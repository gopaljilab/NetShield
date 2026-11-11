# NETSHIELD – React Cybersecurity Dashboard (Phase 4)

**AI-Powered Network Intrusion Detection System**  
*Department of Computer Science & Engineering | Academic Mini Project (BCS586)*

A modern, high-density Security Operations Center (SOC) dashboard built with **React 18**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Recharts**. Connected directly to the NetShield FastAPI backend to provide real-time telemetry visualization, single-flow classification, high-throughput CSV batch evaluation, and audited model comparisons.

---

## 1. Visual Aesthetics & Design System

Inspired by elite defense platforms (Querytel Sentinel, NetWatch, and Interceptor SOC):
- **Background**: Deep Navy / Obsidian (`#070A12`, `#0B0F19`, `#141E33`).
- **Accent Accents**: Electric Cyan (`#06B6D4`, `#0EA5E9`) for active selections and brand badges.
- **Normal Telemetry**: Emerald Green (`#10B981`) for benign network flows and operational status.
- **Attack Telemetry**: Crimson Red (`#EF4444`, `#F43F5E`) for detected intrusions and critical anomalies.
- **Elevated Suspicion**: Amber (`#F59E0B`) for elevated risk and warnings.
- **Typography**: Inter for crisp UI layout; JetBrains Mono for telemetry metrics, IP/port tuples, and timestamps.

---

## 2. Page Directory & Functionality

### 1. Overview (`/`)
- **Key Metrics**: Total Flows Ingested, Normal Traffic Count, Detected Attacks Count, Active Engine & Uptime.
- **Visualizations**: 
  - Real-time pipeline latency timeline (area chart across recent 20 predictions).
  - Normal vs Attack traffic distribution ratio (donut chart).
  - Breakdown of cumulative inferences by machine learning model.
- **Stream Activity**: Recent session predictions with quick link to the Detection Center.

### 2. Traffic Monitor
- **Preset Dispatch Deck**: One-click dispatch of verified UNSW-NB15 flow presets (Normal HTTP, Backdoor Probe, DoS Flood, Exploit).
- **Flow Stream Table**: Real-time event log with filter tabs (All, Normal, Attacks) and duration/latency instrumentation.
- **Scope Disclaimer**: Explicitly explains offline UNSW-NB15 flow evaluation mode (no claim of live promiscuous packet capture).

### 3. Detection Center
- **Threat Triage**: Dedicated anomaly investigation view displaying all flows flagged as Label 1 (Attack).
- **Severity Scoring**: Categorizes alerts based on model confidence probability (Critical >= 90%, High >= 75%, Medium >= 50%, Low < 50%).
- **Interactive Inspection Modal**: Deep-dive inspection into the full flow telemetry tuple, duration, and probability gauge.
- **Defensive Caveat**: Clarifies that machine learning anomaly classification is an algorithmic decision requiring SOC correlation.

### 4. Model Performance & Benchmarks
- **Academic Benchmark Cards**: Compares all 5 trained classifiers (XGBoost, Random Forest, Decision Tree, Logistic Regression, Linear SVC).
- **Interactive Metric Chart**: Dynamically plots Accuracy, Precision, Recall, F1-Score, False Positive Rate (FPR), ROC-AUC, and Latency per 1k flows.
- **Complete Metric Matrix**: Full confusion matrix statistics (TP, TN, FP, FN) from the official Phase 2 audit.
- **Architectural Rationale**: Detailed academic justification explaining why XGBoost was chosen as production default over Random Forest.

### 5. Prediction Playground
- **Single Flow Form**: Full 42-feature input form categorized into 4 tabs (Basic, TCP Dynamics, Content, Connection Counts) with preset loaders and client-side validation.
- **Real-Time Outcome Card**: Displays predicted class (Normal / Attack), confidence probability gauge, and fine-grained latency breakdown (preprocessing ms, inference ms, total ms).
- **Batch CSV Upload**: In-browser CSV file parsing with PapaParse, automatic leakage exclusion (`label`, `attack_cat`, `id`), preview table, batch classification via API, and annotated CSV download.

### 6. Settings
- **Backend Connection Configuration**: Change or reset the API Base URL with in-browser persistence.
- **Interactive Ping**: Live latency probe testing backend connectivity.
- **Model Engine Selection**: Global selector switching the active classifier across all queries.
- **Polling Preferences**: Auto-refresh rate (5s, 10s, 30s, or manual).
- **Cache Management**: One-click clear of ephemeral session history.

---

## 3. Technology Stack

- **Runtime**: Node.js v20+ (tested on Node.js v22)
- **Framework**: React 18 with TypeScript 5
- **Build Tool**: Vite 6 (sub-2-second production compilation)
- **Styling**: Tailwind CSS 3.4 with custom cybersecurity theme
- **Charts**: Recharts 2.15 (Donut, Area, and Bar charts)
- **Icons**: Lucide React
- **CSV Parser**: PapaParse 5.5

---

## 4. Setup & Running the Dashboard

### Prerequisites
1. Ensure the NetShield FastAPI backend is running:
   ```bash
   uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

### Install Dependencies
```bash
cd frontend
npm install
```

### Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### Build Production Bundle
```bash
npm run build
```
Compiled production assets will be output to `frontend/dist/`.

### Run Automated Tests
```bash
npm test
```

---

## 5. Environment Variables

Create a `.env` file in `frontend/` (optional):
```bash
VITE_API_URL=http://localhost:8000
```
If not specified, the client defaults to `http://localhost:8000`, with user overrides configurable in the Settings page and persisted to `localStorage`.

---

## 6. Defensive Security & Anti-Leakage Rules

- **Zero Data Leakage Boundary**: The frontend schema strictly prohibits `id`, `attack_cat`, and `label` in single-flow and batch prediction payloads. In CSV uploads, any detected leakage columns are automatically stripped prior to API dispatch.
- **Real Telemetry**: No simulated numbers or random number generators are used for statistics. All metrics reflect actual backend API responses.
- **Session History Persistence**: Frontend event history is ephemerally stored in browser `sessionStorage` and clearly labeled as session telemetry, making it distinct from database-backed persistence.
