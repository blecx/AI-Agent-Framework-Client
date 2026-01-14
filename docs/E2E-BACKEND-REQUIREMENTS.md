# E2E Testing Backend Requirements

## Overview

The client E2E tests require a running backend API to test against. This document explains the backend requirements and how the CI system automatically detects and starts the backend.

## Philosophy

**E2E tests run by default in CI.** The system attempts to resolve all dependencies automatically. Tests only skip if resolution is truly impossible, with detailed logging explaining why.

## Backend Startup Methods (Priority Order)

The CI automatically detects and uses the best available method:

### 1. E2E Test Harness (Recommended) ✅

**File**: `backend_e2e_runner.py`

**Why**: Purpose-built for E2E testing with isolated state, test data fixtures, and predictable behavior.

**Requirements**:
- Located at repository root
- Starts backend API on port 8000
- Exposes `/health` endpoint
- Manages test data isolation
- Clean startup/shutdown

**Example** (from blecx/AI-Agent-Framework#28):
```python
# backend_e2e_runner.py
import uvicorn
from pathlib import Path

def run_e2e_backend():
    # Configure for E2E testing
    test_docs_path = Path("/tmp/test-docs")
    test_docs_path.mkdir(exist_ok=True)
    
    # Start API
    uvicorn.run(
        "apps.main:app",
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )

if __name__ == "__main__":
    run_e2e_backend()
```

### 2. Docker Compose 🐳

**File**: `docker-compose.yml`

**Why**: Containerized setup with all dependencies.

**Requirements**:
- Located at repository root
- Service exposes port 8000
- Service has health check
- `docker-compose up -d` starts all services
- `docker-compose down` cleans up

**Example**:
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - PROJECT_DOCS_PATH=/app/test-docs
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 10s
      timeout: 5s
      retries: 5
```

### 3. Direct FastAPI/Uvicorn 🚀

**File**: `main.py` or `apps/main.py`

**Why**: Simple Python application with standard structure.

**Requirements**:
- FastAPI application at `main:app` or `apps.main:app`
- `requirements.txt` with dependencies
- Application listens on `0.0.0.0:8000`
- Exposes `/health` endpoint

**Example**:
```python
# main.py or apps/main.py
from fastapi import FastAPI

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "healthy"}
```

**CI starts with**:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
# or
uvicorn apps.main:app --host 0.0.0.0 --port 8000
```

## Health Check Endpoint

**All methods must expose**: `GET /health`

**Expected response**:
```json
{
  "status": "healthy"
}
```

**HTTP Status**: 200 OK

The CI polls this endpoint up to 60 times (2 minutes) before failing.

## CI Workflow Behavior

### Automatic Detection

```yaml
- name: Analyze backend structure
  # Checks in priority order:
  # 1. backend_e2e_runner.py
  # 2. docker-compose.yml
  # 3. main.py or apps/main.py
  # Fails with detailed error if none found
```

### Dependency Resolution

The setup script **attempts to fix** common issues when running locally:

1. **Missing config files**: Creates `config/llm.json` if needed
2. **Test data directory**: Creates `/tmp/test-docs`
3. **Dependencies**: Installs from `requirements.txt`
4. **Process verification**: Checks backend stays running

### Failure Handling (Local Development)

**If backend cannot start** when running locally:

1. **Logs detailed error**:
   ```
   ✗ ERROR: Cannot determine backend startup method
   
   RESOLUTION REQUIRED:
   The backend repository must provide one of:
     1. backend_e2e_runner.py (recommended for E2E tests)
     2. docker-compose.yml (for Docker-based setup)
     3. main.py or apps/main.py (for direct FastAPI startup)
   
   See docs/E2E-BACKEND-REQUIREMENTS.md for details
   ```

2. **Shows diagnostic information**:
   - Backend logs (if available)
   - Process status
   - Directory listing

This ensures issues are **visible and actionable**, not hidden.

## Local Development

### Using the E2E Runner Script

```bash
cd client
./run-e2e-tests.sh
```

The script automatically:
- Detects backend location
- Uses same priority order as CI
- Starts backend if not running
- Runs E2E tests
- Cleans up after completion

### Manual Backend Start

