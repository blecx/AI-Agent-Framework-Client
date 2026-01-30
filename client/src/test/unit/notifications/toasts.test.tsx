import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ToastProvider } from '../../../components/ToastContext';
import ToastContainer from '../../../components/ToastContainer';
import { notify } from '../../../notifications/notificationBus';

function TestToasts() {
  return (
    <ToastProvider>
      <ToastContainer />
    </ToastProvider>
  );
}

describe('Toast notifications', () => {
  it('queues multiple notifications and auto-dismisses after 5 seconds', async () => {
    vi.useFakeTimers();

    render(<TestToasts />);

    // Ensure effects (subscription) have run.
    await act(async () => {});

    act(() => {
      notify({ type: 'info', message: 'First' });
      notify({ type: 'error', message: 'Second' });
    });

    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.queryByText('First')).not.toBeInTheDocument();
    expect(screen.queryByText('Second')).not.toBeInTheDocument();

    vi.useRealTimers();
  });
});
