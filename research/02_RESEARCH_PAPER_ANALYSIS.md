# NetShield – Comprehensive Research Paper Analysis

**Project Title:** NetShield: AI-Powered Network Intrusion Detection System Using Machine Learning  
**Domain:** Defensive Network Security, Offline Benchmark Evaluation & Applied Machine Learning  
**Author / Mentor:** Senior Machine Learning Engineer & Academic Project Mentor  
**Date:** November 11, 2026  

---

## 1. Overview of Research Literature

This document provides an exhaustive, peer-review-grade analysis of every research paper discovered in the NetShield project repository (`research_papers/paper 1.pdf` through `paper 10.pdf`). Every paper was examined in full detail across all pages, tables, figures, formulas, and references.

No findings or metrics are fabricated. Wherever specific parameters, splits, or metrics were omitted by the original authors, it is explicitly recorded as **"Not reported in the paper."**

---

## Paper 1: Design and Implementation of Network Intrusion Detection System based on Machine Learning

### A. Research Information
- **Title:** Design and Implementation of Network Intrusion Detection System based on Machine Learning
- **Author:** Rongguo Fu
- **Affiliation:** Information Center, Jiangsu Earthquake Agency, Nanjing, Jiangsu, China
- **Publication Year:** 2025
- **Conference / Venue:** 2025 International Conference on Intelligent Systems and Computational Networks (ICISCN)
- **Publisher / DOI:** IEEE | DOI: [10.1109/ICISCN64258.2025.10934502](https://doi.org/10.1109/ICISCN64258.2025.10934502) | ISBN: 979-8-3315-2924-6
- **Research Problem:** Traditional rule-based and signature-based Intrusion Detection Systems (IDS) cannot detect new, complex, and changeable cyber attacks. Existing ML implementations struggle with high-dimensional feature selection, poor generalization, high latency spikes, and balancing false alarms with detection rates.
- **Research Objectives:** 
  1. Design a modular, layered IDS architecture (Data Collection, Data Preprocessing, Feature Extraction, Intrusion Detection, Alerting & Response).
  2. Implement an ensemble hybrid model combining Deep Neural Networks (DNN) and Random Forest (RF) to leverage their complementary strengths.
  3. Validate real-time processing performance and latency in a network environment.

### B. Methodology
- **Intrusion Detection Approach:** Hybrid supervised flow classification. Raw network features are passed into a Deep Neural Network (MLP architecture) to extract high-level non-linear representations; the output probabilities/activations of the DNN are fed as input features into a Random Forest ensemble to produce the final classification decision.
- **Dataset Used:** KDD CUP 1999 dataset combined with an unspecified "actual network traffic data" capture.
- **Dataset Version:** Standard 10% KDD Cup 1999 benchmark + localized real traffic capture.
- **Data Preprocessing Techniques:** One-hot encoding for categorical tags, min-max feature normalization, and handling missing values.
- **Feature Selection Techniques:** Not reported in the paper (the paper mentions the challenge of high-dimensional feature selection, but uses the full feature set passed to DNN).
- **Machine Learning Algorithms:**
  1. Deep Neural Network (DNN): Multi-Layer Perceptron stacked with multiple hidden layers, ReLU and Sigmoid activations, Adam optimizer, cross-entropy loss, and $L_2$ weight regularization.
  2. Random Forest (RF): Ensemble of de-correlated decision trees using bagging and majority voting.
  3. Hybrid DNN + Random Forest: DNN representation outputs concatenated with input features into Random Forest.
- **Training and Testing Methodology:** Grid search with cross-validation (`GridSearchCV` in Scikit-Learn) to tune learning rate, hidden layer count, and tree estimators. Exact train/test ratio: Not reported in the paper.
- **Evaluation Metrics:** Accuracy, Recall, F1-score, and Latency (ms).

### C. Results
- **Classification Type:** Binary Classification (Normal vs Intrusion).
- **Reported Metric Values (Table II of Paper):**
  - **Single DNN Model:**
    - Accuracy: **97.2%**
    - Precision: *Not reported in the paper*
    - Recall: **0.96** (96.0%)
    - F1-Score: **0.965**
    - False Positive Rate: *Not reported in the paper*
    - AUC: *Not reported in the paper*
  - **Single Random Forest Model:**
    - Accuracy: **96.8%**
    - Precision: *Not reported in the paper*
    - Recall: **0.95** (95.0%)
    - F1-Score: **0.960**
    - False Positive Rate: *Not reported in the paper*
    - AUC: *Not reported in the paper*
  - **Hybrid Model (DNN + Random Forest):**
    - Accuracy: **98.5%**
    - Precision: *Not reported in the paper*
    - Recall: **0.98** (98.0%)
    - F1-Score: **0.985**
    - False Positive Rate: *Not reported in the paper*
    - AUC: *Not reported in the paper*
  - **System Latency:** Average processing time of **50 milliseconds** per traffic batch.

### D. Research Limitations
- **Dataset Limitations:** Relies on the severely outdated KDD CUP 1999 dataset, which is known in the security literature to suffer from massive synthetic redundancy, unrealistic traffic rates, and obsolete attack patterns.
- **Class Imbalance:** Not quantitatively addressed in the paper; class distribution ratios are omitted.
- **Generalization Degradation:** In Figure 6 of the paper, the authors evaluate the model against "Noise" and two "Unknown Attack Types". The detection rate suffered a severe decline under unknown attack type 2, demonstrating that the hybrid model fails to reliably generalize beyond the training distribution.
- **Latency Spikes:** The paper acknowledges a noticeable "long tail" phenomenon where processing latency spiked dramatically on larger packet bursts due to system contention.

### E. Research Contribution & Relevance to NetShield
- **Key Takeaways for NetShield:**
  - Confirms that Random Forest provides superior stability and variance reduction compared to standalone neural networks.
  - Proves that a layered software architecture (Ingestion $\rightarrow$ Preprocessing $\rightarrow$ Inference $\rightarrow$ Dashboard Alerting) is an effective paradigm for a defensive IDS.
- **College Project Implementation Guidance:**
  - NetShield should avoid KDD Cup 1999 and instead utilize modern benchmarks (UNSW-NB15 or CICIDS2017).
  - Rather than training an opaque and computationally heavy DNN+RF hybrid on a laptop, a tuned Random Forest or XGBoost model will deliver comparable or superior F1-scores with significantly faster inference and lower memory footprint.

---

## Paper 2: Evaluating Machine Learning Algorithms for Enhancing Network Intrusion Detection Systems: A Comparative Study

### A. Research Information
- **Title:** Evaluating Machine Learning Algorithms for Enhancing Network Intrusion Detection Systems: A Comparative Study
- **Authors:** Gunay Abdiyeva-Aliyeva, Naila Allakhverdiyeva, Ilkin Balazade, Nihad Alili
- **Affiliation:** Department of Information Technology, Baku Higher Oil School, Baku, Azerbaijan
- **Publication Year:** 2025
- **Publisher / Venue:** IEEE | ISBN: 979-8-3315-0993-4/25 | Exact Conference Name: *Not reported on paper cover page (IEEE copyright imprint)*
- **Research Problem:** Evaluating the comparative performance of multiple standard machine learning algorithms on benchmark network intrusion data to establish baseline detection capabilities.
- **Research Objectives:** Implement and compare 7 ML classifiers using standard classification and balanced evaluation metrics in a Python environment.

### B. Methodology
- **Intrusion Detection Approach:** Supervised tabular classification comparing classical and ensemble algorithms.
- **Dataset Used:** NSL-KDD dataset.
- **Dataset Version:** Standard NSL-KDD (exact subset/split count not specified in text).
- **Data Preprocessing Techniques:** Label encoding of categorical variables; missing value imputation; feature scaling: *Not reported in the paper*.
- **Feature Selection Techniques:** None; all standard NSL-KDD features used.
- **Machine Learning Algorithms:**
  1. Decision Tree (DT)
  2. Random Forest (RF)
  3. K-Nearest Neighbors (KNN)
  4. Naive Bayes (NB)
  5. Neural Network (NN - MLP)
  6. Gradient Boosting (GB)
  7. Linear Support Vector Classifier (LinearSVC)
- **Training and Testing Methodology:** Standard train/test split. Cross-validation: *Not reported in the paper*. Hyperparameter tuning: *Not reported in the paper (default library parameters used)*.
- **Evaluation Metrics:** Accuracy, Precision, Recall, F1-Score, Specificity, AUC-ROC, Balanced Accuracy.

### C. Results
- **Classification Type:** Multiclass / Binary comparative evaluation (*unspecified in text, reported in Table II*).
- **Reported Metric Values (Table II of Paper):**
  - **Decision Tree:** Accuracy: **55.77%** (0.557711) | Precision: **49.88%** | Recall: **55.77%** | F1-Score: **0.4668**
  - **Random Forest:** Accuracy: **55.78%** (0.557790) | Precision: **49.87%** | Recall: **55.78%** | F1-Score: **0.4664**
  - **K-Nearest Neighbors (KNN):** Accuracy: **51.73%** (0.517332) | Precision: **51.45%** | Recall: **51.73%** | F1-Score: **0.4926**
  - **Naive Bayes:** Accuracy: **0.49%** (0.004948) | Precision: **52.23%** | Recall: **0.49%** | F1-Score: **0.0065**
  - **Neural Network:** Accuracy: **55.68%** (0.556758) | Precision: **49.46%** | Recall: **55.68%** | F1-Score: **0.4671**
  - **Gradient Boosting:** Accuracy: **55.66%** (0.556626) | Precision: **48.19%** | Recall: **55.66%** | F1-Score: **0.4613**
  - **LinearSVC:** Accuracy: **54.81%** (0.548079) | Precision: **45.63%** | Recall: **54.81%** | F1-Score: **0.4302**
  - **AUC-ROC / FPR:** *Formulas defined in text, but actual numerical values omitted from Table II.*

### D. Research Limitations
- **Severely Underperforming Models:** All tested models collapsed to near ~50-55% accuracy (barely better than a coin toss), and Naive Bayes catastrophically failed with 0.49% accuracy. This indicates severe unaddressed data scaling errors, untuned hyperparameter defaults, or unhandled class distribution shifts between train and test splits.
- **Lack of Preprocessing Rigor:** The paper omitted feature scaling (StandardScaler or MinMaxScaler), which is catastrophic for distance-sensitive algorithms like KNN and margin-based algorithms like LinearSVC.
- **Dataset Age:** Relies on NSL-KDD, which reflects 1999-era attacks and lacks modern encrypted network protocols, advanced persistent threats (APTs), and modern botnet dynamics.

### E. Research Contribution & Relevance to NetShield
- **Cautionary Lesson for NetShield:**
  - Serves as an essential academic case study demonstrating why raw, untuned ML models with default hyperparameters and missing preprocessing steps produce unacceptable detection performance.
  - Highlights why NetShield must implement rigorous feature scaling, proper encoding, and hyperparameter tuning before drawing conclusions about algorithm superiority.

---

## Paper 3 & Paper 10: Irreconcilable Differences? Investigating Consensus of Post-hoc XAI for ML-NIDS via Decomposition

*(Note: Paper 3 and Paper 10 are identical duplicate copies of the same publication).*

### A. Research Information
- **Title:** Irreconcilable Differences? Investigating Consensus of Post-hoc XAI for ML-NIDS via Decomposition
- **Authors:** Katharina Dietz, Johannes Schleicher, Stefan Geißler, Michael Seufert, Tobias Hoßfeld
- **Affiliation:** University of Würzburg and University of Augsburg, Germany
- **Publication Year:** 2025
- **Conference / Venue:** 2025 21st International Conference on Network and Service Management (CNSM)
- **DOI / URL:** *CNSM 2025 IEEE Conference Proceedings (IEEE Xplore)*
- **Research Problem:** Post-hoc Explainable AI (XAI) frameworks (e.g., SHAP, LIME) are widely used to explain ML-NIDS decisions, but frequently produce conflicting and contradictory feature importance explanations ("the disagreement problem"). A primary root cause is high multicollinearity among network traffic features, which creates multiple divergent but mathematically equivalent explanation vectors.
- **Research Objectives:**
  1. Investigate whether feature decorrelation techniques (Principal Component Analysis - PCA for continuous variables, Multiple Correspondence Analysis - MCA for categorical variables) can improve consensus between SHAP and LIME.
  2. Measure consensus using formal metrics: Unordered Consensus (UC) and strict Ordered Consensus (OC).
  3. Evaluate the trade-off between mathematical consensus and human interpretability.

### B. Methodology
- **Intrusion Detection Approach:** Binary anomaly detection evaluated across raw continuous, raw discretized, and decomposed feature spaces using shallow ML (Random Forest) and deep learning (MLP).
- **Datasets Used:** 
  1. **CICIDS2017** (Canadian Institute for Cybersecurity)
  2. **CIDDS-001** (Coburg Intrusion Detection Data Set)
  3. **Edge-IIoTset** (IoT/IIoT cybersecurity dataset)
- **Dataset Preprocessing:** Sampling 100,000 samples per class to balance training data; continuous pipeline (min-max normalization, PCA) and discrete pipeline (equal-frequency binning into 5 bins, MCA).
- **Feature Selection / Decomposition:** PCA (continuous features retaining components explaining variance) and MCA (categorical features); Sparse PCA (SPCA) to preserve interpretability.
- **Machine Learning Algorithms:**
  - Random Forest (RF): 50 trees, maximum tree depth = 20.
  - Multi-Layer Perceptron (MLP): 2 fully connected layers of 64 neurons, ReLU activations, dropout probability = 0.5.
- **Explainability Frameworks:** TreeSHAP, DeepSHAP, and LIME.
- **Evaluation Metrics:** Classification F1-score (micro and macro), Signed Unordered Consensus (UC top-5), Signed Ordered Consensus (OC top-5).

### C. Results
- **Classification Type:** Binary Classification (Benign vs Malicious).
- **Reported Classification Metrics on CICIDS2017 (Table I of Paper):**
  - **Random Forest (RF):**
    - Raw Continuous: F1-micro = **0.997** | F1-macro = **0.997**
    - PCA Continuous: F1-micro = **0.996** | F1-macro = **0.996**
    - Raw Discretized: F1-micro = **0.983** | F1-macro = **0.982**
    - MCA Discretized: F1-micro = **0.983** | F1-macro = **0.982**
  - **Multi-Layer Perceptron (MLP):**
    - Raw Continuous: F1-micro = **0.983** | F1-macro = **0.981**
    - PCA Continuous: F1-micro = **0.985** | F1-macro = **0.984**
    - Raw Discretized: F1-micro = **0.983** | F1-macro = **0.982**
    - MCA Discretized: F1-micro = **0.984** | F1-macro = **0.982**
  - Accuracy, Precision, Recall, FPR: *Not individually tabulated; authors report F1-scores as primary metric to account for class balance*.
- **XAI Consensus Findings:**
  - CICIDS2017 showed the greatest consensus improvement under PCA decorrelation because network flow features exhibit heavy natural collinearity (e.g., bidirectional packet counts, flow duration moments).
  - Unordered consensus between SHAP and LIME rose to approximately **60%** with PCA, whereas raw feature consensus was near zero.

### D. Research Limitations
- **Loss of Semantic Interpretability:** PCA transforms meaningful network features (e.g., `Destination Port`, `Flow Duration`) into linear combinations of latent eigenvectors. Network administrators cannot easily interpret "Principal Component 4 is high" in operational defense.
- **High Computational Overhead:** Calculating Kernel SHAP and LIME perturbations in real-time network traffic pipelines is computationally infeasible for high-throughput packet streams.
- **Dataset Dependency:** Consensus improvements did not transfer uniformly to CIDDS or Edge-IIoTset, showing that decorrelation benefits depend strictly on the underlying feature generation methodology.

### E. Research Contribution & Relevance to NetShield
- **Relevance to NetShield:**
  - Confirms that Random Forest achieves near-perfect F1-scores (**0.997**) on CICIDS2017.
  - Warns NetShield against blindly trusting post-hoc explainers like LIME or SHAP when collinear features are present in network traffic.
  - Demonstrates that feature selection (removing redundant correlated features) is superior to mathematical decomposition (PCA) if administrative interpretability is required.

---

## Paper 4: Real Time Network Intrusion Detection using PySpark and Machine Learning

### A. Research Information
- **Title:** Real Time Network Intrusion Detection using PySpark and Machine Learning
- **Authors:** Dr. Geetha J, Chethana P, Brunda G, Mihika Dhariwal, Dr. R China Appala Naidu, Prachi Patil
- **Affiliation:** Department of Computer Science & Engineering, Ramaiah Institute of Technology, Bengaluru, India
- **Publication Year:** 2024 / 202X (*IEEE template placeholder text present in header*)
- **Conference / Venue:** IEEE Conference Publication (*Exact conference name omitted in template header*)
- **Research Problem:** Signature-based systems fail against novel attacks, while standard single-machine ML algorithms face scalability bottlenecks when processing massive real-time network traffic streams.
- **Research Objectives:** Build an end-to-end distributed NIDS pipeline using PySpark MLlib for batch model training and combine it with real-time packet capture via tcpdump and PyShark.

### B. Methodology
- **Intrusion Detection Approach:** Distributed machine learning pipeline using Apache Spark (PySpark) coupled with real-time packet sniffers and DoS attack emulation using `hping`.
- **Dataset Used:** NSL-KDD dataset (~25,000 labeled instances, 41 features).
- **Data Preprocessing Techniques:** Categorical encoding via `StringIndexer` and `OneHotEncoderEstimator`; vector concatenation via `VectorAssembler`.
- **Feature Selection Techniques:** Not reported in the paper.
- **Machine Learning Algorithms:**
  1. Logistic Regression (PySpark MLlib)
  2. Random Forest Classifier (PySpark MLlib)
  3. Naive Bayes Classifier (PySpark MLlib)
- **Live Capture Module:** `tcpdump` for packet ingestion; `PyShark` for packet attribute parsing (IPs, ports, flags, packet size, inter-arrival time); saved to Pandas CSV and scored against pickled models.
- **Evaluation Metrics:** Accuracy and Confusion Matrix.

### C. Results
- **Classification Type:** Multiclass (Normal, DoS, Probe, R2L, U2R).
- **Reported Metric Values (Table 1 of Paper):**
  - **Logistic Regression:** Accuracy: **99.05%**
  - **Random Forest:** Accuracy: **98.72%**
  - **Naive Bayes:** Accuracy: **85.97%**
  - Precision, Recall, F1-Score, FPR, AUC: *Not reported in the paper (confusion matrices are displayed as unquantified image figures)*.
- **Author Model Selection Decision:** Despite Logistic Regression and Random Forest achieving ~99% accuracy, the authors selected Naive Bayes (85.97%) for deployment, claiming the higher accuracies were likely due to overfitting.

### D. Research Limitations
- **Unsubstantiated Model Selection Claim:** The authors discarded Random Forest (98.72%) and Logistic Regression (99.05%) in favor of Naive Bayes (85.97%) based on an unproven assumption of overfitting, without providing cross-validation, regularization analysis, or held-out test proofs.
- **Missing Standard Performance Metrics:** Did not report Precision, Recall, F1-score, or False Positive Rate in text tables, which is critical because DoS attacks in NSL-KDD dominate minority classes like U2R and R2L.
- **Limited Real-World Testing:** Live attack emulation was restricted to simple DoS SYN floods generated by `hping`; complex attacks were left as future work.

### E. Research Contribution & Relevance to NetShield
- **Direct Practical Inspiration for NetShield:**
  - NetShield's Review 0 architecture proposes a pipeline very similar to Paper 4: feature extraction, multi-model evaluation, and a real-time monitoring vision.
  - Paper 4 demonstrates how offline trained models can be serialized (`pickle`/`joblib`) and integrated into a real-time ingestion service.
  - NetShield should avoid Paper 4's methodological flaw: do not discard high-performing tree ensembles without empirical proof of overfitting.

---

## Paper 5: Performance Comparison of Network Intrusion Detection Machine Learning Models

### A. Research Information
- **Title:** Performance Comparison of Network Intrusion Detection Machine Learning Models
- **Authors:** Kuruba Madhusudhan, Aravind Kumar Madam
- **Affiliation:** BEST Innovation University (Gorantla, India) and West Godavari Institute of Science and Engineering (India)
- **Publication Year:** 2025
- **Conference / Venue:** Proceedings of the International Conference on Sustainable Communication Networks and Application (ICSCN-2025)
- **Publisher / DOI:** IEEE | ISBN: 979-8-3315-9420-6 | CFP25DW8-ART | pp. 68–72
- **Research Problem:** Comparing modern deep neural architectures and hybrid frameworks to assess detection efficacy, false negative risks, and false positive overhead across both modern and legacy network traffic benchmarks.
- **Research Objectives:** Evaluate 8 deep learning and hybrid architectures across both UNSW-NB15 and KDD datasets using a multi-metric evaluation framework.

### B. Methodology
- **Intrusion Detection Approach:** Deep learning and recurrent/convolutional neural networks for anomaly detection.
- **Datasets Used:** 
  1. **UNSW-NB15:** 2,540,044 records, 9 attack categories (Fuzzers, Analysis, Backdoors, DoS, Exploits, Generic, Reconnaissance, Shellcode, Worms).
  2. **KDD (NSL-KDD):** 4 major attack classes (DoS, U2R, R2L, Probing).
- **Data Preprocessing Techniques:** Data normalization, min-max scaling, PCA dimensionality reduction.
- **Machine Learning / Deep Learning Algorithms Evaluated:**
  1. OCNN-HMLSTM (Optimized CNN with Hierarchical Multi-layer LSTM)
  2. HMLSTM only
  3. OCNN (Optimized CNN)
  4. MSCNN (Multi-Scale CNN)
  5. Deep Neural Network (DNN)
  6. Conv-LSTM (Convolutional LSTM)
  7. Long Short-Term Memory (LSTM)
  8. Convolutional Neural Network (CNN)
- **Evaluation Metrics:** Accuracy, Recall, F-measure, Kappa coefficient, Matthews Correlation Coefficient (MCC), False Positive Rate (FPR), False Negative Rate (FNR).

### C. Results
- **Classification Type:** Binary / Anomaly Intrusion Detection.
- **Reported Metric Values on UNSW-NB15 (Tables I & II of Paper):**
  - **OCNN-HMLSTM:** Accuracy: **90.67%** | Recall: **95.19%** | F-Measure: **91.46%** | Kappa: **86.33%** | MCC: **82.22%** | FPR: **8.86%** | FNR: **5.78%**
  - **HMLSTM only:** Accuracy: **87.11%** | Recall: **93.67%** | F-Measure: **88.40%** | Kappa: **80.00%** | MCC: **81.10%** | FPR: **12.20%** | FNR: **6.66%**
  - **OCNN:** Accuracy: **88.67%** | Recall: **90.12%** | F-Measure: **89.78%** | Kappa: **81.12%** | MCC: **76.78%** | FPR: **11.89%** | FNR: **7.89%**
  - **MSCNN:** Accuracy: **88.45%** | Recall: **90.11%** | F-Measure: **88.76%** | Kappa: **83.37%** | MCC: **80.80%** | FPR: **9.94%** | FNR: **6.67%**
  - **DNN:** Accuracy: **89.33%** | Recall: **92.56%** | F-Measure: **90.67%** | Kappa: **75.67%** | MCC: **81.01%** | FPR: **12.67%** | FNR: **11.20%**
  - **Conv-LSTM:** Accuracy: **89.94%** | Recall: **88.87%** | F-Measure: **88.77%** | Kappa: **83.34%** | MCC: **78.90%** | FPR: **11.80%** | FNR: **9.95%**
  - **LSTM:** Accuracy: **83.00%** | Recall: **83.39%** | F-Measure: **87.57%** | Kappa: **78.42%** | MCC: **21.74%** | FPR: **15.03%** | FNR: **17.51%**
  - **CNN:** Accuracy: **79.67%** | Recall: **83.35%** | F-Measure: **72.51%** | Kappa: **62.82%** | MCC: **68.21%** | FPR: **18.62%** | FNR: **19.83%**
- **Reported Metric Values on KDD Dataset (Tables III & IV of Paper):**
  - **OCNN-HMLSTM:** Accuracy: **97.45%** | Recall: **96.34%** | F-Measure: **96.89%** | FPR: **5.87%** | FNR: **3.67%**
  - Legacy CNN and LSTM models scored between 79% and 93% on KDD with higher false alarm rates.

### D. Research Limitations
- **High False Alarm Rates:** Even the best hybrid model (OCNN-HMLSTM) exhibited an FPR of **8.86%** on UNSW-NB15. In an enterprise producing millions of flows daily, an 8.8% false alarm rate overwhelms security analysts with thousands of false alerts daily.
- **Massive Computational Complexity:** Stacking multi-scale CNNs and hierarchical multi-layer LSTMs requires intensive GPU hardware and introduces severe inference latency, making it impractical for resource-constrained laptop environments.
- **Equation Typo:** Equation (6) in the paper inadvertently defines FPR as $FN / (FN + TP)$, which is mathematically the False Negative Rate formula.

### E. Research Contribution & Relevance to NetShield
- **Relevance to NetShield:**
  - Provides empirical proof that UNSW-NB15 is significantly more challenging than legacy KDD benchmarks (models scored ~90% on UNSW-NB15 vs ~97% on KDD).
  - Establishes a rigorous metric standard for NetShield by showing that FPR, FNR, and MCC are mandatory alongside Accuracy and F1-score.

---

## Paper 6: White Box Adversarial Exploitation of NIDS: Insights from FGSM, PGD, and C&W

### A. Research Information
- **Title:** White Box Adversarial Exploitation of NIDS: Insights from FGSM, PGD, and C&W
- **Authors:** Uliya Ashfaque Ali, Krish Dogra, Seema Sharma
- **Affiliation:** Amity School of Engineering and Technology, Amity University, Noida, Uttar Pradesh, India
- **Publication Year:** 2025
- **Conference / Venue:** 2025 2nd International Conference on Computational Intelligence, Communication Technology and Networking (CICTN)
- **Publisher / DOI:** IEEE | pp. 672–677
- **Research Problem:** Machine learning and deep learning-based NIDS are vulnerable to adversarial evasion attacks, where imperceptible gradient-based perturbations to input traffic features trick models into misclassifying malicious attacks as benign traffic.
- **Research Objectives:** Systematically assess the vulnerability of a hybrid CNN-LSTM NIDS model against three white-box adversarial attacks (FGSM, PGD, and Carlini & Wagner).

### B. Methodology
- **Intrusion Detection Approach:** Deep hybrid sequence classification (1D CNN layer followed by Batch Normalization, Max Pooling, Dropout, LSTM layer, and Dense Softmax output).
- **Dataset Used:** CICIDS2017 dataset.
- **Data Preprocessing Techniques:** Data cleaning, removing infinity/NaN values, MinMax feature scaling $[0, 1]$, SMOTE (Synthetic Minority Over-sampling Technique) to balance minority attack classes.
- **Partitioning:** 70% training, 15% validation, 15% testing.
- **Adversarial Attack Algorithms Implemented:**
  1. Fast Gradient Sign Method (FGSM): Single-step gradient perturbation with varying epsilon ($\epsilon \in [0.01, 0.3]$).
  2. Projected Gradient Descent (PGD): Multi-step iterative gradient perturbation with step size $\alpha$ and clipping.
  3. Carlini & Wagner ($L_2$ / C&W): Optimization-based attack with confidence parameter $c$.
- **Evaluation Metrics:** Accuracy, Precision, Recall, F1-Score on clean versus perturbed inputs.

### C. Results
- **Classification Type:** Multiclass Intrusion Detection on CICIDS2017.
- **Reported Metric Values (Table II of Paper):**
  - **Clean Data (Baseline):**
    - Accuracy: **99.45%**
    - Precision: **98.90%**
    - Recall: **99.20%**
    - F1-Score: **99.05%**
  - **Under FGSM Attack ($\epsilon = 0.1$):**
    - Accuracy: **73.01%** (degraded by 26.44 percentage points)
    - Precision: **41.90%**
    - Recall: **42.72%**
    - F1-Score: **41.89%**
  - **Under PGD Attack ($\epsilon = 0.1$, iterative):**
    - Accuracy: **36.60%** (catastrophic collapse, degraded by 62.85 percentage points)
    - Precision: **25.55%**
    - Recall: **22.51%**
    - F1-Score: **23.27%**
  - **Under C&W Attack ($c = 0.1$):**
    - Accuracy: **55.20%**
    - Precision: **42.49%**
    - Recall: **55.20%**
    - F1-Score: **48.02%**

### D. Research Limitations
- **White-Box Vulnerability:** Highlights that deep learning models achieving >99% test accuracy on clean benchmark data can be completely blinded (accuracy dropping to 36%) by gradient perturbations.
- **Lack of Classical ML Comparison:** The authors only evaluated CNN-LSTM; they did not assess whether decision tree ensembles (Random Forest, XGBoost) exhibit greater intrinsic resilience to continuous gradient attacks due to non-differentiable step decision boundaries.
- **Adversarial Feasibility:** Perturbations were applied in feature space without verifying whether the perturbed network flow remains protocol-compliant (e.g., negative duration or illegal TCP flags).

### E. Research Contribution & Relevance to NetShield
- **Key Takeaways for NetShield:**
  - Provides a critical academic warning: a 99% accuracy score on clean offline datasets does not mean an IDS is invincible in production.
  - In our NetShield project documentation and evaluation, we must document adversarial risk as a core limitation of ML-based intrusion detection.
  - Tree-based models (Random Forest, XGBoost) offer practical advantages over deep networks because they do not expose continuous differentiable gradients for simple white-box FGSM attacks.

---

## Paper 7: Poster: Towards Transparent NIDS: An xLSTM-Based Explainable Architecture

### A. Research Information
- **Title:** Poster: Towards Transparent NIDS: An xLSTM-Based Explainable Architecture
- **Authors:** Aayush Joshi, Dongfeng Fang
- **Affiliation:** California Polytechnic State University, San Luis Obispo, California, USA
- **Publication Year:** 2025 / 2026
- **Conference / Venue:** IEEE Conference Poster Presentation (IEEE Xplore)
- **Research Problem:** Deep learning NIDS are black-box models. Existing post-hoc explainers (LIME, SHAP) lack robustness, add heavy runtime overhead, and fail to capture temporal feature interactions.
- **Research Objectives:** Propose an intrinsically explainable NIDS framework based on Extended Long Short-Term Memory (xLSTM) utilizing internal memory gates (mLSTM and sLSTM) to visualize decision rationale without post-hoc surrogate models.

### B. Methodology
- **Intrusion Detection Approach:** Recurrent sequence processing utilizing xLSTM (matrix-memory mLSTM with exponential gating + scalar-memory sLSTM).
- **Datasets Used:**
  1. **UNSW-NB15:** Evaluated as a **binary classification** problem (Normal vs Attack; test set: 55,951 Normal, 119,340 Attack).
  2. **TON-IoT:** Evaluated as a **multiclass** problem (Backdoor, Normal, Ransomware, XSS; 800,000 train / 200,000 test).
- **Preprocessing:** MinMax normalization, class weighting in cross-entropy loss function to counter class imbalance.
- **Hardware Configuration:** Apple M5 device with 10-core CPU, 10-core GPU, and 16 GB unified memory. Implementation in Python and PyTorch.
- **Evaluation Metrics:** Precision, Recall, F1-Score, Accuracy, False Negative Rate (FNR).

### C. Results
- **Classification Type:** Binary on UNSW-NB15; Multiclass on TON-IoT.
- **Reported Binary Classification Results on UNSW-NB15 (Table I of Paper):**
  - **Baseline LSTM Model:**
    - Accuracy: **94.91%** (reported as 0.95)
    - Normal Class: Precision: **0.93** | Recall: **0.91** | F1-Score: **0.92** (55,951 instances)
    - Attack Class: Precision: **0.96** | Recall: **0.97** | F1-Score: **0.96** (119,340 instances)
    - Macro Average: Precision: **0.94** | Recall: **0.94** | F1-Score: **0.94**
    - Weighted Average: Precision: **0.95** | Recall: **0.95** | F1-Score: **0.95**
    - False Negative Rate: **3.4%**
  - **Proposed xLSTM Architecture:**
    - Accuracy: **95.44%** (reported as 0.95)
    - Normal Class: Precision: **0.95** | Recall: **0.91** | F1-Score: **0.93** (55,951 instances)
    - Attack Class: Precision: **0.96** | Recall: **0.98** | F1-Score: **0.97** (119,340 instances)
    - Macro Average: Precision: **0.95** | Recall: **0.94** | F1-Score: **0.95**
    - Weighted Average: Precision: **0.95** | Recall: **0.95** | F1-Score: **0.95**
    - False Negative Rate: **2.25%**
- **TON-IoT Multiclass Results (Table III of Paper):**
  - LSTM Accuracy: **89.92%** | Macro F1: **0.82**
  - xLSTM Accuracy: **95.38%** | Macro F1: **0.91**
  - *Notable Weakness:* Ransomware precision was only **0.65** due to severe minority class imbalance (7.3% of data).

### D. Research Limitations
- **Complex Internal Interpretability:** Visualizing internal mLSTM gating activations requires specialized deep learning expertise; it cannot easily be converted into an automated plain-text rule for a network administrator.
- **Hardware Barrier:** Relies on cutting-edge PyTorch neural extensions tailored to GPU acceleration.
- **Minority Attack Degradation:** Even with class-weighted loss, minority attack vectors (e.g., Ransomware) suffered an 18-35% drop in precision compared to majority classes.

### E. Research Contribution & Relevance to NetShield
- **Relevance to NetShield:**
  - Establishes a verified benchmark on UNSW-NB15 binary classification: achieving **95% accuracy** and **0.95 F1-score** is considered state-of-the-art on this benchmark.
  - Confirms that minimizing False Negatives (FNR = 2.25%) is paramount in defensive security because missed intrusions lead to severe breaches.

---

## Paper 8: Enhancing unknown attack detection for GNN-based NIDS through Open Set Recognition Approach

### A. Research Information
- **Title:** Enhancing unknown attack detection for GNN-based NIDS through Open Set Recognition Approach
- **Authors:** Thanh-Tung Nguyen, Minho Park
- **Affiliation:** Soongsil University, Seoul, South Korea
- **Publication Year:** 2025 / 2026
- **Conference / Venue:** IEEE Conference Publication (pp. 823–825)
- **Research Problem:** Traditional closed-world NIDS assume that all testing classes are present during training. When deployed against zero-day or emerging attack patterns, standard models misclassify novel attacks as normal traffic with dangerously high confidence.
- **Research Objectives:** Formulate an Open Set Recognition (OSR) framework for Graph Convolutional Networks (GCN) using extreme value theory (Weibull distribution) to identify and reject unknown attack classes.

### B. Methodology
- **Intrusion Detection Approach:** Graph Convolutional Network (GCN) with extreme distance boundary estimation.
- **Graph Transformation:** Network flows are transformed into graph structures where nodes represent host IP addresses or flows, and edges denote communication links.
- **GCN Architecture:** Multi-layer GCN aggregating local and global structural embeddings using graph convolution, batch normalization, and ReLU activations.
- **Open Set Mechanism:** Post-training Weibull distribution fitting on extreme activation vectors to establish an open-set rejection threshold for unseen attack samples.
- **Datasets Used:** Subsampled partitions of **CICIDS2017** (26,554 network flows) and **UNSW-NB15** (56,000 network flows); 75% train / 25% test split.
- **Evaluation Strategy:** Novel attack classes were deliberately withheld from the training set and introduced exclusively during testing.

### C. Results
- **Classification Type:** Open-Set Classification (Known Classes vs Unknown Attacks).
- **Reported Metric Values:**
  - **Conventional Closed-World GCN (when exposed to unseen attacks):**
    - CICIDS2017 Test Accuracy: **70.45%**
    - UNSW-NB15 Test Accuracy: **56.73%**
  - **Proposed GCN + Open Set Recognition (Weibull):**
    - CICIDS2017 Test Accuracy: **91.56%**
    - UNSW-NB15 Test Accuracy: **93.73%**
  - Precision, Recall, F1-Score, FPR: *Not reported in the paper (only accuracy and qualitative misclassification reduction plots are provided)*.

### D. Research Limitations
- **Severe Subsampling:** Evaluated on tiny subsets (only 26,554 flows of CICIDS2017 and 56,000 flows of UNSW-NB15), representing less than 2% of the original datasets.
- **Graph Construction Bottleneck:** Generating dynamic communication graphs from real-time high-throughput packet flows is computationally prohibitive on standard endpoint machines.
- **Omission of Detailed Security Metrics:** The paper omitted Precision, Recall, and False Alarm rates, reporting only overall classification accuracy.

### E. Research Contribution & Relevance to NetShield
- **Relevance to NetShield:**
  - Validates the fundamental defensive principle: ML models degrade severely (down to 56% accuracy) when encountering traffic patterns not represented in the training set.
  - In NetShield's documentation and review presentation, this provides empirical justification for framing NetShield as a hybrid defensive tool that complements, rather than replaces, traditional signature-based firewalls.

---

## Paper 9: Label-Flipping Poisoning Attack Against ML-based NIDS: A Comparative Analysis

### A. Research Information
- **Title:** Label-Flipping Poisoning Attack Against ML-based NIDS: A Comparative Analysis
- **Authors:** Sarveshwer Dahre, Sharbani Purkayastha, Nitesh K. Bharadwaj
- **Affiliation:** Department of Computer Applications and Department of CSE, National Institute of Technology (NIT) Raipur, India
- **Publication Year:** 2026
- **Conference / Venue:** 18th IEEE International Conference on Computational Intelligence and Communication Networks (CICN) 2026
- **Publisher / DOI:** IEEE | DOI: [10.1109/CICN.2026.122](https://doi.org/10.1109/CICN.2026.122) | pp. 782–787
- **Research Problem:** NIDS training pipelines are vulnerable to data poisoning. If an adversary gains access to traffic logs and flips binary labels (e.g., marking malicious traffic as benign), the resulting model can be compromised.
- **Research Objectives:** Conduct a rigorous comparative robustness evaluation of 7 widely used classical and deep learning classifiers under progressive label-flipping poisoning rates (0% to 50%) using CICIDS2017.

### B. Methodology
- **Intrusion Detection Approach:** Supervised binary classification evaluated under clean baseline conditions and under 10%, 20%, 30%, 40%, and 50% stratified label-flipping poisoning.
- **Dataset Used:** CICIDS2017 dataset.
  - Raw records: 2,830,743 across 78 features.
  - Data Cleaning: Removal of duplicate rows, nulls, and infinite values; removal of constant/zero-variance features (reducing features from 78 to 68).
  - Class Distribution: Post-cleaning distribution was 1,896,672 Benign and 336,492 Attack records (85:15 ratio).
  - Balancing: Under-sampled the benign majority to 336,492 samples to achieve an exact 50:50 balanced training split (672,984 total records).
  - Feature Scaling: Scikit-Learn `StandardScaler`.
- **Machine Learning Algorithms Evaluated:**
  1. Decision Tree (DT)
  2. Random Forest (RF)
  3. Extreme Gradient Boosting (XGBoost)
  4. Logistic Regression (LR)
  5. Linear Support Vector Classifier (LinearSVC)
  6. Gaussian Naive Bayes (GNB)
  7. Deep Neural Network (DNN: 2 hidden layers of 256 neurons, ReLU, dropout 0.2, softmax output, Adam optimizer)
- **Evaluation Metrics:** Accuracy, Precision, Recall, F1-Score on overall dataset and attack class specifically.

### C. Results
- **Classification Type:** Binary Classification (Benign = 0, Attack = 1).
- **Reported Clean Data (0% Poisoning) Baseline Performance (Tables I & II of Paper):**
  - **Decision Tree (DT):** Accuracy: **99.99%**
  - **Random Forest (RF):** Accuracy: **99.97%**
  - **XGBoost (XGB):** Accuracy: **99.95%**
  - **Deep Neural Network (DNN):** Accuracy: **98.96%** | Precision: **98.97%** | Recall: **98.96%** | F1-Score: **98.96%**
  - **Logistic Regression (LR):** Accuracy: **95.42%**
  - **Linear SVC:** Accuracy: **94.89%**
  - **Gaussian Naive Bayes (GNB):** Accuracy: **58.98%**
- **Performance Under 50% Label Poisoning (Table II of Paper):**
  - Decision Tree: **99.88%** (high apparent resistance, but authors caution this indicates memorization of noisy labels rather than generalizable learning)
  - Random Forest: **99.76%**
  - XGBoost: **55.60%** (degraded linearly)
  - Deep Neural Network (DNN): **50.11%** overall accuracy; attack class accuracy collapsed to **12.61%**
  - Logistic Regression: **50.24%**
  - Linear SVC: **50.32%**
  - Gaussian Naive Bayes: **50.00%**

### D. Research Limitations
- **Evaluation on Training Distribution:** The authors evaluated poisoning degradation primarily on the training set to study learning behavior, which can inflate tree-based model resilience via memorization.
- **Severe Downsampling:** Discarding over 1.5 million benign records to force a 50:50 balance alters the real-world base-rate of network attacks.

### E. Research Contribution & Relevance to NetShield
- **Crucial Benchmark for NetShield:**
  - Evaluates the **exact set of candidate ML algorithms** identified in NetShield's Review 0 proposal (DT, RF, LR, SVC, XGBoost).
  - Proves that on clean CICIDS2017 data, **Random Forest (99.97%) and XGBoost (99.95%)** drastically outperform linear models (LR: 95.42%, SVC: 94.89%) and naive probabilistic models (GNB: 58.98%).
  - Confirms that Gaussian Naive Bayes is fundamentally unsuited for multi-feature network flow classification due to its invalid feature independence assumption.
  - Provides empirical justification for NetShield's selection of Random Forest and XGBoost as primary candidate classifiers.
