"""NetShield Model Management Service.

Loads, manages, and serves machine learning artifacts and metadata in memory.
Enforces strict model whitelisting and prohibits arbitrary file access.
"""

import os
from typing import Dict, Any, List, Optional, Tuple
import joblib
import pandas as pd

from backend.app.config import settings
from backend.app.schemas.models import ModelMetadata
from backend.app.utils.validation import sanitize_error_message
from ml.preprocessing import NetShieldPreprocessor


class ModelService:
    """Singleton service for loading and managing ML models and the preprocessor."""

    # Static algorithm descriptions and taxonomy
    MODEL_TAXONOMY: Dict[str, Dict[str, Any]] = {
        "xgboost": {
            "display_name": "XGBoost (Extreme Gradient Boosting)",
            "algorithm_type": "Gradient Boosted Decision Trees",
            "description": "High-performance ensemble of gradient boosted trees optimized for low FPR and high throughput.",
            "supports_probability": True,
        },
        "random_forest": {
            "display_name": "Random Forest Classifier",
            "algorithm_type": "Ensemble Bagging (Decision Trees)",
            "description": "Robust bagging ensemble with 100 estimators providing strong generalization and high recall.",
            "supports_probability": True,
        },
        "decision_tree": {
            "display_name": "Decision Tree (CART)",
            "algorithm_type": "Single Decision Tree",
            "description": "Fast, interpretable, single-tree classifier with ultra-low single-flow latency.",
            "supports_probability": True,
        },
        "logistic_regression": {
            "display_name": "Logistic Regression",
            "algorithm_type": "Linear Probabilistic Classifier",
            "description": "L2-regularized linear baseline with calibrated sigmoid class probabilities.",
            "supports_probability": True,
        },
        "linear_svc": {
            "display_name": "Linear Support Vector Classifier",
            "algorithm_type": "Maximum Margin Linear Classifier",
            "description": "Linear SVM minimizing hinge loss; outputs geometric decision margins without probabilities.",
            "supports_probability": False,
        },
    }

    def __init__(self):
        self.preprocessor: Optional[NetShieldPreprocessor] = None
        self.models: Dict[str, Any] = {}
        self.models_metadata: Dict[str, ModelMetadata] = {}
        self._is_loaded: bool = False

    def load_artifacts(self) -> None:
        """Load the preprocessor and trained models once into memory.

        Raises:
            FileNotFoundError: If required preprocessor or default model file is missing.
            RuntimeError: If artifacts fail to deserialize or validate.
        """
        models_dir = settings.MODELS_DIR
        if not os.path.isdir(models_dir):
            raise FileNotFoundError(f"Models directory not found at: {models_dir}")

        # 1. Load Preprocessor
        preprocessor_path = os.path.join(models_dir, "preprocessor.joblib")
        if not os.path.exists(preprocessor_path):
            raise FileNotFoundError(
                f"Required preprocessor artifact missing at: {preprocessor_path}"
            )

        try:
            self.preprocessor = NetShieldPreprocessor.load(preprocessor_path)
        except Exception as exc:
            raise RuntimeError(
                f"Failed to deserialize preprocessor from {preprocessor_path}: {exc}"
            ) from exc

        # 2. Load Whitelisted Models
        loaded_count = 0
        for model_id in settings.ALLOWED_MODELS:
            model_file = f"{model_id}.joblib"
            model_path = os.path.join(models_dir, model_file)

            if os.path.exists(model_path):
                try:
                    clf = joblib.load(model_path)
                    # Verify model object has predict method
                    if not hasattr(clf, "predict"):
                        raise TypeError(f"Artifact {model_file} does not implement predict()")
                    self.models[model_id] = clf
                    loaded_count += 1
                except Exception as exc:
                    if model_id == settings.DEFAULT_MODEL:
                        raise RuntimeError(
                            f"CRITICAL: Failed to load default model '{model_id}' from {model_path}: {exc}"
                        ) from exc
                    # Optional models can fail without aborting if default is healthy

        # Verify default model is loaded
        if settings.DEFAULT_MODEL not in self.models:
            raise RuntimeError(
                f"CRITICAL: Default model '{settings.DEFAULT_MODEL}' could not be loaded. "
                f"Available loaded models: {list(self.models.keys())}"
            )

        # 3. Load Metrics and Construct Metadata
        self._load_metadata()

        self._is_loaded = True

    def _load_metadata(self) -> None:
        """Parse benchmark metrics from CSV and merge with model taxonomy."""
        csv_metrics: Dict[str, Dict[str, float]] = {}
        metrics_file = settings.METRICS_FILE

        if os.path.isfile(metrics_file):
            try:
                df = pd.read_csv(metrics_file)
                for _, row in df.iterrows():
                    # Normalize model name from CSV (e.g. "Random Forest" -> "random_forest")
                    raw_name = str(row.get("Model", "")).strip().replace(" ", "_").lower()
                    csv_metrics[raw_name] = {
                        "accuracy_pct": float(row["Accuracy (%)"]) if "Accuracy (%)" in row else None,
                        "precision_pct": float(row["Precision (%)"]) if "Precision (%)" in row else None,
                        "recall_pct": float(row["Recall (%)"]) if "Recall (%)" in row else None,
                        "f1_pct": float(row["F1-Score (%)"]) if "F1-Score (%)" in row else None,
                        "fpr_pct": float(row["FPR (%)"]) if "FPR (%)" in row else None,
                        "fnr_pct": float(row["FNR (%)"]) if "FNR (%)" in row else None,
                        "roc_auc_pct": float(row["ROC-AUC (%)"]) if "ROC-AUC (%)" in row else None,
                        "latency_ms_per_1k": float(row["Latency (ms / 1k flows)"]) if "Latency (ms / 1k flows)" in row else None,
                    }
            except Exception:
                # If CSV parsing fails, fallback gracefully to static taxonomy without crashing
                csv_metrics = {}

        # Construct ModelMetadata instances for all loaded models
        for model_id in self.models.keys():
            tax = self.MODEL_TAXONOMY.get(model_id, {
                "display_name": model_id.replace("_", " ").title(),
                "algorithm_type": "Classifier",
                "description": f"Loaded {model_id} classifier model.",
                "supports_probability": hasattr(self.models[model_id], "predict_proba"),
            })

            metrics = csv_metrics.get(model_id, {})

            self.models_metadata[model_id] = ModelMetadata(
                name=model_id,
                display_name=tax["display_name"],
                algorithm_type=tax["algorithm_type"],
                is_default=(model_id == settings.DEFAULT_MODEL),
                supports_probability=tax.get("supports_probability", False),
                accuracy_pct=metrics.get("accuracy_pct"),
                precision_pct=metrics.get("precision_pct"),
                recall_pct=metrics.get("recall_pct"),
                f1_pct=metrics.get("f1_pct"),
                fpr_pct=metrics.get("fpr_pct"),
                fnr_pct=metrics.get("fnr_pct"),
                roc_auc_pct=metrics.get("roc_auc_pct"),
                latency_ms_per_1k=metrics.get("latency_ms_per_1k"),
                description=tax["description"],
            )

    def get_model(self, model_name: Optional[str] = None) -> Tuple[str, Any]:
        """Retrieve a validated model instance by name or default.

        Parameters:
            model_name: Optional string identifier of the requested model.

        Returns:
            Tuple of (resolved_model_name, model_instance)

        Raises:
            RuntimeError: If models have not been loaded.
            ValueError: If the requested model is unknown, unapproved, or not loaded.
        """
        if not self._is_loaded:
            raise RuntimeError("ModelService is not initialized. Artifacts have not been loaded.")

        if model_name is None or not model_name.strip():
            return settings.DEFAULT_MODEL, self.models[settings.DEFAULT_MODEL]

        normalized_name = model_name.strip().lower()

        if normalized_name not in self.models:
            available = list(self.models.keys())
            clean_name = sanitize_error_message(model_name)
            raise ValueError(
                f"Model '{clean_name}' is not available. Loaded models: {available}. "
                f"Default is '{settings.DEFAULT_MODEL}'."
            )

        return normalized_name, self.models[normalized_name]

    def get_preprocessor(self) -> NetShieldPreprocessor:
        """Return the initialized preprocessor instance."""
        if not self._is_loaded or self.preprocessor is None:
            raise RuntimeError("ModelService is not initialized. Preprocessor is not loaded.")
        return self.preprocessor

    def list_models_metadata(self) -> List[ModelMetadata]:
        """Return metadata objects for all loaded models."""
        return list(self.models_metadata.values())

    def get_loaded_model_names(self) -> List[str]:
        """Return list of loaded model identifiers."""
        return list(self.models.keys())

    @property
    def is_loaded(self) -> bool:
        """Check if service is initialized and ready for inference."""
        return self._is_loaded


# Global singleton instance
model_service = ModelService()
