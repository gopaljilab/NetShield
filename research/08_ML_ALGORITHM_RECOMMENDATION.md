# NetShield – Machine Learning Algorithm Selection & Evaluation Strategy

**Project Title:** NetShield: AI-Powered Network Intrusion Detection System Using Machine Learning  
**Domain:** Supervised Binary Classification & Comparative Model Benchmarking  
**Auditor / Mentor:** Senior Machine Learning Engineer & Academic Project Mentor  
**Date:** November 11, 2026  

---

## 1. Evaluation of Candidate Machine Learning Algorithms

In accordance with NetShield's project proposal, five representative machine learning algorithms covering diverse statistical, geometric, and ensemble paradigms were selected for comparative evaluation:

```
                          NetShield Model Hierarchy
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         ▼                            ▼                            ▼
   Linear / Margin               Tree / Rule               Ensemble Champions
  ┌─────────────────────┐      ┌───────────────┐        ┌───────────────────────┐
  │ Logistic Regression │      │ Decision Tree │        │ Random Forest (Bagging│
  │ Linear / RBF SVM    │      │               │        │ XGBoost (Boosting)    │
  └─────────────────────┘      └───────────────┘        └───────────────────────┘
```

---

### Algorithm 1: Logistic Regression (LR)
- **Mathematical Paradigm:** Linear probabilistic classification using the sigmoid link function:
  $$P(y=1|\mathbf{x}) = \frac{1}{1 + e^{-(\mathbf{w}^T \mathbf{x} + b)}}$$
- **Role in NetShield:** **Linear Baseline Model**.
- **Strengths:** 
  - Extremely fast training time ($< 2$ seconds on 82k records).
  - High interpretability: feature weights $\mathbf{w}$ directly indicate whether an attribute increases or decreases the odds of an intrusion.
  - Minimal memory footprint and instantaneous inference latency ($< 0.1$ ms per flow).
- **Weaknesses:**
  - Cannot model non-linear feature interactions without manual polynomial expansion.
  - Highly sensitive to unscaled features and extreme outliers common in network bursts.
- **Preprocessing Requirements:** Strict feature scaling (`StandardScaler` or `RobustScaler`) is mandatory.

---

### Algorithm 2: Decision Tree (DT - CART)
- **Mathematical Paradigm:** Recursive non-parametric binary splitting based on Gini Impurity or Information Gain:
  $$\text{Gini}(D) = 1 - \sum_{i=1}^{C} p_i^2$$
- **Role in NetShield:** **Interpretable Non-Linear Baseline**.
- **Strengths:**
  - Fast training ($< 3$ seconds).
  - Complete white-box interpretability: decision paths can be directly visualized and converted into simple firewall IF-THEN rules.
  - Invariant to monotonic feature scaling; handles numerical features without normalization.
- **Weaknesses:**
  - High variance: prone to deep overfitting and memorization of noise (as proven by Dahre et al., *Paper 9*).
  - Sub-optimal decision boundaries on complex continuous distributions.
- **Mitigation in NetShield:** Constrain `max_depth` (e.g., 10–15) and set `min_samples_split` $\ge 20$ to prevent leaf-level memorization.

---

### Algorithm 3: Random Forest (RF)
- **Mathematical Paradigm:** Ensemble bagging architecture combining $B$ de-correlated decision trees with bootstrap aggregation and random feature sub-spacing:
  $$\hat{y} = \text{mode}\left( \{ T_b(\mathbf{x}) \}_{b=1}^B \right)$$
- **Role in NetShield:** **Primary Bagging Ensemble Champion**.
- **Strengths:**
  - Proven state-of-the-art performance across 7 of our reviewed research papers (*Fu 2025, Dietz 2025, Dahre 2026*).
  - Significantly reduces variance and eliminates the overfitting vulnerability of single decision trees.
  - Built-in Gini feature importance calculation to rank the most critical network flow attributes.
  - Highly robust to outliers and noisy network measurements.
- **Weaknesses:**
  - Moderate memory usage for large forests ($> 100$ trees).
- **Hyperparameter Recommendation:** `n_estimators=100`, `max_depth=20`, `n_jobs=-1` (parallel multi-core training).

---

### Algorithm 4: Support Vector Machine (Linear / RBF SVM)
- **Mathematical Paradigm:** Maximum-margin hyperplane separation with convex quadratic optimization:
  $$\min_{\mathbf{w}, b, \boldsymbol{\xi}} \frac{1}{2} \|\mathbf{w}\|^2 + C \sum_{i=1}^N \xi_i \quad \text{s.t.} \quad y_i(\mathbf{w}^T \phi(\mathbf{x}_i) + b) \ge 1 - \xi_i$$
- **Role in NetShield:** **Geometric Margin-Based Baseline**.
- **Strengths:**
  - High theoretical robustness in high-dimensional feature spaces.
  - Effective when clear separation boundaries exist between normal and anomalous flows.
- **Weaknesses:**
  - Kernel SVM (RBF) has $\mathcal{O}(N^2)$ to $\mathcal{O}(N^3)$ computational time complexity, making full non-linear SVM training on 82k samples painfully slow on student laptops.
- **Mitigation in NetShield:** Use `LinearSVC` (optimized via LibLinear) or train RBF SVM on a stratified subsample (e.g., 20,000 samples) to ensure rapid training and prevent student machine lockups.

---

