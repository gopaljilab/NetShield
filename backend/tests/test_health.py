"""Tests for Health and Readiness Check Endpoint."""

import pytest
from fastapi.testclient import TestClient


def test_health_check_success(client: TestClient):
    """Verify GET /api/v1/health returns 200, healthy status, and initialized models."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "healthy"
    assert data["version"] == "1.0.0"
    assert data["models_loaded"] is True
    assert data["default_model"] == "xgboost"
    assert isinstance(data["available_models"], list)
    assert "xgboost" in data["available_models"]
    assert "random_forest" in data["available_models"]
    assert data["uptime_seconds"] >= 0.0
    assert "timestamp" in data


def test_root_landing_endpoint(client: TestClient):
    """Verify GET / returns navigation and online status."""
    response = client.get("/")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "online"
    assert "/docs" in data["documentation"]
    assert "/api/v1/health" in data["health"]
