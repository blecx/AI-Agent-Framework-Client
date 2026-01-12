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

### GitHub Actions

The E2E tests run in the `client-e2e` job after the main CI passes. See [CI Setup Notes](CI-SETUP.md) for detailed configuration.

**Important**: The CI workflow expects a backend Docker image at `ghcr.io/blecx/ai-agent-framework:latest`. 
- If this image doesn't exist yet, see [CI-SETUP.md](CI-SETUP.md) for alternatives
- The backend image must be built and published from the AI-Agent-Framework repository

### CI Workflow Overview

```yaml
client-e2e:
  runs-on: ubuntu-latest
  needs: client-ci
  
  services:
    - backend:
        image: ghcr.io/blecx/ai-agent-framework:latest
```

The workflow:
1. Starts backend API as a Docker service
2. Installs Node.js and dependencies
3. Installs Playwright browsers
4. Waits for backend health check
5. Runs E2E tests
6. Uploads artifacts on failure

### Artifacts on Failure

When tests fail in CI:
- **Screenshots** of failed tests
- **Videos** of failed tests
- **Traces** for debugging
- **HTML report** with full details

Access artifacts via GitHub Actions → Workflow → Artifacts.

## Troubleshooting

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
