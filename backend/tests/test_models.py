"""Tests for Model Discovery and Metadata Endpoint."""

import pytest
from fastapi.testclient import TestClient


def test_list_models_success(client: TestClient):
    """Verify GET /api/v1/models returns registered models with academic benchmarks."""
    response = client.get("/api/v1/models")
    assert response.status_code == 200

    data = response.json()
    assert data["default_model"] == "xgboost"
    models = data["models"]
    assert len(models) >= 5

    model_names = [m["name"] for m in models]
    assert "xgboost" in model_names
    assert "random_forest" in model_names
    assert "decision_tree" in model_names
    assert "logistic_regression" in model_names
    assert "linear_svc" in model_names

    # Verify XGBoost benchmark details
    xgb = next(m for m in models if m["name"] == "xgboost")
    assert xgb["is_default"] is True
    assert xgb["supports_probability"] is True
    assert xgb["accuracy_pct"] == 90.0
    assert xgb["precision_pct"] == 98.87
    assert xgb["recall_pct"] == 86.29
    assert xgb["f1_pct"] == 92.15
    assert xgb["fpr_pct"] == 2.1
    assert xgb["fnr_pct"] == 13.71
    assert xgb["roc_auc_pct"] == 98.63
    assert xgb["latency_ms_per_1k"] == 0.394

    # Verify Linear SVC has supports_probability = False
    svc = next(m for m in models if m["name"] == "linear_svc")
    assert svc["supports_probability"] is False
