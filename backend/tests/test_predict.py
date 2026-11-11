"""Tests for Single-Flow Prediction Endpoint."""

from typing import Dict, Any
import pytest
from fastapi.testclient import TestClient


def test_predict_normal_flow_default_model(client: TestClient, sample_normal_flow: Dict[str, Any]):
    """Verify prediction of verified Normal flow using default model (XGBoost)."""
    response = client.post("/api/v1/predict", json=sample_normal_flow)
    assert response.status_code == 200

    data = response.json()
    assert data["prediction"] == 0
    assert data["label"] == "Normal"
    assert data["model_used"] == "xgboost"
    assert data["probability"] is not None
    assert 0.0 <= data["probability"] <= 0.5
    assert data["preprocessing_duration_ms"] > 0
    assert data["inference_duration_ms"] > 0
    assert data["total_duration_ms"] > 0
    assert "timestamp" in data


def test_predict_attack_flow_random_forest(client: TestClient, sample_attack_flow: Dict[str, Any]):
    """Verify prediction of verified Attack flow using Random Forest override via query param."""
    response = client.post("/api/v1/predict?model_name=random_forest", json=sample_attack_flow)
    assert response.status_code == 200

    data = response.json()
    assert data["prediction"] == 1
    assert data["label"] == "Attack"
    assert data["model_used"] == "random_forest"
    assert data["probability"] is not None
    assert data["probability"] >= 0.5


def test_predict_model_selection_in_payload(client: TestClient, sample_normal_flow: Dict[str, Any]):
    """Verify model selection specified directly within the flow payload."""
    payload = dict(sample_normal_flow)
    payload["model_name"] = "decision_tree"

    response = client.post("/api/v1/predict", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["model_used"] == "decision_tree"
    assert data["prediction"] in (0, 1)


def test_predict_linear_svc_null_probability(client: TestClient, sample_normal_flow: Dict[str, Any]):
    """Verify Linear SVC execution where probability is properly None."""
    response = client.post("/api/v1/predict?model_name=linear_svc", json=sample_normal_flow)
    assert response.status_code == 200

    data = response.json()
    assert data["model_used"] == "linear_svc"
    assert data["probability"] is None


def test_predict_case_insensitive_model_name(client: TestClient, sample_normal_flow: Dict[str, Any]):
    """Verify model name lookup is case-insensitive ('XGBoost' -> 'xgboost')."""
    response = client.post("/api/v1/predict?model_name=XGBoost", json=sample_normal_flow)
    assert response.status_code == 200
    assert response.json()["model_used"] == "xgboost"
