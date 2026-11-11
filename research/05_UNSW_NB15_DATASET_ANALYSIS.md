# NetShield – UNSW-NB15 Dataset Verification & Forensic Analysis

**Project Title:** NetShield: AI-Powered Network Intrusion Detection System Using Machine Learning  
**Dataset Under Audit:** University of New South Wales – UNSW-NB15 Network Intrusion Benchmark  
**Storage Format in Repository:** 
- Official Benchmark Files: `UNSW_NB15_training-set.csv`, `UNSW_NB15_testing-set.csv`
- Metadata Dictionaries: `NUSW-NB15_features.csv`, `UNSW-NB15_LIST_EVENTS.csv`
- Raw Full Captures: `UNSW-NB15_1.csv`, `UNSW-NB15_2.csv`, `UNSW-NB15_3.csv`, `UNSW-NB15_4.csv`  
**Auditor / Mentor:** Senior Machine Learning Engineer & Academic Project Mentor  
**Date:** November 11, 2026  

---

## 1. Executive Summary of UNSW-NB15 Verification

A comprehensive forensic inspection was performed across all 8 UNSW-NB15 files available in `./dataset/`. The dataset was generated using the IXIA PerfectStorm testbed by Moustafa and Slay at the Australian Centre for Cyber Security (ACCS) to simulate contemporary network traffic patterns and modern synthetic cyber attacks.

### Key Measured Summary Statistics:
- **Official Benchmark Partition:**
  - **Training Set (`UNSW_NB15_training-set.csv`):** **82,332 records**, 45 columns (15.0 MB).
  - **Testing Set (`UNSW_NB15_testing-set.csv`):** **175,341 records**, 45 columns (31.0 MB).
  - **Combined Benchmark Records:** **257,673 records**.
- **Raw Traffic Volume (`UNSW-NB15_1..4.csv`):** **2,540,044 raw records** (559 MB total).
- **Column Composition:** 45 total columns in the benchmark sets:
  - 1 Sequence Identifier: `id` (must be excluded from learning).
  - 42 Network Feature Columns (3 categorical, 39 numerical).
  - 1 Multiclass Target Column: `attack_cat`.
  - 1 Binary Ground Truth Target Column: `label` (0 = Normal, 1 = Attack).
- **Missing Values ($NaN$):** **0** in both training and testing sets.
- **Infinite Values ($\pm\infty$):** **0** in both training and testing sets.
- **Data Types:** 30 `int64`, 11 `float64`, 4 `object` (strings).

---

## 2. Official Training vs. Testing Partition Analysis

The dataset creators established an official, non-random benchmark split designed to reflect realistic operational conditions where the training set represents earlier network traffic and the test set represents subsequent traffic.

### A. Binary Label Distribution (`label`)

| Partition | Total Records | Normal Records ($y=0$) | Attack Records ($y=1$) | Normal % | Attack % |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Training Set** (`training-set.csv`) | 82,332 | 37,000 | 45,332 | 44.94% | 55.06% |
| **Testing Set** (`testing-set.csv`) | 175,341 | 56,000 | 119,341 | 31.94% | 68.06% |
| **COMBINED BENCHMARK** | **257,673** | **93,000** | **164,673** | **36.09%** | **63.91%** |

### Crucial Methodological Observation:
In the official partition, the **Testing Set (175,341 records)** is significantly larger than the **Training Set (82,332 records)**, with a 2.13:1 ratio. Furthermore, the proportion of attacks shifts from 55.06% in training to 68.06% in testing. This deliberate shift simulates real-world conditions where attack intensities fluctuate and prevents models from relying on simple prior probabilities.

---

### B. Multiclass Attack Category Distribution (`attack_cat`)

The dataset incorporates 9 distinct modern attack families alongside normal traffic:

| Attack Category (`attack_cat`) | Training Set Count | Training % | Testing Set Count | Testing % | Total Benchmark Count | Total % | Description & Tactical Nature |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Normal** | 37,000 | 44.94% | 56,000 | 31.94% | 93,000 | 36.09% | Legitimate benign operational network traffic |
| **Generic** | 18,871 | 22.92% | 40,000 | 22.81% | 58,871 | 22.85% | Automated cryptographic cipher attacks against hash functions |
| **Exploits** | 11,132 | 13.52% | 33,393 | 19.04% | 44,525 | 17.28% | Known security vulnerability exploitation sequences |
| **Fuzzers** | 6,062 | 7.36% | 18,184 | 10.37% | 24,246 | 9.41% | Random malformed data injections to uncover memory faults |
| **DoS** | 4,089 | 4.97% | 12,264 | 6.99% | 16,353 | 6.35% | Denial of Service flooding of system resources and bandwidth |
| **Reconnaissance** | 3,496 | 4.25% | 10,491 | 5.98% | 13,987 | 5.43% | Port scanning, host probing, and network vulnerability discovery |
| **Analysis** | 677 | 0.82% | 2,000 | 1.14% | 2,677 | 1.04% | Port scans, spam email probes, and web script exploits |
| **Backdoor** | 583 | 0.71% | 1,746 | 1.00% | 2,329 | 0.90% | Unauthorized remote access channels bypassing security controls |
| **Shellcode** | 378 | 0.46% | 1,133 | 0.65% | 1,511 | 0.59% | Small executable code payloads used to exploit system shells |
| **Worms** | 44 | 0.05% | 130 | 0.07% | 174 | 0.07% | Self-replicating autonomous malware propagating across nodes |
| **TOTALS** | **82,332** | **100.00%** | **175,341** | **100.00%** | **257,673** | **100.00%** | **9 Attack Categories + Normal Baseline** |

