# NetShield – Comparative Analysis of Research Literature

**Project Title:** NetShield: AI-Powered Network Intrusion Detection System Using Machine Learning  
**Domain:** Applied Machine Learning & Defensive Network Security  
**Author / Mentor:** Senior Machine Learning Engineer & Academic Project Mentor  
**Date:** November 11, 2026  

---

## 1. Research Literature Comparison Table

The following comparison table synthesizes the empirical findings, algorithmic architectures, datasets, and limitations across the analyzed research papers. All metrics represent the actual reported values extracted directly from the published texts.

| Paper | Year | Dataset | ML / DL Algorithms | Classification Type | Accuracy | Precision | Recall | F1-Score | Key Limitations Identified |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Paper 1**<br>*(Fu)* | 2025 | KDD CUP 1999 + local traffic | DNN, Random Forest, Hybrid (DNN + RF) | Binary (Normal vs Attack) | **98.50%**<br>*(Hybrid)* | *Not reported in paper* | **0.98** | **0.985** | Outdated KDD99 dataset; severe performance degradation on unknown attack types; latency spikes on large bursts. |
| **Paper 2**<br>*(Abdiyeva-Aliyeva et al.)* | 2025 | NSL-KDD | DT, RF, KNN, Naive Bayes, MLP, Gradient Boosting, LinearSVC | Multiclass / Binary | **55.78%**<br>*(RF)*<br>**0.49%**<br>*(NB)* | **49.87%**<br>*(RF)* | **55.78%**<br>*(RF)* | **0.4664**<br>*(RF)* | Severe underfitting across all models (~55% accuracy); Naive Bayes collapsed (0.49%); missing feature scaling; untuned defaults. |
| **Paper 3 / 10**<br>*(Dietz et al.)* | 2025 | CICIDS2017, CIDDS-001, Edge-IIoTset | Random Forest, MLP (with PCA & MCA) | Binary | *Reported F1* | *Reported F1* | *Reported F1* | **0.997**<br>*(RF Raw)*<br>**0.983**<br>*(MLP)* | PCA destroys feature interpretability into abstract eigenvectors; high runtime overhead of SHAP/LIME; consensus varies across datasets. |
| **Paper 4**<br>*(Geetha et al.)* | 2024 | NSL-KDD + live pcap via PyShark | Logistic Regression, Random Forest, Naive Bayes (PySpark) | Multiclass (Normal, DoS, Probe, R2L, U2R) | **99.05%**<br>*(LR)*<br>**98.72%**<br>*(RF)*<br>**85.97%**<br>*(NB)* | *Not reported in text tables* | *Not reported in text tables* | *Not reported in text tables* | Discarded high-performing LR/RF without statistical proof of overfitting; omitted precision/recall tables; tested only basic DoS flood via hping. |
| **Paper 5**<br>*(Madhusudhan & Madam)* | 2025 | UNSW-NB15 & NSL-KDD | OCNN-HMLSTM, HMLSTM, OCNN, MSCNN, DNN, Conv-LSTM, LSTM, CNN | Binary / Anomaly | **90.67%**<br>*(UNSW)*<br>**97.45%**<br>*(KDD)* | *Reported via F-measure* | **95.19%**<br>*(UNSW)* | **91.46%**<br>*(UNSW)*<br>**96.89%**<br>*(KDD)* | High false alarm rate (FPR = 8.86%); massive GPU training complexity; CNN/LSTM fail on tabular flows without spatial/temporal relations. |
| **Paper 6**<br>*(Ali et al.)* | 2025 | CICIDS2017 | CNN-LSTM (Evasion attacks: FGSM, PGD, C&W) | Multiclass | **99.45%**<br>*(Clean)*<br>**36.60%**<br>*(PGD)* | **98.90%**<br>*(Clean)*<br>**25.55%**<br>*(PGD)* | **99.20%**<br>*(Clean)*<br>**22.51%**<br>*(PGD)* | **99.05%**<br>*(Clean)*<br>**23.27%**<br>*(PGD)* | High clean accuracy masks complete vulnerability to gradient perturbations; adversarial defenses are computationally heavy. |
| **Paper 7**<br>*(Joshi & Fang)* | 2025 | UNSW-NB15 & TON-IoT | xLSTM (matrix mLSTM + scalar sLSTM) vs vanilla LSTM | Binary (UNSW) & Multiclass (TON-IoT) | **95.44%**<br>*(xLSTM)*<br>**94.91%**<br>*(LSTM)* | **0.95**<br>*(Normal)*<br>**0.96**<br>*(Attack)* | **0.91**<br>*(Normal)*<br>**0.98**<br>*(Attack)* | **0.95**<br>*(Weighted Avg)* | Gate interpretability requires deep learning expertise; xLSTM requires PyTorch GPU acceleration; minority attack classes (Ransomware) suffered low precision (0.65). |
| **Paper 8**<br>*(Nguyen & Park)* | 2025 | Subsampled CICIDS2017 & UNSW-NB15 | GCN + Open Set Recognition (Weibull OSR) | Open-Set (Known vs Unknown) | **91.56%**<br>*(CIC)*<br>**93.73%**<br>*(UNSW)* | *Not reported in paper* | *Not reported in paper* | *Not reported in paper* | Evaluated on small subsamples (<2% of data); graph construction overhead is prohibitive in real time; omitted precision, recall, and FPR metrics. |
| **Paper 9**<br>*(Dahre et al.)* | 2026 | CICIDS2017 (Balanced 50:50) | DT, RF, XGBoost, LR, LinearSVC, GaussianNB, DNN | Binary (Clean vs Poisoned) | **99.99%**<br>*(DT)*<br>**99.97%**<br>*(RF)*<br>**99.95%**<br>*(XGB)*<br>**95.42%**<br>*(LR)* | **98.68%**<br>*(DNN Attack)* | **99.25%**<br>*(DNN Attack)* | **98.97%**<br>*(DNN Attack)* | Evaluation on training data overstates tree robustness; discarding 1.5M benign rows skews traffic base rate; GNB completely failed (58.98%). |

