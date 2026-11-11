# NetShield Backend REST API (Phase 3)

**NetShield – AI-Powered Network Intrusion Detection System Using Machine Learning**  
*Department of Computer Science & Engineering | Academic Mini Project (BCS586)*

The NetShield backend is a modular, high-performance REST API built with **FastAPI**, **Pydantic v2**, and **Uvicorn**. It serves trained machine learning classifiers (XGBoost, Random Forest, Decision Tree, Logistic Regression, Linear SVC) on network flow telemetry extracted from the **UNSW-NB15** intrusion detection benchmark.

---

## 1. Architecture & Directory Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                   # FastAPI app entrypoint, lifespan loader, CORS & error handlers
│   ├── config.py                 # Environment-aware application configuration
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── prediction.py         # 42-feature input, single & batch prediction schemas
│   │   ├── health.py             # Health check schema
│   │   ├── models.py             # Model discovery and benchmark schemas
│   │   └── statistics.py         # Ephemeral telemetry and counter schemas
│   ├── services/
│   │   ├── __init__.py
│   │   ├── model_service.py      # Artifact loading, model whitelisting, metadata lookup
│   │   └── prediction_service.py # Preprocessing orchestration, inference timing, thread-safe metrics
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes/
│   │       ├── __init__.py       # Aggregated API v1 router
│   │       ├── health.py         # GET /api/v1/health
│   │       ├── models.py         # GET /api/v1/models
│   │       ├── prediction.py     # POST /api/v1/predict & POST /api/v1/predict/batch
│   │       └── statistics.py     # GET /api/v1/statistics
│   └── utils/
│       ├── __init__.py
│       └── validation.py         # Pydantic error formatting & path sanitization
├── tests/
│   ├── __init__.py
│   ├── conftest.py               # Test fixtures (TestClient, sample normal/attack flows)
│   ├── test_health.py            # Health and landing route tests
│   ├── test_models.py            # Model discovery tests
│   ├── test_predict.py           # Single flow inference tests
│   ├── test_batch_predict.py     # Vectorized batch prediction tests
│   ├── test_statistics.py        # Cumulative counter tests
│   └── test_validation.py        # Schema validation, leakage rejection & sanitization tests
├── requirements.txt              # Production and testing dependencies
└── README.md                     # Backend developer & operational guide
```

---

## 2. Key Design & Defensive Principles

1. **Lifespan Artifact Loading**: All machine learning artifacts (`preprocessor.joblib`, `xgboost.joblib`, etc.) are loaded once into memory during application startup. Artifacts are never deserialized per-request, and models are never retrained on the API thread.
2. **Strict Anti-Leakage Protocol**: Ground-truth target columns (`label`) and metadata/leakage columns (`id`, `attack_cat`) are strictly prohibited in prediction inputs. If supplied, requests are immediately rejected with HTTP 422.
3. **Whitelisted Model Selection**: Clients can specify a model override (e.g. `?model_name=random_forest`). Arbitrary file paths or unsupported models are strictly rejected (HTTP 400). Default model is **XGBoost**.
4. **Vectorized Batch Processing**: The batch endpoint transforms and evaluates flows in vector format via NumPy and pandas, enforcing a configurable limit (default: 5,000 flows).
5. **Thread-Safe Ephemeral Telemetry**: In-memory statistics counters are synchronized with `threading.Lock` and explicitly documented as ephemeral (resets on process restart).
6. **Error Sanitization**: All error handlers redact server filesystem paths (e.g. `/Users/...` or `C:\...`) to protect host infrastructure details.

---

## 3. Installation & Setup

### Prerequisites
- Python 3.9+ (tested on Python 3.9.6 on macOS ARM64 / Linux x86_64)
- OpenMP runtime for XGBoost (`brew install libomp` on macOS, `apt install libgomp1` on Debian/Ubuntu)

### Install Dependencies
```bash
# Optional: create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt
```

---

## 4. Running the Server

Start the Uvicorn development server:
```bash
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

