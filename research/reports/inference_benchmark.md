# NetShield – Comprehensive Inference Latency Benchmark Report

**Project Title:** NetShield: AI-Powered Network Intrusion Detection System Using Machine Learning  
**Evaluation Target:** Production Inference Latency, Model Loading Time & End-to-End Flow Processing  
**Dataset / Hardware:** UNSW-NB15 Benchmark | Apple Silicon (ARM64) Multi-Core CPU  
**Auditor / Mentor:** Senior Machine Learning Engineer & Academic Project Mentor  
**Date of Audit:** November 11, 2026  

---

## 1. Benchmarking Methodology & Rigor

In standard machine learning evaluations, latency is often measured superficially (e.g., timing a single arbitrary batch without warm-up and excluding preprocessing). To establish true production-grade operational metrics for NetShield, this audit conducted an independent, multi-tiered benchmark adhering to strict performance engineering protocols:

1. **Isolation of Model Deserialization:** Model loading from disk (`joblib.load`) is measured independently and strictly excluded from inference timing loops.
2. **Warm-Up Execution:** Every model executes 5 to 10 unmeasured "warm-up" inference cycles before timing begins to ensure runtime caches, thread pools, and dynamic libraries are fully primed.
3. **Repeated Measurement & Statistical Distribution:** Every test is executed across 30 to 100 iterations. Both the arithmetic mean and standard deviation ($\mu \pm \sigma$) are reported.
4. **Multi-Scale Batch Sizing:** Evaluated across three operational deployment scenarios:
   - **Streaming Mode (Batch Size = 1):** Simulates real-time, flow-by-flow packet stream classification as flows terminate.
   - **Micro-Batch Mode (Batch Size = 100):** Simulates a small memory buffer queue in a defensive edge proxy.
   - **Macro-Batch Mode (Batch Size = 1,000):** Simulates bulk offline ingestion of firewall logs.
5. **End-to-End Pipeline Timing:** Preprocessing transformation latency (`StandardScaler` + `OneHotEncoder`) is benchmarked separately to provide true end-to-end flow classification cost.
6. **Scientific Metric Standard:** Measurements are reported strictly in **flow classification latency (milliseconds and microseconds per flow)**. Conversions from flow latency to raw "packets per second" are explicitly rejected as unscientific because a single flow represents an aggregated session comprising dozens or hundreds of individual packets.

---

## 2. Preprocessing Pipeline Latency Benchmark

In an operational deployment, incoming raw network features cannot bypass preprocessing. The raw input dictionary or dataframe must be normalized and encoded before reaching `model.predict()`.

| Batch Size | Scenario | Total Preprocessing Time ($\mu \pm \sigma$) | Per-Flow Processing Overhead |
| :--- | :--- | :--- | :--- |
| **Batch = 1** | Real-time single flow | $1.230 \pm 0.079\text{ ms}$ | $1,229.6\ \mu\text{s / flow}$ ($1.23\text{ ms}$) |
| **Batch = 100** | Edge buffer queue | $1.281 \pm 0.120\text{ ms}$ | $12.8\ \mu\text{s / flow}$ |
| **Batch = 1,000** | Bulk firewall log | $1.935 \pm 0.118\text{ ms}$ | $1.9\ \mu\text{s / flow}$ |

### Preprocessing Observation:
- Pandas DataFrame indexing and Scikit-Learn transformer overhead imposes a baseline cost of $\approx 1.2\text{ ms}$ on single-row inputs.
- When batched (e.g., 100 to 1,000 flows), vectorized NumPy operations take over, driving the per-flow preprocessing cost down to **$1.9\ \mu\text{s}$ per flow**.

---

## 3. Pure Model Inference Benchmark (Excluding Loading & Preprocessing)

All 5 saved models in `ml/saved_models/` were benchmarked on pre-transformed feature arrays.

