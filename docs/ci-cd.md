# CI/CD Documentation

This document describes all quality gates and checks in the CI/CD pipeline for the AI-Agent-Framework-Client.

## Overview

The CI/CD pipeline enforces quality standards through automated checks on every pull request and merge to main. All checks must pass before merging.

## Pipeline Structure

```
Pull Request → CI Checks → Review → Merge → Deploy
                  ↓
        ┌─────────┴─────────┐
        ↓                   ↓
   Required Gates      Optional Gates
   (Always run)        (Main or labeled)
```

## Quality Gates

### 1. PR Template Validation

**Purpose**: Ensures all PRs follow the required template format with complete information.

**Checks**:
- Required sections present:
  - `# Summary`
  - `## Goal / Acceptance Criteria (required)`
  - `## Issue / Tracking Link (required)`
  - `## Validation (required)`
  - `## Automated checks`
  - `## Manual test evidence (required)`
  - `## Cross-repo / Downstream impact (always include)`
- All acceptance criteria checkboxes are checked
- Tracking link is not a placeholder
- Validation details are filled (not placeholders)
- Manual test evidence is complete
- "How to review" has meaningful steps

**Failure Remediation**:
```bash
# Get template from recent successful PR
gh pr view <recent-pr> --json body --jq .body > .tmp/pr-template.md

# Update your PR body with all required sections
gh api -X PATCH repos/blecx/AI-Agent-Framework-Client/pulls/<PR_NUMBER> \
  --field body=@.tmp/pr-body.md

# Trigger new CI run
git commit --allow-empty -m "chore: trigger CI with updated PR description"
git push
```

### 2. Repository Hygiene

**Purpose**: Prevents committing sensitive or environment-specific files.

**Checks**:
- No `.env` files (use `.env.example` instead)
- No `.env.local` files
- No `.env.production` files
- No `.env.e2e` files

**Failure Remediation**:
```bash
# Remove forbidden files from git
git rm .env .env.local .env.production .env.e2e

# Add to .gitignore if not already there
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore
echo ".env.e2e" >> .gitignore

# Commit and push
git add .gitignore
git commit -m "fix: remove environment files and update .gitignore"
git push
```

### 3. Linting

**Purpose**: Ensures code follows style guidelines and best practices.

**Command**: `npm run lint`

**Checks**:
- ESLint rules pass
- TypeScript types are valid
- No unused variables
- Consistent code formatting

**Failure Remediation**:
```bash
cd client
npm run lint -- --fix  # Auto-fix issues
npm run lint           # Verify fixes
```

Common issues:
- **Unused variables**: Remove or prefix with `_`
- **Missing dependencies**: Add to useEffect dependency array
- **Type errors**: Fix type annotations

### 4. Test Coverage

**Purpose**: Ensures adequate test coverage for all code changes.

**Command**: `npm run test:coverage`

**Thresholds**:
- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

**Failure Remediation**:
```bash
# Generate coverage report
cd client
npm run test:coverage

# View detailed HTML report
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux

# Identify untested code
# Write tests for uncovered lines/functions

# Common patterns:
# - Add unit tests for new components
# - Add integration tests for new features
# - Add E2E tests for critical workflows
```

**What to test**:
- Component rendering
- User interactions (clicks, inputs)
- State changes
- API integration
- Error handling
- Edge cases

### 5. Build Success

**Purpose**: Ensures code compiles without errors or warnings.

**Command**: `npm run build`

**Checks**:
- TypeScript compilation succeeds
- Vite build completes
- No build warnings
- Assets are generated

**Failure Remediation**:
```bash
cd client
npm run build

# Common issues:
# - Type errors: Fix TypeScript types
# - Import errors: Check file paths
# - Module not found: Install dependencies
npm ci  # Reinstall dependencies if needed
```

### 6. Bundle Size

**Purpose**: Prevents bundle bloat and ensures fast load times.

**Command**: `npm run check:bundle-size`

**Limit**: Main bundle < 500KB (gzipped)

**Failure Remediation**:
```bash
# Check current bundle size
cd client
npm run build
npm run check:bundle-size

# Analyze bundle composition
npm run build -- --mode analyze

# Optimization strategies:
# 1. Code splitting
#    - Use dynamic imports: const Component = lazy(() => import('./Component'))
#    - Route-based splitting with React.lazy
#
# 2. Tree shaking
#    - Import only what you need: import { specific } from 'library'
#    - Avoid import * as
#
# 3. Dependency optimization
#    - Replace large libraries with smaller alternatives
#    - Use lightweight versions (e.g., date-fns instead of moment)
#    - Remove unused dependencies
#
# 4. Asset optimization
#    - Optimize images (WebP, lazy loading)
#    - Use SVG for icons instead of icon fonts
#    - Compress static assets
```