The interactive documentation will be available at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI Schema**: `http://localhost:8000/openapi.json`

---

## 5. Running the Automated Test Suite

Execute the comprehensive 23-test backend test suite:
```bash
pytest backend/tests/ -v
```

Run all project tests (including Phase 2 pipeline tests):
```bash
pytest backend/tests/ tests/ -v
```

---

## 6. API Endpoints Reference & Examples

### A. Health & Readiness Check
- **Endpoint**: `GET /api/v1/health`
- **Description**: Verifies service status and loaded model availability.

```bash
curl -X GET http://localhost:8000/api/v1/health
```

**Response (200 OK)**:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "models_loaded": true,
  "available_models": ["xgboost", "random_forest", "decision_tree", "logistic_regression", "linear_svc"],
  "default_model": "xgboost",
  "uptime_seconds": 12.45,
  "timestamp": "2026-11-11T12:00:00.000000+00:00"
}
```

---

### B. Model Discovery & Academic Benchmarks
- **Endpoint**: `GET /api/v1/models`
- **Description**: Lists all available classifiers with audited test performance on UNSW-NB15.

```bash
curl -X GET http://localhost:8000/api/v1/models
```

**Response (200 OK)**:
```json
{
  "models": [
    {
      "name": "xgboost",
      "display_name": "XGBoost (Extreme Gradient Boosting)",
      "algorithm_type": "Gradient Boosted Decision Trees",
      "is_default": true,
      "supports_probability": true,
      "accuracy_pct": 90.0,
      "precision_pct": 98.87,
      "recall_pct": 86.29,
      "f1_pct": 92.15,
      "fpr_pct": 2.1,
      "fnr_pct": 13.71,
      "roc_auc_pct": 98.63,
      "latency_ms_per_1k": 0.394,
      "description": "High-performance ensemble of gradient boosted trees optimized for low FPR and high throughput."
    },
    {
      "name": "random_forest",
      "display_name": "Random Forest Classifier",
      "algorithm_type": "Ensemble Bagging (Decision Trees)",
      "is_default": false,
      "supports_probability": true,
      "accuracy_pct": 90.21,
      "precision_pct": 98.8,
      "recall_pct": 86.67,
      "f1_pct": 92.34,
      "fpr_pct": 2.25,
      "fnr_pct": 13.33,
      "roc_auc_pct": 98.69,
      "latency_ms_per_1k": 3.56,
      "description": "Robust bagging ensemble with 100 estimators providing strong generalization and high recall."
    }
  ],
  "default_model": "xgboost"
}
```

---

### C. Single Flow Classification
- **Endpoint**: `POST /api/v1/predict`
- **Query Parameters**: `model_name` *(optional)* — overrides default (`xgboost`). Allowed: `xgboost`, `random_forest`, `decision_tree`, `logistic_regression`, `linear_svc`.
- **Request Body**: JSON object containing all 42 flow features.

```bash
curl -X POST "http://localhost:8000/api/v1/predict?model_name=xgboost" \
     -H "Content-Type: application/json" \
     -d '{
       "dur": 0.449454,
       "proto": "tcp",
       "service": "-",
       "state": "FIN",
       "spkts": 10.0,
       "dpkts": 6.0,
       "sbytes": 534.0,
       "dbytes": 268.0,
       "rate": 33.373826,
       "sttl": 254.0,
       "dttl": 252.0,
       "sload": 8561.499023,
       "dload": 3987.059814,
       "sloss": 2.0,
       "dloss": 1.0,
       "sinpkt": 47.750333,
       "dinpkt": 75.659602,
       "sjit": 2415.837634,
       "djit": 115.807,
       "swin": 255.0,
       "stcpb": 2436137549.0,
       "dtcpb": 1977154190.0,
       "dwin": 255.0,
       "tcprtt": 0.128381,
       "synack": 0.071147,
       "ackdat": 0.057234,
       "smean": 53.0,
       "dmean": 45.0,
       "trans_depth": 0.0,
       "response_body_len": 0.0,
       "ct_srv_src": 43.0,
       "ct_state_ttl": 1.0,
       "ct_dst_ltm": 2.0,
       "ct_src_dport_ltm": 2.0,
       "ct_dst_sport_ltm": 1.0,
       "ct_dst_src_ltm": 40.0,
       "is_ftp_login": 0.0,
       "ct_ftp_cmd": 0.0,
       "ct_flw_http_mthd": 0.0,
       "ct_src_ltm": 2.0,
       "ct_srv_dst": 39.0,
       "is_sm_ips_ports": 0.0
     }'
