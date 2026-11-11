# NetShield – Final Project Roadmap & Academic Recommendation

**Project Title:** NetShield: AI-Powered Network Intrusion Detection System Using Machine Learning  
**Course & Academic Unit:** Mini Project (BCS586), Department of Computer Science & Engineering  
**Student Team:** Tejashwini PB (1BH24CS077), Ruthu K (1BH24CS057), Lalit (1BH25CS408), Gopal Gupta (1BH25CS406)  
**Project Guide:** Dr. Jerline Sheeba Anni, Head of Department, Dept. of CSE  
**Author / Mentor:** Senior Machine Learning Engineer & Academic Project Mentor  
**Date:** November 11, 2026  

---

## 1. Executive Summary & Core Decisions

Following an exhaustive audit of all available research papers, presentations, and dataset captures in the project repository, this document establishes the definitive implementation foundation for **NetShield**.

### Key Architectural Decisions:
1. **Primary Dataset Selected:** **UNSW-NB15 Benchmark Partition** (`UNSW_NB15_training-set.csv` [82,332 records] and `UNSW_NB15_testing-set.csv` [175,341 records]).
   - *Rationale:* Perfectly sized for rapid laptop execution; avoids the 85.5% benign majority class skew of CICIDS2017; includes 9 modern attack families; provides an official benchmark partition that eliminates cross-validation leakage.
2. **Secondary Dataset Role:** **CICIDS2017 Parquet Captures** (2,313,810 records) are reserved as a secondary generalization benchmark for cross-dataset verification, avoiding naive schema concatenation.
3. **Target Classification Task:** **Binary Intrusion Detection** (`Normal` = 0, `Attack` = 1).
4. **Candidate Model Suite:**
   - **Baseline Models:** Logistic Regression (Linear) and Decision Tree (Interpretable Rule-Based).
   - **Geometric Margin Baseline:** Linear Support Vector Classifier (LinearSVC).
   - **Ensemble Champions:** Random Forest (Bagging) and XGBoost (Gradient Boosting).
5. **Full-Stack Architecture:** A modular Python backend (FastAPI / Flask) exposing inference endpoints to a modern, interactive defensive SOC dashboard (React.js).

---

## 2. Phased Implementation Roadmap

To ensure smooth, structured execution across the college semester, the project is organized into four sequential engineering phases:

```
  Phase 1: Foundation (Current)
  [ Research Analysis ] ──► [ Dataset Verification ] ──► [ Architecture Approved ]
                                                                 │
  Phase 2: ML Pipeline & Modeling                                ▼
  [ Leak-Free Preprocessing ] ──► [ Feature Selection ] ──► [ Train 5 Models ] ──► [ Model Comparison ]
                                                                                        │
  Phase 3: Backend & Interface                                                          ▼
  [ Model Serialization ] ──► [ FastAPI / Flask Service ] ──► [ React SOC Dashboard ]
                                                                      │
  Phase 4: Evaluation & Reporting                                     ▼
  [ Multi-Metric Benchmarking ] ──► [ Final Report & PPT ] ──► [ Project Defense / Viva ]
```

### Phase 1: Research Foundation & Dataset Verification *(COMPLETED)*
- Audit all 10 research papers and establish comparative baselines.
- Verify schema integrity, missing values, duplicates, and label distributions across all downloaded datasets.
- Formally select and justify UNSW-NB15 as the primary benchmark.

### Phase 2: Leak-Free Preprocessing & Model Training *(NEXT STEP - Upon User Approval)*
1. **Data Ingestion Script:** Create a reproducible script to load `training-set.csv` and `testing-set.csv`.
2. **Column Pruning:** Drop `id` (monotonic artifact) and `attack_cat` (leakage column for binary task).
3. **Leak-Free Transformation:**
   - Fit `OneHotEncoder(handle_unknown='ignore')` on `['proto', 'service', 'state']` using training data only.
   - Fit `StandardScaler()` on the 39 numerical features using training data only.
   - Transform testing data using fitted transformers.
4. **Model Training & Comparison:**
   - Train Logistic Regression, Decision Tree, Random Forest, LinearSVC, and XGBoost.
   - Record training duration (seconds) and memory usage for each algorithm.
