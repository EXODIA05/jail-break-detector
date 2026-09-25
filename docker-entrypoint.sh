#!/bin/bash
set -e

MODE="${1:-${SERVICE:-both}}"

if [ "$MODE" = "api" ]; then
    echo "Starting FastAPI service on port ${PORT:-7860}..."
    exec uvicorn api:app --host 0.0.0.0 --port ${PORT:-7860}
elif [ "$MODE" = "streamlit" ]; then
    echo "Starting Streamlit dashboard on port ${STREAMLIT_PORT:-8501}..."
    exec streamlit run app.py --server.port=${STREAMLIT_PORT:-8501} --server.address=0.0.0.0 --server.headless=true
elif [ "$MODE" = "both" ]; then
    echo "Starting both FastAPI and Streamlit dashboard..."
    uvicorn api:app --host 0.0.0.0 --port ${PORT:-7860} &
    API_PID=$!
    
    echo "Waiting for FastAPI to initialize..."
    sleep 2
    
    API_URL="http://127.0.0.1:${PORT:-7860}" streamlit run app.py \
        --server.port=${STREAMLIT_PORT:-8501} \
        --server.address=0.0.0.0 \
        --server.headless=true &
    STREAMLIT_PID=$!
    
    trap "kill -TERM $API_PID $STREAMLIT_PID 2>/dev/null" SIGINT SIGTERM
    wait -n
    exit $?
else
    exec "$@"
fi
