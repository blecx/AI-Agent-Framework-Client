# CI/CD Setup for E2E Tests

## Overview

**E2E tests are NOT run in CI by default.** Backend E2E testing should be done using the CLI client included in the backend repository (`blecx/AI-Agent-Framework`).

## Design Philosophy

**"Client tests client, backend tests E2E"** - The client repository focuses on client-side unit and integration tests. Full end-to-end tests that require the backend are handled by the backend repository's CLI client, avoiding cross-repository dependencies.

## Why E2E Tests Are Not in Client CI

1. **Avoids cross-repository dependencies** - Client PRs don't depend on backend availability
2. **Clearer separation of concerns** - Backend tests backend, client tests client
3. **Faster CI** - No waiting for backend startup or health checks
4. **Better testing approach** - Backend's CLI client provides comprehensive E2E coverage

## Local E2E Testing

The E2E test infrastructure is **fully available for local development**:

```bash
cd client
./run-e2e-tests.sh  # Automatically starts backend if needed
```

This is useful for:
- Debugging client-backend integration issues locally
- Testing UI workflows during development
- Validating changes before submitting to backend E2E tests

## Future: Enabling E2E in CI

For special cases (e.g., testing experimental integrations), E2E tests can be enabled by adding the `run-e2e` label to a PR.

**To enable E2E tests in CI:**
1. Add the `run-e2e` label to your PR
2. Ensure backend repository is accessible
3. CI will run the full E2E suite

**Implementation note**: To fully implement this, add a conditional job to `.github/workflows/ci.yml`:

```yaml
client-e2e:
  if: contains(github.event.pull_request.labels.*.name, 'run-e2e')
  runs-on: ubuntu-latest
  # ... steps to checkout backend, start it, run tests
```

## Backend Requirements

See **[E2E Backend Requirements](../../docs/E2E-BACKEND-REQUIREMENTS.md)** for complete details.

**Quick summary** - Backend must have ONE of:
1. `backend_e2e_runner.py` (recommended E2E harness)
2. `docker-compose.yml` (containerized setup)
3. `main.py` or `apps/main.py` with FastAPI

Plus:
- `requirements.txt` with dependencies
- `/health` endpoint returning 200 OK
- Listens on `0.0.0.0:8000`
    - Setup Python 3.11 (for backend)
    - Setup Node.js 20 (for client)
    
    # 3. Analyze and start backend
    - Analyze backend structure
    - Install backend dependencies
    - Start backend with detected method
    - Wait for health check (60 attempts)
    
    # 4. Run E2E tests
    - Install client dependencies
    - Install Playwright browsers
    - Run Playwright tests
    
    # 5. Upload artifacts on failure
    - Upload test reports
    - Upload screenshots
    - Upload backend logs
    
    # 6. Clean up
    - Stop backend gracefully
```

## When Tests Run

**Always** - E2E tests run on:
- Every pull request
- Every push to any branch
- Every merge to main

**No opt-in required** - Unlike the previous approach, you don't need to add labels.

## Failure Scenarios

### Scenario 1: Backend Repository Unavailable

**Error**:
```
Error: Repository not found: blecx/AI-Agent-Framework
```

**Resolution**:
1. Verify repository exists and is accessible
2. For private repos, add `BACKEND_ACCESS_TOKEN` secret
3. Update repository path in workflow if different

**Status**: **BLOCKS CI** ❌

### Scenario 2: No Valid Startup Method

**Error**:
```
✗ ERROR: Cannot determine backend startup method

RESOLUTION REQUIRED:
The backend repository must provide one of:
  1. backend_e2e_runner.py (recommended for E2E tests)
  2. docker-compose.yml (for Docker-based setup)
  3. main.py or apps/main.py (for direct FastAPI startup)
  
See docs/E2E-BACKEND-REQUIREMENTS.md for details
```

**Resolution**:
1. Add one of the required files to backend repository
2. See [E2E Backend Requirements](E2E-BACKEND-REQUIREMENTS.md)

**Status**: **BLOCKS CI** ❌

### Scenario 3: Backend Fails Health Check

**Error**:
```
✗ Backend failed to become healthy after 60 attempts

