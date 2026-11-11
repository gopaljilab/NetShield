"""NetShield Machine Learning Model Training Module.

Author: NetShield Engineering Team & Senior ML Mentor
Academic Context: Department of CSE, Mini Project (BCS586)

Trains 5 candidate models on the official UNSW-NB15 training partition:
1. Logistic Regression (Linear baseline)
2. Decision Tree (Interpretable baseline)
3. Random Forest (Bagging ensemble champion)
4. Linear SVC (Geometric margin baseline)
5. XGBoost (Gradient boosting ensemble champion)

Saves all trained models and the fitted preprocessor to ml/saved_models/.
"""

import os
import sys
import time
import joblib
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier

# Ensure ml module can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ml.preprocessing import (
    load_dataset,
    split_features_and_target,
    NetShieldPreprocessor
)

RANDOM_SEED = 42
TRAIN_DATA_PATH = "dataset/UNSW_NB15_training-set.csv"
SAVED_MODELS_DIR = "ml/saved_models"


def get_model_definitions(random_state: int = RANDOM_SEED) -> dict:
    """
    Define model configurations with reproducible random seeds.
    """
    return {
        "logistic_regression": LogisticRegression(
            max_iter=1000,
            random_state=random_state,
            solver="lbfgs"
        ),
        "decision_tree": DecisionTreeClassifier(
            max_depth=12,
            min_samples_split=20,
            random_state=random_state
        ),
        "random_forest": RandomForestClassifier(
            n_estimators=100,
            max_depth=15,
            random_state=random_state,
            n_jobs=-1
        ),
        "linear_svc": LinearSVC(
            max_iter=5000,
            random_state=random_state,
            dual="auto"
        ),
        "xgboost": XGBClassifier(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            random_state=random_state,
            eval_metric="logloss",
            n_jobs=-1
        )
    }


def train_pipeline(
    train_path: str = TRAIN_DATA_PATH,
    output_dir: str = SAVED_MODELS_DIR,
    random_state: int = RANDOM_SEED
) -> dict:
    """
    Execute the leak-free training pipeline.
    """
    os.makedirs(output_dir, exist_ok=True)
    print("=" * 70)
    print("NetShield Phase 2: Leak-Free Model Training Pipeline")
    print("=" * 70)

    # 1. Load official training dataset
    print(f"\n[1/4] Loading training dataset from: {train_path}")
    df_train = load_dataset(train_path)
    print(f"      Loaded {len(df_train):,} rows, {len(df_train.columns)} columns.")

    # 2. Separate features and target; prune leakage columns
    print("\n[2/4] Separating features & target (Dropping 'id' & 'attack_cat')...")
    X_train_raw, y_train = split_features_and_target(df_train)
    print(f"      Feature matrix: {X_train_raw.shape}")
    print(f"      Target distribution: Normal (0) = {(y_train == 0).sum():,}, Attack (1) = {(y_train == 1).sum():,}")

    # 3. Fit preprocessor strictly on training data
    print("\n[3/4] Fitting NetShield Preprocessor on training features...")
    preprocessor = NetShieldPreprocessor()
    X_train_proc = preprocessor.fit_transform(X_train_raw)
    print(f"      Transformed feature shape: {X_train_proc.shape} ({len(preprocessor.get_feature_names())} features)")

    # Save fitted preprocessor
    prep_path = os.path.join(output_dir, "preprocessor.joblib")
    preprocessor.save(prep_path)
    print(f"      Saved preprocessor to: {prep_path}")

    # 4. Train each model
    print("\n[4/4] Training candidate models...")
    models = get_model_definitions(random_state=random_state)
    training_summary = {}

    for name, model in models.items():
        print(f"\n      --> Training {name.upper()}...")
        start_time = time.time()
        try:
            model.fit(X_train_proc, y_train)
            train_time = round(time.time() - start_time, 2)
            train_acc = round(model.score(X_train_proc, y_train) * 100, 2)
            
            # Save trained model
            model_path = os.path.join(output_dir, f"{name}.joblib")
            joblib.dump(model, model_path)
            
            training_summary[name] = {
                "status": "SUCCESS",
                "train_time_sec": train_time,
                "train_accuracy_pct": train_acc,
                "model_path": model_path
            }
            print(f"          Status: SUCCESS | Time: {train_time}s | Train Acc: {train_acc}% | Saved: {model_path}")
        except Exception as e:
            training_summary[name] = {
                "status": f"FAILED: {e}",
                "train_time_sec": None,
                "train_accuracy_pct": None,
                "model_path": None
            }
            print(f"          Status: FAILED | Error: {e}")

    print("\n" + "=" * 70)
    print("Training Phase Complete!")
    print("=" * 70)
    return training_summary


if __name__ == "__main__":
    summary = train_pipeline()
