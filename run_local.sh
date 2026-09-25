#!/bin/bash
# Starts FastAPI backend, React 3D frontend, and Streamlit dashboard locally in background

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ -f "$SCRIPT_DIR/.venv/bin/python" ]; then
    PYTHON="$SCRIPT_DIR/.venv/bin/python"
    UVICORN="$SCRIPT_DIR/.venv/bin/uvicorn"
    STREAMLIT="$SCRIPT_DIR/.venv/bin/streamlit"
else
    PYTHON="$(command -v python3 || command -v python)"
    UVICORN="$(command -v uvicorn || echo "$PYTHON -m uvicorn")"
    STREAMLIT="$(command -v streamlit || echo "$PYTHON -m streamlit")"
fi

API_PORT="${API_PORT:-8001}"
LANDING_PORT="${LANDING_PORT:-5173}"
REACT_PORT="${REACT_PORT:-3000}"
STREAMLIT_PORT="${STREAMLIT_PORT:-8501}"

echo "=================================================="
echo " Starting Sentinel AI Cyber Defense Suite"
echo "=================================================="

mkdir -p logs

# 1. Stop existing if running
./stop_local.sh > /dev/null 2>&1

# 2. Start FastAPI backend
echo "Starting FastAPI on http://127.0.0.1:$API_PORT..."
setsid "$UVICORN" api:app --host 0.0.0.0 --port "$API_PORT" </dev/null > logs/api.log 2>&1 &
API_PID=$!
echo "$API_PID" > logs/api.pid
echo "FastAPI PID: $API_PID (Logs: logs/api.log)"

# Wait for API to become ready
echo -n "Waiting for FastAPI..."
READY=0
for i in {1..20}; do
    if curl -s "http://127.0.0.1:$API_PORT/health" > /dev/null 2>&1; then
        echo " Ready!"
        READY=1
        break
    fi
    sleep 0.3
    echo -n "."
done

# 3. Start React 3D Frontend
echo "Starting React 3D UI on http://127.0.0.1:$REACT_PORT..."
cd "$SCRIPT_DIR/frontend"
setsid npm run dev -- --host 0.0.0.0 --port "$REACT_PORT" </dev/null > ../logs/react.log 2>&1 &
REACT_PID=$!
echo "$REACT_PID" > ../logs/react.pid
echo "React PID: $REACT_PID (Logs: logs/react.log)"
cd "$SCRIPT_DIR"

# Wait for React
echo -n "Waiting for React 3D UI..."
for i in {1..20}; do
    if curl -s "http://127.0.0.1:$REACT_PORT" > /dev/null 2>&1; then
        echo " Ready!"
        break
    fi
    sleep 0.3
    echo -n "."
done

# 3b. Start 3D Interactive Product Landing Page
echo "Starting 3D Product Landing Page on http://127.0.0.1:$LANDING_PORT..."
cd "$SCRIPT_DIR/landing"
setsid npm run dev -- --host 0.0.0.0 --port "$LANDING_PORT" </dev/null > ../logs/landing.log 2>&1 &
LANDING_PID=$!
echo "$LANDING_PID" > ../logs/landing.pid
echo "Landing Page PID: $LANDING_PID (Logs: logs/landing.log)"
cd "$SCRIPT_DIR"

# Wait for Landing
echo -n "Waiting for 3D Landing Page..."
for i in {1..20}; do
    if curl -s "http://127.0.0.1:$LANDING_PORT" > /dev/null 2>&1; then
        echo " Ready!"
        break
    fi
    sleep 0.3
    echo -n "."
done

# 4. Start Streamlit (Secondary/Legacy Dashboard)
echo "Starting Streamlit on http://127.0.0.1:$STREAMLIT_PORT..."
API_URL="http://127.0.0.1:$API_PORT" setsid "$STREAMLIT" run app.py \
    --server.port "$STREAMLIT_PORT" \
    --server.address 0.0.0.0 \
    --server.headless true \
    --browser.gatherUsageStats false </dev/null > logs/streamlit.log 2>&1 &
STREAMLIT_PID=$!
echo "$STREAMLIT_PID" > logs/streamlit.pid
echo "Streamlit PID: $STREAMLIT_PID (Logs: logs/streamlit.log)"

# Wait for Streamlit
echo -n "Waiting for Streamlit..."
for i in {1..25}; do
    if curl -s "http://127.0.0.1:$STREAMLIT_PORT" > /dev/null 2>&1; then
        echo " Ready!"
        break
    fi
    sleep 0.3
    echo -n "."
done

echo "=================================================="
echo " 🚀 All Services Connected & Live!"
echo " - 🌐 3D PRODUCT LANDING:  http://localhost:$LANDING_PORT"
echo " - ✨ REACT 3D PLAYGROUND: http://localhost:$REACT_PORT"
echo " - 🛡️ FastAPI Swagger:     http://localhost:$API_PORT/docs"
echo " - 📡 FastAPI Health:      http://localhost:$API_PORT/health"
echo " - 📊 Streamlit UI:        http://localhost:$STREAMLIT_PORT"
echo "=================================================="