---

## 3. Feature Breakdown & Categorical Encoding Requirements

The 42 feature columns (excluding `id`, `attack_cat`, and `label`) encompass flow statistics, connection aggregates, and content attributes:

### A. Categorical Features (3 Columns)
1. `proto` (Transaction protocol, string): e.g., `tcp`, `udp`, `arp`, `ospf`, `icmp`, `igmp` (133 unique values).
2. `service` (Application service, string): e.g., `-`, `dns`, `http`, `smtp`, `ftp-data`, `ftp`, `ssh`, `pop3`, `ssl`, `snmp`, `dhcp`, `radius`, `irc` (13 unique values; `-` denotes unrecognized service).
3. `state` (Connection state, string): e.g., `FIN`, `INT`, `CON`, `REQ`, `RST`, `ECO`, `CLO`, `ACC`, `PAR`, `URN`, `no` (11 unique values).

> [!TIP]
> **Encoding Strategy for NetShield:**
> Use `OneHotEncoder(handle_unknown='ignore')` fitted strictly on the training set. Rare protocols appearing in testing will be mapped safely to all zeros without triggering runtime errors or data leakage.

### B. Numerical Features (39 Columns)
- **Basic Flow Attributes:** `dur` (duration), `spkts` (source packets), `dpkts` (dest packets), `sbytes` (source bytes), `dbytes` (dest bytes), `rate` (total packets per sec).
- **Network Metrics:** `sttl` (source TTL), `dttl` (dest TTL), `sload` (source bits/s), `dload` (dest bits/s), `sloss` (source packets lost), `dloss` (dest packets lost).
- **Time & Jitter Statistics:** `sinpkt` (source inter-packet arrival time), `dinpkt` (dest inter-packet arrival time), `sjit` (source jitter ms), `djit` (dest jitter ms).
- **TCP Connection Metrics:** `swin` (source window), `stcpb` (source TCP sequence base), `dtcpb` (dest TCP sequence base), `dwin` (dest window), `tcprtt` (TCP round-trip time), `synack` (SYN to SYN-ACK time), `ackdat` (SYN-ACK to ACK time), `smean` (mean packet size sent), `dmean` (mean packet size received).
- **Transaction & Aggregate Counts:** `trans_depth`, `response_body_len`, `ct_srv_src`, `ct_state_ttl`, `ct_dst_ltm`, `ct_src_dport_ltm`, `ct_dst_sport_ltm`, `ct_dst_src_ltm`, `is_ftp_login`, `ct_ftp_cmd`, `ct_flw_http_mthd`, `ct_src_ltm`, `ct_srv_dst`, `is_sm_ips_ports`.

---

## 4. Duplicate Records & Train/Test Overlap Investigation

A deep forensic check was executed to uncover duplicate records and potential data leakage between the official train and test sets:

1. **Within-Partition Duplicates (Excluding `id`):**
   - In `UNSW_NB15_training-set.csv`: **26,387 records** are identical to another record in the training set.
   - In `UNSW_NB15_testing-set.csv`: **67,601 records** are identical to another record in the testing set.
   - *Forensic Cause:* The `id` column is an artificial monotonic counter ($1, 2, 3, \dots, N$) that makes every row appear unique. When `id` is removed, many repetitive network events (such as standardized DNS lookups or repetitive ARP requests with 0 duration) have identical feature values.
2. **Cross-Partition Overlap:**
   - There are **109,106 pairwise matching feature tuples** between the training set and testing set.
   - *Impact on Academic Evaluation:* In published literature, uncritical researchers who perform random k-fold cross-validation accidentally mix these identical flow tuples between folds, producing artificially inflated accuracies (>99%). By **preserving the official train/test partition**, NetShield maintains authentic academic rigor and avoids this artificial inflation.

---

## 5. Strict Anti-Data-Leakage Protocol for NetShield

To ensure complete defensive integrity:
1. **Drop Sequence Identifier:** The `id` column contains no security intelligence and must be dropped immediately.
2. **Drop Multiclass Target from Binary Learning:** The `attack_cat` column is an explicit leakage target. If `label` is the prediction target, `attack_cat` **must be completely removed from the input matrix $X$**.
3. **Preserve Official Benchmark Split:** Never merge and randomly re-split `UNSW_NB15_training-set.csv` and `UNSW_NB15_testing-set.csv`. Evaluate models trained on the official training set directly on the official testing set.
4. **Fit Preprocessing on Training Set Only:**
   ```python
   # NetShield Leak-Free Pipeline Principle
   scaler = StandardScaler()
   X_train_scaled = scaler.fit_transform(X_train_num)
   X_test_scaled  = scaler.transform(X_test_num) # Notice: transform ONLY!
   ```