```

**Response (200 OK)**:
```json
{
  "prediction": 0,
  "label": "Normal",
  "probability": 0.0615,
  "model_used": "xgboost",
  "timestamp": "2026-11-11T12:02:00.000000+00:00",
  "preprocessing_duration_ms": 3.36,
  "inference_duration_ms": 3.286,
  "total_duration_ms": 6.647
}
```

---

### D. Batch Flow Classification
- **Endpoint**: `POST /api/v1/predict/batch`
- **Request Body**: Object with `flows` array (or direct JSON array of flow objects) and optional `model_name`.

```bash
curl -X POST "http://localhost:8000/api/v1/predict/batch" \
     -H "Content-Type: application/json" \
     -d '{
       "model_name": "xgboost",
       "flows": [
         {
           "dur": 0.449454, "proto": "tcp", "service": "-", "state": "FIN",
           "spkts": 10.0, "dpkts": 6.0, "sbytes": 534.0, "dbytes": 268.0,
           "rate": 33.373826, "sttl": 254.0, "dttl": 252.0, "sload": 8561.499023,
           "dload": 3987.059814, "sloss": 2.0, "dloss": 1.0, "sinpkt": 47.750333,
           "dinpkt": 75.659602, "sjit": 2415.837634, "djit": 115.807, "swin": 255.0,
           "stcpb": 2436137549.0, "dtcpb": 1977154190.0, "dwin": 255.0, "tcprtt": 0.128381,
           "synack": 0.071147, "ackdat": 0.057234, "smean": 53.0, "dmean": 45.0,
           "trans_depth": 0.0, "response_body_len": 0.0, "ct_srv_src": 43.0, "ct_state_ttl": 1.0,
           "ct_dst_ltm": 2.0, "ct_src_dport_ltm": 2.0, "ct_dst_sport_ltm": 1.0, "ct_dst_src_ltm": 40.0,
           "is_ftp_login": 0.0, "ct_ftp_cmd": 0.0, "ct_flw_http_mthd": 0.0, "ct_src_ltm": 2.0,
           "ct_srv_dst": 39.0, "is_sm_ips_ports": 0.0
         },
         {
           "dur": 0.000009, "proto": "ddp", "service": "-", "state": "INT",
           "spkts": 2.0, "dpkts": 0.0, "sbytes": 200.0, "dbytes": 0.0,
           "rate": 111111.1072, "sttl": 254.0, "dttl": 0.0, "sload": 88888888.0,
           "dload": 0.0, "sloss": 0.0, "dloss": 0.0, "sinpkt": 0.009,
           "dinpkt": 0.0, "sjit": 0.0, "djit": 0.0, "swin": 0.0,
           "stcpb": 0.0, "dtcpb": 0.0, "dwin": 0.0, "tcprtt": 0.0,
           "synack": 0.0, "ackdat": 0.0, "smean": 100.0, "dmean": 0.0,
           "trans_depth": 0.0, "response_body_len": 0.0, "ct_srv_src": 4.0, "ct_state_ttl": 2.0,
           "ct_dst_ltm": 1.0, "ct_src_dport_ltm": 1.0, "ct_dst_sport_ltm": 1.0, "ct_dst_src_ltm": 4.0,
           "is_ftp_login": 0.0, "ct_ftp_cmd": 0.0, "ct_flw_http_mthd": 0.0, "ct_src_ltm": 2.0,
           "ct_srv_dst": 4.0, "is_sm_ips_ports": 0.0
         }
       ]
     }'
