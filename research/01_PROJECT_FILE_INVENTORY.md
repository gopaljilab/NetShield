# NetShield – Complete Project File Inventory & Discovery Report

**Project Title:** NetShield: AI-Powered Network Intrusion Detection System Using Machine Learning  
**Academic Context:** Department of Computer Science & Engineering, Mini Project (Course Code: BCS586)  
**Author / Team Members:** Tejashwini PB (1BH24CS077), Ruthu K (1BH24CS057), Lalit (1BH25CS408), Gopal Gupta (1BH25CS406)  
**Project Guide:** Dr. Jerline Sheeba Anni, Head of Department, Dept. of CSE  
**Date of Audit:** November 11, 2026  
**Auditor / Mentor:** Senior Machine Learning Engineer & Academic Project Mentor  

---

## 1. Executive Summary of File Discovery

A comprehensive recursive discovery and file integrity inspection was conducted across the root workspace directory `/Users/gopalguptamac/Downloads/NetSheild`. Every document, presentation, dataset, and configuration file was audited, categorized, and inspected for readability, structural integrity, and relevance to the NetShield defensive NIDS project.

### Summary Statistics:
- **Total Research Papers Found:** 10 PDF documents inside `research_papers/`.
- **Total Project Documentation Found:** 1 Review 0 presentation PDF in workspace root (`NetShield_Review0.pptx (1).pdf`).
- **Total Dataset Files Found:** 19 dataset files inside `dataset/` comprising:
  - **8 Parquet Files** (CICIDS2017 8-day network flow captures, 253 MB total).
  - **8 UNSW-NB15 CSV Files** (Official Train/Test splits, 4 raw capture parts, feature descriptions, event dictionary, 608 MB total).
  - **3 Miscellaneous CSV Files** (`Midterm_53_group.csv`, `output1.csv`, `network_traffic_dataset.csv`, 76 MB total).
- **Existing Preprocessing / Training Scripts:** None initially present (clean slate for disciplined development).
- **File Readability Status:** All 10 research papers and all 19 dataset files were successfully parsed and verified.
- **Critical Integrity Findings:**
  1. **Duplicate Research Papers:** `paper 3.pdf` and `paper 10.pdf` are identical research papers (*Dietz et al., CNSM 2025*).
  2. **Font Encoding Issue Resolved:** `paper 6.pdf` (*Ali et al., CICTN 2025*) had custom font glyph shifts (ASCII offset $+29$). A dedicated decoding pipeline was implemented to recover the complete readable text.
  3. **Irrelevant "Network Traffic" Dataset:** `network_traffic_dataset.csv` contains QoS streaming/call categories (`Video_Streaming` vs `VoIP_Call`), **not** cyber intrusion traffic.
  4. **Unlabelled Packet Dumps:** `Midterm_53_group.csv` and `output1.csv` are unlabelled Wireshark packet captures without intrusion ground truth labels.

---

## 2. Complete Project File Inventory

