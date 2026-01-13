# CI/CD Setup Notes for E2E Tests

## Current CI Configuration

The E2E tests in CI use a **Python-based backend setup** that checks out and runs the backend repository directly.

### How It Works

The workflow:
1. Checks out the client repository
2. Checks out the backend repository (`blecx/AI-Agent-Framework`)
3. Sets up Python 3.11 with pip caching
4. Installs backend dependencies from `requirements.txt`
5. Starts backend via `uvicorn` in background
6. Waits for backend health check to pass
7. Runs Playwright E2E tests
8. Uploads artifacts on failure (reports, screenshots, backend logs)

```yaml
- name: Checkout backend
  uses: actions/checkout@v4
  with:
    repository: blecx/AI-Agent-Framework
    path: backend

- name: Setup Python
  uses: actions/setup-python@v5
  with:
    python-version: '3.11'
    cache: 'pip'

- name: Start backend API
  run: |
    cd backend
    pip install -r requirements.txt
    nohup uvicorn main:app --host 0.0.0.0 --port 8000 &
```

## Benefits of Python-Based Approach

✅ **No Docker image required** - Works immediately without publishing images  
✅ **Uses latest backend code** - Always tests against current backend  
✅ **Fast pip caching** - Dependencies cached between runs  
✅ **Easy debugging** - Backend logs uploaded on failure  
✅ **Flexible configuration** - Environment variables easily adjusted  

## Important Notes

### Backend Repository Access

The CI workflow checks out the public `blecx/AI-Agent-Framework` repository. If the backend is private:
1. Generate a Personal Access Token (PAT) with `repo` scope
2. Add it as a repository secret (e.g., `BACKEND_ACCESS_TOKEN`)
3. Update checkout step:
   ```yaml
   - name: Checkout backend
     uses: actions/checkout@v4
     with:
       repository: blecx/AI-Agent-Framework
       path: backend
       token: ${{ secrets.BACKEND_ACCESS_TOKEN }}
   ```

### Backend Requirements

The backend must:
- Have a `requirements.txt` file at the root
- Start via `uvicorn main:app`
- Expose a `/health` endpoint
- Run on port 8000 (configurable via PORT env var)

### Environment Variables

Backend configuration:
- `PROJECT_DOCS_PATH=/tmp/test-docs` - Isolated test data directory
- `PORT=8000` - API port
- `HOST=0.0.0.0` - Listen on all interfaces

## Alternative: Docker Service Container

If you later publish a Docker image, you can switch back to the service container approach:

```yaml
client-e2e:
  services:
    backend:
      image: ghcr.io/blecx/ai-agent-framework:latest
      ports:
        - 8000:8000
      env:
        PROJECT_DOCS_PATH: /tmp/test-docs
```

**To publish the backend image:**
```bash
cd AI-Agent-Framework
docker build -t ghcr.io/blecx/ai-agent-framework:latest .
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
docker push ghcr.io/blecx/ai-agent-framework:latest
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
