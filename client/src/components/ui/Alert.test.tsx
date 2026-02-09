import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Alert from './Alert';

describe('Alert', () => {
  describe('Rendering', () => {
    it('renders alert message', () => {
      render(<Alert variant="info" message="Test message" />);
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('renders with title', () => {
      render(<Alert variant="info" title="Important" message="Test message" />);
      expect(screen.getByText('Important')).toBeInTheDocument();
    });

    it('renders without title', () => {
      render(<Alert variant="info" message="Test message" />);
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    it('renders info variant correctly', () => {
      render(<Alert variant="info" message="Info message" />);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('alert-info');
    });

    it('renders success variant correctly', () => {
      render(<Alert variant="success" message="Success message" />);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('alert-success');
    });

    it('renders warning variant correctly', () => {
      render(<Alert variant="warning" message="Warning message" />);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('alert-warning');
    });

    it('renders error variant correctly', () => {
      render(<Alert variant="error" message="Error message" />);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('alert-error');
    });

    it('renders ReactNode message', () => {
      render(
        <Alert
          variant="info"
          message={
            <div>
              <strong>Bold</strong> text
            </div>
          }
        />,
      );
      expect(screen.getByText('Bold')).toBeInTheDocument();
      expect(screen.getByText('text')).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('renders action button when provided', () => {
      const handleAction = vi.fn();
      render(
        <Alert
          variant="info"
          message="Test"
          action={{ label: 'Retry', onClick: handleAction }}
        />,
      );
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    it('calls action onClick when action button clicked', async () => {
      const user = userEvent.setup();
      const handleAction = vi.fn();
      render(
        <Alert
          variant="error"
          message="Test"
          action={{ label: 'Retry', onClick: handleAction }}
        />,
      );
      await user.click(screen.getByText('Retry'));
      expect(handleAction).toHaveBeenCalledTimes(1);
    });

    it('does not render action button when not provided', () => {
      render(<Alert variant="info" message="Test" />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Dismissibility', () => {
    it('renders dismiss button when onDismiss provided', () => {
      const handleDismiss = vi.fn();
      render(<Alert variant="info" message="Test" onDismiss={handleDismiss} />);
      expect(
        screen.getByRole('button', { name: /dismiss alert/i }),
      ).toBeInTheDocument();
    });

    it('calls onDismiss when dismiss button clicked', async () => {
      const user = userEvent.setup();
      const handleDismiss = vi.fn();
      render(<Alert variant="info" message="Test" onDismiss={handleDismiss} />);
      await user.click(screen.getByRole('button', { name: /dismiss alert/i }));
      expect(handleDismiss).toHaveBeenCalledTimes(1);
    });

    it('does not render dismiss button when onDismiss not provided', () => {
      render(<Alert variant="info" message="Test" />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has role="alert" for screen readers', () => {
      render(<Alert variant="info" message="Test" />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('has aria-live="assertive" for error variant', () => {
      render(<Alert variant="error" message="Test" />);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'assertive');
    });

    it('has aria-live="polite" for non-error variants', () => {
      render(<Alert variant="info" message="Test" />);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'polite');
    });

    it('marks icon as aria-hidden', () => {
      render(<Alert variant="info" message="Test" />);
      const icon = screen.getByRole('alert').querySelector('.alert-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('has aria-label on dismiss button', () => {
      const handleDismiss = vi.fn();
      render(<Alert variant="info" message="Test" onDismiss={handleDismiss} />);
      expect(
        screen.getByRole('button', { name: /dismiss alert/i }),
      ).toBeInTheDocument();
    });
  });
});
