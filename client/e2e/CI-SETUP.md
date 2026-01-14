# CI/CD Setup Notes for E2E Tests

## Current CI Configuration

The E2E tests in CI are **optional** and only run when:
1. Pushing to the `main` branch, OR
2. A PR is labeled with `run-e2e`

This approach ensures that E2E tests don't block development when the backend isn't available.

### How It Works

The workflow:
1. Checks out the client repository
2. **Optionally** checks out the backend repository (continues if this fails)
3. If backend is available:
   - Looks for `backend_e2e_runner.py` (recommended)
   - Falls back to `docker-compose.yml` if harness not found
   - Starts backend and waits for health check
4. Runs Playwright E2E tests (continues even if backend unavailable)
5. Uploads artifacts on failure

```yaml
client-e2e:
  # Only run on main or when explicitly requested
  if: github.event_name == 'push' && github.ref == 'refs/heads/main' || github.event.pull_request.labels.*.name == 'run-e2e'
  
  steps:
    - name: Checkout backend
      id: checkout-backend
      continue-on-error: true  # Don't fail if backend unavailable
      uses: actions/checkout@v4
      with:
        repository: blecx/AI-Agent-Framework
```

## Benefits of This Approach

✅ **Non-blocking** - E2E tests don't block PRs by default  
✅ **Optional backend** - Works even if backend repo is unavailable  
✅ **Uses backend's E2E harness** - Leverages `backend_e2e_runner.py` if available  
✅ **Fallback support** - Uses docker-compose if harness not found  
✅ **Label-triggered** - Can be enabled per-PR with `run-e2e` label  

## Running E2E Tests in CI

### Automatic (Main Branch)
E2E tests run automatically on pushes to `main`.

### Manual (Pull Requests)
Add the `run-e2e` label to your PR to trigger E2E tests:
1. Open your PR
2. Add label: `run-e2e`
3. CI will run E2E tests on next push

### Backend Requirements

If the backend is available, it should provide:
1. **Recommended**: `backend_e2e_runner.py` - E2E test harness
2. **Alternative**: `docker-compose.yml` - Docker-based setup
3. **Health endpoint**: `/health` returning 200 when ready

## Local Development

For local E2E testing, use the provided script:

```bash
cd client
./run-e2e-tests.sh
```

The script will:
- Check if backend is running
- Attempt to start it automatically (Docker or Python)
- Run E2E tests
- Clean up after completion

## Troubleshooting

### E2E tests skipped in CI
**Cause**: Not running on `main` and no `run-e2e` label.  
**Solution**: Add `run-e2e` label to PR or merge to `main`.

### Backend checkout fails
**Cause**: Backend repository not accessible or doesn't exist.  
**Solution**: This is expected and handled gracefully. E2E tests will be skipped or run with mock data.

### Backend fails to start
**Cause**: Missing `backend_e2e_runner.py` or `docker-compose.yml`.  
**Solution**: Ensure backend repository has proper E2E setup. Check backend logs in CI artifacts.

### Tests fail but backend is healthy
**Cause**: API contract mismatch or test issues.  
**Solution**: Check test logs and screenshots in CI artifacts. Verify API compatibility.

## Alternative Approaches

If you don't have access to the backend repository:

### Option 1: Mock Backend
Create a mock backend in `client/e2e/mock-backend/` for testing:
```yaml
- name: Start mock backend
  working-directory: client/e2e/mock-backend
  run: npm start &
```

### Option 2: Skip E2E in CI
Remove the `run-e2e` label and only run E2E tests locally.

### Option 3: Separate E2E Repository
Create a dedicated E2E test repository that coordinates both client and backend.

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
