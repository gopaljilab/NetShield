"""Health check response schema."""

from typing import List
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """API health and service readiness schema."""
    status: str = Field("healthy", description="Current service health state ('healthy' or 'degraded')")
    version: str = Field(..., description="API semantic version")
    models_loaded: bool = Field(..., description="True if ML artifacts are initialized in memory")
    available_models: List[str] = Field(..., description="List of initialized, validated model identifiers")
    default_model: str = Field(..., description="Default model used when no model override is provided")
    uptime_seconds: float = Field(..., description="Time in seconds since backend application startup")
    timestamp: str = Field(..., description="Current ISO 8601 UTC timestamp")
