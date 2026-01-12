#!/bin/bash
# E2E Backend Setup Script
# Starts the backend API for E2E testing

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLIENT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Configuration
API_PORT="${API_PORT:-8000}"
API_HOST="${API_HOST:-localhost}"
API_BASE_URL="http://${API_HOST}:${API_PORT}"

# Check if backend repo is cloned alongside this repo
BACKEND_DIR="${BACKEND_DIR:-${REPO_ROOT}/../AI-Agent-Framework}"

echo "=== E2E Backend Setup ==="
echo "Backend directory: $BACKEND_DIR"
echo "API URL: $API_BASE_URL"
echo ""

# Check if backend directory exists
if [ ! -d "$BACKEND_DIR" ]; then
  echo "❌ Backend not found at: $BACKEND_DIR"
  echo ""
  echo "Please clone the backend repository:"
  echo "  cd $(dirname "$BACKEND_DIR")"
  echo "  git clone https://github.com/blecx/AI-Agent-Framework.git"
  echo ""
  echo "Or set BACKEND_DIR environment variable to point to your backend location."
  exit 1
fi

echo "✓ Backend directory found"

# Check if backend is already running
if curl -s "$API_BASE_URL/health" > /dev/null 2>&1; then
  echo "✓ Backend API is already running at $API_BASE_URL"
  echo "✓ Health check passed"
  exit 0
fi

echo "Starting backend API..."

# Check if Docker is available and docker-compose.yml exists
if command -v docker &> /dev/null && [ -f "$BACKEND_DIR/docker-compose.yml" ]; then
  echo "Starting backend via Docker Compose..."
  cd "$BACKEND_DIR"
  docker compose up -d
  
  # Wait for API to be ready
  echo "Waiting for API to be ready..."
  for i in {1..30}; do
    if curl -s "$API_BASE_URL/health" > /dev/null 2>&1; then
      echo "✓ Backend API is ready at $API_BASE_URL"
      exit 0
    fi
    echo -n "."
    sleep 2
  done
  
  echo ""
  echo "❌ Backend API did not start in time"
  echo "Check logs: cd $BACKEND_DIR && docker compose logs"
  exit 1

# Check if Python virtual environment exists
elif [ -f "$BACKEND_DIR/venv/bin/activate" ]; then
  echo "Starting backend via Python virtual environment..."
  cd "$BACKEND_DIR"
  source venv/bin/activate
  
  # Start uvicorn in background
  uvicorn main:app --host "$API_HOST" --port "$API_PORT" --log-level info > /tmp/backend-e2e.log 2>&1 &
  BACKEND_PID=$!
  echo $BACKEND_PID > /tmp/backend-e2e.pid
  
  # Wait for API to be ready
  echo "Waiting for API to be ready..."
  for i in {1..30}; do
    if curl -s "$API_BASE_URL/health" > /dev/null 2>&1; then
      echo "✓ Backend API is ready at $API_BASE_URL (PID: $BACKEND_PID)"
      echo "Log file: /tmp/backend-e2e.log"
      exit 0
    fi
    echo -n "."
    sleep 2
  done
  
  echo ""
  echo "❌ Backend API did not start in time"
  echo "Check logs: tail /tmp/backend-e2e.log"
  kill $BACKEND_PID 2>/dev/null || true
  exit 1

else
  echo "❌ Could not determine how to start the backend"
  echo ""
  echo "Please either:"
  echo "  1. Start backend manually (Docker or uvicorn)"
  echo "  2. Ensure Docker is installed and backend has docker-compose.yml"
  echo "  3. Create Python venv in backend: python -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
  exit 1
fi
