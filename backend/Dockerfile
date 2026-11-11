# ==============================================================================
# NetShield Backend REST API - Production Dockerfile
# Multi-stage security-hardened container for FastAPI + XGBoost/Scikit-Learn
# ==============================================================================

FROM python:3.11-slim AS runtime

# Set security and runtime environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PYTHONPATH=/app \
    PORT=8000

# Install runtime system dependencies (libgomp1 for XGBoost OpenMP, curl for healthchecks)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root system user and group for defensive security hardening
RUN groupadd -g 1001 netshield && \
    useradd -u 1001 -g netshield -m -s /bin/bash netshield

WORKDIR /app

# Install Python dependencies first to leverage Docker layer caching
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy application code, preprocessor, trained models, and benchmark reports
COPY backend/ /app/backend/
COPY ml/ /app/ml/
COPY research/reports/model_comparison.csv /app/research/reports/model_comparison.csv

# Ensure correct file permissions for the non-root user
RUN chown -R netshield:netshield /app

# Switch to non-root user
USER netshield

# Expose backend REST API port
EXPOSE 8000

# Container health probe
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/api/v1/health || exit 1

# Launch production Uvicorn ASGI server
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
