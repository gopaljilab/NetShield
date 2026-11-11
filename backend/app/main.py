"""NetShield FastAPI Application Entrypoint.

Provides the production REST API for the NetShield AI-Powered Network Intrusion
Detection System.
"""

from contextlib import asynccontextmanager
import logging
from typing import Dict, Any
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.config import settings
from backend.app.api.routes import api_router
from backend.app.services.model_service import model_service
from backend.app.utils.validation import format_validation_errors, sanitize_error_message

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("netshield")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler to load ML models once during application startup."""
    logger.info("Starting NetShield NIDS API backend...")
    logger.info(f"Loading ML artifacts from: {settings.MODELS_DIR}")

    try:
        model_service.load_artifacts()
        loaded = model_service.get_loaded_model_names()
        logger.info(f"Successfully loaded {len(loaded)} model(s): {loaded}")
        logger.info(f"Default prediction model set to: '{settings.DEFAULT_MODEL}'")
    except Exception as exc:
        logger.error(f"CRITICAL: Failed to initialize NetShield ML artifacts: {exc}", exc_info=True)
        raise RuntimeError(f"NetShield startup aborted due to model loading failure: {exc}") from exc

    yield

    logger.info("Shutting down NetShield NIDS API backend...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 Router
app.include_router(api_router, prefix=settings.API_V1_STR)


# Exception Handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handle Pydantic schema validation failures with clean, structured details."""
    errors = format_validation_errors(exc)
    status_code = getattr(status, "HTTP_422_UNPROCESSABLE_CONTENT", 422)
    return JSONResponse(
        status_code=status_code,
        content={
            "error": "Validation Error",
            "message": "Input payload failed schema validation.",
            "detail": errors,
        },
    )


@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError) -> JSONResponse:
    """Handle business logic errors and bad parameters safely."""
    clean_msg = sanitize_error_message(str(exc))
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "error": "Bad Request",
            "detail": clean_msg,
        },
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch unhandled internal errors without leaking internal stack traces or paths."""
    logger.error(f"Unhandled server exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "detail": "An internal server error occurred while processing the request.",
        },
    )


@app.get(
    "/",
    summary="Root Welcome Endpoint",
    description="Provides quick navigation links to API documentation and health status.",
)
async def root() -> Dict[str, Any]:
    """Root landing endpoint."""
    return {
        "title": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "documentation": "/docs",
        "health": f"{settings.API_V1_STR}/health",
        "models": f"{settings.API_V1_STR}/models",
        "statistics": f"{settings.API_V1_STR}/statistics",
    }
