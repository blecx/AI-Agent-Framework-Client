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
    expect(screen.getByText('Boom')).toBeInTheDocument();

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
});
