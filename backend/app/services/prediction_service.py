"""NetShield Prediction and Inference Orchestration Service.

Handles single-record and batch flow inference, timing instrumentation,
and thread-safe ephemeral metrics collection.
"""

from collections import defaultdict
from datetime import datetime, timezone
import threading
import time
from typing import List, Optional
import numpy as np
import pandas as pd

from backend.app.config import settings
from backend.app.schemas.prediction import (
    NetworkFlowInput,
    PredictionResponse,
    BatchPredictionResponse,
)
from backend.app.schemas.statistics import StatisticsResponse
from backend.app.services.model_service import model_service


class PredictionService:
    """Service orchestrating preprocessor transformation, model inference, and statistics."""

    def __init__(self):
        self._lock = threading.Lock()
        self._total_predictions: int = 0
        self._normal_predictions: int = 0
        self._attack_predictions: int = 0
        self._predictions_by_model: defaultdict[str, int] = defaultdict(int)
        self._start_time: float = time.time()
        self._start_iso: str = datetime.now(timezone.utc).isoformat()

    def reset_statistics(self) -> None:
        """Reset in-memory counters (primarily for testing and clean benchmarking)."""
        with self._lock:
            self._total_predictions = 0
            self._normal_predictions = 0
            self._attack_predictions = 0
            self._predictions_by_model.clear()
            self._start_time = time.time()
            self._start_iso = datetime.now(timezone.utc).isoformat()

    def get_statistics(self) -> StatisticsResponse:
        """Return a thread-safe snapshot of cumulative inference metrics."""
        with self._lock:
            uptime = max(0.0, time.time() - self._start_time)
            return StatisticsResponse(
                total_predictions=self._total_predictions,
                normal_predictions=self._normal_predictions,
                attack_predictions=self._attack_predictions,
                predictions_by_model=dict(self._predictions_by_model),
                uptime_seconds=round(uptime, 2),
                server_start_time=self._start_iso,
                timestamp=datetime.now(timezone.utc).isoformat(),
            )

    def predict_single(
        self, flow: NetworkFlowInput, model_name: Optional[str] = None
    ) -> PredictionResponse:
        """Classify a single network flow record.

        Parameters:
            flow: Validated NetworkFlowInput object.
            model_name: Optional explicit model identifier.

        Returns:
            PredictionResponse with prediction, label, probability, and timing.
        """
        resolved_name, clf = model_service.get_model(model_name)
        preprocessor = model_service.get_preprocessor()

        total_start = time.perf_counter()

        # 1. Feature Preprocessing
        prep_start = time.perf_counter()
        df_input = pd.DataFrame([flow.model_dump()])
        X_proc = preprocessor.transform(df_input)
        prep_duration_ms = (time.perf_counter() - prep_start) * 1000.0

        # 2. Model Inference
        inf_start = time.perf_counter()
        raw_pred = clf.predict(X_proc)
        pred_int = int(raw_pred[0])

        # Calculate probability if supported
        prob_val: Optional[float] = None
        if hasattr(clf, "predict_proba"):
            try:
                proba = clf.predict_proba(X_proc)
                # Class 1 corresponds to Attack
                prob_val = round(float(proba[0, 1]), 4)
            except Exception:
                prob_val = None

        inf_duration_ms = (time.perf_counter() - inf_start) * 1000.0
        total_duration_ms = (time.perf_counter() - total_start) * 1000.0

        label_str = "Attack" if pred_int == 1 else "Normal"
        timestamp_str = datetime.now(timezone.utc).isoformat()

        # 3. Thread-Safe Metric Update
        with self._lock:
            self._total_predictions += 1
            if pred_int == 1:
                self._attack_predictions += 1
            else:
                self._normal_predictions += 1
            self._predictions_by_model[resolved_name] += 1

        return PredictionResponse(
            prediction=pred_int,
            label=label_str,
            probability=prob_val,
            model_used=resolved_name,
            timestamp=timestamp_str,
            preprocessing_duration_ms=round(prep_duration_ms, 3),
            inference_duration_ms=round(inf_duration_ms, 3),
            total_duration_ms=round(total_duration_ms, 3),
        )

    def predict_batch(
        self, flows: List[NetworkFlowInput], model_name: Optional[str] = None
    ) -> BatchPredictionResponse:
        """Classify a batch of network flow records using vectorized processing.

        Parameters:
            flows: List of validated NetworkFlowInput records.
            model_name: Optional model identifier override for entire batch.

        Returns:
            BatchPredictionResponse with summary and per-flow classifications.

        Raises:
            ValueError: If batch is empty or exceeds MAX_BATCH_SIZE.
        """
        if not flows:
            raise ValueError("Batch request cannot be empty. At least 1 flow record is required.")

        if len(flows) > settings.MAX_BATCH_SIZE:
            raise ValueError(
                f"Batch size {len(flows)} exceeds maximum allowed limit of {settings.MAX_BATCH_SIZE} flows."
            )

        resolved_name, clf = model_service.get_model(model_name)
        preprocessor = model_service.get_preprocessor()

        batch_start = time.perf_counter()

        # 1. Vectorized DataFrame Preprocessing
        prep_start = time.perf_counter()
        records = [f.model_dump() for f in flows]
        df_batch = pd.DataFrame(records)
        X_proc = preprocessor.transform(df_batch)
        total_prep_ms = (time.perf_counter() - prep_start) * 1000.0

        # 2. Vectorized Model Inference
        inf_start = time.perf_counter()
        raw_preds = clf.predict(X_proc)

        has_proba = hasattr(clf, "predict_proba")
        probs = None
        if has_proba:
            try:
                probs = clf.predict_proba(X_proc)
            except Exception:
                probs = None

        total_inf_ms = (time.perf_counter() - inf_start) * 1000.0
        total_batch_ms = (time.perf_counter() - batch_start) * 1000.0

        # Amortized per-flow timing for itemized responses
        num_flows = len(flows)
        per_flow_prep_ms = total_prep_ms / num_flows
        per_flow_inf_ms = total_inf_ms / num_flows
        per_flow_total_ms = total_batch_ms / num_flows

        normal_count = 0
        attack_count = 0
        predictions_list: List[PredictionResponse] = []
        now_iso = datetime.now(timezone.utc).isoformat()

        for idx in range(num_flows):
            p = int(raw_preds[idx])
            lbl = "Attack" if p == 1 else "Normal"
            if p == 1:
                attack_count += 1
            else:
                normal_count += 1

            prob_val = None
            if probs is not None:
                prob_val = round(float(probs[idx, 1]), 4)

            predictions_list.append(
                PredictionResponse(
                    prediction=p,
                    label=lbl,
                    probability=prob_val,
                    model_used=resolved_name,
                    timestamp=now_iso,
                    preprocessing_duration_ms=round(per_flow_prep_ms, 3),
                    inference_duration_ms=round(per_flow_inf_ms, 3),
                    total_duration_ms=round(per_flow_total_ms, 3),
                )
            )

        # 3. Thread-Safe Cumulative Metric Update
        with self._lock:
            self._total_predictions += num_flows
            self._normal_predictions += normal_count
            self._attack_predictions += attack_count
            self._predictions_by_model[resolved_name] += num_flows

        return BatchPredictionResponse(
            total_flows=num_flows,
            normal_count=normal_count,
            attack_count=attack_count,
            model_used=resolved_name,
            timestamp=now_iso,
            batch_duration_ms=round(total_batch_ms, 3),
            predictions=predictions_list,
        )


# Global singleton instance
prediction_service = PredictionService()