```

**Response (200 OK)**:
```json
{
  "total_flows": 2,
  "normal_count": 1,
  "attack_count": 1,
  "model_used": "xgboost",
  "timestamp": "2026-11-11T12:03:00.000000+00:00",
  "batch_duration_ms": 7.42,
  "predictions": [
    {
      "prediction": 0,
      "label": "Normal",
      "probability": 0.0615,
      "model_used": "xgboost",
      "timestamp": "2026-11-11T12:03:00.000000+00:00",
      "preprocessing_duration_ms": 1.85,
      "inference_duration_ms": 1.86,
      "total_duration_ms": 3.71
    },
    {
      "prediction": 1,
      "label": "Attack",
      "probability": 0.985,
      "model_used": "xgboost",
      "timestamp": "2026-11-11T12:03:00.000000+00:00",
      "preprocessing_duration_ms": 1.85,
      "inference_duration_ms": 1.86,
      "total_duration_ms": 3.71
    }
  ]
}
```

---

### E. Operational Statistics & Telemetry
- **Endpoint**: `GET /api/v1/statistics`
- **Description**: Returns thread-safe in-memory cumulative counters since process startup.

```bash
curl -X GET http://localhost:8000/api/v1/statistics
```

**Response (200 OK)**:
```json
{
  "total_predictions": 154,
  "normal_predictions": 120,
  "attack_predictions": 34,
  "predictions_by_model": {
    "xgboost": 140,
    "random_forest": 14
  },
  "uptime_seconds": 342.15,
  "server_start_time": "2026-11-11T11:55:00.000000+00:00",
  "timestamp": "2026-11-11T12:00:42.150000+00:00",
  "ephemeral_notice": "In-memory counters reset on application restart."
}
```

---

## 7. Error Handling & Validation Rules

| HTTP Status | Error Type | Trigger Condition | Example Error Response |
|---|---|---|---|
| **400 Bad Request** | Business Logic | Unsupported model or empty batch | `{"error": "Bad Request", "detail": "Model 'resnet' is not available."}` |
| **422 Unprocessable Content** | Schema Validation | Missing feature, negative metric, or forbidden column | `{"error": "Validation Error", "detail": [{"field": "dur", "message": "Input should be greater than or equal to 0"}]}` |
| **500 Internal Error** | Server Exception | Uncaught runtime error | `{"error": "Internal Server Error", "detail": "An internal server error occurred while processing the request."}` |

---

## 8. College Project Defense FAQ

- **Q: Why is XGBoost the default model instead of Random Forest?**  
  *A: In our Phase 2 evaluation, Random Forest achieved 90.21% accuracy and 3.56 ms latency per 1k flows, but single-flow latency was ~13.9 ms due to threading synchronization overhead. XGBoost achieved 90.00% accuracy, a lower False Positive Rate (2.10% vs 2.25%), and a single-flow latency of ~0.12 ms (over 100x faster for single packet/flow decisions).*

- **Q: How is data leakage prevented in the REST API?**  
  *A: The API strictly prohibits `label`, `attack_cat`, and `id` in the input schema via Pydantic model validators. If any of these fields are submitted, the API rejects the request before inference. The preprocessor applies transformers fitted exclusively on the UNSW-NB15 training partition.*

- **Q: What happens when an unseen protocol or service arrives at the API?**  
  *A: The underlying `OneHotEncoder` was initialized with `handle_unknown='ignore'`. Any novel protocol or service is safely encoded as all zeros in the one-hot columns without raising errors.*
