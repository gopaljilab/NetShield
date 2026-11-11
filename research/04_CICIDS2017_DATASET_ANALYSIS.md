# NetShield – CICIDS2017 Dataset Verification & Forensic Analysis

**Project Title:** NetShield: AI-Powered Network Intrusion Detection System Using Machine Learning  
**Dataset Under Audit:** Canadian Institute for Cybersecurity – CICIDS2017 Network Flow Captures  
**Storage Format in Repository:** 8 Apache Parquet Files (`*-no-metadata.parquet`)  
**Auditor / Mentor:** Senior Machine Learning Engineer & Academic Project Mentor  
**Date:** November 11, 2026  

---

## 1. Executive Summary of CICIDS2017 Verification

A complete forensic inspection was performed across all 8 parquet files of the CICIDS2017 dataset present in `./dataset/`. Every file was loaded and inspected for schema uniformity, column naming conventions, missing values, infinite values, constant columns, within-file duplicate rows, cross-file overlaps, and exact ground truth label distributions.

### Key Measured Summary Statistics:
- **Total Records:** **2,313,810** flow records across all 8 files.
- **Total Columns:** **78 columns** (77 numerical flow features + 1 target `Label` column).
- **Schema Uniformity:** **100% Identical Schema** across all 8 parquet captures.
- **Total Benign Records:** **1,977,318** (**85.46%**).
- **Total Malicious Attack Records:** **336,492** (**14.54%**).
- **Unique Attack Categories Verified:** **14 distinct attack classes** + 1 Benign class (15 total classes).
- **Missing Values ($NaN$):** **0** across all 2,313,810 records.
- **Infinite Values ($\pm\infty$):** **0** across all 2,313,810 records.
- **Within-File Duplicate Rows:** **0** (0.00% within individual files).
- **Cross-File Duplicate Rows:** **82,004** records (shared background benign flows across collection days).
- **Constant / Zero-Variance Features:** **10 columns** contain constant values across the benign baseline.

---

## 2. File-by-File Forensic Breakdown

The 8 parquet files correspond directly to the five recording days (Monday through Friday) of the official CICIDS2017 traffic generation schedule:

| Capture File Name | Day / Traffic Profile | File Size (MB) | Total Records | Benign Records | Attack Records | Specific Attack Labels Verified & Counts |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `Benign-Monday-no-metadata.parquet` | Monday (Baseline normal) | 54.0 MB | 458,831 | 458,831 (100.0%) | 0 (0.0%) | Benign: 458,831 |
| `Bruteforce-Tuesday-no-metadata.parquet` | Tuesday (Brute Force) | 44.0 MB | 389,714 | 380,564 (97.65%) | 9,150 (2.35%) | FTP-Patator: 5,931<br>SSH-Patator: 3,219 |
| `DoS-Wednesday-no-metadata.parquet` | Wednesday (DoS / Heartbleed) | 65.0 MB | 584,991 | 391,235 (66.88%) | 193,756 (33.12%) | DoS Hulk: 172,846<br>DoS GoldenEye: 10,286<br>DoS slowloris: 5,385<br>DoS Slowhttptest: 5,228<br>Heartbleed: 11 |
| `WebAttacks-Thursday-no-metadata.parquet` | Thursday Morning (Web Attacks) | 17.0 MB | 155,820 | 153,677 (98.62%) | 2,143 (1.38%) | Web Attack – Brute Force: 1,470<br>Web Attack – XSS: 652<br>Web Attack – Sql Injection: 21 |
| `Infiltration-Thursday-no-metadata.parquet` | Thursday Afternoon (Infiltration) | 22.0 MB | 207,630 | 207,594 (99.98%) | 36 (0.02%) | Infiltration: 36 |
| `Botnet-Friday-no-metadata.parquet` | Friday Morning (ARES Botnet) | 19.0 MB | 176,038 | 174,601 (99.18%) | 1,437 (0.82%) | Bot: 1,437 |
| `Portscan-Friday-no-metadata.parquet` | Friday Afternoon (PortScan) | 13.0 MB | 119,522 | 117,566 (98.36%) | 1,956 (1.64%) | PortScan: 1,956 |
| `DDoS-Friday-no-metadata.parquet` | Friday Afternoon (LOIC DDoS) | 24.0 MB | 221,264 | 93,250 (42.14%) | 128,014 (57.86%) | DDoS: 128,014 |
| **COMBINED TOTALS** | **Full 5-Day Capture** | **258.0 MB** | **2,313,810** | **1,977,318 (85.46%)** | **336,492 (14.54%)** | **14 Attack Categories** |

---

## 3. Verified Attack Label Distribution

The exact ground truth label counts across the combined 2,313,810 records are as follows:

```
Label Distribution Across Entire CICIDS2017 Dataset:
------------------------------------------------------------
 1. Benign                        : 1,977,318  (85.4571%)
 2. DoS Hulk                      :   172,846  ( 7.4702%)
 3. DDoS                          :   128,014  ( 5.5326%)
 4. DoS GoldenEye                 :    10,286  ( 0.4445%)
 5. FTP-Patator                   :     5,931  ( 0.2563%)
 6. DoS slowloris                 :     5,385  ( 0.2327%)
 7. DoS Slowhttptest              :     5,228  ( 0.2259%)
 8. SSH-Patator                   :     3,219  ( 0.1391%)
 9. PortScan                      :     1,956  ( 0.0845%)
10. Web Attack – Brute Force      :     1,470  ( 0.0635%)
11. Bot                           :     1,437  ( 0.0621%)
12. Web Attack – XSS              :       652  ( 0.0282%)
13. Infiltration                  :        36  ( 0.0016%)
14. Web Attack – Sql Injection    :        21  ( 0.0009%)
15. Heartbleed                    :        11  ( 0.0005%)
------------------------------------------------------------
Total Records                     : 2,313,810  (100.0000%)
Total Attacks                     :   336,492  ( 14.5429%)
```

