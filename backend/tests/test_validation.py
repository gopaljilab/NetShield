"""Tests for Validation Rules, Leakage Prevention, and Error Sanitization."""

from typing import Dict, Any
import pytest
from fastapi.testclient import TestClient


def test_validation_rejects_missing_feature(client: TestClient, sample_normal_flow: Dict[str, Any]):
    """Verify omitting a required flow metric produces 422 with field identified."""
    payload = dict(sample_normal_flow)
    del payload["dur"]

    response = client.post("/api/v1/predict", json=payload)
    assert response.status_code == 422

    body = response.json()
    assert body["error"] == "Validation Error"
    detail_fields = [e["field"] for e in body["detail"]]
    assert "dur" in detail_fields


def test_validation_rejects_negative_value(client: TestClient, sample_normal_flow: Dict[str, Any]):
    """Verify negative numerical flow metrics are rejected with 422."""
    payload = dict(sample_normal_flow)
    payload["sbytes"] = -500.0

    response = client.post("/api/v1/predict", json=payload)
    assert response.status_code == 422

    body = response.json()
    detail = body["detail"]
    assert any("sbytes" in e["field"] and "greater than or equal to 0" in e["message"] for e in detail)


def test_validation_rejects_invalid_binary_indicator(client: TestClient, sample_normal_flow: Dict[str, Any]):
    """Verify indicator field outside [0, 1] is rejected with 422."""
    payload = dict(sample_normal_flow)
    payload["is_ftp_login"] = 5.0

    response = client.post("/api/v1/predict", json=payload)
    assert response.status_code == 422

    body = response.json()
    assert any("is_ftp_login" in e["field"] for e in body["detail"])


@pytest.mark.parametrize("forbidden_col", ["label", "attack_cat", "id"])
def test_validation_strictly_rejects_leakage_columns(
    client: TestClient,
    sample_normal_flow: Dict[str, Any],
    forbidden_col: str
):
    """Verify caller cannot supply ground truth labels, attack categories, or IDs."""
    payload = dict(sample_normal_flow)
    payload[forbidden_col] = 1 if forbidden_col != "attack_cat" else "Normal"

    response = client.post("/api/v1/predict", json=payload)
    assert response.status_code == 422

    body = response.json()
    messages = " ".join(e["message"] for e in body["detail"])
    assert "Forbidden leakage/metadata field(s) detected" in messages
    assert forbidden_col in messages


def test_validation_rejects_unknown_extra_fields(client: TestClient, sample_normal_flow: Dict[str, Any]):
    """Verify arbitrary unknown fields are rejected under strict schema configuration."""
    payload = dict(sample_normal_flow)
    payload["arbitrary_telemetry"] = "malicious_payload"

    response = client.post("/api/v1/predict", json=payload)
    assert response.status_code == 422

    body = response.json()
    detail = body["detail"]
    assert any("arbitrary_telemetry" in e["field"] for e in detail)


def test_rejects_unsupported_model_name(client: TestClient, sample_normal_flow: Dict[str, Any]):
    """Verify requests specifying unsupported or unapproved models are rejected with 400."""
    response = client.post("/api/v1/predict?model_name=deep_neural_net", json=sample_normal_flow)
    assert response.status_code == 400

    body = response.json()
    assert "Model 'deep_neural_net' is not available" in body["detail"]
    assert "xgboost" in body["detail"]


def test_error_sanitization_does_not_leak_paths(client: TestClient, sample_normal_flow: Dict[str, Any]):
    """Verify error messages do not expose server-side filesystem paths."""
    response = client.post("/api/v1/predict?model_name=/etc/passwd", json=sample_normal_flow)
    assert response.status_code == 400

    body = response.json()
    assert "/etc/passwd" not in body["detail"]
    assert "[REDACTED_PATH]" in body["detail"]
