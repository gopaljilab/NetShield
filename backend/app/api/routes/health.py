"""Health and readiness endpoint."""

from datetime import datetime, timezone
from fastapi import APIRouter
from backend.app.config import settings
from backend.app.schemas.health import HealthResponse
from backend.app.services.model_service import model_service
from backend.app.services.prediction_service import prediction_service

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Service Health and Readiness Check",
    description="Returns the operational status of the NetShield API and loaded ML models.",
)
async def check_health() -> HealthResponse:
    """Return API health status, loaded models, and uptime."""
    is_ready = model_service.is_loaded
    stats = prediction_service.get_statistics()

    return HealthResponse(
        status="healthy" if is_ready else "degraded",
        version=settings.VERSION,
        models_loaded=is_ready,
        available_models=model_service.get_loaded_model_names(),
        default_model=settings.DEFAULT_MODEL,
        uptime_seconds=stats.uptime_seconds,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