---

## 2. Common Techniques Across the Literature

1. **Flow-Based Traffic Summarization:**
   - None of the high-performing papers attempt deep packet inspection (DPI) on raw packet payloads due to encryption (TLS 1.3/HTTPS).
   - All modern papers utilize flow-level statistical aggregates (e.g., connection duration, forward/backward packet counts, inter-arrival time distributions, TCP flag counts, and byte ratios).
2. **Standard Supervised Pipelines:**
   - Categorical variables (`proto`, `service`, `state`) are consistently encoded via One-Hot Encoding or String Indexing.
   - Continuous numerical features require normalization (MinMax or Standard scaling) to prevent gradient-based or distance-based algorithms from diverging.
3. **Class Balancing Interventions:**
   - Network datasets exhibit severe natural class imbalance (benign traffic typically accounts for 80% to 99% of flows).
   - Researchers employ either random under-sampling of majority benign traffic (Paper 9, Paper 3), SMOTE synthetic over-sampling (Paper 6), or class-weighted cross-entropy loss functions (Paper 7).

---

## 3. Most Frequently Used Machine Learning Algorithms

Across the 10 reviewed papers, the frequency of model utilization is:
1. **Random Forest (RF):** Evaluated in **7 out of 9 unique papers**. It is universally praised for superior stability, high F1-scores (typically >98%), resistance to noisy features, and fast inference.
2. **Deep Neural Networks (DNN / MLP):** Evaluated in **6 papers**. While capable of high accuracy, they suffer from opaque decision boundaries, hyperparameter sensitivity, and vulnerability to adversarial attacks.
3. **Decision Trees (DT):** Evaluated in **3 papers**. Provides rapid training and white-box transparency, but is prone to memorization and high variance.
4. **XGBoost / Gradient Boosting:** Evaluated in **3 papers**. Demonstrates state-of-the-art accuracy on tabular flow data, matching or exceeding Random Forest.
5. **Logistic Regression (LR) & Support Vector Machines (SVM):** Evaluated in **3 papers**. Used as linear/margin-based baselines; typically achieve 94–95% accuracy, but struggle with complex non-linear feature interactions.
6. **Naive Bayes (Gaussian / Multinomial):** Evaluated in **3 papers**. Uniformly underperformed across all studies (scoring between 0.49% and 58.98% in Paper 2 and Paper 9) because network flow features violate the conditional independence assumption.