| Category | File Name | File Path | File Type | File Size | Read Status | Relevance & Function in NetShield |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Project Presentation** | `NetShield_Review0.pptx (1).pdf` | `./NetShield_Review0.pptx (1).pdf` | PDF Presentation | 2.62 MB | **Verified Readable** | **Essential Primary Spec:** College Review 0 presentation defining project scope, team members, supervisor, 5 target ML models, backend/frontend plan, and reference paper. |
| **Research Paper 1** | `paper 1.pdf` | `./research_papers/paper 1.pdf` | PDF Paper | 609 KB | **Verified Readable** | **High:** Fu (ICISCN 2025), DNN + Random Forest hybrid model on KDD Cup 1999, layered architecture, latency benchmarks (~50ms). |
| **Research Paper 2** | `paper 2.pdf` | `./research_papers/paper 2.pdf` | PDF Paper | 1.50 MB | **Verified Readable** | **High:** Abdiyeva-Aliyeva et al. (IEEE 2025), comparative study of 7 ML models on NSL-KDD, evaluation metrics analysis. |
| **Research Paper 3** | `paper 3.pdf` | `./research_papers/paper 3.pdf` | PDF Paper | 329 KB | **Verified Readable** | **High:** Dietz et al. (CNSM 2025), Explainable AI (SHAP & LIME) consensus and PCA/MCA feature decorrelation on CICIDS2017 & CIDDS. |
| **Research Paper 4** | `paper 4.pdf` | `./research_papers/paper 4.pdf` | PDF Paper | 483 KB | **Verified Readable** | **High:** Geetha et al. (Ramaiah IT, IEEE), PySpark + ML (LR, RF, NB) on NSL-KDD with real-time packet capture via tcpdump/PyShark. |
| **Research Paper 5** | `paper 5.pdf` | `./research_papers/paper 5.pdf` | PDF Paper | 1.10 MB | **Verified Readable** | **High:** Madhusudhan & Madam (ICSCN 2025), benchmarking deep learning models on UNSW-NB15 & KDD datasets across comprehensive metrics (Accuracy, Recall, F-measure, MCC, Kappa, FPR, FNR). |
| **Research Paper 6** | `paper 6.pdf` | `./research_papers/paper 6.pdf` | PDF Paper | 698 KB | **Decoded & Readable** | **High:** Ali et al. (CICTN 2025), White-box adversarial evasion attacks (FGSM, PGD, C&W) on CNN-LSTM trained on CICIDS2017. Custom font shift (+29) successfully decoded. |
| **Research Paper 7** | `paper 7.pdf` | `./research_papers/paper 7.pdf` | PDF Paper | 464 KB | **Verified Readable** | **High:** Joshi & Fang (IEEE 2025), xLSTM explainable architecture for NIDS evaluated on UNSW-NB15 and TON-IoT. |
| **Research Paper 8** | `paper 8.pdf` | `./research_papers/paper 8.pdf` | PDF Paper | 243 KB | **Verified Readable** | **High:** Nguyen & Park (IEEE 2025), Open Set Recognition (OSR) using Weibull distribution on GNN for unknown attack detection on CICIDS2017 and UNSW-NB15. |
| **Research Paper 9** | `paper 9.pdf` | `./research_papers/paper 9.pdf` | PDF Paper | 967 KB | **Verified Readable** | **Critical:** Dahre et al. (CICN 2026), Label-flipping poisoning attacks on 7 ML models (DT, RF, XGB, LR, SVC, GNB, DNN) using CICIDS2017 binary classification. Direct benchmark for NetShield algorithms. |
| **Research Paper 10** | `paper 10.pdf` | `./research_papers/paper 10.pdf` | PDF Paper | 329 KB | **Verified Readable** | **Duplicate:** Identical reprint of `paper 3.pdf` (*Dietz et al., CNSM 2025*). |
| **Dataset: CICIDS2017** | `Benign-Monday-no-metadata.parquet` | `./dataset/Benign-Monday-no-metadata.parquet` | Apache Parquet | 54.0 MB | **Verified Readable** | **Benchmark File:** 458,831 records, 78 columns. 100% Benign baseline Monday traffic. |
| **Dataset: CICIDS2017** | `Bruteforce-Tuesday-no-metadata.parquet` | `./dataset/Bruteforce-Tuesday-no-metadata.parquet` | Apache Parquet | 44.0 MB | **Verified Readable** | **Benchmark File:** 389,714 records, 78 columns. Attacks: FTP-Patator (5,931), SSH-Patator (3,219). |
| **Dataset: CICIDS2017** | `DoS-Wednesday-no-metadata.parquet` | `./dataset/DoS-Wednesday-no-metadata.parquet` | Apache Parquet | 65.0 MB | **Verified Readable** | **Benchmark File:** 584,991 records, 78 columns. Attacks: DoS Hulk (172,846), GoldenEye (10,286), slowloris (5,385), Slowhttptest (5,228), Heartbleed (11). |
| **Dataset: CICIDS2017** | `WebAttacks-Thursday-no-metadata.parquet` | `./dataset/WebAttacks-Thursday-no-metadata.parquet` | Apache Parquet | 17.0 MB | **Verified Readable** | **Benchmark File:** 155,820 records, 78 columns. Attacks: Web Attack Brute Force (1,470), XSS (652), Sql Injection (21). |
| **Dataset: CICIDS2017** | `Infiltration-Thursday-no-metadata.parquet` | `./dataset/Infiltration-Thursday-no-metadata.parquet` | Apache Parquet | 22.0 MB | **Verified Readable** | **Benchmark File:** 207,630 records, 78 columns. Attacks: Infiltration (36). |
| **Dataset: CICIDS2017** | `Botnet-Friday-no-metadata.parquet` | `./dataset/Botnet-Friday-no-metadata.parquet` | Apache Parquet | 19.0 MB | **Verified Readable** | **Benchmark File:** 176,038 records, 78 columns. Attacks: Botnet (1,437). |
| **Dataset: CICIDS2017** | `DDoS-Friday-no-metadata.parquet` | `./dataset/DDoS-Friday-no-metadata.parquet` | Apache Parquet | 24.0 MB | **Verified Readable** | **Benchmark File:** 221,264 records, 78 columns. Attacks: DDoS LOIC (128,014). |
| **Dataset: CICIDS2017** | `Portscan-Friday-no-metadata.parquet` | `./dataset/Portscan-Friday-no-metadata.parquet` | Apache Parquet | 13.0 MB | **Verified Readable** | **Benchmark File:** 119,522 records, 78 columns. Attacks: PortScan (1,956). |
| **Dataset: UNSW-NB15** | `UNSW_NB15_training-set.csv` | `./dataset/UNSW_NB15_training-set.csv` | CSV Dataset | 15.0 MB | **Verified Readable** | **PRIMARY BENCHMARK:** 82,332 records, 45 columns. Official training partition (37,000 Normal, 45,332 Attack across 9 categories). |
| **Dataset: UNSW-NB15** | `UNSW_NB15_testing-set.csv` | `./dataset/UNSW_NB15_testing-set.csv` | CSV Dataset | 31.0 MB | **Verified Readable** | **PRIMARY BENCHMARK:** 175,341 records, 45 columns. Official test partition (56,000 Normal, 119,341 Attack across 9 categories). |
| **Dataset: UNSW-NB15** | `NUSW-NB15_features.csv` | `./dataset/NUSW-NB15_features.csv` | CSV Metadata | 3.9 KB | **Verified Readable** | **Feature Dictionary:** 49 features detailed with names, data types, and semantic descriptions. |
| **Dataset: UNSW-NB15** | `UNSW-NB15_LIST_EVENTS.csv` | `./dataset/UNSW-NB15_LIST_EVENTS.csv` | CSV Metadata | 4.5 KB | **Verified Readable** | **Event Dictionary:** 208 attack event categories, subcategories, and occurrence counts. |
| **Dataset: UNSW-NB15** | `UNSW-NB15_1.csv` | `./dataset/UNSW-NB15_1.csv` | CSV Dataset | 161.0 MB | **Verified Readable** | **Raw Capture Part 1:** 700,001 raw network flow records from IXIA PerfectStorm testbed. |
| **Dataset: UNSW-NB15** | `UNSW-NB15_2.csv` | `./dataset/UNSW-NB15_2.csv` | CSV Dataset | 158.0 MB | **Verified Readable** | **Raw Capture Part 2:** 700,001 raw network flow records. |
| **Dataset: UNSW-NB15** | `UNSW-NB15_3.csv` | `./dataset/UNSW-NB15_3.csv` | CSV Dataset | 147.0 MB | **Verified Readable** | **Raw Capture Part 3:** 700,001 raw network flow records. |
| **Dataset: UNSW-NB15** | `UNSW-NB15_4.csv` | `./dataset/UNSW-NB15_4.csv` | CSV Dataset | 93.0 MB | **Verified Readable** | **Raw Capture Part 4:** 440,044 raw network flow records. |
| **Non-NIDS File** | `network_traffic_dataset.csv` | `./dataset/network_traffic_dataset.csv` | CSV Dataset | 3.2 MB | **Verified Readable** | **REJECTED FROM NIDS:** 89,709 records, 4 columns. Target column `Activity_Type` contains `Video_Streaming` (77,725) and `VoIP_Call` (11,984). Not cyber intrusion traffic. |
| **Raw Packet Capture** | `Midterm_53_group.csv` | `./dataset/Midterm_53_group.csv` | CSV Packet Dump | 53.0 MB | **Verified Readable** | **REJECTED FOR MODEL TRAINING:** 394,136 raw packet rows exported from Wireshark (`Time`, `Source`, `No.`, `Destination`, `Protocol`, `Length`, `Info`). Unlabelled packet stream from a student midterm exercise. |
| **Derived Packet Dump** | `output1.csv` | `./dataset/output1.csv` | CSV Packet Dump | 20.0 MB | **Verified Readable** | **REJECTED FOR MODEL TRAINING:** 394,136 rows exported with 5 columns (`Timestamp`, `Source IP`, `Destination IP`, `Protocol`, `Length`). Derived directly from `Midterm_53_group.csv`. Contains no intrusion labels. |

