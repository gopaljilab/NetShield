"""Comprehensive Edge Cases and Robustness Test Suite for NetShield Backend.

Tests defensive boundary conditions, extreme numerical values, zero-day protocols,
security injection attempts, and batch processing limits.
"""

from typing import Dict, Any
import pytest
from fastapi.testclient import TestClient


# =====================================================================
# 1. Zero-Day Protocols & Unseen Categorical Features
# =====================================================================

def test_unseen_zero_day_protocol_and_state(client: TestClient, sample_normal_flow: Dict[str, Any]):
    """Verify inference gracefully digests unseen protocol/service/state without raising KeyError."""
    payload = dict(sample_normal_flow)
    payload["proto"] = "zero_day_tunnel_v99"
    payload["service"] = "unseen_encrypted_mesh"
    payload["state"] = "NON_STANDARD_STATE"

    response = client.post("/api/v1/predict", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["prediction"] in (0, 1)
    assert data["label"] in ("Normal", "Attack")
    assert data["model_used"] == "xgboost"
    assert data["probability"] is not None


# =====================================================================
# 2. Extreme Numerical Boundaries (Floods, Zeros, Floating Point Precision)
# =====================================================================

def test_zero_values_flow(client: TestClient, sample_normal_flow: Dict[str, Any]):
    """Verify flow with all zero numerical metrics is processed without division by zero."""
    payload = dict(sample_normal_flow)
    for k in payload:
        if isinstance(payload[k], (int, float)):
            payload[k] = 0

    response = client.post("/api/v1/predict", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["prediction"] in (0, 1)
    assert data["label"] in ("Normal", "Attack")


def test_extreme_ddos_flood_numerical_values(client: TestClient, sample_attack_flow: Dict[str, Any]):
    """Verify volumetric DDoS flow with astronomical values does not cause overflow or NaN."""
    payload = dict(sample_attack_flow)
    payload["sbytes"] = 1e12
    payload["dbytes"] = 1e12
    payload["rate"] = 1e9
    payload["sload"] = 1e15
    payload["dload"] = 1e15
    payload["spkts"] = 10000000
    payload["dpkts"] = 10000000

    response = client.post("/api/v1/predict", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["prediction"] == 1
    assert data["label"] == "Attack"
    assert data["probability"] is not None
    assert 0.0 <= data["probability"] <= 1.0


def test_tiny_floating_point_precision(client: TestClient, sample_normal_flow: Dict[str, Any]):
    """Verify nanosecond-scale durations do not cause underflow issues."""
    payload = dict(sample_normal_flow)
    payload["dur"] = 0.00000000001
    payload["sinpkt"] = 0.00000000001
    payload["dinpkt"] = 0.00000000001

    response = client.post("/api/v1/predict", json=payload)
    assert response.status_code == 200
    assert response.json()["prediction"] in (0, 1)


# =====================================================================
# 3. Schema Validation & Type Strictness Edge Cases
# =====================================================================

def test_validation_rejects_string_in_numeric_field(client: TestClient, sample_normal_flow: Dict[str, Any]):
    """Verify string literal passed to float field is rejected with 422."""
    payload = dict(sample_normal_flow)
    payload["dur"] = "ten_milliseconds"

    response = client.post("/api/v1/predict", json=payload)
    assert response.status_code == 422
    assert any("dur" in e["field"] for e in response.json()["detail"])


def test_validation_rejects_null_in_required_field(client: TestClient, sample_normal_flow: Dict[str, Any]):
    """Verify explicit null/None in required numerical field is rejected with 422."""
    payload = dict(sample_normal_flow)
    payload["sbytes"] = None

    response = client.post("/api/v1/predict", json=payload)
    assert response.status_code == 422
    assert any("sbytes" in e["field"] for e in response.json()["detail"])


def test_validation_rejects_empty_json_object(client: TestClient):
    """Verify completely empty payload is rejected with 422 with detailed field errors."""
    response = client.post("/api/v1/predict", json={})
    assert response.status_code == 422
    assert response.json()["error"] == "Validation Error"
    assert len(response.json()["detail"]) >= 40


def test_validation_rejects_negative_tcp_window(client: TestClient, sample_normal_flow: Dict[str, Any]):
    """Verify TCP window sizes cannot be negative."""
    payload = dict(sample_normal_flow)
    payload["swin"] = -10.0

    response = client.post("/api/v1/predict", json=payload)
    assert response.status_code == 422
    assert any("swin" in e["field"] for e in response.json()["detail"])


def test_validation_rejects_negative_packet_count(client: TestClient, sample_normal_flow: Dict[str, Any]):
    """Verify packet counts cannot be negative."""
    payload = dict(sample_normal_flow)
    payload["spkts"] = -1.0

    response = client.post("/api/v1/predict", json=payload)
    assert response.status_code == 422
    assert any("spkts" in e["field"] for e in response.json()["detail"])


# =====================================================================
# 4. Security Injection & Path Traversal Defensive Hardening
# =====================================================================

def test_security_path_traversal_model_name(client: TestClient, sample_normal_flow: Dict[str, Any]):
    """Verify path traversal sequences in model_name are safely rejected without file system leakage."""
    response = client.post("/api/v1/predict?model_name=../../../../etc/shadow", json=sample_normal_flow)
    assert response.status_code == 400
    assert "etc" not in response.json()["detail"]
    assert "[REDACTED_PATH]" in response.json()["detail"]


def test_security_sql_injection_model_name(client: TestClient, sample_normal_flow: Dict[str, Any]):
    """Verify SQL injection strings in model_name query parameter are safely handled as invalid model names."""
    response = client.post("/api/v1/predict?model_name=' UNION SELECT * FROM users; --", json=sample_normal_flow)
    assert response.status_code == 400
    assert "is not available" in response.json()["detail"]


def test_security_xss_script_tag_in_categorical_field(client: TestClient, sample_normal_flow: Dict[str, Any]):
    """Verify XSS strings in categorical feature values are processed safely without code execution."""
    payload = dict(sample_normal_flow)
    payload["proto"] = "<script>alert('xss')</script>"

    response = client.post("/api/v1/predict", json=payload)
    assert response.status_code == 200
    assert response.json()["prediction"] in (0, 1)


# =====================================================================
# 5. Batch Prediction Edge Cases
# =====================================================================

def test_batch_prediction_single_flow(client: TestClient, sample_normal_flow: Dict[str, Any]):
    """Verify batch endpoint handles boundary case of batch size = 1."""
    payload = {"flows": [sample_normal_flow], "model_name": "xgboost"}
    response = client.post("/api/v1/predict/batch", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["total_flows"] == 1
    assert data["normal_count"] == 1
    assert data["attack_count"] == 0
    assert len(data["predictions"]) == 1


def test_batch_prediction_duplicate_flows(client: TestClient, sample_normal_flow: Dict[str, Any]):
    """Verify batch with 5 identical flows produces identical predictions for each item."""
    payload = {"flows": [sample_normal_flow] * 5, "model_name": "xgboost"}
    response = client.post("/api/v1/predict/batch", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["total_flows"] == 5
    assert data["normal_count"] == 5
    assert data["attack_count"] == 0
    predictions = [p["prediction"] for p in data["predictions"]]
    assert len(set(predictions)) == 1


@pytest.mark.parametrize("model", ["xgboost", "random_forest", "decision_tree", "logistic_regression", "linear_svc"])
def test_batch_prediction_across_all_five_models(
    client: TestClient,
    sample_normal_flow: Dict[str, Any],
    sample_attack_flow: Dict[str, Any],
    model: str
):
    """Verify vectorized batch prediction executes properly for all 5 whitelisted classifiers."""
    payload = {"flows": [sample_normal_flow, sample_attack_flow], "model_name": model}
    response = client.post("/api/v1/predict/batch", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["total_flows"] == 2
    assert data["model_used"] == model
    assert len(data["predictions"]) == 2


def test_batch_raw_list_with_unsupported_model(
    client: TestClient,
    sample_normal_flow: Dict[str, Any]
):
    """Verify batch request specifying invalid model override query is rejected with 400."""
    response = client.post(
        "/api/v1/predict/batch?model_name=quantum_supercomputer",
        json=[sample_normal_flow]
    )
    assert response.status_code == 400
    assert "Model 'quantum_supercomputer' is not available" in response.json()["detail"]


# =====================================================================
# 6. Model Catalog & Health Probe Integrity
# =====================================================================

def test_models_catalog_contains_all_phase2_artifacts(client: TestClient):
    """Verify the /api/v1/models endpoint reports all 5 trained models with audit metrics."""
    response = client.get("/api/v1/models")
    assert response.status_code == 200

    data = response.json()
    assert len(data["models"]) == 5
    assert data["default_model"] == "xgboost"

    names = [m["name"] for m in data["models"]]
    assert set(names) == {"xgboost", "random_forest", "decision_tree", "logistic_regression", "linear_svc"}

    # Validate each model has audited benchmark metrics
    for m in data["models"]:
        assert m["accuracy_pct"] is not None and m["accuracy_pct"] > 80.0
        assert m["f1_pct"] is not None and m["f1_pct"] > 80.0
        assert m["latency_ms_per_1k"] is not None and m["latency_ms_per_1k"] > 0
        assert "algorithm_type" in m
