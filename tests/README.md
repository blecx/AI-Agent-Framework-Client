# Testing Guide

## Overview

This document covers testing patterns for the AI Agent Framework Client, including validation, error handling, and accessibility testing.

## Test Structure

```
client/src/test/          # Unit tests
client/src/components/__tests__/  # Component tests
client/e2e/              # End-to-end tests
```

## Running Tests

```bash
# All tests
npm test -- --run

# Watch mode (development)
npm test

# Coverage
npm test -- --coverage

# Specific test file
npm test -- accessibility.test.tsx
```

## Validation Testing

### Form Validation

Test form validation logic in isolation:

```typescript
import { validateField } from '../utils/validation';

describe('Form Validation', () => {
  it('validates required fields', () => {
    const error = validateField('email', '', { type: 'string', required: true });
    expect(error).toBe('Email is required');
  });

  it('validates email format', () => {
    const error = validateField('email', 'invalid', { type: 'string', pattern: '^[^@]+@[^@]+$' });
    expect(error).toBe('Invalid format');
  });
});
```

### Real-time Validation

Test that validation errors appear as users type:

```typescript
it('shows validation error immediately on invalid input', async () => {
  render(<ArtifactEditor templateId="test" projectKey="TEST" />);
  
  const emailInput = screen.getByLabelText(/email/i);
  await userEvent.type(emailInput, 'invalid');
  
  expect(screen.getByRole('alert')).toHaveTextContent('Invalid email format');
});
```

## Error Handling Testing

### Network Errors

Test retry logic and error recovery:

```typescript
import { useRetry } from '../hooks/useRetry';

it('retries failed operations', async () => {
  const operation = vi.fn()
    .mockRejectedValueOnce(new Error('Fail 1'))
    .mockRejectedValueOnce(new Error('Fail 2'))
    .mockResolvedValueOnce({ success: true });

  const { executeWithRetry } = useRetry({ maxAttempts: 3 });
  const result = await executeWithRetry(operation);

  expect(operation).toHaveBeenCalledTimes(3);
  expect(result).toEqual({ success: true });
});
```

### API Error Responses

Mock API errors and verify user-friendly messages:

```typescript
import MockAdapter from 'axios-mock-adapter';
import apiClient from '../services/apiClient';

it('handles API errors gracefully', async () => {
  const mock = new MockAdapter(apiClient.client);
  mock.onGet('/projects').reply(500, { detail: 'Server error' });

  await expect(apiClient.listProjects()).rejects.toThrow('Server error');
});
```

### Optimistic Updates

Test optimistic UI updates with rollback on error:

```typescript
it('rolls back optimistic update on save error', async () => {
  const onSave = vi.fn().mockRejectedValueOnce(new Error('Save failed'));
  const { rerender } = render(
    <ArtifactEditor
      templateId="test"
      projectKey="TEST"
      initialData={{ name: 'Original' }}
      onSave={onSave}
    />
  );

  // Update field
  const nameInput = screen.getByLabelText(/name/i);
  await userEvent.clear(nameInput);
  await userEvent.type(nameInput, 'Updated');

  // Try to save (will fail)
  const saveButton = screen.getByRole('button', { name: /save/i });
  await userEvent.click(saveButton);

  // Verify rollback
  await waitFor(() => {
    expect(screen.getByLabelText(/name/i)).toHaveValue('Original');
  });
});
```

## Accessibility Testing

### ARIA Labels

Verify all interactive elements have proper ARIA attributes:

```typescript
it('has proper ARIA labels', () => {
  render(<ConfirmDialog isOpen={true} {...props} />);

  const dialog = screen.getByRole('dialog');
  expect(dialog).toHaveAttribute('aria-modal', 'true');
  expect(dialog).toHaveAttribute('aria-labelledby');
  expect(dialog).toHaveAttribute('aria-describedby');
});
```

### Keyboard Navigation

Test keyboard shortcuts (Tab, Enter, Escape):

```typescript
it('supports Escape to cancel', async () => {
  const onCancel = vi.fn();
  render(<ArtifactEditor {...props} onCancel={onCancel} />);

  await userEvent.keyboard('{Escape}');
  expect(onCancel).toHaveBeenCalled();
});

it('supports Enter to submit', async () => {
  const onSave = vi.fn();
  render(<ArtifactEditor {...props} onSave={onSave} />);

  const input = screen.getByRole('textbox');
  await userEvent.type(input, 'test{Enter}');
  
  expect(onSave).toHaveBeenCalled();
});
```

### Screen Reader Support

Test that elements are announced properly:

```typescript
it('announces errors to screen readers', async () => {
  render(<ArtifactEditor {...props} />);

  const input = screen.getByLabelText(/email/i);
  await userEvent.type(input, 'invalid');

  const error = screen.getByRole('alert');
  expect(error).toHaveAttribute('aria-live', 'polite');
  expect(error).toHaveTextContent('Invalid email format');
});
```

## Lighthouse Testing

Run Lighthouse accessibility audit manually:

```bash
# Start dev server
npm run dev

# In another terminal, run Lighthouse
npx lighthouse http://localhost:5173 --only-categories=accessibility --output=html --output-path=./lighthouse-report.html
```

Target score: ≥ 90

## Common Patterns

### Test Data Builders

Use test helpers for creating consistent test data:

```typescript
import { RAIDTestHelper } from '../test/helpers/RAIDTestHelper';

const testRaid = RAIDTestHelper.createTestRaid({
  type: 'risk',
  priority: 'high',
});
```

### Mocking API Calls

Mock API responses for deterministic tests:

```typescript
beforeEach(() => {
  vi.mock('../services/apiClient', () => ({
    default: {
      listProjects: vi.fn().mockResolvedValue({ success: true, data: [] }),
    },
  }));
});
```

### Waiting for Async Updates

Use `waitFor` for async state updates:

```typescript
import { waitFor } from '@testing-library/react';

await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument();
});
```

## Best Practices

1. **Test user behavior, not implementation** - Focus on what users see and do
2. **Use semantic queries** - Prefer `getByRole`, `getByLabelText` over `getByTestId`
3. **Test accessibility** - Every interactive element should be keyboard accessible
4. **Mock external dependencies** - Keep tests fast and reliable
5. **Write descriptive test names** - Test names should describe expected behavior
6. **Test error cases** - Don't just test the happy path
7. **Keep tests focused** - One assertion per test when possible

## Troubleshooting

### Tests timeout

Increase timeout for slow operations:

```typescript
it('loads data', async () => {
  // ... test code
}, 10000); // 10 second timeout
```

### Mock not working

Clear mocks between tests:

```typescript
afterEach(() => {
  vi.clearAllMocks();
});
```

### Component not updating

Ensure you're using async utilities:

```typescript
await userEvent.type(input, 'text');
await waitFor(() => expect(screen.getByText('Updated')).toBeInTheDocument());
```

## Resources

- [Testing Library Docs](https://testing-library.com/)
- [Vitest Docs](https://vitest.dev/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Accessibility Checker](https://wave.webaim.org/)
