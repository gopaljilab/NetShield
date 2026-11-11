"""NetShield Preprocessing Pipeline.

Defensive Network Intrusion Detection System (NIDS) Preprocessing Module.
Author: NetShield Engineering Team & Senior ML Mentor
Academic Context: Department of CSE, Mini Project (BCS586)

Key Responsibilities:
1. Strict Anti-Leakage Protocol: Removes 'id' and 'attack_cat' from input feature space.
2. Leak-Free Preprocessing: Fits all scaling and encoding transformers EXCLUSIVELY on training data.
3. Categorical Handling: One-Hot Encoding with handle_unknown='ignore' for unseen test protocols.
4. Numerical Scaling: Standard scaling for continuous flow metrics.
5. Reproducible Serialization: Save and load preprocessing pipelines via joblib.
"""

from typing import List, Optional, Tuple
import os
import joblib
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.preprocessing import OneHotEncoder, StandardScaler


# Explicit feature definitions based on UNSW-NB15 dataset dictionary
CATEGORICAL_FEATURES = ["proto", "service", "state"]
TARGET_COLUMN = "label"
LEAKAGE_COLUMNS_TO_DROP = ["id", "attack_cat"]


def load_dataset(filepath: str) -> pd.DataFrame:
  """Load a dataset CSV file with validation and error handling."""
  if not os.path.exists(filepath):
    raise FileNotFoundError(f"Dataset file not found at: {filepath}")

  df = pd.read_csv(filepath)
  if df.empty:
    raise ValueError(f"Dataset at {filepath} is empty.")

  return df


def split_features_and_target(
    df: pd.DataFrame,
    target_col: str = TARGET_COLUMN,
    leakage_cols: Optional[List[str]] = None,
) -> Tuple[pd.DataFrame, pd.Series]:
  """Separate input features from target label and remove potential leakage columns.

  Parameters
  ----------
  df : pd.DataFrame
      Raw dataset dataframe.
  target_col : str
      Name of the target binary label column (default: 'label').
  leakage_cols : list
      Columns to remove from the input feature set (default: ['id',
      'attack_cat']).

  Returns
  -------
  X : pd.DataFrame
      Cleaned feature matrix without target or leakage columns.
  y : pd.Series
      Ground-truth binary label series (0 = Normal, 1 = Attack).
  """
  if leakage_cols is None:
    leakage_cols = LEAKAGE_COLUMNS_TO_DROP

  if target_col not in df.columns:
    raise KeyError(f"Target column '{target_col}' not found in dataframe.")

  # Extract binary target
  y = df[target_col].copy()
  if not set(y.unique()).issubset({0, 1}):
    raise ValueError(
        f"Target column '{target_col}' must contain binary values (0 or 1)."
        f" Found: {y.unique()}"
    )

  # Drop target and any present leakage columns
  cols_to_drop = [target_col] + [c for c in leakage_cols if c in df.columns]
  X = df.drop(columns=cols_to_drop).copy()

  return X, y


class NetShieldPreprocessor(BaseEstimator, TransformerMixin):
  """Leak-free preprocessing transformer for NetShield NIDS.

  Standardizes numerical network flow statistics and one-hot encodes
  categorical attributes. Ensures that all transformations are fitted
  strictly on the training partition.
  """

  def __init__(
      self,
      categorical_cols: Optional[List[str]] = None,
      scaler_type: str = "standard",
  ):
    self.categorical_cols = categorical_cols or CATEGORICAL_FEATURES
    self.scaler_type = scaler_type

    # Transformers (unfitted)
    self.scaler = StandardScaler()
    self.encoder = OneHotEncoder(
        handle_unknown="ignore", sparse_output=False, dtype=np.float32
    )

    self.numerical_cols: List[str] = []
    self.feature_names_out: List[str] = []
    self.is_fitted = False

  def fit(self, X: pd.DataFrame, y: Optional[pd.Series] = None):
    """Fit scaler on numerical columns and encoder on categorical columns

    using TRAINING data only.
    """
    if not isinstance(X, pd.DataFrame):
      raise TypeError("Input X must be a pandas DataFrame.")

    # Identify numerical columns dynamically
    self.numerical_cols = [
        c for c in X.columns if c not in self.categorical_cols
    ]

    # Verify all expected categorical columns are present
    missing_cats = [c for c in self.categorical_cols if c not in X.columns]
    if missing_cats:
      raise KeyError(
          f"Expected categorical columns missing from input: {missing_cats}"
      )

    # 1. Fit numerical scaler
    if self.numerical_cols:
      self.scaler.fit(X[self.numerical_cols])

    # 2. Fit categorical encoder
    if self.categorical_cols:
      self.encoder.fit(X[self.categorical_cols])

    # 3. Construct feature names list for interpretability
    encoded_cat_names = list(
        self.encoder.get_feature_names_out(self.categorical_cols)
    )
    self.feature_names_out = self.numerical_cols + encoded_cat_names
    self.is_fitted = True

    return self

  def transform(self, X: pd.DataFrame) -> np.ndarray:
    """Transform input features using the fitted transformers."""
    if not self.is_fitted:
      raise RuntimeError(
          "NetShieldPreprocessor instance is not fitted yet. Call 'fit' before"
          " 'transform'."
      )

    if not isinstance(X, pd.DataFrame):
      raise TypeError("Input X must be a pandas DataFrame.")

    # Check for missing numerical features
    missing_num = [c for c in self.numerical_cols if c not in X.columns]
    if missing_num:
      raise KeyError(
          f"Missing numerical features required for transformation:"
          f" {missing_num}"
      )

    # Transform numerical features
    X_num_scaled = self.scaler.transform(X[self.numerical_cols])

    # Transform categorical features (handles unseen categories safely)
    X_cat_encoded = self.encoder.transform(X[self.categorical_cols])

    # Concatenate into full feature array: [numerical_scaled, categorical_onehot]
    X_transformed = np.hstack([X_num_scaled, X_cat_encoded]).astype(np.float32)

    return X_transformed

  def fit_transform(
      self, X: pd.DataFrame, y: Optional[pd.Series] = None
  ) -> np.ndarray:
    """Fit to training data, then transform it."""
    return self.fit(X, y).transform(X)

  def get_feature_names(self) -> List[str]:
    """Return the names of the transformed output features."""
    if not self.is_fitted:
      raise RuntimeError("Preprocessor must be fitted to get feature names.")
    return self.feature_names_out

  def save(self, filepath: str):
    """Serialize the preprocessor to disk using joblib."""
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    joblib.dump(self, filepath)

  @classmethod
  def load(cls, filepath: str) -> "NetShieldPreprocessor":
    """Deserialize a saved preprocessor from disk."""
    if not os.path.exists(filepath):
      raise FileNotFoundError(f"Preprocessor file not found at: {filepath}")
    loaded = joblib.load(filepath)
    if not isinstance(loaded, cls):
      raise TypeError(
          f"Loaded object is not an instance of {cls.__name__}. Got"
          f" {type(loaded)}"
      )
    return loaded
