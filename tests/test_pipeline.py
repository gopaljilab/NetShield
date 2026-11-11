"""Integration and pipeline unit tests for NetShield.

Author: NetShield Engineering Team & Senior ML Mentor
"""

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

from ml.preprocessing import split_features_and_target, NetShieldPreprocessor


def test_end_to_end_dummy_pipeline():
    # 1. Create synthetic train & test sets
    train_data = pd.DataFrame({
        "id": list(range(1, 21)),
        "dur": [0.1 * i for i in range(20)],
        "proto": ["tcp" if i % 2 == 0 else "udp" for i in range(20)],
        "service": ["http" if i % 3 == 0 else "dns" for i in range(20)],
        "state": ["FIN" if i % 2 == 0 else "CON" for i in range(20)],
        "spkts": [10 + i for i in range(20)],
        "dpkts": [5 + i for i in range(20)],
        "attack_cat": ["Normal" if i < 10 else "Exploits" for i in range(20)],
        "label": [0 if i < 10 else 1 for i in range(20)]
    })

    test_data = pd.DataFrame({
        "id": [101, 102, 103, 104],
        "dur": [0.2, 1.5, 0.05, 2.0],
        "proto": ["tcp", "udp", "tcp", "udp"],
        "service": ["http", "dns", "dns", "http"],
        "state": ["FIN", "CON", "FIN", "CON"],
        "spkts": [12, 22, 11, 25],
        "dpkts": [6, 16, 5, 18],
        "attack_cat": ["Normal", "Exploits", "Normal", "Exploits"],
        "label": [0, 1, 0, 1]
    })

    # 2. Preprocess
    X_train_raw, y_train = split_features_and_target(train_data)
    X_test_raw, y_test = split_features_and_target(test_data)

    preprocessor = NetShieldPreprocessor()
    X_train_proc = preprocessor.fit_transform(X_train_raw)
    X_test_proc = preprocessor.transform(X_test_raw)

    assert X_train_proc.shape[0] == 20
    assert X_test_proc.shape[0] == 4
    assert X_train_proc.shape[1] == X_test_proc.shape[1]

    # 3. Fit classifier (Decision Tree)
    clf = DecisionTreeClassifier(max_depth=5, random_state=42)
    clf.fit(X_train_proc, y_train)

    # 4. Predict
    y_pred = clf.predict(X_test_proc)
    assert len(y_pred) == 4
    assert set(y_pred).issubset({0, 1})

    # 5. Evaluate metrics
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)

    assert 0.0 <= acc <= 1.0
    assert 0.0 <= prec <= 1.0
    assert 0.0 <= rec <= 1.0
    assert 0.0 <= f1 <= 1.0
