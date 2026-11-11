"""Runtime telemetry and statistics endpoint."""

from fastapi import APIRouter
from backend.app.schemas.statistics import StatisticsResponse
from backend.app.services.prediction_service import prediction_service

router = APIRouter(tags=["Statistics"])


@router.get(
    "/statistics",
    response_model=StatisticsResponse,
    summary="Get Inference Telemetry and Statistics",
    description="Returns thread-safe in-memory cumulative counters for traffic predictions.",
)
async def get_statistics() -> StatisticsResponse:
    """Return runtime inference counts and traffic classification breakdown."""
    return prediction_service.get_statistics()
