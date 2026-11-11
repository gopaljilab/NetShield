"""Tests for Telemetry and Operational Statistics Endpoint."""

from typing import Dict, Any
import pytest
from fastapi.testclient import TestClient


def test_statistics_initial_state(client: TestClient):
    """Verify statistics counters start at zero."""
    response = client.get("/api/v1/statistics")
    assert response.status_code == 200

    data = response.json()
    assert data["total_predictions"] == 0
    assert data["normal_predictions"] == 0
    assert data["attack_predictions"] == 0
    assert data["predictions_by_model"] == {}
    assert data["uptime_seconds"] >= 0.0
    assert "In-memory counters reset" in data["ephemeral_notice"]


def test_statistics_increments_after_predictions(
    client: TestClient,
    sample_normal_flow: Dict[str, Any],
    sample_attack_flow: Dict[str, Any]
):
    """Verify statistics counters accurately track predictions and breakdown by model."""
    # 1. Single normal flow with XGBoost
    client.post("/api/v1/predict", json=sample_normal_flow)

    # 2. Single attack flow with Random Forest
    client.post("/api/v1/predict?model_name=random_forest", json=sample_attack_flow)

    # 3. Batch of 2 flows with XGBoost
    batch = {"flows": [sample_normal_flow, sample_attack_flow], "model_name": "xgboost"}
    client.post("/api/v1/predict/batch", json=batch)

    # Check cumulative statistics
    response = client.get("/api/v1/statistics")
    assert response.status_code == 200

    data = response.json()
    assert data["total_predictions"] == 4
    assert data["normal_predictions"] == 2
    assert data["attack_predictions"] == 2
    assert data["predictions_by_model"]["xgboost"] == 3
    assert data["predictions_by_model"]["random_forest"] == 1
