# E2E Testing Guide

This guide covers end-to-end (E2E) testing for the AI-Agent-Framework-Client using Playwright.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Configuration](#configuration)
- [Writing Tests](#writing-tests)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

## Overview

The E2E test suite validates the complete client-backend integration through the browser UI. Tests cover:

1. **Project Creation** - Creating projects through the UI
2. **Proposal Workflow** - Proposing and viewing changes
3. **Apply Proposals** - Applying and rejecting proposals
4. **Navigation** - Moving between views and accessing artifacts
5. **Error Handling** - Graceful error handling and edge cases

### Important: E2E Tests Are for Local Development Only

**E2E tests with the backend are NOT run in CI.** Backend E2E testing should be done using the CLI client included in the backend repository (`blecx/AI-Agent-Framework`). This approach:

- Avoids cross-repository dependencies in CI
- Keeps backend testing within the backend repository
- Allows client PRs to pass without backend access
- Provides full E2E test infrastructure for local development and debugging

For future adoption, E2E tests can be enabled in CI by adding the `run-e2e` label to a PR.

### Test Independence

**CRITICAL**: All tests are designed to be **strongly independent**:

- Each test creates unique project keys using timestamps and random strings
- Tests do not rely on shared state or artifacts from other tests
- Tests can run in any order or in parallel
- Each test cleans up its own data after completion

## Prerequisites

### Required Software

- **Node.js 20+** (tested with 20.19.6)
- **npm 10+** (tested with 10.8.2)
- **Backend API** running (AI-Agent-Framework)

### Backend Setup

The E2E tests require the backend API to be running. You have several options:

#### Option 1: Use the Setup Script (Recommended)

```bash
cd client
./e2e/setup-backend.sh
```

This script will:

- Check if backend is already running
- Start backend via Docker Compose if available
- Start backend via Python venv if available
- Provide clear error messages if setup is needed

#### Option 2: Manual Docker Setup

```bash
# Clone backend (if not already cloned)
cd ~/projects
git clone https://github.com/blecx/AI-Agent-Framework.git
cd AI-Agent-Framework

# Start backend
docker compose up -d

# Verify
curl http://localhost:8000/health
```

#### Option 3: Manual Python Setup

```bash
cd ~/projects/AI-Agent-Framework
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Quick Start

```bash
# 1. Navigate to client directory
cd client

# 2. Install dependencies (if not already done)
npm ci

# 3. Install Playwright browsers (first time only)
npx playwright install --with-deps

# 4. Run E2E tests (automated setup)
./run-e2e-tests.sh

# This script will:
# - Check dependencies
# - Install Playwright browsers if needed
# - Start backend API automatically
# - Run all E2E tests
# - Show results and report location

# Optional: Pass Playwright arguments
./run-e2e-tests.sh --headed  # Run in headed mode
./run-e2e-tests.sh --debug   # Run in debug mode
./run-e2e-tests.sh e2e/tests/01-project-creation.spec.ts  # Run specific test
```

### Manual Setup

If you prefer manual control:

```bash
# 1. Navigate to client directory
cd client

# 2. Install dependencies (if not already done)
npm ci

# 3. Install Playwright browsers (first time only)
npx playwright install --with-deps

# 4. Start backend API (if not already running)
./e2e/setup-backend.sh
# OR start manually (see Prerequisites)

# 5. Run E2E tests
npm run test:e2e

# Optional: Run in headed mode (see browser)
npx playwright test --headed

# Optional: Run specific test file
npx playwright test e2e/tests/01-project-creation.spec.ts

# Optional: Debug mode
npx playwright test --debug
```

## Test Structure

```
client/
├── e2e/
│   ├── tests/                           # Test files
│   │   ├── 01-project-creation.spec.ts  # Project creation tests
│   │   ├── 02-proposal-workflow.spec.ts # Proposal creation tests
│   │   ├── 03-apply-proposal.spec.ts    # Apply/reject proposals
│   │   ├── 04-navigation-artifacts.spec.ts # Navigation tests
│   │   └── 05-error-handling.spec.ts    # Error scenarios
│   ├── helpers/                         # Reusable test helpers
│   │   ├── api-helpers.ts              # Direct API calls
│   │   ├── test-data.ts                # Test data generation
│   │   └── ui-helpers.ts               # UI interaction helpers
│   ├── fixtures.ts                      # Playwright fixtures
│   ├── setup-backend.sh                # Backend setup script
│   └── basic.spec.ts                   # Basic smoke test
├── playwright.config.ts                 # Playwright configuration
└── playwright-report/                   # Test reports (generated)
```

## Running Tests

### Run All Tests

```bash
npm run test:e2e
```

### Run Specific Test File

```bash
npx playwright test e2e/tests/01-project-creation.spec.ts
```

### Run Tests in Headed Mode (Visual)

```bash
npx playwright test --headed
```

### Run Tests in Debug Mode

```bash
npx playwright test --debug
```

### Run Tests in UI Mode (Interactive)

```bash
npx playwright test --ui
```

### View Test Report

```bash
npx playwright show-report
```

## Configuration

### Environment Variables

Configure E2E tests using environment variables:

```bash
# Frontend URL (default: http://localhost:3000)
export E2E_BASE_URL=http://localhost:3000

# Backend API URL (default: http://localhost:8000)
export API_BASE_URL=http://localhost:8000

# Run in headless mode (default: true in CI)
export E2E_HEADLESS=true
```

### Using .env File

Create `client/.env.e2e` for local development:

```bash
E2E_BASE_URL=http://localhost:3000
API_BASE_URL=http://localhost:8000
```

Then load it:

```bash
source .env.e2e && npm run test:e2e
```

### Playwright Configuration

See `playwright.config.ts` for detailed configuration:

- **Timeout**: 60s per test
- **Retries**: 2 in CI, 0 locally
- **Workers**: 1 in CI (sequential), parallel locally
- **Artifacts**: Screenshots and videos on failure
- **Trace**: Retained on failure for debugging

## Writing Tests

### Test Template

```typescript
import { test, expect } from '../fixtures';
import { generateProjectData } from '../helpers/test-data';

test.describe('Feature Name', () => {
  test('should do something', async ({ page, apiHelper, uniqueProjectKey }) => {
    // 1. Setup (use uniqueProjectKey for independence)
    const projectData = {
      key: uniqueProjectKey,
      name: `Test ${Date.now()}`,
    };

    // 2. Navigate
    await page.goto('/projects');

    // 3. Interact
    await page.click('button:has-text("Create Project")');
    await page.fill('#projectKey', projectData.key);

    // 4. Wait for response
    const response = await page.waitForResponse(/\/projects/);

    // 5. Assert
    expect(response.status()).toBe(200);
    await expect(page.locator('.project-card')).toBeVisible();

    // 6. Verify via API
    const project = await apiHelper.getProject(projectData.key);
    expect(project.key).toBe(projectData.key);
  });
});
```

### Best Practices

1. **Use Unique Data**: Always use `uniqueProjectKey` fixture or generate unique identifiers
2. **Wait for Network**: Use `page.waitForResponse()` for API calls
3. **Deterministic Waits**: Wait for specific elements/states, avoid `page.waitForTimeout()`
4. **Clean Assertions**: Use Playwright's built-in expect with clear messages
5. **Use Helpers**: Leverage helpers in `e2e/helpers/` for common operations
6. **Test Independence**: Each test should work in isolation

### Available Fixtures

- **`page`**: Playwright Page object
- **`apiHelper`**: Direct API access for setup/verification
- **`uniqueProjectKey`**: Guaranteed unique project key

### Helper Functions

**Test Data** (`test-data.ts`):

- `generateProjectKey()` - Unique project key
- `generateProjectData()` - Complete project data
- `generateProposalData()` - Proposal data

**API Helpers** (`api-helpers.ts`):

- `apiHelper.checkHealth()` - Health check
- `apiHelper.createProject()` - Create project via API
- `apiHelper.getProject()` - Get project
- `apiHelper.cleanupTestProjects()` - Clean up test data

**UI Helpers** (`ui-helpers.ts`):

- `navigateToProjects()` - Navigate to projects page
- `waitForToast()` - Wait for toast notification
- `createProjectViaUI()` - Create project through UI
- `switchToTab()` - Switch project tabs

## CI/CD Integration

### Smart Dependency Resolution in CI

E2E tests in CI now include **intelligent dependency resolution** that automatically:

- Clones the backend repository if needed
- Installs all backend dependencies
- Starts the backend using the best available method
- Only skips tests if dependencies are truly unresolvable

### When E2E Tests Run

E2E tests run automatically when:

- Pushing to the `main` branch, OR
- A PR is labeled with `run-e2e`

### CI Workflow Overview

The workflow implements a **two-run strategy**:

**First Run: Attempt Full Resolution**

1. Checkout client repository
2. Setup Node.js and Python
3. Attempt backend dependency resolution:
   - Try to clone backend repository from GitHub
   - Try to start via Docker Compose (if available)
   - Try to start via Python venv (if available)
   - Try to create new venv and install dependencies
4. Verify backend health check
5. Run E2E tests if backend is available
6. Upload all diagnostic artifacts

**Second Run: Fallback with Clear Messaging**

- If all resolution attempts fail:
  - Display detailed skip message
  - List all attempted methods
  - Provide actionable fix steps
  - Upload resolution logs

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
✓ 14 tests passed
```

### Example: Failed Resolution

```
═══════════════════════════════════════════════════════════
E2E TESTS SKIPPED - DEPENDENCY RESOLUTION FAILED
═══════════════════════════════════════════════════════════

ATTEMPTED RESOLUTION METHODS:
  1. Clone backend repository from GitHub - FAILED
  2. Start backend via Docker Compose - UNAVAILABLE
  3. Create Python venv and install dependencies - FAILED

See backend-setup-log artifact for detailed logs.

TO FIX:
  - Ensure backend repository is accessible
  - Verify backend has requirements.txt
  - Check backend health endpoint works

For more information:
  - docs/E2E-CI-DEPENDENCY-RESOLUTION.md
  - docs/E2E-CI-SETUP.md
═══════════════════════════════════════════════════════════
```

### Running E2E in CI

**For Pull Requests:**

1. Add the `run-e2e` label to your PR
2. CI automatically attempts dependency resolution
3. Tests run if backend is available
4. Clear skip message if dependencies cannot be resolved

**For Main Branch:**
E2E tests run automatically on every push.

### Benefits of Smart Resolution

✅ **Automatic resolution** - Attempts to fix dependency issues  
✅ **Multiple fallback strategies** - Tries Docker, Python venv, and more  
✅ **Clear logging** - Detailed logs of all resolution attempts  
✅ **Diagnostic artifacts** - Logs uploaded for debugging  
✅ **Actionable messages** - Clear instructions when tests skip  
✅ **Non-blocking** - PRs not blocked by unresolvable dependencies

### Monitoring CI

**Artifacts Available:**

Always uploaded:

- `backend-setup-log` - Complete resolution attempt logs

When tests run:

- `playwright-report` - HTML test report with full details
- `backend-logs` - Backend runtime logs

When tests fail:

- `test-screenshots` - Screenshots from failed tests
- Trace files for debugging

**Access**: GitHub Actions → Workflow Run → Artifacts section (bottom of page)

### Documentation

For complete details, see:

- **[E2E CI Dependency Resolution](../../docs/E2E-CI-DEPENDENCY-RESOLUTION.md)** - Resolution strategy and logging
- **[E2E CI Setup Guide](../../docs/E2E-CI-SETUP.md)** - Configuration and troubleshooting
- **[E2E Testing Approach](../../docs/E2E-TESTING-APPROACH.md)** - Overall E2E strategy

## Troubleshooting

### CI Troubleshooting

#### E2E Tests Skipped in CI

**Problem**: CI shows "E2E TESTS SKIPPED - DEPENDENCY RESOLUTION FAILED"

**Solution**:

1. **Download the `backend-setup-log` artifact** from the CI run
   - Go to Actions tab → Select the workflow run
   - Scroll to bottom → Artifacts section
   - Download `backend-setup-log`

2. **Review the log** to see which resolution methods failed:

   ```
   ✗ Failed to clone backend repository
   ✗ Docker Compose failed to start
   ✗ Failed to install dependencies
   ```

3. **Fix the blocking issue**:
   - **Clone failed**: Verify backend repo is accessible (may need `BACKEND_ACCESS_TOKEN` secret for private repos)
   - **Docker failed**: Backend may not have `docker-compose.yml` (this is OK, other methods will try)
   - **Dependencies failed**: Backend may be missing `requirements.txt` or have invalid dependencies

4. **Common fixes**:
   - Ensure backend repository exists at `https://github.com/blecx/AI-Agent-Framework`
   - For private repos: Add `BACKEND_ACCESS_TOKEN` secret in repository settings
   - Verify backend has `requirements.txt` with valid dependencies
   - Check backend has `/health` endpoint that returns 200 OK

5. **See detailed documentation**:
   - [E2E CI Dependency Resolution](../../docs/E2E-CI-DEPENDENCY-RESOLUTION.md)
   - [E2E CI Setup Guide](../../docs/E2E-CI-SETUP.md)

#### E2E Tests Run But Fail in CI

**Problem**: Backend starts successfully but tests fail

**Solution**:

1. **Download artifacts**:
   - `playwright-report` - HTML test report
   - `test-screenshots` - Screenshots from failed tests
   - `backend-logs` - Backend runtime logs

2. **Review test failures** in `playwright-report/index.html`
   - Open in browser to see detailed failure information
   - Check screenshots to see UI state at failure

3. **Check backend logs** for API errors
   - Look for 500 errors or exceptions
   - Verify backend is handling requests correctly

4. **Common issues**:
   - **Timing differences**: CI is slower, increase timeouts in `playwright.config.ts`
   - **Environment variables**: Set required env vars in workflow
   - **Test dependencies**: Ensure `npx playwright install --with-deps chromium` ran
   - **Hard-coded URLs**: Use environment variables instead of localhost

#### Backend Health Check Timeout

**Problem**: Backend starts but health check never passes

**Solution**:

1. **Check backend logs artifact** for startup errors

2. **Common causes**:
   - Backend binds to `127.0.0.1` instead of `0.0.0.0` (CI needs 0.0.0.0)
   - Health endpoint doesn't exist (backend needs `/health` route)
   - Backend crashes on startup (check logs for exceptions)
   - Missing environment variables (add to workflow)

3. **Fix in backend**:

   ```python
   # Ensure backend binds to all interfaces
   uvicorn.run(app, host="0.0.0.0", port=8000)

   # Ensure health endpoint exists
   @app.get("/health")
   async def health():
       return {"status": "healthy"}
   ```

#### How to Test CI Changes

Before pushing workflow changes:

1. **Test setup script locally**:

   ```bash
   export LOG_FILE=/tmp/test-setup.log
   bash client/e2e/setup-backend.sh
   cat /tmp/test-setup.log
   ```

2. **Create a test branch**:

   ```bash
   git checkout -b test/ci-e2e
   git push origin test/ci-e2e
   ```

3. **Create draft PR with `run-e2e` label**
   - Review CI logs in Actions tab
   - Iterate until working
   - Close PR when done testing

### Local Troubleshooting

### Backend Not Running

**Problem**: Tests fail with "API is not ready" or connection errors.

**Solution**:

```bash
# Check if backend is running
curl http://localhost:8000/health

# If not, start it
./e2e/setup-backend.sh
# OR
cd ../AI-Agent-Framework && docker compose up -d
```

### Port Already in Use

**Problem**: Error about port 3000 or 8000 already in use.

**Solution**:

```bash
# Find process using port
lsof -i :3000
lsof -i :8000

# Kill process or change ports
export E2E_BASE_URL=http://localhost:3001
export API_BASE_URL=http://localhost:8001
```

### Tests Fail Randomly

**Problem**: Tests pass individually but fail when run together.

**Solution**:

- Check test independence - ensure each test uses `uniqueProjectKey`
- Run tests sequentially: `npx playwright test --workers=1`
- Check for shared state or race conditions

### Timeout Errors

**Problem**: Tests timeout waiting for elements or responses.

**Solution**:

```bash
# Increase timeouts in playwright.config.ts
timeout: 120000,  # 2 minutes

# Or run in headed mode to see what's happening
npx playwright test --headed

# Check backend logs
docker compose logs -f  # if using Docker
tail -f /tmp/backend-e2e.log  # if using Python
```

### Tests Work Locally but Fail in CI

**Problem**: Tests pass on local machine but fail in GitHub Actions.

**Solution**:

- Check environment variables are set correctly in CI
- Verify backend starts properly (check CI logs)
- Ensure Playwright browsers are installed: `npx playwright install --with-deps`
- Check for timing issues (CI is slower) - increase timeouts

### Debugging Failed Tests

```bash
# View trace of last failed test
npx playwright show-trace playwright-report/.../trace.zip

# Run in debug mode
npx playwright test --debug e2e/tests/01-project-creation.spec.ts

# Run in headed mode with slowMo
npx playwright test --headed --slow-mo=1000
```

### Clean Up Test Data

If test projects accumulate:

```bash
# Use API helper to clean up
# This is done automatically after each test via fixtures
# But can be done manually if needed:

curl -X DELETE http://localhost:8000/projects/e2e-project-*
```

## Step 2: Artifact, Proposal, and Audit Testing

### Overview

Step 2 E2E tests validate the complete workflow for template-driven artifact management, proposal creation/review, and audit viewing. These tests are in `e2e/tests/10-step2-workflow.spec.ts`.

### Test Scenarios Covered

1. **Artifact Editor Workflow** - Navigate to artifact editor, edit fields, save, and verify persistence
2. **Artifact List and Filtering** - View artifact list, apply filters by type, navigate to editor
3. **Proposal Creation** - Create new proposal through UI, fill form, submit, verify in list
4. **Proposal Apply Workflow** - View proposal list, open proposal, apply changes, verify artifact updated
5. **Proposal Reject Workflow** - View proposal list, open proposal, reject with reason, verify status change
6. **Audit Viewer** - View audit results, filter by severity, click links to navigate to artifacts
7. **Full End-to-End Workflow** - Complete workflow from project creation through proposal apply and audit

### Running Step 2 Tests

```bash
# Run all Step 2 tests
npm run test:e2e -- tests/10-step2-workflow

# Run specific scenario
npx playwright test --grep "Artifact Editor Workflow"
npx playwright test --grep "Proposal Creation"
npx playwright test --grep "Full End-to-End"

# Run with UI for debugging
npm run test:e2e:ui -- tests/10-step2-workflow

# Run in headed mode to watch execution
npx playwright test --headed tests/10-step2-workflow.spec.ts
```

### Step 2 Test Helpers

The file `e2e/helpers/step2-helpers.ts` provides reusable utilities:

- `navigateToArtifactEditor()` - Navigate to artifact editor for specific artifact
- `fillArtifactField()` - Fill form field in artifact editor
- `saveArtifact()` - Save artifact and wait for confirmation
- `navigateToArtifactList()` - Navigate to artifact list view
- `filterArtifactsByType()` - Apply artifact type filter
- `createProposalViaUI()` - Create proposal through UI form
- `applyProposalViaUI()` - Apply proposal and handle confirmation dialog
- `rejectProposalViaUI()` - Reject proposal with reason
- `navigateToAuditViewer()` - Navigate to audit viewer
- `filterAuditBySeverity()` - Filter audit results by severity level
- `verifyProposalInList()` - Verify proposal appears in list

### Step 2 Test Dependencies

**Backend Requirements:**

- All Step 2 backend endpoints must be implemented (#69-#77)
- Template API (`/api/v1/templates`)
- Artifact API (`/api/v1/projects/{key}/artifacts`)
- Proposal API (`/api/v1/projects/{key}/proposals`)
- Audit API (`/api/v1/projects/{key}/audit`)

**Frontend Requirements:**

- All Step 2 UX components must be implemented (#102-#108)
- ArtifactEditor component
- ArtifactList component
- ProposalList component
- ProposalReview component
- AuditViewer component

### Expected Test Execution Time

- **Individual scenarios**: 5-10 seconds each
- **Full Step 2 suite**: < 90 seconds total
- Tests are deterministic and should pass consistently

### Troubleshooting Step 2 Tests

**Problem**: Artifact editor not loading

**Solution**: Verify backend templates API is accessible and returning templates. Check that artifact generation has been run for the project.

**Problem**: Proposals not appearing in list

**Solution**: Ensure proposal creation API completed successfully. Check backend logs for proposal creation errors.

**Problem**: Audit results empty

**Solution**: Audit events are created after proposal apply/reject actions. First apply or reject a proposal to generate audit events.

**Problem**: Tests timing out

**Solution**: Step 2 tests include defensive timeouts and fallback logic. Check that backend is responding within 10 seconds. Increase timeout in playwright.config.ts if needed.

### Step 2 Test Data

Tests use the existing E2E fixtures:

- `apiClient` - SRP-compliant API client factory
- `apiHelper` - Legacy API helper (backward compatibility)
- `uniqueProjectKey` - Generates unique project key per test

Tests create minimal data needed and clean up automatically via fixtures.

## Additional Resources

- [Playwright Documentation](https://playwright.dev)
- [AI-Agent-Framework Backend Repo](https://github.com/blecx/AI-Agent-Framework)
- [Backend E2E Testing Docs](https://github.com/blecx/AI-Agent-Framework/blob/main/E2E_TESTING.md)
- [Project README](../README.md)

## Common Commands Cheat Sheet

```bash
# Install and setup
npm ci
npx playwright install --with-deps
./e2e/setup-backend.sh

# Run tests
npm run test:e2e                                    # All tests
npx playwright test --headed                        # Visual mode
npx playwright test --debug                         # Debug mode
npx playwright test --ui                            # Interactive UI
npx playwright test e2e/tests/01-*.spec.ts         # Specific file
npx playwright test --grep "should create"          # By test name

# View results
npx playwright show-report                          # HTML report
npx playwright show-trace trace.zip                 # Trace viewer

# Debugging
export DEBUG=pw:api                                 # Playwright debug logs
npx playwright test --headed --slow-mo=1000        # Slow motion
```
