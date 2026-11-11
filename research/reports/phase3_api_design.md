# NetShield Phase 3: REST API Architecture & Deployment Report

**Project Title**: NetShield – AI-Powered Network Intrusion Detection System Using Machine Learning  
**Department**: Computer Science & Engineering | Academic Mini Project (Course Code: BCS586)  
**Author**: NetShield Senior ML Mentor & Backend Engineering Team  
**Date**: November 2026  
**Document Status**: COMPLETED & VERIFIED (23/23 Automated Unit & Integration Tests Passing)

---

## 1. Executive Summary

Phase 3 transitions the audited machine learning models developed in Phase 2 into a high-performance, production-grade REST API backend. The service is implemented using **FastAPI**, **Pydantic v2**, and **Uvicorn**, serving deserialized pipelines (`preprocessor.joblib`, `xgboost.joblib`, `random_forest.joblib`, `decision_tree.joblib`, `logistic_regression.joblib`, and `linear_svc.joblib`) without re-training or altering Phase 2 weights.

### Key Milestones Delivered:
1. **Zero Data Leakage Boundary**: The API defines a strict 42-feature schema that automatically detects and rejects `id`, `attack_cat`, and `label` with HTTP 422.
2. **Lifespan Startup Invariant**: All preprocessors and model weights are initialized once in memory during the FastAPI `lifespan` startup event, preventing file I/O latency during request handling.
3. **Whitelisted Model Selection**: Allows dynamic switching between models (defaulting to **XGBoost** for optimal low-latency flow decisions, with **Random Forest** available for high-recall scenarios). Arbitrary file paths and unapproved models are rejected with HTTP 400.
4. **Vectorized High-Throughput Batching**: Implements array-based vectorization for batch predictions up to 5,000 flows per request.
5. **Thread-Safe Ephemeral Telemetry**: Ephemeral counters track total, normal, and attack classifications and breakdown by model, synchronized via `threading.Lock`.
6. **Path & Stack-Trace Sanitization**: All error messages strip internal filesystem paths (`/Users/...`, `/tmp/...`) and internal tracebacks before reaching clients.
7. **Complete Test Suite**: 23 automated tests verifying health, model discovery, single flow classification, batch flow classification, statistics updates, validation rejections, and security sanitization.

---

## 2. System Architecture

```
                                  Client Request
                                        │
                                        ▼
                        ┌──────────────────────────────┐
                        │       Uvicorn Server         │
                        └──────────────┬───────────────┘
                                       │
                                       ▼
                        ┌──────────────────────────────┐
                        │     FastAPI Application      │
                        │  (CORS, Lifespan, Handlers)  │
                        └──────────────┬───────────────┘
                                       │
         ┌─────────────────────────────┼────────────────────────────┐
         │                             │                            │
         ▼                             ▼                            ▼
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│   Health Check   │         │ Model Discovery  │         │  Prediction API  │
│ GET /v1/health   │         │ GET /v1/models   │         │ POST /v1/predict │
└────────┬─────────┘         └────────┬─────────┘         └────────┬─────────┘
         │                            │                            │
         └────────────────────────────┼────────────────────────────┘
                                      │
                                      ▼
                        ┌──────────────────────────────┐
                        │      Pydantic Validation     │
                        │ (42 features, extra='forbid')│
                        └──────────────┬───────────────┘
                                       │
                                       ▼
                        ┌──────────────────────────────┐
                        │  Model & Prediction Services │
                        │  - Preprocessor (190 feats)  │
                        │  - Model Dispatch (XGB/RF)   │
                        │  - Lock-protected Telemetry  │
                        └──────────────┬───────────────┘
                                       │
                                       ▼
                        ┌──────────────────────────────┐
                        │   JSON Response + Latency    │
                        └──────────────────────────────┘
```

---

## 3. Input Feature Specification (42 Features)

The prediction endpoint accepts network flow records derived from the **UNSW-NB15** feature set. The schema strictly excludes `id` (identifier), `attack_cat` (attack category string), and `label` (binary ground truth):

### Categorical Features (3)
| Feature | Type | Valid Example Values | Handling of Unseen Categories |
|---|---|---|---|
| `proto` | `string` | `tcp`, `udp`, `arp`, `ospf`, `icmp` | Encoded as all zeros via `handle_unknown='ignore'` |
| `service` | `string` | `http`, `dns`, `smtp`, `ftp`, `-` | Encoded as all zeros via `handle_unknown='ignore'` |
| `state` | `string` | `FIN`, `INT`, `CON`, `REQ`, `RST` | Encoded as all zeros via `handle_unknown='ignore'` |

### Numerical Features (39)
All numerical metrics are validated as non-negative floats (`ge=0.0`). Indicators `is_ftp_login` and `is_sm_ips_ports` are bounded between `0.0` and `1.0`.