---

## 3. Structural Integrity & Anomalies Discovered

1. **Research Paper Duplication:**
   - `paper 3.pdf` and `paper 10.pdf` are byte-level duplicates of the exact same publication: *"Irreconcilable Differences? Investigating Consensus of Post-hoc XAI for ML-NIDS via Decomposition"* by Katharina Dietz et al., presented at the *2025 21st International Conference on Network and Service Management (CNSM)*.
   - **Recommendation:** Retain both files unmodified in `research_papers/` to preserve historical project folder state, but treat them as a single academic reference in all literature analyses.

2. **Font Encoding Defect in Paper 6:**
   - Standard PDF text extractors returned character strings such as `:KLWH %R[ $GYHUVDULDO ([SORLWDWLRQ RI 1,'6` for Paper 6.
   - Byte inspection revealed that the PDF font embedded an ASCII translation shift of exactly $+29$ across alphanumeric characters (e.g., `'W' (87) - 29 = 58 (':')`, `'0' (48) - 29 = 19`, `'.' (46) - 29 = 17`).
   - A custom Python restoration pipeline was constructed in `scratch/` which fully recovered the complete text of the paper: *"White Box Adversarial Exploitation of NIDS: Insights from FGSM, PGD, and C&W"* by Uliya Ashfaque Ali et al., published in *CICTN 2025*.

3. **Classification Validity of Downloaded Datasets:**
   - Three files inside `dataset/` had misleading names or lacked supervised ground truth:
     - `network_traffic_dataset.csv` was named generically, leading to a potential assumption that it contained cyber attacks. Systematic inspection proved it is an application traffic QoS dataset (Video vs VoIP).
     - `Midterm_53_group.csv` and `output1.csv` are unlabelled packet logs without ground truth attack labels. They cannot be used for supervised machine learning training.

---

## 4. Preservation & Non-Modification Guarantee

In accordance with strict research and project governance principles:
- **No original source files in `/Users/gopalguptamac/Downloads/NetSheild` have been deleted, modified, or overwritten.**
- All intermediate extraction scripts and decoded text files reside strictly inside the isolated scratch workspace directory `/Users/gopalguptamac/.gemini/antigravity/brain/e0bb2119-f274-4eca-80e9-f8cfcc2e9da3/scratch/`.
- All structured analytical findings are documented exclusively under the `research/` directory.
