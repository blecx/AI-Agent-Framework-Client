#!/bin/bash
# E2E Backend Setup Script with Smart Dependency Resolution
# Starts the backend API for E2E testing with automatic fallback strategies

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLIENT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Configuration
API_PORT="${API_PORT:-8000}"
API_HOST="${API_HOST:-localhost}"
API_BASE_URL="http://${API_HOST}:${API_PORT}"
BACKEND_REPO="${BACKEND_REPO:-https://github.com/blecx/AI-Agent-Framework.git}"
LOG_FILE="${LOG_FILE:-/tmp/backend-setup.log}"

# Check if backend repo is cloned alongside this repo
BACKEND_DIR="${BACKEND_DIR:-${REPO_ROOT}/../AI-Agent-Framework}"

# Initialize log file
echo "=== E2E Backend Setup - $(date) ===" > "$LOG_FILE"

# Logging function
log() {
  echo "$1" | tee -a "$LOG_FILE"
}

log_error() {
  echo "✗ $1" | tee -a "$LOG_FILE"
}

log_success() {
  echo "✓ $1" | tee -a "$LOG_FILE"
}

log_attempt() {
  echo "→ $1" | tee -a "$LOG_FILE"
}

log ""
log "=== E2E Backend Setup ==="
log "Backend directory: $BACKEND_DIR"
log "API URL: $API_BASE_URL"
log "Log file: $LOG_FILE"
log ""

# Smart dependency resolution: Try to clone backend if not found
if [ ! -d "$BACKEND_DIR" ]; then
  log_error "Backend not found at: $BACKEND_DIR"
  log ""
  log_attempt "Attempting to clone backend repository..."
  
  # Try to clone the backend repository
  PARENT_DIR="$(dirname "$BACKEND_DIR")"
  mkdir -p "$PARENT_DIR"
  
  if git clone "$BACKEND_REPO" "$BACKEND_DIR" >> "$LOG_FILE" 2>&1; then
    log_success "Backend repository cloned successfully"
  else
    log_error "Failed to clone backend repository"
    log ""
    log "RESOLUTION REQUIRED:"
    log "  1. Clone manually: git clone $BACKEND_REPO $BACKEND_DIR"
    log "  2. Or set BACKEND_DIR to existing backend location"
    log "  3. Or start backend manually on port $API_PORT"
    log ""
    log "See log file: $LOG_FILE"
    exit 1
  fi
fi

log_success "Backend directory found"

# Check if backend is already running
log_attempt "Checking if backend is already running..."
if curl -s "$API_BASE_URL/health" > /dev/null 2>&1; then
  log_success "Backend API is already running at $API_BASE_URL"
  log_success "Health check passed"
  exit 0
fi

log "Backend not running, attempting to start..."
log ""

# Strategy 1: Try Docker Compose
if command -v docker &> /dev/null && [ -f "$BACKEND_DIR/docker-compose.yml" ]; then
  log_attempt "Method 1: Starting backend via Docker Compose..."
  cd "$BACKEND_DIR"
  
  if docker compose up -d >> "$LOG_FILE" 2>&1; then
    log_success "Docker Compose started successfully"
    
    # Wait for API to be ready
    log_attempt "Waiting for API to be ready (max 30 attempts)..."
    for i in {1..30}; do
      if curl -s "$API_BASE_URL/health" > /dev/null 2>&1; then
        log_success "Backend API is ready at $API_BASE_URL (attempt $i/30)"
        exit 0
      fi
      echo -n "." | tee -a "$LOG_FILE"
      sleep 2
    done
    
    log ""
    log_error "Backend API did not start in time after Docker Compose"
    log "Check logs: cd $BACKEND_DIR && docker compose logs"
    docker compose logs >> "$LOG_FILE" 2>&1 || true
    # Don't exit yet, try next method
  else
    log_error "Docker Compose failed to start"
  fi
fi