**Option 1: E2E Harness**
```bash
cd ../AI-Agent-Framework
python backend_e2e_runner.py
```

**Option 2: Docker Compose**
```bash
cd ../AI-Agent-Framework
docker-compose up -d
```

**Option 3: Direct Uvicorn**
```bash
cd ../AI-Agent-Framework
uvicorn apps.main:app --reload --host 0.0.0.0 --port 8000
```

Then run tests:
```bash
cd client
npm run test:e2e
```

## Troubleshooting

### Error: "Cannot determine backend startup method"

**Cause**: Backend repository lacks required files.

**Solution**:
1. Add `backend_e2e_runner.py` (recommended)
2. OR ensure `docker-compose.yml` exists
3. OR ensure `main.py` or `apps/main.py` exists

### Error: "Backend process died immediately"

**Cause**: Application crashes on startup.

**Solution**:
1. Check backend logs in CI artifacts
2. Verify `requirements.txt` has all dependencies
3. Ensure required config files exist
4. Test backend locally first

### Error: "Backend failed to become healthy"

**Cause**: Backend starts but `/health` endpoint not accessible.

**Solution**:
1. Verify `/health` endpoint exists
2. Check backend logs for startup errors
3. Ensure backend binds to `0.0.0.0:8000` (not `127.0.0.1`)
4. Verify no port conflicts

### Error: "Backend checkout failed"

**Cause**: Backend repository not accessible.

**Solution**:
1. Verify repository exists: `blecx/AI-Agent-Framework`
2. Check repository is public OR
3. Add `BACKEND_ACCESS_TOKEN` secret for private repos

## Advanced Configuration

### Custom Backend Location

Set `BACKEND_REPO` environment variable:

```yaml
env:
  BACKEND_REPO: organization/custom-backend-repo
```

### Custom Health Check Endpoint

Set `BACKEND_HEALTH_ENDPOINT`:

```yaml
env:
  BACKEND_HEALTH_ENDPOINT: /api/health
```

### Extended Timeout

Set `BACKEND_STARTUP_TIMEOUT`:

```yaml
env:
  BACKEND_STARTUP_TIMEOUT: 120  # seconds
```

## Best Practices

### ✅ DO

- **Use `backend_e2e_runner.py`** for dedicated E2E setup
- **Expose `/health` endpoint** that returns quickly
- **Isolate test data** from production/development data
- **Log startup progress** for debugging
- **Test locally first** before pushing to CI

### ❌ DON'T

- **Don't skip E2E tests** without fixing the root cause
- **Don't use production credentials** in E2E tests
- **Don't rely on arbitrary sleeps** - use health checks
- **Don't start long-running migrations** in E2E setup
- **Don't bind to `127.0.0.1`** - use `0.0.0.0` for CI

## Migration Guide

### From "Optional E2E" to "Always-On E2E"

**Old approach** (commit 79e491b):
- E2E tests optional with label
- Silently skipped if backend unavailable
- Used `continue-on-error: true`

**New approach** (current):
- E2E tests always run
- Fails with clear error if backend unavailable
- Attempts to resolve dependencies first
- Logs detailed diagnostics

**Migration steps**:
1. Ensure backend has one of the required files
2. Test locally: `cd client && ./run-e2e-tests.sh`
3. Verify CI passes: push to PR
4. Remove any `run-e2e` labels (no longer needed)

## Support

### Getting Help

If E2E tests fail in CI:

1. **Check CI logs** for "RESOLUTION REQUIRED" messages
2. **Download artifacts**: `backend-logs`, `playwright-report`
3. **Run locally**: `cd client && ./run-e2e-tests.sh`
4. **Verify backend** has required files per this document

### Contributing

To improve E2E setup:

1. **Backend improvements**: Add/update `backend_e2e_runner.py`
2. **Client improvements**: Update `client/e2e/setup-backend.sh`
3. **Documentation**: Update this file
4. **CI improvements**: Update `.github/workflows/ci.yml`

## References

- [Backend E2E Testing](https://github.com/blecx/AI-Agent-Framework/blob/main/E2E_TESTING.md)
- [Client E2E Setup](../client/e2e/README.md)
- [CI Configuration](../.github/workflows/ci.yml)
- [Playwright Documentation](https://playwright.dev)
