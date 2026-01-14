# E2E CI Dependency Resolution

## Overview

This document explains the **smart dependency resolution** system for E2E tests in CI. The system automatically resolves backend dependencies when possible and only skips tests when resolution is truly impossible, with clear logging of all attempts and failures.

## Auto-Enable Behavior

**⚠️ IMPORTANT: This feature is AUTO-ENABLED**

E2E tests with dependency resolution run automatically when:
- Pushing to the `main` branch
- Pull requests with the `run-e2e` label

You don't need to configure anything - the system automatically attempts to resolve all dependencies.

## Two-Run Strategy

The CI implements an intelligent two-run strategy:

### First Run: Attempt Full Resolution

The CI attempts to resolve all dependencies automatically:

1. **Check for backend availability**
   - Look for backend repository at expected location
   - If not found, attempt to clone from GitHub

2. **Attempt backend startup**
   - Try Method 1: Docker Compose (if available)
   - Try Method 2: Existing Python venv (if available)
   - Try Method 3: Create new Python venv and install dependencies

3. **Verify backend health**
   - Check `/health` endpoint
   - Wait up to 60 seconds for backend to be ready
   - Log all health check attempts

4. **Log all attempts**
   - Each resolution attempt is logged in detail
   - Success and failure reasons are captured
   - Logs are saved to `backend-setup.log`

### Second Run: Fallback with Clear Reasoning

Only if **ALL** resolution attempts fail:

1. **Skip E2E tests** - Tests are not run
2. **Log clear reasoning** - Detailed explanation of why tests are skipped
3. **Provide actionable steps** - Clear instructions on how to fix
4. **Upload diagnostics** - All logs are uploaded as CI artifacts

## Dependency Resolution Methods

The system attempts these methods in order:

### Method 1: Clone Backend Repository

**What it does:**
- Clones `https://github.com/blecx/AI-Agent-Framework.git`
- Proceeds to Method 3 to set up and start

**Success criteria:**
- Repository is accessible
- Clone operation completes successfully

**Logs on success:**
```
✓ Backend repository cloned successfully
```

**Logs on failure:**
```
✗ Failed to clone backend repository

RESOLUTION REQUIRED:
  1. Verify repository exists and is accessible
  2. Check network connectivity
  3. For private repos, configure access token
```

### Method 2: Docker Compose

**What it does:**
- Checks if Docker is installed
- Looks for `docker-compose.yml` in backend directory
- Runs `docker compose up -d`
- Waits for health check

**Success criteria:**
- Docker command is available
- `docker-compose.yml` exists
- Backend starts and passes health check within 60 seconds

**Logs on success:**
```
✓ Docker Compose started successfully
✓ Backend API is ready at http://localhost:8000 (attempt 5/30)
```

**Logs on failure:**
```
✗ Docker Compose failed to start
Check logs: cd $BACKEND_DIR && docker compose logs
```

### Method 3: Python Virtual Environment

**What it does:**
- Creates Python virtual environment
- Installs dependencies from `requirements.txt`
- Starts backend using `uvicorn main:app`
- Waits for health check

**Success criteria:**
- Python 3.11+ is available
- `requirements.txt` exists
- All dependencies install successfully
- Backend starts and passes health check within 60 seconds

**Logs on success:**
```
✓ Python venv created
✓ Dependencies installed
✓ Backend started with PID: 12345
✓ Backend API is ready at http://localhost:8000 (attempt 8/30)
```

**Logs on failure:**
```
✗ Failed to install dependencies

Backend logs:
[error details from /tmp/backend-e2e.log]

RESOLUTION REQUIRED:
  1. Check requirements.txt is valid
  2. Verify all dependencies are available
  3. Check Python version compatibility
```

## Logging and Observability

### Successful Resolution Example

```
=== E2E Backend Setup ===
Backend directory: /home/runner/work/AI-Agent-Framework
API URL: http://localhost:8000
Log file: /tmp/backend-setup.log

✗ Backend not found at: /home/runner/work/AI-Agent-Framework

→ Attempting to clone backend repository...
✓ Backend repository cloned successfully
✓ Backend directory found

→ Checking if backend is already running...
Backend not running, attempting to start...

→ Method 3: Creating Python venv and installing dependencies...
✓ Python venv created
→ Installing backend dependencies...
✓ Dependencies installed
→ Starting backend with uvicorn...
✓ Backend started with PID: 1234
→ Waiting for API to be ready (max 30 attempts)...
.....
✓ Backend API is ready at http://localhost:8000 (PID: 1234, attempt 5/30)
Log file: /tmp/backend-e2e.log
```