**Bundle size breakdown**:
```javascript
// Example output
Main bundle: index-abc123.js
  Raw: 1.2 MB
  Gzipped: 350 KB  ✓ Under 500KB limit
```

### 7. Console Error Check

**Purpose**: Ensures production build has no console statements.

**Check**: Scans built files for `console.log`, `console.error`, `console.warn`, `console.debug`

**Status**: Warning (non-blocking)

**Remediation**:
```bash
# Option 1: Remove console statements manually
# Find and remove console.* calls

# Option 2: Use build plugin to strip console statements
# Add to vite.config.ts:
export default defineConfig({
  build: {
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
});

# Option 3: Use a logging library
# Replace console.* with proper logging
import logger from './utils/logger';
logger.debug('Debug message');  // Stripped in production
```

### 8. Documentation Validation

**Purpose**: Ensures test documentation is current and complete.

**Command**: `npm run check:docs`

**Checks**:
- `tests/README.md` exists
- Contains required sections:
  - Test Types
  - Unit Tests
  - E2E Tests
  - Running Tests
  - CI/CD
- Minimum 50 lines (comprehensive)

**Failure Remediation**:
```bash
# Create or update tests/README.md
cd client

# Required sections:
cat > tests/README.md << 'EOF'
# Test Documentation

## Test Types
[Describe unit, integration, E2E tests]

## Unit Tests
[Document component tests, utilities]

## E2E Tests
[Document Playwright tests, page objects]

## Running Tests
[Commands for local and CI]

## CI/CD
[Describe CI workflow, gates]
EOF

# Run check
npm run check:docs
```

### 9. Unit Tests

**Purpose**: Validates all unit and integration tests pass.

**Command**: `npm test`

**Checks**:
- All test suites pass
- No test failures
- Tests complete in reasonable time

**Failure Remediation**:
```bash
cd client
npm test  # Run all tests

# Run specific test file
npm test -- src/components/MyComponent.test.tsx

# Run in watch mode for debugging
npm run test:watch

# Common issues:
# - Mock not set up correctly
# - Async operations not awaited
# - Component not properly rendered
# - State updates not flushed

# Debug failing test
npm test -- --reporter=verbose src/path/to/failing.test.tsx
```

## Optional Quality Gates

These gates run on main branch or when specific labels are added to PRs.

### 10. API Integration Tests

**Trigger**: Main branch or changes to client API code

**Purpose**: Validates client works with actual backend API.

**Requirements**:
- Backend repository available
- API endpoints accessible
- Integration tests pass

**Label**: Runs automatically based on path filters

### 11. E2E Tests

**Trigger**: Main branch or `run-e2e` label

**Purpose**: Validates critical user workflows end-to-end.

**Command**: `npx playwright test`

**Checks**:
- All E2E scenarios pass
- Backend dependencies resolved
- No browser errors
- Screenshots/videos captured

**Failure Remediation**:
```bash
cd client

# Run E2E tests locally
npm run test:e2e

# Run with UI for debugging
npx playwright test --ui

# Run specific test
npx playwright test e2e/01-project-creation.spec.ts

# Update snapshots if visual regression fails
npm run test:e2e:update-snapshots

# Common issues:
# - Selector not found: Update page object selectors
# - Timing issues: Add proper waits
# - Backend not available: Check API connection
# - Visual diff: Review screenshot and update baseline
```

**Adding `run-e2e` label**:
```bash
gh pr edit <PR_NUMBER> --add-label run-e2e
```

### 12. Lighthouse CI

**Trigger**: Main branch or `run-lighthouse` label

**Purpose**: Validates performance, accessibility, and best practices.

**Command**: `npm run lighthouse:ci`

**Thresholds**:
- Performance: ≥ 80
- Accessibility: ≥ 90
- Best Practices: ≥ 80

**Failure Remediation**:

#### Performance < 80
```bash
# Run Lighthouse locally
cd client
npm run build
npm run preview &
npm run lighthouse:ci

# Optimization steps:
# 1. Optimize images
#    - Use WebP format
#    - Add lazy loading: <img loading="lazy" />
#    - Use responsive images
#
# 2. Reduce JavaScript
#    - Code splitting (see Bundle Size section)
#    - Remove unused code
#    - Defer non-critical JS
#
# 3. Optimize assets
#    - Enable compression (gzip/brotli)
#    - Use CDN for static files
#    - Implement caching headers
#
# 4. Critical rendering path
#    - Inline critical CSS
#    - Preload key resources
#    - Minimize render-blocking resources
```

