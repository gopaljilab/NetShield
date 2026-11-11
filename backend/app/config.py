"""NetShield Backend Configuration Module.

Loads application settings and parameters from environment variables with
sensible defaults.
"""

import os
from pathlib import Path
from typing import List


class Settings:
    """Application configuration settings."""

    # Project Information
    PROJECT_NAME: str = "NetShield AI-Powered NIDS API"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = (
        "Production-ready defensive Network Intrusion Detection System (NIDS) "
        "REST API serving machine learning models trained on UNSW-NB15."
    )
    API_V1_STR: str = "/api/v1"

    # Base Paths
    # backend/app/config.py -> parent(app) -> parent(backend) -> parent(NetSheild)
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    MODELS_DIR: str = os.getenv(
        "NETSHIELD_MODELS_DIR",
        str(BASE_DIR / "ml" / "saved_models"),
    )
    METRICS_FILE: str = os.getenv(
        "NETSHIELD_METRICS_FILE",
        str(BASE_DIR / "research" / "reports" / "model_comparison.csv"),
    )

    # Model Defaults & Whitelist
    DEFAULT_MODEL: str = os.getenv("NETSHIELD_DEFAULT_MODEL", "xgboost").lower()
    ALLOWED_MODELS: List[str] = [
        "xgboost",
        "random_forest",
        "decision_tree",
        "logistic_regression",
        "linear_svc",
    ]

    # Batch Processing Limits
    MAX_BATCH_SIZE: int = int(os.getenv("NETSHIELD_MAX_BATCH_SIZE", "5000"))

    # CORS Settings
    CORS_ORIGINS: List[str] = ["*"]


settings = Settings()