1. `dur`: Record total duration
2. `spkts`: Source-to-destination packet count
3. `dpkts`: Destination-to-source packet count
4. `sbytes`: Source-to-destination transaction bytes
5. `dbytes`: Destination-to-source transaction bytes
6. `rate`: Flow packet throughput (packets/sec)
7. `sttl`: Source-to-destination time-to-live
8. `dttl`: Destination-to-source time-to-live
9. `sload`: Source bits per second
10. `dload`: Destination bits per second
11. `sloss`: Source packets retransmitted/dropped
12. `dloss`: Destination packets retransmitted/dropped
13. `sinpkt`: Source interpacket arrival time (ms)
14. `dinpkt`: Destination interpacket arrival time (ms)
15. `sjit`: Source jitter (ms)
16. `djit`: Destination jitter (ms)
17. `swin`: Source TCP window advertisement
18. `stcpb`: Source TCP base sequence number
19. `dtcpb`: Destination TCP base sequence number
20. `dwin`: Destination TCP window advertisement
21. `tcprtt`: TCP connection round-trip time
22. `synack`: TCP setup time (SYN to SYN-ACK)
23. `ackdat`: TCP setup time (SYN-ACK to ACK)
24. `smean`: Mean packet size transmitted by source
25. `dmean`: Mean packet size transmitted by destination
26. `trans_depth`: HTTP request/response pipeline depth
27. `response_body_len`: Content size of HTTP response
28. `ct_srv_src`: Connections with same service & source (per 100)
29. `ct_state_ttl`: State count by TTL range
30. `ct_dst_ltm`: Connections to destination in last 100
31. `ct_src_dport_ltm`: Connections to same destination port (per 100)
32. `ct_dst_sport_ltm`: Connections to same source port (per 100)
33. `ct_dst_src_ltm`: Connections between same source & destination (per 100)
34. `is_ftp_login`: 1 if session authenticated, else 0
35. `ct_ftp_cmd`: Count of FTP commands in session
36. `ct_flw_http_mthd`: HTTP methods count (GET/POST)
37. `ct_src_ltm`: Connections from source in last 100
38. `ct_srv_dst`: Connections with same service & destination (per 100)
39. `is_sm_ips_ports`: 1 if source/dest IP and port match, else 0

---

## 4. API Endpoints & Contract Specification

| Method | Endpoint | Description | Request Payload | Response Status |
|---|---|---|---|---|
| `GET` | `/` | Root landing page with navigation links | None | `200 OK` |
| `GET` | `/api/v1/health` | Service health, readiness, and uptime | None | `200 OK` |
| `GET` | `/api/v1/models` | List available models and academic metrics | None | `200 OK` |
| `POST` | `/api/v1/predict` | Single flow classification | `NetworkFlowInput` (42 features) | `200 OK`, `400 Bad Request`, `422 Unprocessable` |
| `POST` | `/api/v1/predict/batch` | Bounded batch classification | Object with `flows: [...]` or JSON array | `200 OK`, `400 Bad Request`, `422 Unprocessable` |
| `GET` | `/api/v1/statistics` | Ephemeral inference counters & breakdown | None | `200 OK` |

---

## 5. Defense & Security Mechanisms

### 5.1 Strict Anti-Leakage Protocol
In academic machine learning audits, target leakage and identifier contamination invalidate reported performance:
- If a client passes `"label": 0` or `"attack_cat": "DoS"` or `"id": 105`, the request is rejected immediately at the Pydantic schema validation layer before hitting preprocessing or inference.
- Error message returned:
  `"Forbidden leakage/metadata field(s) detected: ['label']. NetShield prohibits passing 'label', 'attack_cat', or 'id' in prediction requests."`

### 5.2 Whitelisted Model Selection & Path Traversal Defense
The API supports explicit model selection via query parameter `?model_name=...` or in the request body.
- Allowed values: `["xgboost", "random_forest", "decision_tree", "logistic_regression", "linear_svc"]` (case-insensitive).
- If an attacker attempts path traversal (e.g. `?model_name=/etc/passwd` or `?model_name=../../secrets`), the request is rejected with HTTP 400.
- All error messages sanitize server file paths, replacing any system path with `[REDACTED_PATH]`.

### 5.3 Safe Handling of Unseen Network Protocols
In production networks, zero-day protocols, unexpected services, or non-standard TCP flags frequently occur.
- The `NetShieldPreprocessor` utilizes scikit-learn's `OneHotEncoder(handle_unknown='ignore')`.
- When an unseen protocol (e.g. `proto="wireguard"` or `service="custom_rpc"`) is processed, the preprocessor sets all one-hot indicator columns for that categorical attribute to `0.0`.
- The transformed vector shape remains strictly constant at `(N, 190)`, allowing inference to proceed safely without runtime crashes.

### 5.4 High-Performance Latency Instrumentation
Each prediction response includes fine-grained latency breakdown:
- `preprocessing_duration_ms`: Wall-clock time spent in `StandardScaler` and `OneHotEncoder` transformation.
- `inference_duration_ms`: Wall-clock time spent in `model.predict()` and `model.predict_proba()`.
- `total_duration_ms`: Cumulative end-to-end processing latency.
- In batch mode, inference is vectorized across the entire DataFrame, achieving throughput orders of magnitude higher than looping over individual records.

