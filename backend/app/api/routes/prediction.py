"""Prediction endpoints for single-flow and batch network traffic classification."""

from typing import List, Optional, Union
from fastapi import APIRouter, Query, HTTPException, status
from backend.app.schemas.prediction import (
    NetworkFlowInput,
    PredictionResponse,
    BatchPredictionRequest,
    BatchPredictionResponse,
)
from backend.app.services.prediction_service import prediction_service
from backend.app.utils.validation import sanitize_error_message

router = APIRouter(tags=["Prediction"])


@router.post(
    "/predict",
    response_model=PredictionResponse,
    status_code=status.HTTP_200_OK,
    summary="Classify a Single Network Flow",
    description=(
        "Accepts a 42-feature network flow record, validates against schema, transforms features "
        "via the leak-free UNSW-NB15 preprocessor, and returns the binary intrusion prediction."
    ),
    responses={
        200: {"description": "Successful classification"},
        400: {"description": "Invalid model selection or request parameter"},
        422: {"description": "Validation error: missing, malformed, negative, or forbidden fields"},
    },
)
async def predict_flow(
    flow: NetworkFlowInput,
    model_name: Optional[str] = Query(
        None,
        description="Optional model override (e.g. 'xgboost', 'random_forest'). Defaults to 'xgboost'.",
    ),
) -> PredictionResponse:
    """Predict whether a network flow is Normal or an Attack."""
    # Query parameter overrides body field if provided, else use body field
    selected_model = model_name or flow.model_name

    try:
        return prediction_service.predict_single(flow, selected_model)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=sanitize_error_message(str(exc)),
        ) from exc


@router.post(
    "/predict/batch",
    response_model=BatchPredictionResponse,
    status_code=status.HTTP_200_OK,
    summary="Classify a Batch of Network Flows",
    description=(
        "Accepts a bounded list of network flow records (either as an object with 'flows' array or "
        "a direct JSON list of flows), performs vectorized preprocessing and inference, "
        "and returns aggregate counts and itemized flow classifications."
    ),
    responses={
        200: {"description": "Successful batch classification"},
        400: {"description": "Invalid batch size, empty batch, or invalid model name"},
        422: {"description": "Validation error in one or more records"},
    },
)
async def predict_batch_flows(
    payload: Union[BatchPredictionRequest, List[NetworkFlowInput]],
    model_name: Optional[str] = Query(
        None,
        description="Optional model override for the batch. Defaults to 'xgboost'.",
    ),
) -> BatchPredictionResponse:
    """Predict traffic classifications for a batch of network flows."""
    if isinstance(payload, BatchPredictionRequest):
        flows = payload.flows
        selected_model = model_name or payload.model_name
    else:
        flows = payload
        selected_model = model_name

    if not flows:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Batch request cannot be empty. At least 1 flow record is required.",
        )

    try:
        return prediction_service.predict_batch(flows, selected_model)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=sanitize_error_message(str(exc)),
        ) from exc
