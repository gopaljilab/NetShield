"""API router aggregation."""

from fastapi import APIRouter
from backend.app.api.routes.health import router as health_router
from backend.app.api.routes.models import router as models_router
from backend.app.api.routes.prediction import router as prediction_router
from backend.app.api.routes.statistics import router as statistics_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(models_router)
api_router.include_router(prediction_router)
api_router.include_router(statistics_router)

__all__ = ["api_router"]
