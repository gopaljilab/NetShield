"""Unit tests for NetShield Preprocessing Module.

Author: NetShield Engineering Team & Senior ML Mentor
"""

import os
import tempfile
import numpy as np
import pandas as pd
import pytest

from ml.preprocessing import (
    split_features_and_target,
    NetShieldPreprocessor,
    CATEGORICAL_FEATURES,
    LEAKAGE_COLUMNS_TO_DROP
)


def create_dummy_dataframe():
    """Create a minimal synthetic dataframe matching UNSW-NB15 schema."""
    return pd.DataFrame({
        "id": [1, 2, 3, 4, 5],
        "dur": [0.1, 0.5, 0.0, 1.2, 0.05],
        "proto": ["tcp", "udp", "tcp", "arp", "udp"],
        "service": ["http", "dns", "-", "smtp", "dns"],
        "state": ["FIN", "CON", "INT", "FIN", "CON"],
        "spkts": [10, 2, 4, 20, 2],
        "dpkts": [8, 2, 0, 15, 2],
        "attack_cat": ["Normal", "Fuzzers", "Exploits", "Normal", "DoS"],
        "label": [0, 1, 1, 0, 1]
    })


def test_split_features_and_target_removes_leakage():
    df = create_dummy_dataframe()
    X, y = split_features_and_target(df)

    # 1. Target column must not be in X
    assert "label" not in X.columns

    # 2. Leakage columns must be pruned from X
    for col in LEAKAGE_COLUMNS_TO_DROP:
        assert col not in X.columns

    # 3. y must match target values
    assert list(y) == [0, 1, 1, 0, 1]

    # 4. Correct number of remaining features
    expected_cols = ["dur", "proto", "service", "state", "spkts", "dpkts"]
    assert list(X.columns) == expected_cols


def test_split_features_and_target_invalid_label():
    df = create_dummy_dataframe()
    df["label"] = [0, 1, 2, 0, 1] # Non-binary value 2

    with pytest.raises(ValueError):
        split_features_and_target(df)


def test_preprocessor_fit_transform_shape():
    df = create_dummy_dataframe()
    X, y = split_features_and_target(df)

    preprocessor = NetShieldPreprocessor()
    X_proc = preprocessor.fit_transform(X)

    assert isinstance(X_proc, np.ndarray)
    assert X_proc.shape[0] == len(df)
    assert X_proc.shape[1] == len(preprocessor.get_feature_names())
    assert preprocessor.is_fitted is True


def test_preprocessor_handles_unseen_categories():
    df_train = create_dummy_dataframe()
    X_train, _ = split_features_and_target(df_train)

    preprocessor = NetShieldPreprocessor()
    preprocessor.fit(X_train)

    # Test set has a completely new protocol and service
    df_test = pd.DataFrame({
        "dur": [0.2],
        "proto": ["brand_new_proto"],
        "service": ["unknown_service"],
        "state": ["FIN"],
        "spkts": [5],
        "dpkts": [5]
    })

    # Should transform without raising KeyError or ValueError
    X_test_proc = preprocessor.transform(df_test)
    assert X_test_proc.shape[0] == 1
    assert X_test_proc.shape[1] == len(preprocessor.get_feature_names())


def test_preprocessor_serialization():
    df = create_dummy_dataframe()
    X, _ = split_features_and_target(df)

    preprocessor = NetShieldPreprocessor()
    X_proc1 = preprocessor.fit_transform(X)

    with tempfile.TemporaryDirectory() as tmpdir:
        save_path = os.path.join(tmpdir, "test_preproc.joblib")
        preprocessor.save(save_path)
        assert os.path.exists(save_path)

        loaded_preproc = NetShieldPreprocessor.load(save_path)
        assert loaded_preproc.is_fitted is True
        X_proc2 = loaded_preproc.transform(X)

        np.testing.assert_array_almost_equal(X_proc1, X_proc2)
