import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';

describe('Modal', () => {
  it('renders when open and closes on Escape', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Test modal">
        <div>Body</div>
      </Modal>,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes when overlay clicked (default)', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Test modal">
        <div>Body</div>
      </Modal>,
    );

    const dialog = screen.getByRole('dialog');
    const overlay = dialog.parentElement;
    expect(overlay).not.toBeNull();

    if (overlay) fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('traps focus inside modal with Tab and Shift+Tab', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">Outside</button>
        <Modal isOpen onClose={vi.fn()} title="Focusable modal">
          <button type="button">First</button>
          <button type="button">Last</button>
        </Modal>
      </>,
    );

    const closeButton = screen.getByRole('button', { name: /close dialog/i });
    const firstButton = screen.getByRole('button', { name: 'First' });
    const lastButton = screen.getByRole('button', { name: 'Last' });

    await waitFor(() => {
      expect(closeButton).toHaveFocus();
    });

    await user.tab();
    expect(firstButton).toHaveFocus();

    await user.tab();
    expect(lastButton).toHaveFocus();

    await user.tab();
    expect(closeButton).toHaveFocus();

    await user.tab({ shift: true });
    expect(lastButton).toHaveFocus();
  });
});
