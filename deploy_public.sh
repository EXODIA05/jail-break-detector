#!/bin/bash
# ==============================================================================
# Aegis / Warden Guardrail - Instant 100% Free Public Deployment Script
# ==============================================================================

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=================================================="
echo " 🛡️ Aegis Guardrail: Instant Free Public Deploy"
echo "=================================================="

# 1. Ensure production builds are fresh
echo "[1/3] Building production assets..."
cd "$SCRIPT_DIR/landing" && npm run build --silent
cd "$SCRIPT_DIR/frontend" && npm run build --silent
cd "$SCRIPT_DIR"

# 2. Check if local backend is active or start it
echo "[2/3] Checking local unified gateway..."
if ! curl -s "http://127.0.0.1:8001/health" > /dev/null 2>&1; then
    echo "Starting local service in background..."
    ./run_local.sh > /dev/null 2>&1
    sleep 2
fi

echo "[3/3] Creating secure HTTPS public tunnel to port 8001..."
echo "--------------------------------------------------"
echo "Your application serves:"
echo " - 🌐 3D Landing Page:    /"
echo " - ✨ 3D Playground:      /playground"
echo " - 🛡️ API Endpoints:      /chat, /predict"
echo " - 📡 Interactive Docs:   /docs"
echo "--------------------------------------------------"
echo "Starting global tunnel... (Press Ctrl+C to stop)"

# Use npx localtunnel for zero-install, zero-cost public HTTPS URL
npx --yes localtunnel --port 8001
