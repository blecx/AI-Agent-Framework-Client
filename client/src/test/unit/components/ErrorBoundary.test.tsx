import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../../../components/ErrorBoundary';

function MaybeBoom({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Boom');
  }
  return <div>All good</div>;
}

describe('ErrorBoundary', () => {
  it('renders fallback on error and can recover after reset', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { rerender } = render(
      <ErrorBoundary>
        <MaybeBoom shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    // Verify error UI is displayed (try again button should be present)
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();

    // Swap children to a non-throwing render, then reset the boundary.
    rerender(
      <ErrorBoundary>
        <MaybeBoom shouldThrow={false} />
      </ErrorBoundary>,
    );

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    expect(screen.getByText('All good')).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it('displays report issue button and constructs GitHub issue URL', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const windowOpenSpy = vi
      .spyOn(window, 'open')
      .mockImplementation(() => null);

    render(
      <ErrorBoundary name="TestBoundary">
        <MaybeBoom shouldThrow={true} />
      </ErrorBoundary>,
    );

    const reportButton = screen.getByRole('button', { name: /report issue/i });
    expect(reportButton).toBeInTheDocument();

    fireEvent.click(reportButton);

    expect(windowOpenSpy).toHaveBeenCalled();
    const callArgs = windowOpenSpy.mock.calls[0];
    expect(callArgs[0]).toContain('github.com');
    expect(callArgs[0]).toContain('issues/new');
    expect(callArgs[0]).toContain('Boom');

    consoleSpy.mockRestore();
    windowOpenSpy.mockRestore();
  });

  it('uses optional name prop in error logging', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary name="CustomBoundary">
        <MaybeBoom shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    // In dev mode, console.error is called with boundary name
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('CustomBoundary'),
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });

  it('renders custom fallback when provided', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const customFallback = (error: Error, reset: () => void) => (
      <div>
        <h1>Custom Error UI</h1>
        <p>Error: {error.message}</p>
        <button onClick={reset}>Custom Reset</button>
      </div>
    );

    render(
      <ErrorBoundary fallback={customFallback}>
        <MaybeBoom shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /custom reset/i })).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('displays reload page button', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const reloadSpy = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadSpy },
      writable: true,
    });

    render(
      <ErrorBoundary>
        <MaybeBoom shouldThrow={true} />
      </ErrorBoundary>,
    );

    const reloadButton = screen.getByRole('button', { name: /reload page/i });
    expect(reloadButton).toBeInTheDocument();

    fireEvent.click(reloadButton);
    expect(reloadSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