---

## 6. Verification & Automated Test Results

The backend implementation was verified against a dedicated test suite using `pytest` and FastAPI's `TestClient`.

### Test Summary
- **Total Tests Executed**: 23 backend tests (+ 6 Phase 2 tests = 29 tests total)
- **Status**: 100% PASSED (0 failures, 0 errors, 0 warnings)
- **Execution Time**: 0.55 seconds

```
backend/tests/test_batch_predict.py::test_batch_predict_object_format PASSED
backend/tests/test_batch_predict.py::test_batch_predict_raw_list_format PASSED
backend/tests/test_batch_predict.py::test_batch_predict_empty_list_rejected PASSED
backend/tests/test_batch_predict.py::test_batch_predict_exceeds_max_limit PASSED
backend/tests/test_health.py::test_health_check_success PASSED
backend/tests/test_health.py::test_root_landing_endpoint PASSED
backend/tests/test_models.py::test_list_models_success PASSED
backend/tests/test_predict.py::test_predict_normal_flow_default_model PASSED
backend/tests/test_predict.py::test_predict_attack_flow_random_forest PASSED
backend/tests/test_predict.py::test_predict_model_selection_in_payload PASSED
backend/tests/test_predict.py::test_predict_linear_svc_null_probability PASSED
backend/tests/test_predict.py::test_predict_case_insensitive_model_name PASSED
backend/tests/test_statistics.py::test_statistics_initial_state PASSED
backend/tests/test_statistics.py::test_statistics_increments_after_predictions PASSED
backend/tests/test_validation.py::test_validation_rejects_missing_feature PASSED
backend/tests/test_validation.py::test_validation_rejects_negative_value PASSED
backend/tests/test_validation.py::test_validation_rejects_invalid_binary_indicator PASSED
backend/tests/test_validation.py::test_validation_strictly_rejects_leakage_columns[label] PASSED
backend/tests/test_validation.py::test_validation_strictly_rejects_leakage_columns[attack_cat] PASSED
backend/tests/test_validation.py::test_validation_strictly_rejects_leakage_columns[id] PASSED
backend/tests/test_validation.py::test_validation_rejects_unknown_extra_fields PASSED
backend/tests/test_validation.py::test_rejects_unsupported_model_name PASSED
backend/tests/test_validation.py::test_error_sanitization_does_not_leak_paths PASSED
============================== 23 passed in 0.55s ==============================
```

---

## 7. Operational Readiness Checklist

| Requirement | Implementation Component | Status |
|---|---|---|
| Load preprocessor & models once at startup | `FastAPI(lifespan=lifespan)` in `backend/app/main.py` | **PASS** |
| XGBoost as default prediction model | `settings.DEFAULT_MODEL = "xgboost"` | **PASS** |
| Random Forest as optional model | Whitelisted and selectable via `?model_name=random_forest` | **PASS** |
| Reject arbitrary/unknown model paths | Whitelist validation in `ModelService.get_model()` | **PASS** |
| Never retrain models during API startup | Pure `joblib.load()` of pre-existing Phase 2 artifacts | **PASS** |
| Single-flow prediction endpoint | `POST /api/v1/predict` returning prediction, label, probability, latency | **PASS** |
| Batch prediction endpoint | `POST /api/v1/predict/batch` with summary and itemized predictions | **PASS** |
| Enforce maximum batch size limit | Enforced via `settings.MAX_BATCH_SIZE` (default: 5,000) | **PASS** |
| Health check endpoint | `GET /api/v1/health` returning readiness, loaded models, uptime | **PASS** |
| Model discovery endpoint | `GET /api/v1/models` returning academic benchmark metrics | **PASS** |
| Ephemeral statistics counters | `GET /api/v1/statistics` synchronized via `threading.Lock` | **PASS** |
| Strict anti-leakage protection | `reject_leakage_and_metadata` validator rejecting `id`, `attack_cat`, `label` | **PASS** |
| Error sanitization | Filesystem paths redacted in error details | **PASS** |
| Production dependency specification | `backend/requirements.txt` | **PASS** |
| Comprehensive documentation | `backend/README.md` with curl examples | **PASS** |
| Automated unit & integration tests | `backend/tests/` (23 tests passing) | **PASS** |

---

## 8. Conclusion & Next Phase Transition

Phase 3 is complete and verified. The backend provides a secure, leak-free, instrumented REST interface for network flow classification. The project is now positioned for:
- **Phase 4**: Frontend Dashboard Development (interactive visualization of network flows, real-time alert logs, model comparison charts, and live inference triggers).
- **Phase 5**: Defensive Live Packet Sniffing (offline PCAP parsing and feature extraction mapping raw packets to UNSW-NB15 flow features).