#### Accessibility < 90
```bash
# Run accessibility tests
npm run test:e2e:a11y

# Common issues and fixes:
# 1. Missing ARIA labels
<button aria-label="Close dialog">X</button>

# 2. Insufficient color contrast
# Use contrast ratio ≥ 4.5:1 for normal text

# 3. Missing alt text
<img src="..." alt="Descriptive text" />

# 4. Keyboard navigation
# Ensure all interactive elements are focusable
# Test with Tab key

# 5. Form labels
<label htmlFor="email">Email</label>
<input id="email" type="email" />

# Tools:
# - axe DevTools browser extension
# - Lighthouse DevTools panel
# - Playwright accessibility tests
```

#### Best Practices < 80
```bash
# Common issues:
# 1. Console errors
#    - Fix all browser console errors
#    - Remove console.* in production
#
# 2. Deprecated APIs
#    - Update to modern APIs
#    - Check browser compatibility
#
# 3. Security
#    - Use HTTPS
#    - Set security headers
#    - Fix vulnerability warnings
#
# 4. Modern practices
#    - Use HTTPS
#    - Serve images in next-gen formats
#    - Avoid document.write()
```

**Adding `run-lighthouse` label**:
```bash
gh pr edit <PR_NUMBER> --add-label run-lighthouse
```

## CI Workflow Summary

### Every PR (Required)
1. ✅ PR template validation
2. ✅ Repository hygiene
3. ✅ Linting
4. ✅ Test coverage (80%)
5. ✅ Build success
6. ✅ Bundle size (< 500KB)
7. ⚠️  Console error check (warning)
8. ✅ Documentation validation
9. ✅ Unit tests

### Main Branch or Labeled (Optional)
10. 🔀 API integration tests (auto)
11. 🧪 E2E tests (`run-e2e` label)
12. 🚀 Lighthouse CI (`run-lighthouse` label)

## Local Development Workflow

### Before Creating PR

```bash
cd client

# 1. Run linting
npm run lint

# 2. Run tests with coverage
npm run test:coverage

# 3. Build project
npm run build

# 4. Check bundle size
npm run check:bundle-size

# 5. Validate documentation
npm run check:docs

# All passed? Create PR
git push -u origin <branch-name>
gh pr create --fill
```

### During PR Review

```bash
# Run E2E tests (if needed)
npm run test:e2e

# Run Lighthouse (if needed)
npm run build
npm run preview &
npm run lighthouse:ci
pkill -f "vite preview"  # Stop preview server
```

## Artifacts

CI uploads the following artifacts for debugging:

- **Coverage report**: Test coverage HTML report
- **Playwright report**: E2E test results with traces
- **Test screenshots**: Screenshots from failed E2E tests
- **Backend logs**: API logs from E2E tests
- **Lighthouse report**: Performance/accessibility reports

**Viewing artifacts**:
```bash
# List artifacts
gh run view <RUN_ID> --log-failed

# Download artifact
gh run download <RUN_ID> -n coverage-report
```

## Troubleshooting

### CI is Stuck/Slow

**Symptoms**: CI runs for > 15 minutes

**Solutions**:
1. Check for infinite loops in tests
2. Reduce E2E test timeout
3. Optimize test setup/teardown
4. Use `--bail` to fail fast
5. Run tests in parallel

### Flaky Tests

**Symptoms**: Tests pass/fail randomly

**Solutions**:
1. Add proper waits for async operations
2. Mock time-dependent logic
3. Use `waitFor` for async assertions
4. Avoid testing implementation details
5. Isolate test data

### Coverage Calculation Wrong

**Symptoms**: Coverage report doesn't match reality

**Solutions**:
1. Clear coverage cache: `rm -rf coverage/`
2. Check coverage excludes in vitest.config.ts
3. Ensure test files match patterns
4. Run locally: `npm run test:coverage`

### Bundle Size Suddenly Increased

**Symptoms**: Bundle size check fails after adding small change

**Solutions**:
1. Check for new dependencies added
2. Run bundle analyzer: `npm run build -- --mode analyze`
3. Check for accidentally imported large libraries
4. Verify tree shaking is working

## References

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Vitest Coverage](https://vitest.dev/guide/coverage)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Playwright E2E](https://playwright.dev/)
- [PR Review Rubric](../.github/prompts/pr-review-rubric.md)

## Updates

This document should be updated when:
- New quality gates are added
- Thresholds are changed
- New tools are introduced
- Common issues/solutions are discovered

Last updated: 2026-02-02