### Algorithm 5: Extreme Gradient Boosting (XGBoost)
- **Mathematical Paradigm:** Sequential gradient boosting of shallow decision trees optimizing a second-order Taylor expansion of the loss function with built-in $L_1$ and $L_2$ leaf regularization:
  $$\mathcal{L}^{(t)} \approx \sum_{i=1}^N \left[ g_i f_t(\mathbf{x}_i) + \frac{1}{2} h_i f_t^2(\mathbf{x}_i) \right] + \Omega(f_t)$$
- **Role in NetShield:** **Primary Boosting Ensemble Champion**.
- **Strengths:**
  - Consistently achieves the highest accuracy and F1-scores in competitive tabular machine learning and cybersecurity benchmarks.
  - Native handling of class imbalance via the `scale_pos_weight` hyperparameter.
  - Highly optimized C++ backend with multi-threaded parallel tree building.
- **Weaknesses:**
  - Requires careful hyperparameter tuning (learning rate `eta`, tree depth `max_depth`, subsampling ratios) to prevent overfitting.
- **Hyperparameter Recommendation:** `learning_rate=0.1`, `n_estimators=100`, `max_depth=6`, `subsample=0.8`.

---

## 2. Technical Comparison Matrix Across Candidate Algorithms

| Selection Criterion | Logistic Regression | Decision Tree | Random Forest | Support Vector Machine | XGBoost |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Training Speed (82k rows)** | Ultra-Fast ($< 2$s) | Ultra-Fast ($< 3$s) | Fast ($\approx 25$s) | Moderate ($\approx 45$s LinearSVC) | Fast ($\approx 15$s) |
| **Inference Latency** | $< 0.1$ ms/flow | $< 0.1$ ms/flow | $\approx 1.2$ ms/flow | $\approx 0.5$ ms/flow | $\approx 0.8$ ms/flow |
| **Model Interpretability** | High (linear weights) | High (visual tree) | Moderate (feature rank) | Low (hyperplane margin) | Moderate (SHAP / gain) |
| **Outlier Robustness** | Low (distorts weights)| High | Very High | Low to Moderate | High |
| **Scaling Sensitivity** | Mandatory | Invariant | Invariant | Mandatory | Invariant |
| **Overfitting Risk** | Low (underfits) | Severe (unpruned) | Low (bagging average) | Low with proper $C$ | Moderate (needs tuning)|
| **College Laptop Feasibility**| **100% Feasible** | **100% Feasible** | **100% Feasible** | **100% (LinearSVC)** | **100% Feasible** |

---

## 3. Comprehensive Evaluation Metrics Framework

In cybersecurity network intrusion detection, **Accuracy alone is profoundly insufficient and actively dangerous**.

### Why Accuracy Fails as a Security Metric:
Consider an enterprise network dataset containing 980 normal flows and 20 attack flows (98% normal, 2% attack).
- A completely broken model that always outputs `0` (Normal) achieves **98.0% Accuracy**.
- However, its **Recall for the Attack Class is 0.0%**. Every single malicious intruder successfully breaches the network undetected.

### The Required NetShield Metric Suite:

1. **Confusion Matrix Parameters:**
   - **True Positive ($TP$):** Attack correctly flagged as Attack.
   - **True Negative ($TN$):** Normal traffic correctly classified as Normal.
   - **False Positive ($FP$):** Normal traffic falsely flagged as Attack (**False Alarm**).
   - **False Negative ($FN$):** Attack traffic misclassified as Normal (**Undetected Breach**).

2. **Detection Accuracy:**
   $$\text{Accuracy} = \frac{TP + TN}{TP + TN + FP + FN}$$
   *Role:* Overall baseline correctness across both classes.

3. **Precision (Positive Predictive Value):**
   $$\text{Precision} = \frac{TP}{TP + FP}$$
   *Role:* Measures alert trustworthiness. When NetShield sounds an alarm, what percentage of the alerts are actual attacks rather than innocent employee web browsing?

4. **Recall / Detection Rate (True Positive Rate):**
   $$\text{Recall} = \frac{TP}{TP + FN}$$
   *Role:* The most critical defensive security metric. What percentage of all cyber intrusions were successfully detected and intercepted?

5. **F1-Score (Harmonic Mean):**
   $$\text{F1-Score} = 2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}}$$
   *Role:* Balances the trade-off between missing attacks ($FN$) and generating false alarms ($FP$).

6. **False Positive Rate (FPR / Fall-out):**
   $$\text{FPR} = \frac{FP}{FP + TN}$$
   *Role:* Measures operational alert fatigue. In an enterprise handling 1,000,000 packets per minute, an FPR of even 1% floods analysts with 10,000 false alarms every 60 seconds.

---

## 4. Anti-Data-Leakage Protocol & Benchmark Partitioning

To guarantee 100% academic validity during implementation:

1. **Strict Partition Preservation:**
   - Train on `UNSW_NB15_training-set.csv` (82,332 records).
   - Test on `UNSW_NB15_testing-set.csv` (175,341 records).
   - **Never combine and re-split.**

2. **Isolated Transformer Fitting:**
   ```
   [ Training Partition ] ─────────────────► fit_transform() ──► Scaler / Encoder Parameters
                                                                            │
   [ Testing Partition ]  ──► transform() ONLY (No fitting!) ◄──────────────┘
   ```

3. **Pruning Non-Feature Columns:**
   - Drop `id` (row index artifact).
   - Drop `attack_cat` from input matrix $X$ when `label` is the target variable.
