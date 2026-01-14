# E2E CI Setup Guide

## Overview

This guide provides step-by-step instructions for setting up and configuring E2E tests in CI for the AI-Agent-Framework-Client repository.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Backend Repository Setup](#backend-repository-setup)
- [CI Workflow Configuration](#ci-workflow-configuration)
- [Repository Secrets](#repository-secrets)
- [Alternative Backend Startup Methods](#alternative-backend-startup-methods)
- [Testing CI Changes](#testing-ci-changes)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required

- GitHub Actions enabled on repository
- Node.js 20+ available in CI (handled by workflow)
- Python 3.11+ available in CI (handled by workflow)
- Access to backend repository: `blecx/AI-Agent-Framework`

### Optional

- Docker installed (for Docker-based backend startup)
- GitHub Container Registry access (for pre-built images)

## Quick Start

The E2E CI is **already configured** and works out of the box. It will:

1. Automatically clone the backend repository
2. Install backend dependencies
3. Start the backend
4. Run E2E tests
5. Upload artifacts on failure

**No manual setup required** - just push to `main` or add `run-e2e` label to PR.

## Backend Repository Setup

### Option 1: Public Repository (Default)

If the backend repository is **public** (current setup):

✅ **No configuration needed** - The workflow will clone it automatically.

### Option 2: Private Repository

If the backend repository is **private**, you need to configure access:

1. **Create a Personal Access Token (PAT)**:
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Click "Generate new token (classic)"
   - Select scopes: `repo` (Full control of private repositories)
   - Generate and copy the token

2. **Add token as repository secret**:
   - Go to repository Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `BACKEND_ACCESS_TOKEN`
   - Value: Paste your PAT
   - Save

3. **Update workflow** to use the token:

```yaml
- name: Checkout backend repository
  uses: actions/checkout@v4
  with:
    repository: blecx/AI-Agent-Framework
    path: ../AI-Agent-Framework
    token: ${{ secrets.BACKEND_ACCESS_TOKEN }}
```

## CI Workflow Configuration

### Current Configuration

The E2E tests run when:

```yaml
if: github.ref == 'refs/heads/main' || contains(github.event.pull_request.labels.*.name, 'run-e2e')
```

**This means:**
- ✅ Always runs on pushes to `main`
- ✅ Runs on PRs with `run-e2e` label
- ❌ Does NOT run on PRs without the label

### Enable E2E on All PRs

To run E2E tests on **every PR** (not recommended - slower CI):

```yaml
client-e2e:
  if: github.event_name == 'pull_request' || github.ref == 'refs/heads/main'
```

### Enable E2E on Specific Branches

To run on multiple branches:

```yaml
client-e2e:
  if: |
    github.ref == 'refs/heads/main' || 
    github.ref == 'refs/heads/develop' || 
    contains(github.event.pull_request.labels.*.name, 'run-e2e')
```

### Disable E2E Tests Completely

To disable E2E tests:

```yaml
client-e2e:
  if: false  # Never runs
```

Or simply remove the `client-e2e` job from the workflow.

## Repository Secrets

### Optional Secrets

| Secret Name | Purpose | Required? |
|-------------|---------|-----------|
| `BACKEND_ACCESS_TOKEN` | Access private backend repo | Only if backend is private |
| `GHCR_TOKEN` | Pull pre-built Docker images | Only if using GHCR images |

### How to Add Secrets

1. Go to repository Settings
2. Navigate to Secrets and variables → Actions
3. Click "New repository secret"
4. Enter name and value
5. Click "Add secret"

## Alternative Backend Startup Methods

The default setup uses **automatic cloning + Python venv**, but you can configure other methods:

### Method 1: Pre-built Docker Image (Recommended for Production)

**Prerequisites:**
1. Build and publish backend Docker image to GHCR
2. Configure image pull secrets

**Steps:**

1. **In backend repository**, create workflow to build/push image:

```yaml
# .github/workflows/docker-publish.yml (backend repo)
name: Build and Publish Docker Image

on:
  push:
    branches: [ main ]
    tags: [ 'v*' ]

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            ghcr.io/blecx/ai-agent-framework:latest
            ghcr.io/blecx/ai-agent-framework:${{ github.sha }}
```

2. **In client repository**, update CI workflow:

```yaml
services:
  backend:
    image: ghcr.io/blecx/ai-agent-framework:latest
    credentials:
      username: ${{ github.actor }}
      password: ${{ secrets.GITHUB_TOKEN }}
    ports:
      - 8000:8000
    options: >-
      --health-cmd "curl -f http://localhost:8000/health || exit 1"
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```

3. **Update setup script** to skip if service is running:

```bash
# Backend service is already running in CI
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
  echo "✓ Backend service is already running"
  exit 0
fi
```

### Method 2: Docker Compose

**Prerequisites:**
- Backend has `docker-compose.yml`
- Docker available in CI

**Setup:**

The current setup **already supports** Docker Compose as a fallback. No changes needed.

### Method 3: Python Venv (Current Default)

**Prerequisites:**
- Backend has `requirements.txt`
- Python 3.11+ available in CI

**Setup:**

The current setup **already implements** this. No changes needed.

## Testing CI Changes

### Test Without Affecting Main Branch

1. **Create a test branch:**

```bash
git checkout -b test/ci-e2e-setup
```

2. **Make your changes** to `.github/workflows/ci.yml`

3. **Push and create a draft PR:**

```bash
git push origin test/ci-e2e-setup
```

4. **Add the `run-e2e` label** to trigger E2E tests

5. **Review CI logs:**
   - Go to Actions tab
   - Click on the workflow run
   - Review each step's output
   - Download artifacts if tests fail

6. **Iterate until working:**
   - Make fixes to workflow
   - Push commits
   - CI automatically re-runs on each push

7. **Merge when ready** or close PR if just testing

### Test Locally Before Pushing

Run the same setup script that CI uses:

```bash
cd client
export LOG_FILE=/tmp/local-backend-setup.log
bash e2e/setup-backend.sh

# If successful, run tests
npx playwright test

# Review logs
cat /tmp/local-backend-setup.log
```

## Troubleshooting

### Issue: E2E tests always skip in CI

**Symptom:**
```
E2E TESTS SKIPPED - DEPENDENCY RESOLUTION FAILED
```

**Solution:**

1. Download `backend-setup-log` artifact from CI
2. Review error messages
3. Common causes:
   - Backend repository not accessible (add `BACKEND_ACCESS_TOKEN`)
   - Missing `requirements.txt` in backend (add it)
   - Backend health endpoint not working (fix backend)

### Issue: Backend Docker image not found

**Symptom:**
```
Error response from daemon: manifest unknown
```

**Solution:**

This is expected if using Docker services but image doesn't exist yet.

**Fix Option A:** Build and publish the image (see Method 1 above)

**Fix Option B:** Remove Docker service, use Python venv instead (current default)

### Issue: Backend starts but health check fails

**Symptom:**
```
✗ Backend API did not start in time after Docker Compose
```

**Solution:**

1. Check backend logs artifact
2. Common causes:
   - Backend binds to `127.0.0.1` instead of `0.0.0.0` (fix backend)
   - Health endpoint doesn't exist (add `/health` endpoint)
   - Backend crashes on startup (check logs for errors)
   - Missing environment variables (add to workflow)

**Fix:**

In backend, ensure health endpoint exists:

```python
@app.get("/health")
async def health():
    return {"status": "healthy"}
```

And ensure uvicorn binds to all interfaces:

```python
# main.py or apps/main.py
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### Issue: Dependency installation fails

**Symptom:**
```
✗ Failed to install dependencies
```

**Solution:**

1. Review `backend-setup-log` artifact
2. Look for pip errors
3. Common causes:
   - Package not found on PyPI (fix `requirements.txt`)
   - Version conflict (update `requirements.txt`)
   - Missing system dependencies (add to workflow)

**Fix:**

If system packages needed (e.g., PostgreSQL, Redis):

```yaml
- name: Install system dependencies
  run: |
    sudo apt-get update
    sudo apt-get install -y postgresql-client redis-tools
```

### Issue: Tests pass locally but fail in CI

**Symptom:**
Tests work on local machine but fail in GitHub Actions.

**Solution:**

Common causes and fixes:

1. **Different environment variables**
   ```yaml
   env:
     DATABASE_URL: sqlite:///tmp/test.db
     API_KEY: test-key-for-ci
   ```

2. **Timing differences** (CI is slower)
   ```typescript
   // Increase timeouts in playwright.config.ts
   timeout: 60 * 1000, // 60 seconds instead of 30
   ```

3. **Hard-coded localhost URLs**
   ```typescript
   // Use environment variable
   const baseURL = process.env.E2E_BASE_URL || 'http://localhost:5173';
   ```

4. **Test dependencies not installed**
   ```yaml
   - name: Install Playwright browsers
     run: npx playwright install --with-deps chromium
   ```

## Advanced Configuration

### Custom Backend Repository

To use a different backend repository:

```yaml
env:
  BACKEND_REPO: https://github.com/different-org/other-backend.git
```

### Extended Timeouts

If backend takes longer to start:

```yaml
env:
  BACKEND_STARTUP_TIMEOUT: 120  # seconds
```

Update health check loop in `setup-backend.sh`:

```bash
for i in {1..60}; do  # 60 attempts * 2 seconds = 120 seconds
```

### Custom Health Endpoint

If backend uses different health endpoint:

```yaml
env:
  BACKEND_HEALTH_ENDPOINT: /api/v1/health
```

Update check in `setup-backend.sh`:

```bash
API_HEALTH_ENDPOINT="${API_HEALTH_ENDPOINT:-/health}"
curl -s "$API_BASE_URL$API_HEALTH_ENDPOINT"
```

### Parallel Test Execution

To run tests in parallel (faster but uses more resources):

```yaml
- name: Run E2E tests
  run: npx playwright test --workers=4
```

### Test Sharding

For very large test suites, split across multiple CI jobs:

```yaml
strategy:
  matrix:
    shard: [1, 2, 3, 4]

steps:
  - name: Run E2E tests
    run: npx playwright test --shard=${{ matrix.shard }}/4
```

## Monitoring and Metrics

### Track E2E Test Success Rate

Add a step to post metrics:

```yaml
- name: Report metrics
  if: always()
  run: |
    echo "E2E_TESTS_RUN=$(npx playwright show-report --reporter=json | jq '.stats.total')"
    echo "E2E_TESTS_PASSED=$(npx playwright show-report --reporter=json | jq '.stats.passed')"
```

### Monitor Backend Startup Time

```yaml
- name: Measure backend startup
  run: |
    START_TIME=$(date +%s)
    # ... start backend ...
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    echo "Backend started in ${DURATION} seconds"
```

## Best Practices

### For CI Configuration

1. **Always upload artifacts** - Even on success, for debugging
2. **Use timeouts** - Prevent hanging jobs
3. **Cache dependencies** - Speed up CI runs
4. **Test locally first** - Before pushing workflow changes
5. **Use secrets for credentials** - Never hardcode tokens

### For Backend Integration

1. **Provide health endpoint** - Required for health checks
2. **Bind to 0.0.0.0** - Not localhost
3. **Fast startup** - Keep startup under 30 seconds if possible
4. **Clear errors** - Log startup failures clearly
5. **Document setup** - README with all setup steps

### For Maintainers

1. **Monitor skip rate** - Investigate if tests skip frequently
2. **Review logs regularly** - Look for patterns in failures
3. **Update documentation** - Keep this guide current
4. **Version dependencies** - Pin versions in requirements.txt
5. **Test on PR** - Test changes before merging to main

## Related Documentation

- **[E2E CI Dependency Resolution](E2E-CI-DEPENDENCY-RESOLUTION.md)** - Smart resolution details
- **[E2E Testing Approach](E2E-TESTING-APPROACH.md)** - Overall E2E strategy
- **[E2E Backend Requirements](E2E-BACKEND-REQUIREMENTS.md)** - Backend setup guide
- **[Client E2E README](../client/e2e/README.md)** - Local testing guide

## Getting Help

If you need assistance:

1. Review this guide and related docs
2. Check CI logs and artifacts
3. Test locally with `./client/run-e2e-tests.sh`
4. Search for similar issues in repository
5. Open an issue with:
   - CI workflow run URL
   - Downloaded artifacts (logs, screenshots)
   - Steps to reproduce
   - Expected vs actual behavior