Backend logs:
[error logs here]
```

**Resolution**:
1. Check backend logs in CI artifacts
2. Verify `/health` endpoint exists
3. Ensure backend binds to `0.0.0.0:8000`
4. Test locally first

**Status**: **BLOCKS CI** ❌

### Scenario 4: E2E Tests Fail

**Error**:
```
Tests failed: 3 failed, 11 passed
```

**Resolution**:
1. Download `playwright-report` artifact
2. Review screenshots in `test-screenshots`
3. Fix failing tests
4. Re-run CI

**Status**: **BLOCKS CI** ❌

## Artifacts on Failure

The CI uploads diagnostic artifacts when tests fail:

### 1. Playwright Report
**Path**: `playwright-report/`  
**Contains**: HTML test report with full details  
**View**: Download and open `index.html` in browser

### 2. Test Screenshots
**Path**: `test-screenshots/`  
**Contains**: Screenshots from failed tests  
**View**: Download and browse image files

### 3. Backend Logs
**Path**: `backend.log`  
**Contains**: Full backend startup and runtime logs  
**View**: Download and read text file

**Access**: GitHub Actions → Workflow Run → Artifacts section (bottom of page)

## Local Testing

Run E2E tests locally before pushing:

```bash
cd client
./run-e2e-tests.sh
```

The script:
1. Detects backend automatically
2. Starts backend if not running
3. Runs E2E tests
4. Cleans up after completion

**Same behavior as CI** - Uses same detection logic.

## Comparison: Old vs New Approach

### Old Approach (Commit 79e491b)

```yaml
client-e2e:
  # Only run on main or with 'run-e2e' label
  if: github.ref == 'refs/heads/main' || contains(labels, 'run-e2e')
  
  steps:
    - name: Checkout backend
      continue-on-error: true  # Don't fail
    
    - name: Run tests
      continue-on-error: true  # Don't fail
```

**Problems**:
- ❌ Tests silently skipped if backend unavailable
- ❌ Requires manual label to enable
- ❌ Hides dependency issues
- ❌ No clear error messages

### New Approach (Current)

```yaml
client-e2e:
  # Always run
  
  steps:
    - name: Checkout backend
      # REQUIRED - fails if unavailable
    
    - name: Analyze backend structure
      # Detects startup method or FAILS with clear error
    
    - name: Run tests
      # Fails if tests fail (no continue-on-error)
```

**Benefits**:
- ✅ Tests always run
- ✅ Clear error messages when dependencies missing
- ✅ Attempts to resolve issues first
- ✅ Fails visibly with diagnostics

## Advanced Configuration

### Custom Backend Repository

```yaml
env:
  BACKEND_REPO: organization/custom-backend
```

### Extended Timeout

```yaml
env:
  BACKEND_STARTUP_TIMEOUT: 120  # seconds
```

### Custom Health Endpoint

```yaml
env:
  BACKEND_HEALTH_ENDPOINT: /api/health
```

## Troubleshooting

### CI fails with "Repository not found"

**Solution**: Verify backend repository path and access.

### CI fails with "Cannot determine backend startup method"

**Solution**: Add required file to backend (see [Requirements](E2E-BACKEND-REQUIREMENTS.md)).

### CI fails with "Backend failed to become healthy"

**Solution**: Check backend logs artifact, test locally, verify health endpoint.

### CI passes locally but fails in CI

**Solution**: Check for environment differences, verify all dependencies in `requirements.txt`.

## Getting Help

1. **Check logs**: Look for "RESOLUTION REQUIRED" messages
2. **Download artifacts**: `backend-logs`, `playwright-report`, `test-screenshots`
3. **Test locally**: `cd client && ./run-e2e-tests.sh`
4. **Read docs**: [E2E Backend Requirements](E2E-BACKEND-REQUIREMENTS.md)
5. **Check workflow**: [.github/workflows/ci.yml](../.github/workflows/ci.yml)

## References

- [E2E Backend Requirements](E2E-BACKEND-REQUIREMENTS.md) - Detailed backend setup guide
- [Client E2E Testing](../client/e2e/README.md) - Client-side test documentation
- [Playwright Documentation](https://playwright.dev) - Playwright test framework docs


## Testing CI Changes

To test CI changes without affecting the main branch:

1. Create a test branch
2. Push changes
3. Open a draft PR to see CI results
4. Iterate until working
5. Convert to ready for review

## Monitoring CI

- **Logs**: Check GitHub Actions → Workflow → Job → Step logs
- **Artifacts**: Download screenshots/videos/reports from failed runs
- **Health checks**: Backend health check must pass before tests run
- **Timeouts**: Backend has 60s to start, tests have 60s each

## Common CI Issues

### Backend fails health check
- Check backend Docker image exists and is accessible
- Verify health endpoint works in backend
- Check environment variables are set correctly

### Tests timeout
- Increase timeout values in `playwright.config.ts`
- Check if backend is slow to start in CI
- Verify network connectivity between containers

### Tests fail in CI but pass locally
- Check environment variables
- Verify timing differences (CI is slower)
- Check for hard-coded localhost URLs
- Ensure tests are truly independent