### Failed Resolution Example

```
=== E2E Backend Setup ===
Backend directory: /home/runner/work/AI-Agent-Framework
API URL: http://localhost:8000
Log file: /tmp/backend-setup.log

✗ Backend not found at: /home/runner/work/AI-Agent-Framework

→ Attempting to clone backend repository...
✗ Failed to clone backend repository

RESOLUTION REQUIRED:
  1. Clone manually: git clone https://github.com/blecx/AI-Agent-Framework.git
  2. Or set BACKEND_DIR to existing backend location
  3. Or start backend manually on port 8000

See log file: /tmp/backend-setup.log
```

### Skip Scenario Example

When all methods fail, CI displays:

```
═══════════════════════════════════════════════════════════
E2E TESTS SKIPPED - DEPENDENCY RESOLUTION FAILED
═══════════════════════════════════════════════════════════

The E2E tests were skipped because backend dependencies
could not be resolved automatically.

ATTEMPTED RESOLUTION METHODS:
  1. Clone backend repository from GitHub - FAILED
  2. Start backend via Docker Compose - UNAVAILABLE
  3. Create Python venv and install dependencies - FAILED

All methods failed. See backend-setup.log artifact for details.

TO FIX:
  - Ensure backend repository is accessible
  - Verify backend has requirements.txt or docker-compose.yml
  - Check backend health endpoint works

For more information:
  - docs/E2E-CI-DEPENDENCY-RESOLUTION.md
  - docs/E2E-CI-SETUP.md

E2E tests will run successfully once dependencies are resolved.
═══════════════════════════════════════════════════════════
```

## Diagnostics and Artifacts

The CI uploads these artifacts on **every run** (success or failure):

### 1. backend-setup.log

**Contains:**
- Complete log of all resolution attempts
- Detailed error messages
- Command outputs
- Timestamps

**When to check:**
- Backend setup failed
- Need to debug why a method failed
- Understanding resolution process

### 2. playwright-report

**Contains:**
- HTML test report
- Test results and screenshots
- Failure details

**When to check:**
- E2E tests failed
- Need to see test execution details

**Available when:** Tests ran (backend was available)

### 3. test-screenshots

**Contains:**
- Screenshots from failed tests
- Visual debugging information

**When to check:**
- Tests failed
- Need to see UI state at failure

**Available when:** Tests ran and failed

### 4. backend-logs

**Contains:**
- Backend runtime logs from `/tmp/backend-e2e.log`
- Startup messages
- API request logs
- Error traces

**When to check:**
- Backend started but tests failed
- Investigating backend errors
- Debugging API issues

**Available when:** Backend was started successfully

## Common Scenarios

### Scenario 1: Backend Repository Not Accessible

**Symptom:**
```
✗ Failed to clone backend repository
```

**Cause:**
- Repository doesn't exist
- Network issue
- Private repository without access token

**Fix:**
1. Verify repository URL is correct
2. For private repos, add `BACKEND_ACCESS_TOKEN` secret to CI
3. Check network connectivity

### Scenario 2: Missing requirements.txt

**Symptom:**
```
✗ All backend startup strategies failed
ATTEMPTED METHODS:
  3. Create new Python venv - FAILED or unavailable
```

**Cause:**
- Backend repository doesn't have `requirements.txt`
- No `docker-compose.yml` either

**Fix:**
1. Add `requirements.txt` to backend repository
2. Or add `docker-compose.yml`
3. Ensure dependencies are properly specified

### Scenario 3: Backend Health Check Timeout

**Symptom:**
```
✗ Backend API did not start in time via Python venv
Backend logs:
[error details]
```

**Cause:**
- Backend crashes on startup
- Health endpoint not implemented
- Port already in use
- Missing environment variables

**Fix:**
1. Check backend logs in artifact
2. Verify `/health` endpoint exists
3. Ensure backend binds to `0.0.0.0:8000`
4. Test backend startup locally first

### Scenario 4: Dependency Installation Fails

**Symptom:**
```
✗ Failed to install dependencies
```

**Cause:**
- Dependency not available on PyPI
- Version conflicts
- Missing system dependencies

**Fix:**
1. Review `backend-setup.log` for pip error details
2. Fix dependency specifications in `requirements.txt`
3. Add any required system packages to CI workflow

