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

**Test Files**:

1. `01-project-creation.spec.ts` - Project creation flow
2. `02-proposal-workflow.spec.ts` - Create proposals via UI
3. `03-apply-proposal.spec.ts` - Apply proposals and verify
4. `04-navigation-artifacts.spec.ts` - Navigation between pages
5. `05-error-handling.spec.ts` - Error scenarios and recovery
6. `06-raid-crud.spec.ts` - RAID CRUD operations (10 tests)
7. `07-raid-list-views.spec.ts` - RAID list/navigation (10 tests)

**Coverage Areas**:

- Project creation and navigation
- Proposal workflow (create, apply, approve)
- RAID management (CRUD, filtering, sorting)
- Error handling (validation, network errors)
- Navigation and routing

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

**Available Page Objects**:

- **`ProjectViewPage`**: Project list, creation, navigation
- **`ArtifactEditorPage`**: Artifact viewing and editing
- **`ProposalListPage`**: Proposal list view and creation
- **`ProposalReviewModalPage`**: Proposal diff visualization and review
- **`AuditViewerPage`**: Audit results display and interaction

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

Visual regression tests capture screenshots and compare them to baselines:

**Running Visual Tests**:

```bash
# Run visual regression tests
npm run test:e2e:visual

# Update baselines after intentional UI changes
npm run test:e2e:update-snapshots
```

**Creating Visual Tests**:

```typescript
test('should match baseline for project list', async ({ page }) => {
  await page.goto('/projects');
  await page.waitForLoadState('networkidle');
  
  // Compare full page
  await expect(page).toHaveScreenshot('project-list.png', {
    maxDiffPixels: 100,  // Allow small differences
    threshold: 0.2,      // 20% tolerance
  });
  
  // Compare specific component
  await expect(page.locator('.project-card')).toHaveScreenshot('project-card.png');
  
  // Mask dynamic content
  await expect(page).toHaveScreenshot('proposals.png', {
    mask: [page.locator('.timestamp')],  // Hide timestamps
  });
});
```

**Visual Test Features**:

- Full page screenshots
- Component-level screenshots
- Responsive testing (mobile, tablet, desktop)
- Dark mode testing
- Error state screenshots
- Timestamp masking for dynamic content

### Accessibility Testing

Accessibility tests ensure WCAG 2.1 AA compliance using **@axe-core/playwright**:

**Running Accessibility Tests**:

```bash
npm run test:e2e:a11y
```

**Creating Accessibility Tests**:

```typescript
import AxeBuilder from '@axe-core/playwright';

test('should have no a11y violations', async ({ page }) => {
  await page.goto('/projects');
  
  // Run axe accessibility scan
  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  
  expect(accessibilityScanResults.violations).toEqual([]);
});

test('should have proper ARIA labels', async ({ page }) => {
  await page.goto('/projects');
  const button = page.locator('button:has-text("Create")');
  await expect(button).toHaveAttribute('aria-label', /.+/);
});

test('should support keyboard navigation', async ({ page }) => {
  await page.goto('/projects');
  await page.keyboard.press('Tab');
  const focused = page.locator(':focus');
  await expect(focused).toBeVisible();
});
```

**Accessibility Test Coverage**:

- WCAG 2.1 Level A and AA compliance
- Proper ARIA labels and roles
- Keyboard navigation support
- Focus indicators
- Heading hierarchy
- Color contrast
- Alt text for images

### Test Execution Guidelines

**CI Integration**:

- E2E tests are **disabled in CI by default** (by design)
- Use the `run-e2e` label to enable E2E in specific PRs
- Backend E2E testing is done via the backend CLI client
- Client E2E tests are for local development and debugging

**Local Development**:

1. Start backend (see Prerequisites above)
2. Run tests: `npm run test:e2e`
3. Review failures in `playwright-report/` HTML report
4. Re-run failed tests: `npm run test:e2e -- --last-failed`

**Test Isolation**:

- All tests use unique project keys (timestamp + random)
- Tests can run in parallel or in any order
- No shared state between tests
- Each test cleans up its own data

**Performance Guidelines**:

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

**Workflow**: `.github/workflows/client-ci.yml`

**Jobs**:

1. **Lint**: Code style and TypeScript checks
2. **Unit & Integration Tests**: All Vitest tests
3. **E2E Tests**: Playwright tests (Chromium only in CI)

### CI Test Commands

```bash
# Lint
npm run lint

# Unit + Integration tests
npm test -- --run

# E2E tests
npm run test:e2e
```

### CI Optimization

- **Parallelization**: Tests run in parallel where possible
- **Caching**: node_modules cached between runs
- **Selective execution**: Only E2E tests skip UI components tests in CI

## Coverage Requirements

### Overall Target: 80%+

- **Unit tests**: Target 85%+ coverage
- **Integration tests**: Critical API paths covered
- **E2E tests**: All major user journeys covered

### Measuring Coverage

```bash
cd client

# Run tests with coverage
npm test -- --coverage

# Generate HTML coverage report
npm test -- --coverage --reporter=html

# View report
open coverage/index.html
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
