# ==============================================================================
# Multi-Stage Production Dockerfile for Sentinel / Aegis Guardrail Gateway
# Ultra-fast, lean (<180MB runtime), 100% free cloud hosting ready
# Compatible with: Hugging Face Spaces, Render, Koyeb, Railway, Fly.io, Self-Hosted
# ==============================================================================

# --- Stage 1: Build Static WebGL Frontends ---
FROM node:20-alpine AS frontend-builder
WORKDIR /build

# Build React 3D Playground
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci --silent

COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# Build 3D Landing Page
COPY landing/package*.json ./landing/
RUN cd landing && npm ci --silent

COPY landing/ ./landing/
RUN cd landing && npm run build

# --- Stage 2: Minimal Python Runtime ---
FROM python:3.12-slim AS runtime
WORKDIR /app

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PORT=7860 \
    STREAMLIT_PORT=8501 \
    THRESHOLD=0.4909 \
    MODEL_PATH=jailbreak_detector_light.joblib \
    API_URL=http://127.0.0.1:7860

# Install runtime dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy compiled frontend builds from builder stage
COPY --from=frontend-builder /build/frontend/dist ./frontend/dist
COPY --from=frontend-builder /build/landing/dist ./landing/dist

# Copy application artifacts and entrypoints
COPY api.py app.py jailbreak_detector_light.joblib docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Hugging Face Spaces User compatibility (UID 1000)
RUN useradd -m -u 1000 user && chown -R 1000:1000 /app
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

# Expose standard service ports (dynamic $PORT respected at runtime)
EXPOSE 7860 8001 8501

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["api"]