# Strategy 2: Try Python venv
if [ -f "$BACKEND_DIR/venv/bin/activate" ]; then
  log_attempt "Method 2: Starting backend via Python virtual environment..."
  cd "$BACKEND_DIR"
  source venv/bin/activate
  
  # Start uvicorn in background
  uvicorn main:app --host "$API_HOST" --port "$API_PORT" --log-level info > /tmp/backend-e2e.log 2>&1 &
  BACKEND_PID=$!
  echo $BACKEND_PID > /tmp/backend-e2e.pid
  log_success "Backend started with PID: $BACKEND_PID"
  
  # Wait for API to be ready
  log_attempt "Waiting for API to be ready (max 30 attempts)..."
  for i in {1..30}; do
    if curl -s "$API_BASE_URL/health" > /dev/null 2>&1; then
      log_success "Backend API is ready at $API_BASE_URL (PID: $BACKEND_PID, attempt $i/30)"
      log "Log file: /tmp/backend-e2e.log"
      exit 0
    fi
    echo -n "." | tee -a "$LOG_FILE"
    sleep 2
  done
  
  log ""
  log_error "Backend API did not start in time via Python venv"
  log "Backend logs:"
  cat /tmp/backend-e2e.log | tee -a "$LOG_FILE"
  kill $BACKEND_PID 2>/dev/null || true
  # Don't exit yet, try next method
fi

# Strategy 3: Try to create Python venv and install dependencies
if [ -f "$BACKEND_DIR/requirements.txt" ] && command -v python3 &> /dev/null; then
  log_attempt "Method 3: Creating Python venv and installing dependencies..."
  cd "$BACKEND_DIR"
  
  if python3 -m venv venv >> "$LOG_FILE" 2>&1; then
    log_success "Python venv created"
    source venv/bin/activate
    
    log_attempt "Installing backend dependencies..."
    if pip install -r requirements.txt >> "$LOG_FILE" 2>&1; then
      log_success "Dependencies installed"
      
      # Start uvicorn in background
      log_attempt "Starting backend with uvicorn..."
      uvicorn main:app --host "$API_HOST" --port "$API_PORT" --log-level info > /tmp/backend-e2e.log 2>&1 &
      BACKEND_PID=$!
      echo $BACKEND_PID > /tmp/backend-e2e.pid
      log_success "Backend started with PID: $BACKEND_PID"
      
      # Wait for API to be ready
      log_attempt "Waiting for API to be ready (max 30 attempts)..."
      for i in {1..30}; do
        if curl -s "$API_BASE_URL/health" > /dev/null 2>&1; then
          log_success "Backend API is ready at $API_BASE_URL (PID: $BACKEND_PID, attempt $i/30)"
          log "Log file: /tmp/backend-e2e.log"
          exit 0
        fi
        echo -n "." | tee -a "$LOG_FILE"
        sleep 2
      done
      
      log ""
      log_error "Backend API did not start in time after fresh install"
      log "Backend logs:"
      cat /tmp/backend-e2e.log | tee -a "$LOG_FILE"
      kill $BACKEND_PID 2>/dev/null || true
    else
      log_error "Failed to install dependencies"
    fi
  else
    log_error "Failed to create Python venv"
  fi
fi

# All strategies failed
log ""
log_error "All backend startup strategies failed"
log ""
log "ATTEMPTED METHODS:"
log "  1. Docker Compose - FAILED or unavailable"
log "  2. Existing Python venv - FAILED or unavailable"
log "  3. Create new Python venv - FAILED or unavailable"
log ""
log "RESOLUTION REQUIRED:"
log "  1. Start backend manually: cd $BACKEND_DIR && docker compose up -d"
log "  2. Or create Python venv: cd $BACKEND_DIR && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt && uvicorn main:app --reload"
log "  3. Or verify backend has docker-compose.yml or requirements.txt"
log ""
log "See detailed log: $LOG_FILE"
exit 1
