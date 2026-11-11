"""NetShield Backend Services."""

from backend.app.services.model_service import ModelService, model_service
from backend.app.services.prediction_service import (
    PredictionService,
    prediction_service,
)

__all__ = [
    "ModelService",
    "model_service",
    "PredictionService",
    "prediction_service",
]
