"""Operational statistics schema."""

from typing import Dict
from pydantic import BaseModel, Field


class StatisticsResponse(BaseModel):
    """Runtime cumulative telemetry and prediction counters."""
    total_predictions: int = Field(..., description="Total flows classified since startup")
    normal_predictions: int = Field(..., description="Total flows classified as Normal")
    attack_predictions: int = Field(..., description="Total flows classified as Attack")
    predictions_by_model: Dict[str, int] = Field(
        ...,
        description="Cumulative inference count broken down by model identifier"
    )
    uptime_seconds: float = Field(..., description="Seconds since application startup")
    server_start_time: str = Field(..., description="ISO 8601 UTC timestamp of server launch")
    timestamp: str = Field(..., description="Current ISO 8601 UTC timestamp")
    ephemeral_notice: str = Field(
        "In-memory counters reset on application restart.",
        description="Persistence disclaimer"
    )
