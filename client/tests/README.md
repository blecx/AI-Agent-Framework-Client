# Client Test Documentation

This document provides comprehensive guidance on testing the AI-Agent-Framework client application.

## Table of Contents

- [Testing Strategy](#testing-strategy)
- [Test Types](#test-types)
- [Setup](#setup)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [CI/CD Integration](#cicd-integration)
- [Coverage Requirements](#coverage-requirements)
- [Troubleshooting](#troubleshooting)

## Testing Strategy

We use a comprehensive testing pyramid approach:

1. **Unit Tests** (base): Fast, isolated component/function tests
2. **Integration Tests** (middle): API client and service integration tests
3. **E2E Tests** (top): Full user journey tests with real browser

### Test Distribution

- **Unit Tests**: ~490 tests (94% of total)
- **Integration Tests**: ~31 tests (6% of total)
- **E2E Tests**: ~27 tests across 7 spec files

## Test Types

### 1. Unit Tests

Located in: `client/src/test/unit/`

**Purpose**: Test individual components, functions, and utilities in isolation.

**Technologies**:

- **Vitest** - Fast unit test runner
- **React Testing Library** - Component testing utilities
- **@testing-library/user-event** - User interaction simulation

**Coverage Areas**:

- Chat UI components (`chat/chatUi.test.tsx`)
- Command parser (`chat/commandParser.test.ts`)
- Conversation manager (`chat/conversationManager.test.ts`)
- API client methods (`services/*.test.ts`)
- State management (`state/*.test.ts`)
- Toast notifications (`notifications/toasts.test.tsx`)
- Error handling (`notifications/apiClientErrorHandling.test.ts`)

**Example Unit Test**:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render with correct text', () => {
    render(<MyComponent text="Hello" />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### 2. Integration Tests

Located in: `client/src/test/integration/`

**Purpose**: Test API clients and service interactions with mocked HTTP layer.

**Technologies**:

- **MSW (Mock Service Worker)** - HTTP request mocking
- **Vitest** - Test runner

**Coverage Areas**:

- RAID API client (`raidApiClient.integration.test.ts` - 15 tests)
- Workflow API client (`workflowApiClient.integration.test.ts` - 8 tests)
- Audit API client (`workflowApiClient.integration.test.ts` - 10 tests)

**Example Integration Test**:

```typescript
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { raidApi } from '../../api/raidApi';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('RAID API Integration', () => {
  it('should fetch RAID items', async () => {
    server.use(
      http.get('/api/projects/:key/raid', () => {
        return HttpResponse.json([{ id: 1, title: 'Test' }]);
      }),
    );

    const result = await raidApi.getRaidItems('TEST');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Test');
  });
});
```

### 3. End-to-End (E2E) Tests

Located in: `client/e2e/tests/`

**Purpose**: Test complete user workflows in a real browser environment.

**Technologies**:

- **Playwright** - Browser automation framework
- **Chromium** - Test browser (Desktop Chrome viewport 1280x720)
- **@axe-core/playwright** - Accessibility testing
- **Page Object Model** - Maintainable test structure

**Complete Test Suite** (14 spec files, 60+ tests):

1. **`01-project-creation.spec.ts`** - Project creation flow (navigation, form submission, verification)
2. **`02-proposal-workflow.spec.ts`** - Create proposals via UI (form filling, validation)
3. **`03-apply-proposal.spec.ts`** - Apply proposals and verify state changes
4. **`04-navigation-artifacts.spec.ts`** - Navigation between pages, routing verification
5. **`05-error-handling.spec.ts`** - Error scenarios (API failures, validation, recovery)
6. **`06-raid-crud.spec.ts`** - RAID CRUD operations (create, read, update, delete, 10 tests)
7. **`07-raid-list-views.spec.ts`** - RAID list/navigation (filtering, sorting, pagination, 10 tests)
8. **`08-performance.spec.ts`** - Performance budgets (load times, rendering performance)
9. **`09-workflow-transitions.spec.ts`** - Workflow state management (Initiating → Planning → Executing)
10. **`10-step2-workflow.spec.ts`** - Step 2 complete workflow (artifacts → proposals → audit, 7 scenarios)
11. **`11-page-object-examples.spec.ts`** - Page Object Model usage examples
12. **`12-visual-regression.spec.ts`** - Visual regression testing (screenshot comparison, @visual tag)
13. **`13-accessibility.spec.ts`** - Accessibility compliance (WCAG 2.1 AA, @accessibility tag)
14. **`EXAMPLE-refactored-tests.spec.ts`** - Refactoring patterns and best practices

**Coverage Areas**:

- ✅ Project creation and navigation
- ✅ Proposal workflow (create, apply, approve, reject)
- ✅ RAID management (CRUD, filtering, sorting)
- ✅ Artifact editing (Step 2 workflow)
- ✅ Audit viewer (Step 2 workflow)
- ✅ Error handling (validation, network errors)
- ✅ Navigation and routing
- ✅ Workflow state transitions
- ✅ Performance monitoring
- ✅ Visual regression detection
- ✅ Accessibility compliance (WCAG 2.1 AA)

**Example E2E Test**:

```typescript
import { test, expect } from '../fixtures';
import { navigateToProject } from '../helpers/ui-helpers';

test.describe('Feature Tests', () => {
  test('should perform user action', async ({
    page,
    apiHelper,
    uniqueProjectKey,
  }) => {
    // Setup: Create test data via API (fast)
    await apiHelper.createProject(uniqueProjectKey, 'Test Project');

    // Navigate to page
    await navigateToProject(page, uniqueProjectKey);

    // Perform action
    await page.click('button:has-text("Action")');

    // Verify UI
    await expect(page.locator('.success-message')).toBeVisible();

    // Verify data integrity via API
    const result = await apiHelper.getProject(uniqueProjectKey);
    expect(result.status).toBe('updated');
  });
});
```

**Test Execution Time**: Full E2E suite completes in < 10 minutes (typically 5-7 minutes)

**CI Integration**: E2E tests are disabled by default in CI. To enable for specific PRs:
1. Add the `run-e2e` label to your PR
2. CI will run all E2E tests in headless Chromium
3. Tests run with 2 retries in CI for flaky test mitigation
4. Visual regression tests use consistent viewport (1280x720)
5. Accessibility tests enforce WCAG 2.1 Level AA compliance

## Web UI E2E Setup

### Overview

The E2E test suite provides comprehensive browser-based testing using **Playwright**. It includes:

- **Page Object Model**: Maintainable, reusable page objects for all major UI components
- **Visual Regression Testing**: Screenshot comparison to detect visual changes
- **Accessibility Testing**: Automated ARIA and WCAG compliance checks
- **Performance Testing**: Lighthouse CI integration for performance budgets

### Prerequisites

Before running E2E tests, ensure the backend API is running:

```bash
# Option 1: Use the automated setup script
cd client
./e2e/setup-backend.sh

# Option 2: Start backend manually via Docker
cd ~/projects/AI-Agent-Framework
docker compose up -d

# Option 3: Start backend manually via Python
cd ~/projects/AI-Agent-Framework
source .venv/bin/activate
cd apps/api && PROJECT_DOCS_PATH=../../projectDocs uvicorn main:app --reload
```

Verify backend is running:

```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy","docs_path":"..."}
```

### Running Web UI E2E Tests

```bash
cd client

# Run all E2E tests
npm run test:e2e

# Run specific test suite
npm run test:e2e -- 01-project-creation.spec.ts

# Run tests with page objects
npm run test:e2e -- 11-page-object-examples.spec.ts

# Run visual regression tests
npm run test:e2e:visual

# Run accessibility tests
npm run test:e2e:a11y

# Run in headed mode (see browser)
npm run test:e2e -- --headed

# Run in debug mode
npm run test:e2e -- --debug

# Update visual baselines (after intentional UI changes)
npm run test:e2e:update-snapshots
```

### Page Object Model

The E2E tests use a **Page Object Model** pattern for cleaner, more maintainable tests. Page objects encapsulate UI interaction logic:

**Available Page Objects** (in `client/e2e/page-objects/`):

1. **`ProjectViewPage`** - Project list, creation, navigation
   - Methods: `goto()`, `createProject()`, `getProjectList()`, `navigateToProject()`
   - Use for: Project management tests, navigation verification

2. **`ArtifactEditorPage`** - Artifact viewing and editing
   - Methods: `goto()`, `fillField()`, `save()`, `getFieldValue()`, `verifyArtifactType()`
   - Use for: Artifact editing tests, content validation

3. **`ProposalListPage`** - Proposal list view and creation
   - Methods: `goto()`, `createProposal()`, `verifyProposalExists()`, `filterProposals()`, `getProposalCount()`
   - Use for: Proposal management tests, list operations

4. **`ProposalReviewModalPage`** - Proposal diff visualization and review
   - Methods: `open()`, `approve()`, `reject()`, `getDiff()`, `verifyChanges()`
   - Use for: Proposal review workflow, diff validation

5. **`AuditViewerPage`** - Audit results display and interaction
   - Methods: `goto()`, `filterBySeverity()`, `clickItem()`, `getItemCount()`, `verifyError()`
   - Use for: Audit workflow tests, error navigation

**Page Object Export**: All page objects are exported from `client/e2e/page-objects/index.ts` for convenient imports

**Example using Page Objects**:

```typescript
import { test, expect } from '../fixtures';
import { ProjectViewPage, ProposalListPage } from '../page-objects';

test('should create project and proposal', async ({ page, uniqueProjectKey }) => {
  const projectView = new ProjectViewPage(page);
  const proposalList = new ProposalListPage(page);
  
  // Create project
  await projectView.goto();
  const response = await projectView.createProject(
    uniqueProjectKey,
    'My Project',
    'Project description'
  );
  expect(response.status()).toBe(200);
  
  // Create proposal
  await proposalList.goto(uniqueProjectKey);
  await proposalList.createProposal('My Proposal', 'Description');
  await proposalList.verifyProposalExists('My Proposal');
});
```

### Visual Regression Testing

Visual regression tests capture screenshots and compare them to baselines to detect unintended visual changes.

**Test File**: `client/e2e/tests/12-visual-regression.spec.ts` (tagged with `@visual`)

**Running Visual Tests**:

```bash
# Run visual regression tests only
npm run test:e2e:visual

# Run all E2E tests including visual
npm run test:e2e

# Update baselines after intentional UI changes
npm run test:e2e:update-snapshots

# Update specific test snapshots
npm run test:e2e -- --update-snapshots 12-visual-regression.spec.ts
```

**Coverage**:

- Project list page (empty state, populated state)
- Project detail view (with artifacts)
- Proposal list page (various states)
- Artifact editor page (Step 2 workflow)
- RAID list view (with items)
- Error states (validation errors, API failures)
- Modal dialogs (proposal review, confirmation)
- Navigation menu and header
- Responsive layouts (desktop 1280x720)
- Dark mode variants (if implemented)

**Creating Visual Tests**:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests @visual', () => {
  test('should match baseline for project list', async ({ page }) => {
    await page.goto('/projects');
    await page.waitForLoadState('networkidle');
    
    // Compare full page
    await expect(page).toHaveScreenshot('project-list.png', {
      maxDiffPixels: 100,  // Allow 100 pixels difference
      threshold: 0.2,      // 20% tolerance
    });
  });
  
  // Compare specific component
  test('should match project card design', async ({ page }) => {
    await page.goto('/projects');
    await expect(page.locator('.project-card').first()).toHaveScreenshot('project-card.png');
  });
  
  // Mask dynamic content (timestamps, IDs)
  test('should match proposals page', async ({ page }) => {
    await page.goto('/projects/TEST-123/proposals');
    await expect(page).toHaveScreenshot('proposals.png', {
      mask: [
        page.locator('.timestamp'),  // Hide timestamps
        page.locator('.project-id'), // Hide dynamic IDs
      ],
    });
  });
});
```

**Visual Test Features**:

- Full page screenshots with configurable viewports
- Component-level screenshots for isolated verification
- Masking for dynamic content (timestamps, IDs, randomized data)
- Pixel-diff comparison with tolerance thresholds
- Automatic baseline generation on first run
- Cross-platform consistency (CI uses same environment)

**Baseline Management**:

- Baselines stored in `client/e2e/tests/*.spec.ts-snapshots/`
- Committed to git for consistency across environments
- Update baselines when UI changes are intentional
- Review snapshot diffs in PR review process

### Accessibility Testing

Accessibility tests ensure WCAG 2.1 Level AA compliance using **@axe-core/playwright**.

**Test File**: `client/e2e/tests/13-accessibility.spec.ts` (tagged with `@accessibility`)

**Running Accessibility Tests**:

```bash
# Run accessibility tests only
npm run test:e2e:a11y

# Run all E2E tests including accessibility
npm run test:e2e

# Run specific accessibility test
npm run test:e2e -- 13-accessibility.spec.ts
```

**Coverage**:

- Project list page (navigation, buttons, links)
- Project detail page (complex layouts)
- Form accessibility (inputs, labels, error messages)
- Modal dialogs (focus trapping, ARIA roles)
- RAID management (tables, lists, forms)
- Proposal workflow (multi-step forms)
- Error states (proper ARIA live regions)
- Navigation menu (keyboard accessible)

**Creating Accessibility Tests**:

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests @accessibility', () => {
  test('should have no a11y violations on project list', async ({ page }) => {
    await page.goto('/projects');
    
    // Run axe accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    // Assert no violations found
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper ARIA labels on buttons', async ({ page }) => {
    await page.goto('/projects');
    
    // Check all buttons have accessible names
    const buttons = await page.locator('button').all();
    for (const button of buttons) {
      const ariaLabel = await button.getAttribute('aria-label');
      const textContent = await button.textContent();
      expect(ariaLabel || textContent).toBeTruthy();
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/projects');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
    
    // Test Enter key activation
    await page.keyboard.press('Enter');
    // Verify action triggered
  });
  
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/projects');
    
    // Verify h1 exists and is unique
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
    
    // Verify heading levels don't skip (h1 → h2 → h3, not h1 → h3)
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    // Validate hierarchy logic
  });
});
```

**Accessibility Test Coverage**:

- ✅ **WCAG 2.1 Level A compliance** (critical requirements)
- ✅ **WCAG 2.1 Level AA compliance** (standard requirements)
- ✅ **ARIA labels and roles** (semantic HTML, proper roles)
- ✅ **Keyboard navigation** (tab order, focus management)
- ✅ **Focus indicators** (visible focus states)
- ✅ **Heading hierarchy** (proper document structure)
- ✅ **Color contrast** (4.5:1 for normal text, 3:1 for large text)
- ✅ **Alt text for images** (meaningful descriptions)
- ✅ **Form labels** (associated labels for inputs)
- ✅ **ARIA live regions** (dynamic content announcements)

**Axe Rules Tested**:

The `@axe-core/playwright` library tests 90+ accessibility rules including:
- `button-name`: Buttons must have accessible names
- `color-contrast`: Text must have sufficient contrast
- `label`: Form inputs must have labels
- `link-name`: Links must have accessible names
- `aria-*`: ARIA attributes must be valid and properly used
- `heading-order`: Heading levels should not be skipped
- `image-alt`: Images must have alt text
- `landmark-*`: Page must have proper landmark regions

**CI Enforcement**:

Accessibility tests run in CI when the `run-e2e` label is applied to PRs. Any violations will fail the build, ensuring accessibility is maintained.

### Test Execution Guidelines

**CI Integration**:

- E2E tests are **disabled in CI by default** (by design - backend E2E covered via CLI client)
- **Enable E2E in specific PRs**: Add the `run-e2e` label to your PR
- CI configuration: 2 retries for flaky test mitigation, single worker for stability
- Test execution: Headless Chromium, viewport 1280x720
- Artifacts: Screenshots and videos on failure, HTML report generated
- Backend coordination: E2E tests require backend API running (auto-started in CI when enabled)

**CI Workflow** (`.github/workflows/client-ci.yml`):

```yaml
# E2E tests only run when PR has 'run-e2e' label
- name: Run E2E Tests
  if: contains(github.event.pull_request.labels.*.name, 'run-e2e')
  run: |
    # Start backend (docker or local)
    # Wait for health check
    npm run test:e2e
```

**Label Usage**:

```bash
# Add run-e2e label to PR (enables E2E in CI)
gh pr edit <PR_NUMBER> --add-label "run-e2e"

# Remove label (disables E2E in subsequent runs)
gh pr edit <PR_NUMBER> --remove-label "run-e2e"
```

**Local Development**:

1. **Start backend** (see Prerequisites above)
   ```bash
   # Option 1: Docker
   cd ~/projects/AI-Agent-Framework && docker compose up -d
   
   # Option 2: Local Python
   cd ~/projects/AI-Agent-Framework
   source .venv/bin/activate
   cd apps/api && PROJECT_DOCS_PATH=../../projectDocs uvicorn main:app --reload
   ```

2. **Verify backend health**:
   ```bash
   curl http://localhost:8000/health
   # Expected: {"status":"healthy","docs_path":"..."}
   ```

3. **Run E2E tests**:
   ```bash
   cd client
   npm run test:e2e
   ```

4. **Review failures**:
   - HTML report: `open playwright-report/index.html`
   - Screenshots: `client/test-results/` directory
   - Videos: `client/test-results/` directory (on failure)
   - Traces: View with `npx playwright show-trace <trace.zip>`

5. **Re-run failed tests**:
   ```bash
   npm run test:e2e -- --last-failed
   ```

**Test Isolation**:

- All tests use **unique project keys** (timestamp + random suffix)
- Tests can run in **parallel** or in any order (no dependencies)
- No shared state between tests (each test is self-contained)
- Each test cleans up its own data (automatic via fixtures)
- API helpers ensure data consistency

**Performance Guidelines**:

- **Full E2E suite**: Completes in < 10 minutes (typically 5-7 minutes)
- **Individual test**: Target < 30 seconds per test
- **Setup optimization**: Use API helpers for data setup (10x faster than UI)
- **Verification strategy**: Verify via UI (user perspective), confirm via API (data integrity)
- **Parallel execution**: Enabled by default (`fullyParallel: true` in playwright.config.ts)
- **Worker configuration**: CI uses 1 worker, local dev uses CPU cores

**Execution Time Breakdown**:

| Test Suite                  | Tests | Time    |
| --------------------------- | ----- | ------- |
| 01-project-creation         | 1     | ~15s    |
| 02-proposal-workflow        | 1     | ~20s    |
| 03-apply-proposal           | 1     | ~25s    |
| 04-navigation-artifacts     | 3     | ~30s    |
| 05-error-handling           | 2     | ~20s    |
| 06-raid-crud                | 10    | ~90s    |
| 07-raid-list-views          | 10    | ~60s    |
| 08-performance              | 3     | ~30s    |
| 09-workflow-transitions     | 4     | ~40s    |
| 10-step2-workflow           | 7     | ~90s    |
| 11-page-object-examples     | 3     | ~30s    |
| 12-visual-regression        | 8     | ~45s    |
| 13-accessibility            | 6     | ~30s    |
| **Total**                   | ~60   | **~525s (8.75 min)** |

*Note: Times are approximate and may vary based on system performance and network conditions.*

- Full E2E suite should complete in < 10 minutes
- Use API helpers for setup (faster than UI)
- Verify via UI, confirm via API
- Parallel execution enabled (configurable workers)

## Setup

### Prerequisites

```bash
# Ensure you have Node.js 20+ installed
node --version  # Should be 20.x or higher

# Install dependencies
cd client
npm install
```

### Configuration Files

- **`vitest.config.ts`** - Unit and integration test configuration
- **`playwright.config.ts`** - E2E test configuration
- **`tsconfig.json`** - TypeScript configuration for tests

### Test Fixtures

E2E tests use custom fixtures defined in `client/e2e/fixtures.ts`:

- **`apiHelper`** - Helper for API calls (setup/teardown)
- **`uniqueProjectKey`** - Generates unique project keys for isolation

## Running Tests

### Unit Tests

```bash
cd client

# Run all unit tests
npm test

# Run in watch mode (for development)
npm run test:watch

# Run specific test file
npm test -- src/test/unit/chat/commandParser.test.ts

# Run tests matching pattern
npm test -- --grep "RAID"
```

### Integration Tests

```bash
cd client

# Run all tests (includes integration)
npm test

# Run only integration tests
npm test -- src/test/integration
```

### E2E Tests

```bash
cd client

# Run all E2E tests
npm run test:e2e

# Run specific test file
npm run test:e2e -- 06-raid-crud.spec.ts

# Run in headed mode (see browser)
npm run test:e2e -- --headed

# Run in debug mode
npm run test:e2e -- --debug

# Generate HTML report
npm run test:e2e -- --reporter=html
```

### API Smoke Tests

```bash
cd client

# Run API connectivity test
npm run test:api
```

## Writing Tests

### Unit Test Guidelines

1. **Isolate dependencies**: Use mocks/stubs for external dependencies
2. **Test one thing**: Each test should verify a single behavior
3. **Use descriptive names**: `should render error message when API fails`
4. **Arrange-Act-Assert**: Structure tests clearly
5. **Avoid implementation details**: Test behavior, not internals

**Bad Example**:

```typescript
it('test 1', () => {
  const comp = new MyComponent();
  comp.internalMethod(); // Testing implementation
  expect(comp._privateState).toBe(true); // Accessing internals
});
```

**Good Example**:

```typescript
it('should show error message when validation fails', () => {
  render(<MyComponent />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: '' } });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  expect(screen.getByText(/required/i)).toBeInTheDocument();
});
```

### Integration Test Guidelines

1. **Use MSW for HTTP mocking**: Provides realistic request/response handling
2. **Test success and error paths**: Cover both happy and sad paths
3. **Verify request structure**: Check that API calls have correct data
4. **Setup/teardown properly**: Use beforeAll, afterEach, afterAll hooks
5. **Test realistic scenarios**: Use data that mirrors production

### E2E Test Guidelines

1. **Setup via API**: Use API helpers for fast, reliable test setup
2. **Verify via UI**: Test what users see and interact with
3. **Verify via API**: Confirm data integrity after UI operations
4. **Flexible selectors**: Use multiple selector patterns for robustness
5. **Wait strategies**: Use appropriate waits (networkidle, visible, etc.)
6. **Isolation**: Each test should be independent (use unique project keys)

**Selector Best Practices**:

```typescript
// ✅ Good: Multiple fallback selectors
await page.click('button:has-text("Submit"), button[type="submit"]');

// ✅ Good: Semantic selectors
await page.click('button[aria-label="Close dialog"]');

// ❌ Bad: Brittle class-based selector
await page.click('.btn-primary-submit-form');
```

**Hybrid Testing Pattern**:

```typescript
test('should update item', async ({ page, apiHelper, uniqueProjectKey }) => {
  // 1. Setup via API (fast)
  const item = await apiHelper.createItem(uniqueProjectKey, {
    title: 'Original',
  });

  // 2. Perform action via UI (user perspective)
  await navigateToProject(page, uniqueProjectKey);
  await page.fill('input[name="title"]', 'Updated');
  await page.click('button:has-text("Save")');

  // 3. Verify via UI (what user sees)
  await expect(page.locator('text=Updated')).toBeVisible();

  // 4. Verify via API (data integrity)
  const updated = await apiHelper.getItem(uniqueProjectKey, item.id);
  expect(updated.title).toBe('Updated');
});
```

### Mocking Strategies

#### Component Mocks (Unit Tests)

```typescript
import { vi } from 'vitest';

// Mock entire module
vi.mock('../api/raidApi', () => ({
  raidApi: {
    getRaidItems: vi.fn(() => Promise.resolve([])),
  },
}));

// Mock specific function
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));
```

#### HTTP Mocks (Integration Tests)

```typescript
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer(
  http.get('/api/projects/:key/raid', () => {
    return HttpResponse.json([]);
  }),
  http.post('/api/projects/:key/raid', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 1, ...body }, { status: 201 });
  }),
  http.get('/api/error', () => {
    return HttpResponse.json({ error: 'Server error' }, { status: 500 });
  }),
);
```

## CI/CD Integration

### GitHub Actions Workflow

Tests run automatically on:

- Every push to any branch
- Every pull request

**Workflow**: `.github/workflows/ci.yml`

**Jobs**:

1. **Lint**: Code style and TypeScript checks
2. **Unit & Integration Tests**: All Vitest tests with coverage
3. **Build**: TypeScript compilation and Vite build
4. **Bundle Size Check**: Ensures main bundle < 500KB gzipped
5. **Documentation Validation**: Verifies tests/README.md is current
6. **E2E Tests**: Playwright tests (on main or with `run-e2e` label)
7. **Lighthouse CI**: Performance/accessibility checks (on main or with `run-lighthouse` label)

### Quality Gates

All PRs must pass these quality gates before merging:

#### Required Gates (Always Run)

1. **PR Template Validation**: All required sections present and filled
2. **Repository Hygiene**: No forbidden env files committed
3. **Linting**: ESLint passes with no errors
4. **Test Coverage**: 80%+ coverage for lines, functions, branches, statements
5. **Build Success**: TypeScript compiles and Vite builds without warnings
6. **Bundle Size**: Main bundle < 500KB gzipped
7. **Console Errors**: No console.* in production build (warning)
8. **Documentation**: tests/README.md is current and complete
9. **Unit Tests**: All tests pass

#### Optional Gates (Main Branch or Labeled)

10. **API Integration**: Tests against real backend API (auto-triggered on API code changes)
11. **E2E Tests**: Full browser tests (add `run-e2e` label to PR)
12. **Lighthouse CI**: Performance ≥ 80, Accessibility ≥ 90 (add `run-lighthouse` label to PR)

### CI Test Commands

```bash
# Lint
npm run lint

# Unit + Integration tests with coverage
npm run test:coverage

# Build
npm run build

# Bundle size check
npm run check:bundle-size

# Documentation validation
npm run check:docs

# E2E tests
npm run test:e2e

# Lighthouse CI (requires preview server running)
npm run preview &
npm run lighthouse:ci
```

### CI Optimization

- **Parallelization**: Tests run in parallel where possible
- **Caching**: node_modules cached between runs
- **Coverage Upload**: Coverage reports uploaded as artifacts
- **Smart E2E**: E2E tests only run when needed (main branch or labeled)
- **Lighthouse on Demand**: Performance tests triggered via label

### Artifacts

CI uploads these artifacts for debugging:

- **coverage-report**: Test coverage HTML report
- **playwright-report**: E2E test results with traces
- **test-screenshots**: Screenshots from failed E2E tests
- **backend-logs**: API logs from E2E tests
- **lighthouse-report**: Performance/accessibility reports

**Downloading artifacts**:

```bash
# List run artifacts
gh run view <RUN_ID>

# Download specific artifact
gh run download <RUN_ID> -n coverage-report
```

### Triggering Optional Gates

**E2E Tests**:

```bash
gh pr edit <PR_NUMBER> --add-label run-e2e
```

**Lighthouse CI**:

```bash
gh pr edit <PR_NUMBER> --add-label run-lighthouse
```

### CI Failure Remediation

See **[docs/ci-cd.md](../../docs/ci-cd.md)** for comprehensive troubleshooting guide with:

- Detailed failure scenarios
- Step-by-step remediation instructions
- Common issues and solutions
- Performance optimization tips
- Accessibility compliance guide

## Coverage Requirements

### Overall Target: 80%+ (CI Enforced)

The CI pipeline enforces these minimum coverage thresholds:

- **Lines**: 80%
- **Functions**: 80%
- **Branches**: 80%
- **Statements**: 80%

PRs that reduce coverage below these thresholds will fail CI.

### Component-Level Targets

- **Unit tests**: Target 85%+ coverage for new components
- **Integration tests**: Critical API paths covered
- **E2E tests**: All major user journeys covered

### Measuring Coverage

```bash
cd client

# Run tests with coverage
npm run test:coverage

# Generate HTML coverage report
npm test -- --coverage --reporter=html

# View report
open coverage/index.html

# Check coverage summary
cat coverage/coverage-summary.json | jq '.total'
```

### Coverage Configuration

Coverage settings are configured in `vitest.config.ts`:

```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html', 'lcov'],
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 80,
    statements: 80,
  },
}
```

### Coverage by Area

| Area            | Unit | Integration | E2E |
| --------------- | ---- | ----------- | --- |
| RAID Management | ✅   | ✅          | ✅  |
| Workflow State  | ✅   | ✅          | ⚠️  |
| Proposals       | ✅   | ⚠️          | ✅  |
| Navigation      | ✅   | N/A         | ✅  |
| Error Handling  | ✅   | ✅          | ✅  |
| Chat System     | ✅   | ⚠️          | ⚠️  |

**Legend**: ✅ Comprehensive | ⚠️ Partial | ❌ None | N/A Not Applicable

## Troubleshooting

### Common Issues

#### Vitest: Module resolution errors

**Problem**: `Cannot find module '@/components/...'`

**Solution**: Check `vitest.config.ts` has correct alias configuration:

```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
},
```

#### Playwright: Tests fail locally but pass in CI

**Problem**: Timing issues or environment differences

**Solutions**:

- Increase timeouts: `test.setTimeout(60000)`
- Add explicit waits: `await page.waitForLoadState('networkidle')`
- Check viewport size matches CI: 1280x720
- Verify backend is running and healthy: `curl http://localhost:8000/health`

#### Playwright: Backend connection refused

**Problem**: E2E tests fail with "ECONNREFUSED" errors

**Solutions**:

1. **Verify backend is running**:
   ```bash
   curl http://localhost:8000/health
   # Should return: {"status":"healthy","docs_path":"..."}
   ```

2. **Start backend if not running**:
   ```bash
   # Option 1: Docker
   cd ~/projects/AI-Agent-Framework && docker compose up -d
   
   # Option 2: Local Python
   cd ~/projects/AI-Agent-Framework
   source .venv/bin/activate
   cd apps/api && PROJECT_DOCS_PATH=../../projectDocs uvicorn main:app --reload
   ```

3. **Check environment variables**:
   ```bash
   # In client/.env.e2e (or set in shell)
   API_BASE_URL=http://localhost:8000
   E2E_BASE_URL=http://localhost:3000
   ```

4. **Use automated setup script**:
   ```bash
   cd client
   ./e2e/setup-backend.sh
   ```

#### Playwright: Selectors not found

**Problem**: `page.locator('button:has-text("Submit")').click()` fails

**Solutions**:

- Use flexible selectors with multiple fallbacks:
  ```typescript
  // Good: Multiple fallback selectors
  await page.click('button:has-text("Submit"), button[type="submit"], [aria-label="Submit"]');
  ```
- Add wait conditions:
  ```typescript
  await page.waitForSelector('button:has-text("Submit")', { state: 'visible' });
  await page.click('button:has-text("Submit")');
  ```
- Use page object methods (built-in waits and fallbacks):
  ```typescript
  const projectView = new ProjectViewPage(page);
  await projectView.createProject(key, name);
  ```
- Debug DOM state:
  ```typescript
  // Take screenshot before action
  await page.screenshot({ path: 'debug-before-click.png' });
  
  // Log available elements
  const buttons = await page.locator('button').all();
  for (const btn of buttons) {
    console.log('Button text:', await btn.textContent());
  }
  ```

#### Playwright: Test flakiness (intermittent failures)

**Problem**: Tests pass sometimes, fail other times

**Solutions**:

1. **Replace hard waits with smart waits**:
   ```typescript
   // ❌ Bad: Arbitrary timeout
   await page.waitForTimeout(1000);
   
   // ✅ Good: Wait for specific condition
   await page.waitForLoadState('networkidle');
   await page.waitForSelector('.data-loaded');
   ```

2. **Use auto-waiting assertions**:
   ```typescript
   // ✅ Built-in retry logic (10s default)
   await expect(page.locator('.success')).toBeVisible();
   ```

3. **Increase retry count in playwright.config.ts**:
   ```typescript
   retries: process.env.CI ? 2 : 1,
   ```

4. **Add explicit state verification**:
   ```typescript
   // Wait for API call to complete
   await page.waitForResponse(resp => 
     resp.url().includes('/api/projects') && resp.status() === 200
   );
   ```

#### Playwright: Visual regression false positives

**Problem**: Visual tests fail due to minor pixel differences

**Solutions**:

- Increase tolerance in test:
  ```typescript
  await expect(page).toHaveScreenshot('page.png', {
    maxDiffPixels: 200,  // Increase from 100
    threshold: 0.3,       // Increase from 0.2
  });
  ```
- Mask dynamic content:
  ```typescript
  await expect(page).toHaveScreenshot('page.png', {
    mask: [
      page.locator('.timestamp'),
      page.locator('.dynamic-id'),
      page.locator('.loading-spinner'),
    ],
  });
  ```
- Update baseline if change is intentional:
  ```bash
  npm run test:e2e:update-snapshots
  ```
- Use consistent viewport (set in playwright.config.ts):
  ```typescript
  use: {
    viewport: { width: 1280, height: 720 },
  }
  ```

#### Playwright: Accessibility test violations

**Problem**: Axe scan reports violations

**Solutions**:

1. **Review specific violations**:
   ```typescript
   const results = await new AxeBuilder({ page }).analyze();
   console.log('Violations:', JSON.stringify(results.violations, null, 2));
   ```

2. **Common fixes**:
   - Missing ARIA labels: Add `aria-label` to buttons/links
   - Color contrast: Adjust text/background colors
   - Missing alt text: Add `alt` attribute to images
   - Invalid ARIA: Use valid ARIA roles and attributes
   - Heading hierarchy: Don't skip heading levels (h1→h2→h3)

3. **Exclude specific rules temporarily** (use sparingly):
   ```typescript
   const results = await new AxeBuilder({ page })
     .disableRules(['color-contrast'])  // Temporarily disable
     .analyze();
   ```

4. **Test specific components in isolation**:
   ```typescript
   const results = await new AxeBuilder({ page })
     .include('.my-component')  // Test only this component
     .analyze();
   ```

#### MSW: Handlers not matching requests

**Problem**: MSW not intercepting requests

**Solutions**:

- Verify server is started: `beforeAll(() => server.listen())`
- Check URL patterns match exactly
- Log unhandled requests: `server.listen({ onUnhandledRequest: 'warn' })`

#### React Testing Library: "Unable to find element"

**Problem**: Element not rendered or query incorrect

**Solutions**:

- Use `screen.debug()` to see current DOM
- Use `findBy*` queries for async elements: `await screen.findByText('Loading')`
- Check for accessibility issues: Use `getByRole` when possible

### Debug Mode

#### Vitest Debug

```bash
# Run with Node debugger
node --inspect-brk ./node_modules/.bin/vitest --run

# Then open chrome://inspect in Chrome
```

#### Playwright Debug

```bash
# Run in debug mode (pauses at each step)
npm run test:e2e -- --debug

# Run with trace recording
npm run test:e2e -- --trace on

# View trace
npx playwright show-trace trace.zip
```

### Test Performance

#### Slow Unit Tests

- Check for unintentional async operations
- Avoid unnecessary renders
- Mock expensive operations

#### Slow E2E Tests

- Use API setup instead of UI setup
- Run tests in parallel: `fullyParallel: true` in `playwright.config.ts`
- Skip unnecessary navigation: reuse page when possible

## Best Practices Summary

### ✅ Do

- Write tests for new features and bug fixes
- Test user behavior, not implementation
- Use semantic queries (`getByRole`, `getByLabelText`)
- Keep tests independent and isolated
- Use descriptive test names
- Clean up test data (fixtures do this automatically in E2E)
- Mock external dependencies
- Test error scenarios

### ❌ Don't

- Test implementation details (private methods, state)
- Use brittle selectors (specific class names)
- Write flaky tests (add proper waits)
- Skip tests without good reason
- Commit failing tests
- Mock everything (test realistic scenarios)
- Write mega-tests (one test should verify one thing)

## Resources

### Documentation

- [Vitest Docs](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Docs](https://playwright.dev/)
- [MSW Docs](https://mswjs.io/)

### Useful Commands Quick Reference

```bash
# Unit tests
npm test                          # Run all
npm test -- --watch              # Watch mode
npm test -- --coverage           # With coverage
npm test -- path/to/test.ts      # Single file

# E2E tests
npm run test:e2e                 # Run all
npm run test:e2e -- --headed     # See browser
npm run test:e2e -- --debug      # Debug mode
npm run test:e2e -- test.spec.ts # Single file

# Linting
npm run lint                     # Check all files

# Build
npm run build                    # Production build
```

## Getting Help

- **Test failures in CI**: Check GitHub Actions logs
- **Local test issues**: Run with `--reporter=verbose` for detailed output
- **Playwright issues**: Use `--headed` and `--debug` flags
- **Coverage questions**: Review HTML coverage report

For questions or issues, consult the development team or create an issue in the repository.
