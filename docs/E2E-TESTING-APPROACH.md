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

## Future: Optional E2E in CI

For special cases (e.g., testing experimental integrations or releases), E2E tests can be enabled in CI by adding the `run-e2e` label to a PR.

### How to Enable (Future Implementation)

1. **Add the `run-e2e` label** to your PR
2. CI will:
   - Checkout backend repository
   - Start backend (using E2E harness if available)
   - Run Playwright tests
   - Upload artifacts on failure

3. **When to use**:
   - Testing breaking changes to client-backend contract
   - Pre-release validation
   - Investigating CI-specific issues

### Implementation

To implement this, update `.github/workflows/ci.yml` to add:

```yaml
client-e2e:
  if: contains(github.event.pull_request.labels.*.name, 'run-e2e')
  runs-on: ubuntu-latest
  needs: client-ci
  
  steps:
    # Checkout repos
    - uses: actions/checkout@v4
    - uses: actions/checkout@v4
      with:
        repository: blecx/AI-Agent-Framework
        path: backend
    
    # Setup and start backend
    # ... (see docs/E2E-BACKEND-REQUIREMENTS.md)
    
    # Run E2E tests
    - working-directory: client
      run: npx playwright test
```

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
