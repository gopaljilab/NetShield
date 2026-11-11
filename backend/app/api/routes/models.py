"""Model discovery and benchmark metadata endpoint."""

from fastapi import APIRouter
from backend.app.config import settings
from backend.app.schemas.models import ModelsListResponse
from backend.app.services.model_service import model_service

router = APIRouter(tags=["Models"])


@router.get(
    "/models",
    response_model=ModelsListResponse,
    summary="List Available Machine Learning Models",
    description="Returns all loaded NIDS models with their academic benchmark metrics and characteristics.",
)
async def list_models() -> ModelsListResponse:
    """Return all available models and their benchmark evaluations."""
    return ModelsListResponse(
        models=model_service.list_models_metadata(),
        default_model=settings.DEFAULT_MODEL,
    )