## Configuration

### Environment Variables

You can customize the resolution process with these variables:

```yaml
env:
  BACKEND_DIR: /custom/path/to/backend
  BACKEND_REPO: https://github.com/org/custom-backend.git
  API_PORT: 8080
  API_HOST: localhost
  LOG_FILE: /tmp/custom-setup.log
```

### Workflow Customization

To enable E2E tests on all PRs (not just with label):

```yaml
client-e2e:
  if: github.event_name == 'pull_request'  # Always run on PRs
```

To run only on specific branches:

```yaml
client-e2e:
  if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'
```

## Best Practices

### For Backend Developers

1. **Provide requirements.txt** - Essential for Python venv method
2. **Implement /health endpoint** - Must return 200 OK when ready
3. **Bind to 0.0.0.0:8000** - Don't bind to localhost only
4. **Document setup** - Clear README for manual setup
5. **Test locally** - Verify E2E tests work before pushing

### For Client Developers

1. **Check artifacts** - Always review logs when tests skip
2. **Test locally** - Run `./client/run-e2e-tests.sh` before pushing
3. **Add run-e2e label** - When testing E2E changes in PR
4. **Read skip messages** - They contain actionable fix steps

### For DevOps/Maintainers

1. **Monitor skip rate** - If E2E tests skip frequently, investigate root cause
2. **Update documentation** - Keep resolution docs current
3. **Add telemetry** - Consider tracking which methods succeed/fail
4. **Optimize timeouts** - Adjust based on actual backend startup time

## Comparison: Before vs After

### Before (PR #21 initial approach)

```yaml
# Silent failure - no visibility
client-e2e:
  steps:
    - name: Checkout backend
      continue-on-error: true  # Silently skip if unavailable
    
    - name: Run tests
      continue-on-error: true  # Hide failures
```

**Problems:**
- ❌ Tests silently skipped
- ❌ No attempt to resolve dependencies
- ❌ No logging of why skipped
- ❌ Hidden dependency issues

### After (Current approach)

```yaml
# Smart resolution with visibility
client-e2e:
  steps:
    - name: Attempt backend dependency resolution
      # Tries multiple methods, logs all attempts
    
    - name: Run E2E tests
      if: backend_available  # Only if resolution succeeded
    
    - name: Skip with clear reasoning
      if: not backend_available  # Explain why skipped
```

**Benefits:**
- ✅ Automatic dependency resolution
- ✅ Multiple fallback strategies
- ✅ Comprehensive logging
- ✅ Clear skip messages with action items
- ✅ Diagnostic artifacts
- ✅ Fixes resolvable issues automatically

## Troubleshooting Guide

### E2E tests always skip

**Check:**
1. Download `backend-setup.log` artifact
2. Review attempted methods
3. Fix the blocking issue (usually repo access or missing requirements.txt)

### Backend starts but tests fail

**Check:**
1. Download `playwright-report` and `test-screenshots`
2. Review test failure details
3. Check `backend-logs` for API errors
4. Verify backend health endpoint works

### CI is slower than local

**Reasons:**
- CI has to clone/install dependencies
- No cached venv
- Network latency

**Solutions:**
- Cache Python dependencies in workflow
- Use Docker image with pre-installed dependencies
- Optimize backend startup time

## Future Improvements

Potential enhancements to the resolution system:

1. **Docker Image Caching** - Build and cache backend Docker image
2. **Dependency Caching** - Cache pip packages between CI runs
3. **Parallel Setup** - Start backend while installing client deps
4. **Smart Timeouts** - Adjust health check timeout based on backend size
5. **Health Check Retries** - Exponential backoff for health checks
6. **Telemetry** - Track success/failure rates of each method

## Related Documentation

- **[E2E CI Setup Guide](E2E-CI-SETUP.md)** - Step-by-step CI configuration
- **[E2E Testing Approach](E2E-TESTING-APPROACH.md)** - Overall E2E strategy
- **[E2E Backend Requirements](E2E-BACKEND-REQUIREMENTS.md)** - Backend setup requirements
- **[Client E2E README](../client/e2e/README.md)** - Local E2E testing guide

## Support

If you encounter issues not covered in this guide:

1. Check all related documentation above
2. Review CI logs and artifacts
3. Test locally with `./client/run-e2e-tests.sh`
4. Open an issue with logs attached
