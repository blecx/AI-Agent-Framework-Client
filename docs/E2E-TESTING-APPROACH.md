# E2E Testing Approach

## Overview

This document explains why E2E tests are not run in CI for the client repository and how E2E testing is handled across the AI-Agent-Framework project.

## Design Decision: Client Tests Client, Backend Tests E2E

### Why E2E Tests Are Not in Client CI

The AI-Agent-Framework-Client repository does NOT run E2E tests in CI. This is a deliberate design decision based on best practices:

1. **Avoids Cross-Repository Dependencies**
   - Client CI doesn't depend on backend repository availability
   - Client PRs can pass without backend access
   - Reduces CI complexity and failure points
   - Faster feedback loop for client-only changes

2. **Clearer Separation of Concerns**
   - Client repository tests client functionality
   - Backend repository tests end-to-end workflows
   - Each repository owns its test domain

3. **Better Testing Strategy**
   - Backend's CLI client provides comprehensive E2E coverage
   - Backend E2E tests validate the full stack (API + CLI + business logic)
   - Client E2E tests would duplicate backend's E2E coverage

4. **Pragmatic Engineering**
   - E2E tests are expensive (slow, flaky, maintenance-heavy)
   - Running them twice (backend CI + client CI) wastes resources
   - Single source of truth for E2E testing (backend repo)

## Where E2E Testing Happens

### Backend Repository (Primary E2E Testing)

The `blecx/AI-Agent-Framework` repository includes:
- **CLI client** for interacting with the API
- **E2E test harness** (`backend_e2e_runner.py`)
- **Comprehensive E2E test suite** testing:
  - API endpoints
  - CLI commands
  - Business logic workflows
  - Data persistence
  - Error handling

These tests validate the complete system and run in the backend's CI.

### Client Repository (Local E2E Testing Only)

The `blecx/AI-Agent-Framework-Client` repository includes:
- **Playwright E2E test infrastructure** for local development
- **GUI-based workflow tests** for:
  - Project creation UI
  - Proposal workflow UI
  - Apply/reject UI
  - Navigation and artifacts
  - Error handling UI

**These tests are available for local use only** and are NOT run in CI.

## Local E2E Testing (Client Repository)

### When to Use Local E2E Tests

Use the client's Playwright E2E tests when:
- **Debugging UI issues** that require backend interaction
- **Testing new UI features** before integrating with backend
- **Validating client-backend contract** during development
- **Reproducing bugs** that involve full stack interaction

### How to Run Local E2E Tests

```bash
cd client
./run-e2e-tests.sh  # Convenience script
```

This automatically:
1. Checks if backend is running
2. Starts backend if needed (Docker or Python venv)
3. Waits for health check
4. Runs Playwright tests
5. Reports results

### Requirements

- Backend repository cloned locally (or backend running elsewhere)
- Node.js 20+ and npm 10+
- Python 3.11+ (if starting backend locally)

See [client/e2e/README.md](../client/e2e/README.md) for detailed setup instructions.

## E2E Tests in CI with Smart Dependency Resolution

E2E tests can run in CI with **automatic dependency resolution**. The system intelligently attempts to resolve all backend dependencies and only skips tests when resolution is truly impossible.

### When E2E Tests Run in CI

E2E tests run automatically when:
- Pushing to `main` branch
- Pull requests with the `run-e2e` label

### Smart Dependency Resolution

The CI implements a **two-run strategy** with comprehensive logging:

**First Run: Attempt Full Resolution**
1. Check if backend repository is available
2. If not found, attempt to clone from GitHub
3. Try multiple startup methods:
   - Docker Compose (if available)
   - Existing Python venv (if available)
   - Create new Python venv and install dependencies
4. Wait for backend health check
5. Log all attempts and results

**Second Run: Fallback with Clear Reasoning**
- Only skip tests if **ALL** resolution methods fail
- Display detailed explanation of what was tried
- Provide actionable steps to fix the issue
- Upload all logs as artifacts for debugging

### Auto-Enable Behavior

⚠️ **This feature is AUTO-ENABLED** when:
- The `run-e2e` label is added to a PR
- Pushing to the `main` branch

No additional configuration is needed - the system automatically:
- Clones the backend repository if needed
- Installs all dependencies
- Starts the backend
- Runs E2E tests
- Uploads artifacts on failure

### Example: Successful Resolution

```
=== Smart Backend Dependency Resolution ===
✗ Backend not found at expected location
→ Attempting to clone backend repository...
✓ Backend repository cloned successfully
→ Creating Python venv and installing dependencies...
✓ Python venv created
✓ Dependencies installed
✓ Backend started with PID: 1234
✓ Backend API is ready at http://localhost:8000
Running E2E tests...
```

