# CI/CD Setup Notes for E2E Tests

## Current CI Configuration

The E2E tests in CI use a Docker service container for the backend API. The workflow is configured to use:

```yaml
services:
  backend:
    image: ghcr.io/blecx/ai-agent-framework:latest
```

## Important Notes

### Backend Docker Image

**REQUIRED**: The CI workflow expects a Docker image to be published at `ghcr.io/blecx/ai-agent-framework:latest`.

#### Publishing the Backend Image

If the backend image doesn't exist yet, you'll need to:

1. **Build and push from the backend repo**:
   ```bash
   cd AI-Agent-Framework
   docker build -t ghcr.io/blecx/ai-agent-framework:latest .
   docker login ghcr.io
   docker push ghcr.io/blecx/ai-agent-framework:latest
   ```

2. **Or set up automated builds** in the backend repo's GitHub Actions

### Alternative: Skip E2E in CI Initially

If you want to merge this PR before the backend image is available, you can temporarily disable E2E tests in CI:

**Option 1**: Comment out the `client-e2e` job in `.github/workflows/ci.yml`

**Option 2**: Add a condition to only run when backend image is available:
```yaml
client-e2e:
  runs-on: ubuntu-latest
  needs: client-ci
  if: false  # Temporarily disable until backend image is available
```

**Option 3**: Use a mock backend or test double (requires additional setup)

### Alternative: Use Python Setup in CI

Instead of Docker service, you could check out and run the backend directly:

```yaml
client-e2e:
  runs-on: ubuntu-latest
  needs: client-ci
  
  steps:
    - uses: actions/checkout@v4
      with:
        repository: blecx/AI-Agent-Framework
        path: backend
    
    - name: Setup Python
      uses: actions/setup-python@v5
      with:
        python-version: '3.11'
    
    - name: Install backend dependencies
      working-directory: backend
      run: |
        pip install -r requirements.txt
    
    - name: Start backend
      working-directory: backend
      run: |
        uvicorn main:app --host 0.0.0.0 --port 8000 &
        sleep 10
        curl -f http://localhost:8000/health
    
    # ... rest of E2E test steps
```

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