---

## 4. Common Datasets in NIDS Literature

1. **CICIDS2017:** Used in Papers 3, 6, 8, 9, 10. The modern standard for high-volume flow captures with contemporary multi-vector attacks (DDoS, DoS Hulk, GoldenEye, Patator brute force, Web attacks, Infiltration, Botnets).
2. **UNSW-NB15:** Used in Papers 5, 7, 8. Created by the Australian Centre for Cyber Security (ACCS) to address KDD shortcomings; provides a realistic balance of modern attack categories (Fuzzers, Exploits, Generic, Reconnaissance, DoS, Backdoor, Shellcode, Worms).
3. **NSL-KDD / KDD Cup 1999:** Used in Papers 1, 2, 4, 5. Heavily criticized for obsolete attack vectors and synthetic traffic artifacts, but still frequently used as an introductory academic baseline.

---

## 5. Common Evaluation Metrics & Methodological Gaps

### Standard Metrics Encountered:
- **Accuracy:** Reported in almost all papers, but often misleading due to heavy class imbalance.
- **Precision, Recall, and F1-Score:** Crucial for measuring detection efficacy on minority attack categories.
- **False Positive Rate (FPR) & False Negative Rate (FNR):** Reported only in rigorous papers (Paper 5, Paper 7). In operational security, a high FPR drowns analysts in false alarms, while a high FNR allows intrusions to go undetected.

### Critical Research Gaps Identified in Literature:
1. **The "Accuracy Trap" and Incomplete Metrics:**
   - Multiple papers (Paper 4, Paper 8) report only accuracy, hiding whether rare attack classes were completely missed.
2. **Data Leakage in Preprocessing:**
   - Several papers normalize or balance datasets *before* splitting into train/test sets, leaking test set distributions into the training pipeline.
3. **Unrealistic Model Selection Criteria:**
   - Paper 4 discarded a 98.7% Random Forest in favor of an 85.9% Naive Bayes based on subjective intuition rather than empirical cross-validation.
4. **Adversarial and Noise Blindness:**
   - Papers 6 and 9 show that models scoring >99% on clean data can collapse to 36% under gradient perturbation or 12% under label flipping.
5. **Absence of Usable Defensive Interfaces:**
   - Almost all published papers stop at generating a confusion matrix in a Jupyter notebook; none provide an interactive, operational dashboard for defensive analysts.

---

## 6. Techniques Specifically Suitable for NetShield

Based on this comparative analysis, the following methodologies are directly adopted for NetShield:
1. **Model Suite Selection:** Implement **Logistic Regression** (linear baseline), **Decision Tree** (interpretable baseline), **Random Forest** (primary bagging ensemble), and **XGBoost** (state-of-the-art boosting ensemble).
2. **Elimination of Ineffective Algorithms:** Exclude Naive Bayes due to proven failure on correlated network flow features (as documented in Papers 2 and 9).
3. **Strict Leak-Free Pipeline:** Preprocessing parameters (StandardScaler means and variances, One-Hot categories) must be fitted **exclusively on the training partition** and transformed onto the test partition.
4. **Multi-Metric Evaluation Standard:** Every model must be evaluated using **Accuracy, Precision, Recall, F1-Score, False Positive Rate (FPR), and Confusion Matrix**.

---

## 7. Features That Make NetShield Academically Meaningful

For a third-year college engineering mini-project, NetShield moves beyond simplistic tutorial scripts by incorporating:
1. **Academic Honesty & Methodological Rigor:** Documenting realistic metrics without claiming "novelty" or 100% invulnerability.
2. **Defense-in-Depth Perspective:** Framing ML intrusion detection as an anomaly filter that assists network analysts rather than an autonomous infallible oracle.
3. **Interactive Defensive Dashboard:** Translating offline model inferences into real-time visual metrics, confusion matrix inspections, and per-flow risk ratings.
