"""Tests for Batch Flow Prediction Endpoint."""

from typing import Dict, Any
import pytest
from fastapi.testclient import TestClient


def test_batch_predict_object_format(
    client: TestClient,
    sample_normal_flow: Dict[str, Any],
    sample_attack_flow: Dict[str, Any]
):
    """Verify batch inference using object format with 'flows' and 'model_name'."""
    payload = {
        "flows": [sample_normal_flow, sample_attack_flow],
        "model_name": "xgboost"
    }

    response = client.post("/api/v1/predict/batch", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["total_flows"] == 2
    assert data["normal_count"] == 1
    assert data["attack_count"] == 1
    assert data["model_used"] == "xgboost"
    assert data["batch_duration_ms"] > 0
    assert len(data["predictions"]) == 2

    # Check first item (normal)
    assert data["predictions"][0]["prediction"] == 0
    assert data["predictions"][0]["label"] == "Normal"

    # Check second item (attack)
    assert data["predictions"][1]["prediction"] == 1
    assert data["predictions"][1]["label"] == "Attack"


def test_batch_predict_raw_list_format(
    client: TestClient,
    sample_normal_flow: Dict[str, Any],
    sample_attack_flow: Dict[str, Any]
):
    """Verify batch inference using direct JSON list format."""
    payload = [sample_normal_flow, sample_attack_flow, sample_normal_flow]

    response = client.post("/api/v1/predict/batch?model_name=random_forest", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["total_flows"] == 3
    assert data["normal_count"] == 2
    assert data["attack_count"] == 1
    assert data["model_used"] == "random_forest"
    assert len(data["predictions"]) == 3


def test_batch_predict_empty_list_rejected(client: TestClient):
    """Verify empty batch is rejected with 400 Bad Request or 422 Unprocessable Entity."""
    response = client.post("/api/v1/predict/batch", json={"flows": []})
    assert response.status_code in (400, 422)


def test_batch_predict_exceeds_max_limit(
    client: TestClient,
    sample_normal_flow: Dict[str, Any],
    monkeypatch
):
    """Verify batch exceeding max_batch_size limit is rejected with 400 Bad Request."""
    from backend.app.config import settings
    monkeypatch.setattr(settings, "MAX_BATCH_SIZE", 3)

    payload = {
        "flows": [sample_normal_flow] * 5,
        "model_name": "xgboost"
    }

    response = client.post("/api/v1/predict/batch", json=payload)
    assert response.status_code == 400
    assert "exceeds maximum allowed limit" in response.json()["detail"]