### Example: Failed Resolution with Clear Messaging

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
═══════════════════════════════════════════════════════════
```

### How to Enable for Your PR

1. **Add the `run-e2e` label** to your pull request
2. CI automatically attempts dependency resolution
3. E2E tests run if backend is available
4. Clear skip message if dependencies cannot be resolved

### When to Use

Enable E2E tests in CI when:
- Testing breaking changes to client-backend contract
- Validating new features that require backend
- Pre-release testing
- Investigating CI-specific issues
- Debugging client-backend integration problems

### Diagnostics and Artifacts

The CI uploads these artifacts for debugging:

1. **backend-setup-log** - Complete log of all resolution attempts
2. **playwright-report** - HTML test report (when tests run)
3. **test-screenshots** - Screenshots from failed tests (when tests fail)
4. **backend-logs** - Backend runtime logs (when backend starts)

### Configuration

The E2E CI workflow is already implemented in `.github/workflows/ci.yml`:

```yaml
client-e2e:
  if: github.ref == 'refs/heads/main' || contains(github.event.pull_request.labels.*.name, 'run-e2e')
  runs-on: ubuntu-latest
  needs: client-ci
  
  steps:
    - name: Attempt backend dependency resolution
      # Smart resolution with multiple fallback methods
    
    - name: Run E2E tests
      if: backend_available
    
    - name: Skip with clear reasoning
      if: not backend_available
    
    - name: Upload all artifacts
      # Logs, reports, screenshots, backend logs
```

### Comparison: Before vs After

**Before (No CI Support):**
- ❌ E2E tests never run in CI
- ❌ No visibility into backend integration issues
- ❌ Manual testing required for every change

**After (Smart Resolution):**
- ✅ E2E tests run automatically when enabled
- ✅ Dependencies resolved automatically when possible
- ✅ Clear skip messages when resolution fails
- ✅ Complete diagnostic artifacts
- ✅ Detailed logs of all resolution attempts

For complete details on the dependency resolution system, see:
- **[E2E CI Dependency Resolution](E2E-CI-DEPENDENCY-RESOLUTION.md)** - Resolution strategy details
- **[E2E CI Setup Guide](E2E-CI-SETUP.md)** - Configuration and troubleshooting

## Benefits of This Approach

### For Client Development

✅ **Fast CI** - No waiting for backend startup  
✅ **Reliable CI** - No cross-repo dependency failures  
✅ **Clear feedback** - Client failures are client issues  
✅ **Local debugging** - Full E2E infrastructure available  

### For Backend Development

✅ **Single E2E source** - One place to maintain E2E tests  
✅ **Complete coverage** - CLI + API + business logic tested together  
✅ **Faster iteration** - Backend devs control E2E test evolution  

### For The Project

✅ **Resource efficiency** - E2E tests run once (backend CI)  
✅ **Clearer ownership** - Each repo owns its test domain  
✅ **Better architecture** - Encourages proper separation of concerns  
✅ **Flexibility** - Can enable client E2E when needed (opt-in)  

## Related Documentation

- **[E2E Testing Guide](../client/e2e/README.md)** - How to run E2E tests locally
- **[E2E Backend Requirements](E2E-BACKEND-REQUIREMENTS.md)** - Backend setup for E2E
- **[CI Setup Notes](../client/e2e/CI-SETUP.md)** - CI configuration details
- **Backend E2E Documentation** - See `blecx/AI-Agent-Framework` repo

## Questions?

### "Why not run E2E tests in both repos?"

Running E2E tests in both places:
- Doubles CI time and resource usage
- Creates two sources of truth for E2E status
- Complicates debugging (which repo's tests failed?)
- Doesn't provide additional value (same system being tested)

### "What if I need to test a client-only change?"

Client-only changes should be covered by:
- **Unit tests** - Component and logic tests (fast, reliable)
- **Integration tests** - API mocking tests (no backend needed)
- **Local E2E tests** - Run manually when needed

If a change truly requires E2E validation in CI, add the `run-e2e` label.

### "How do I know if I broke the backend contract?"

1. **Backend E2E tests** will catch API contract violations
2. **Local E2E tests** can verify before submitting
3. **Type definitions** help catch contract mismatches at build time
4. **API documentation** (OpenAPI/Swagger) provides contract reference

### "What about testing the web UI specifically?"

The Playwright tests DO test the web UI - they're just not run in CI automatically. Run them locally during development:

```bash
cd client
./run-e2e-tests.sh
```

This gives you full GUI testing without slowing down CI.

## Summary

**E2E testing strategy:**
- ✅ Backend repository: Runs E2E tests in CI (CLI client + API)
- ✅ Client repository: Provides E2E tests for local development (Playwright)
- ✅ Client CI: Runs unit/integration tests only (fast, reliable)
- ✅ Optional: Client E2E can be enabled with `run-e2e` label

This approach provides comprehensive E2E coverage while keeping CI fast and reliable.