### Forensic Label Observations:
1. **Dominant Attack Vectors:** Two volumetric flood attacks—`DoS Hulk` (172,846) and `DDoS` (128,014)—constitute **89.41% of all attack instances** in the dataset.
2. **Extreme Minority Attack Vectors:** Attack categories such as `Heartbleed` (11 records), `Web Attack – Sql Injection` (21 records), and `Infiltration` (36 records) represent less than **0.002%** of the dataset. Any multiclass model will severely struggle or collapse on these extreme minority classes without massive synthetic oversampling.
3. **Exact Alignment with Published Literature:** The measured attack count of **336,492 records** matches the exact preprocessed attack count reported by Dahre et al. (*Paper 9, NIT Raipur, IEEE CICN 2026*).

---

## 4. Feature Schema & Data Quality Audit

### A. Column Name Consistency & Whitespace
In raw original CSV distributions of CICIDS2017, column names notoriously contain erratic leading and trailing whitespace (e.g., `' Destination Port'`, `' Flow Duration'`).
- **Audit Finding:** In these parquet files (`*-no-metadata.parquet`), all 78 column names are clean and contain **zero leading or trailing whitespace**.

### B. Data Types & Storage Breakdown
The 78 columns break down into the following memory-efficient primitive datatypes:
- `int32`: 27 columns (counts, packet totals, port identifiers)
- `float32`: 22 columns (statistical means, standard deviations, variances)
- `int8`: 20 columns (binary flags, TCP control headers)
- `int16`: 6 columns (inter-arrival minimums/maximums)
- `float64`: 2 columns (flow rates, throughput calculations)
- `category`: 1 column (the target `Label`)
- **Key Advantage:** All 77 feature columns are strictly **numerical**. Unlike datasets with string IP addresses or protocol names, no categorical encoding is required for CICIDS2017 features.

### C. Missing Values & Infinite Values
- Standard CICIDS2017 CSVs frequently contain `NaN` values in `Flow Bytes/s` or `Infinity` in `Flow Packets/s` caused by division by zero during zero-duration microbursts.
- **Audit Finding:** In these parquet files, all missing and infinite values have already been cleaned and imputed ($NaN = 0$, $\pm\infty = 0$).

### D. Constant / Zero-Variance Features
Analysis of the baseline Monday traffic reveals that **10 feature columns are completely constant (zero variance)** across all 458,831 baseline flows:
1. `Bwd PSH Flags` (always 0)
2. `Fwd URG Flags` (always 0)
3. `Bwd URG Flags` (always 0)
4. `CWE Flag Count` (always 0)
5. `Fwd Avg Bytes/Bulk` (always 0)
6. `Fwd Avg Packets/Bulk` (always 0)
7. `Fwd Avg Bulk Rate` (always 0)
8. `Bwd Avg Bytes/Bulk` (always 0)
9. `Bwd Avg Packets/Bulk` (always 0)
10. `Bwd Avg Bulk Rate` (always 0)

> [!IMPORTANT]
> **Defensive Preprocessing Mandate:** These 10 zero-variance features provide zero discriminatory power for classification algorithms and must be pruned during feature selection to reduce computational overhead and prevent matrix singularities during linear scaling.

### E. Duplicate Flow Records
- **Within-File Duplicates:** **0 records**.
- **Cross-File Duplicates:** **82,004 records** are identical between Monday's benign capture and Tuesday-Friday's background benign traffic. This is a natural consequence of background network daemon traffic (e.g., repetitive NTP syncs or broadcast packets).

---

## 5. Binary Classification Mapping for NetShield

For binary network intrusion detection, the 15 original labels must be formally mapped to binary targets:

$$\text{Target Binary Class } y = \begin{cases} 0 & \text{if } \text{Label} = \text{'Benign'} \\ 1 & \text{if } \text{Label} \in \{\text{All 14 Malicious Attack Categories}\} \end{cases}$$

### Strict Anti-Leakage Rule:
- The original string `Label` column must be extracted as the target vector $y$ and **immediately dropped from the feature matrix $X$**.
- No attack type identifiers or day metadata may be included in the input features.

---

## 6. Partitioning Strategy & Leakage Prevention

Unlike UNSW-NB15, CICIDS2017 has **no single official train/test split**. Researchers frequently make catastrophic partitioning mistakes:
1. **Flawed Approach (Day-Based Split):** Training on Monday-Wednesday and testing on Thursday-Friday causes severe distribution shift because DDoS and PortScan attacks only occur on Friday, while Infiltration only occurs on Thursday.
2. **Flawed Approach (Random Split without Stratification):** Random shuffling without stratification leads to extreme underrepresentation of rare attacks (e.g., Heartbleed or Sql Injection) in either train or test folds.

### Recommended CICIDS2017 Splitting Protocol:
If CICIDS2017 is utilized in NetShield (e.g., for generalization experiments):
- Apply **Stratified Split (70% Training / 30% Testing)** partitioned across all 15 classes simultaneously to preserve identical class proportions in both sets.
- Fit all feature scalers (`StandardScaler`) **only on the training split**, and transform the testing split independently.