| Model | Disk Size | Deserialization Time | Single-Flow Latency (Batch = 1)<br>*Real-time Streaming* | Micro-Batch Latency (Batch = 100)<br>*Total / Per-Flow* | Macro-Batch Latency (Batch = 1,000)<br>*Total / Per-Flow* |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Logistic Regression** | 2.3 KB | 184.26 ms | $48.92 \pm 2.92\ \mu\text{s}$ ($0.049\text{ ms}$) | $0.075\text{ ms}$ ($0.75\ \mu\text{s}$) | $0.182\text{ ms}$ ($0.18\ \mu\text{s}$) |
| **Decision Tree** | 56 KB | 91.88 ms | $66.19 \pm 6.11\ \mu\text{s}$ ($0.066\text{ ms}$) | $0.068\text{ ms}$ ($0.68\ \mu\text{s}$) | $0.113\text{ ms}$ ($0.11\ \mu\text{s}$) |
| **Random Forest** | 11.0 MB | 74.37 ms | $13,933.18 \pm 4,178.62\ \mu\text{s}$ (**13.93 ms**) | $13.574\text{ ms}$ ($135.7\ \mu\text{s}$) | $15.261\text{ ms}$ ($15.26\ \mu\text{s}$) |
| **Linear SVC** | 2.2 KB | 0.80 ms | $52.20 \pm 6.32\ \mu\text{s}$ ($0.052\text{ ms}$) | $0.075\text{ ms}$ ($0.75\ \mu\text{s}$) | $0.177\text{ ms}$ ($0.18\ \mu\text{s}$) |
| **XGBoost** ⭐ | 247 KB | 109.41 ms | **$122.20 \pm 17.99\ \mu\text{s}$** (**0.122 ms**) | **$0.236\text{ ms}$** ($2.36\ \mu\text{s}$) | **$0.502\text{ ms}$** (**0.50 $\mu\text{s}$**) |

---

## 4. Critical Engineering Discovery: The Random Forest Threading Bottleneck

### The Anomaly:
In batch evaluation (10,000 samples), Random Forest appeared reasonably fast ($3.56\text{ ms}$ per 1,000 flows). However, when benchmarked on **single-flow streaming (Batch Size = 1)**, Random Forest exhibited a severe latency penalty:
- **Random Forest Single-Flow Latency:** **$13.93\text{ ms}$ per prediction**!
- **XGBoost Single-Flow Latency:** **$0.12\text{ ms}$ per prediction** (over **110x faster**)!
- **Decision Tree Single-Flow Latency:** **$0.066\text{ ms}$ per prediction** (over **200x faster**)!

### Root Cause Analysis:
Scikit-Learn's `RandomForestClassifier` was initialized with `n_jobs=-1`. When `predict()` is called on a single input row, Scikit-Learn's multi-processing backend (`loky` / `threading`) attempts to spawn and synchronize threads across 100 separate decision trees. The CPU core synchronization and lock contention overhead completely dwarfs the actual tree traversal time. 

In contrast:
- **XGBoost** compiles its sequential tree decision paths into optimized C++ machine code, eliminating Python GIL and thread contention bottlenecks.
- As a result, XGBoost executes single-flow predictions in **$122\ \mu\text{s}$** and classifies an entire batch of 1,000 flows in **$0.50\text{ ms}$**.

---

## 5. End-to-End Defensive Latency Assessment

Combining preprocessing and model inference yields the actual end-to-end operational budget:

$$\text{End-to-End Flow Classification Latency} = t_{\text{preprocessing}} + t_{\text{inference}}$$

1. **Streaming Real-Time Deployment (Batch = 1):**
   - **XGBoost Pipeline:** $1.230\text{ ms} + 0.122\text{ ms} = \mathbf{1.352\text{ ms}}$ per flow.
   - **Decision Tree Pipeline:** $1.230\text{ ms} + 0.066\text{ ms} = \mathbf{1.296\text{ ms}}$ per flow.
   - **Random Forest Pipeline:** $1.230\text{ ms} + 13.933\text{ ms} = \mathbf{15.163\text{ ms}}$ per flow.
2. **Buffer Queue Deployment (Micro-batch = 100 flows):**
   - **XGBoost Pipeline:** $1.281\text{ ms} + 0.236\text{ ms} = \mathbf{1.517\text{ ms}}$ total for 100 flows ($\mathbf{15.2\ \mu\text{s}}$ per flow).
   - **Random Forest Pipeline:** $1.281\text{ ms} + 13.574\text{ ms} = \mathbf{14.855\text{ ms}}$ total for 100 flows ($\mathbf{148.5\ \mu\text{s}}$ per flow).

---

## 6. Architectural Recommendation for Phase 3 Backend

Based on this empirical benchmark:
1. **For the FastAPI / Flask Real-Time Dashboard:**
   - **XGBoost** is the definitively superior operational engine. It provides essentially identical detection accuracy to Random Forest (90.00% vs 90.21% Acc, 92.15% vs 92.34% F1) while offering:
     - **110x faster single-flow response time** ($0.12\text{ ms}$ vs $13.93\text{ ms}$).
     - **Lower False Positive Rate** (2.10% vs 2.25%).
     - **Compact memory footprint** ($247\text{ KB}$ artifact vs $11.0\text{ MB}$).
2. **For Batch Offline Auditing:**
   - Both Random Forest and XGBoost are highly viable, with XGBoost executing 30x faster ($0.50\text{ ms}$ vs $15.26\text{ ms}$ per 1,000 flows).