5. **Evaluation Suite:**
   - Compute Accuracy, Precision, Recall, F1-Score, False Positive Rate (FPR), and Confusion Matrix for all 5 models on the official test set.
   - Save trained models using `joblib` into a `models/` directory.

### Phase 3: Defensive SOC Dashboard & Backend Ingestion
1. **API Service:** Build a lightweight FastAPI / Flask service that accepts a JSON network flow payload, applies the saved preprocessor, and returns the intrusion prediction (`Normal` vs `Attack`), attack probability, and flow risk score.
2. **Interactive Frontend:** Develop a clean React dashboard displaying:
   - System status indicator (Threat Level: Low, Moderate, Critical).
   - Live flow stream simulation from test set samples.
   - Confusion matrix and performance metric comparison visualizers.
   - Feature importance bar chart showing top attack indicators.

### Phase 4: Final Academic Documentation & Defense Preparation
- Generate the final project report, user manual, and Review 1 / Review 2 presentation slides.
- Prepare the student team for rigorous viva defense.

---

## 3. Academic Mentorship Guide: Defending NetShield in College Reviews

During project reviews and viva examinations, university examiners and professors typically ask probing questions to test whether students truly understand their machine learning system. Below are the top anticipated questions and the authoritative technical responses the NetShield team should deliver:

### Question 1: "Why did you choose UNSW-NB15 over KDD Cup 1999 or NSL-KDD?"
- **Authoritative Student Answer:**
  > *"KDD Cup 1999 is nearly three decades old and suffers from severe synthetic redundancies, unrealistic traffic rates, and obsolete attack patterns. While NSL-KDD removed duplicate rows, it still reflects 1999-era network topologies and lacks modern encrypted protocols and low-and-slow threats. We chose UNSW-NB15 because it was generated on a modern IXIA PerfectStorm testbed, incorporates 9 modern attack families (such as Fuzzers, Backdoors, and contemporary Exploits), and provides an official benchmark split that reflects realistic operational class shifts between training and deployment."*

### Question 2: "Why didn't you just train a Deep Neural Network (DNN) or CNN?"
- **Authoritative Student Answer:**
  > *"Recent research literature, such as Madhusudhan & Madam (ICSCN 2025) and Ali et al. (CICTN 2025), demonstrates that deep neural networks on tabular network flows introduce massive computational complexity and high latency without necessarily outperforming tree ensembles. Furthermore, deep networks are highly vulnerable to adversarial evasion attacks (reducing accuracy to 36% under PGD) and are opaque black boxes to security analysts. Tree-based ensembles like Random Forest and XGBoost achieve equal or superior F1-scores (~95–99%), train in seconds on standard endpoint hardware, and provide direct feature importance interpretability."*

### Question 3: "Why is Accuracy an insufficient metric for an Intrusion Detection System?"
- **Authoritative Student Answer:**
  > *"In operational network traffic, the base rate of attacks is heavily imbalanced. In real networks, attack traffic is often less than 2% of total volume. A broken model that blindly classifies all packets as 'Normal' achieves 98% accuracy while missing 100% of cyber intrusions. For NetShield, Recall (Detection Rate) is our primary defensive metric because missing an intrusion causes catastrophic security breaches. Simultaneously, False Positive Rate (FPR) must be tightly controlled to prevent operational alert fatigue in the Security Operations Center."*

### Question 4: "How did you prevent data leakage in your machine learning pipeline?"
- **Authoritative Student Answer:**
  > *"We implemented a strict four-point anti-leakage protocol: First, we preserved the official UNSW-NB15 training and testing partitions rather than randomly shuffling and mixing repetitive flows. Second, we pruned the artificial 'id' column and dropped the 'attack_cat' column from the input feature matrix. Third, all feature transformers—including our OneHotEncoder and StandardScaler—were fitted strictly and exclusively on the training partition and only applied via transform() to the test set. Finally, no test set records were ever involved in hyperparameter tuning or feature selection."*

---

## 4. Next Step Sign-Off

All research discovery, literature analysis, dataset verifications, and architectural blueprints are now complete.

**The project is ready to advance to Phase 2 (Preprocessing & Model Training) upon user review and approval.**
