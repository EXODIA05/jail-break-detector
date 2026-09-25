#!/bin/bash
# Stops all local services: FastAPI, React, and Streamlit

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

stopped=0

# 1. Stop React
if [ -f logs/react.pid ]; then
    REACT_PID=$(cat logs/react.pid)
    if [ -n "$REACT_PID" ] && kill -0 "$REACT_PID" 2>/dev/null; then
        kill "$REACT_PID" 2>/dev/null
        echo "Stopped React UI (PID $REACT_PID)"
        stopped=1
    fi
    rm -f logs/react.pid
fi

# 2. Stop FastAPI
if [ -f logs/api.pid ]; then
    API_PID=$(cat logs/api.pid)
    if [ -n "$API_PID" ] && kill -0 "$API_PID" 2>/dev/null; then
        kill "$API_PID" 2>/dev/null
        echo "Stopped FastAPI (PID $API_PID)"
        stopped=1
    fi
    rm -f logs/api.pid
fi

# 3. Stop Streamlit
if [ -f logs/streamlit.pid ]; then
    STREAMLIT_PID=$(cat logs/streamlit.pid)
    if [ -n "$STREAMLIT_PID" ] && kill -0 "$STREAMLIT_PID" 2>/dev/null; then
        kill "$STREAMLIT_PID" 2>/dev/null
        echo "Stopped Streamlit (PID $STREAMLIT_PID)"
        stopped=1
    fi
    rm -f logs/streamlit.pid
fi

# 4. Stop 3D Landing Page
if [ -f logs/landing.pid ]; then
    LANDING_PID=$(cat logs/landing.pid)
    if [ -n "$LANDING_PID" ] && kill -0 "$LANDING_PID" 2>/dev/null; then
        kill "$LANDING_PID" 2>/dev/null
        echo "Stopped 3D Landing Page (PID $LANDING_PID)"
        stopped=1
    fi
    rm -f logs/landing.pid
fi

# Fallbacks
pkill -f "vite.*--port 3000" 2>/dev/null && stopped=1
pkill -f "vite.*--port 5173" 2>/dev/null && stopped=1
pkill -f "uvicorn api:app" 2>/dev/null && stopped=1
pkill -f "streamlit run app.py" 2>/dev/null && stopped=1

if [ $stopped -eq 1 ]; then
    echo "All services stopped."
else
    echo "No running services found."
fi
