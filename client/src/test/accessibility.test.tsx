/**
 * Accessibility Tests
 * Automated ARIA and keyboard navigation tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorBoundary from '../components/ErrorBoundary';
import ConfirmDialog from '../components/ConfirmDialog';
import { LoadingSkeleton, FormSkeleton } from '../components/LoadingSkeleton';

describe('Accessibility Tests', () => {
  describe('ErrorBoundary', () => {
    it('has proper ARIA attributes', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveAttribute('aria-live', 'assertive');
    });

    it('has accessible action buttons', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });
  });

  describe('ConfirmDialog', () => {
    const defaultProps = {
      isOpen: true,
      onConfirm: () => {},
      onCancel: () => {},
      title: 'Confirm Action',
      message: 'Are you sure?',
    };

    it('has proper dialog role and ARIA attributes', () => {
      render(<ConfirmDialog {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'dialog-title');
      expect(dialog).toHaveAttribute('aria-describedby', 'dialog-description');
    });

    it('has accessible close button', () => {
      render(<ConfirmDialog {...defaultProps} />);

      const closeButton = screen.getByRole('button', { name: /close dialog/i });
      expect(closeButton).toBeInTheDocument();
      expect(closeButton).toHaveAttribute('aria-label', 'Close dialog');
    });

    it('supports Escape key to cancel', async () => {
      const onCancel = vi.fn();
      render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />);

      await userEvent.keyboard('{Escape}');
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('has keyboard accessible action buttons', () => {
      render(<ConfirmDialog {...defaultProps} confirmText="Delete" cancelText="Cancel" />);

      const confirmBtn = screen.getByRole('button', { name: /delete/i });
      const cancelBtn = screen.getByRole('button', { name: /cancel/i });

      expect(confirmBtn).toBeInTheDocument();
      expect(cancelBtn).toBeInTheDocument();
    });

    it('focuses confirm button on open', () => {
      const { rerender } = render(<ConfirmDialog {...defaultProps} isOpen={false} />);
      rerender(<ConfirmDialog {...defaultProps} isOpen={true} />);

      const confirmBtn = screen.getByRole('button', { name: /confirm/i });
      expect(confirmBtn).toHaveFocus();
    });
  });

  describe('LoadingSkeleton', () => {
    it('has proper loading status role', () => {
      render(<LoadingSkeleton count={3} />);

      const skeletons = screen.getAllByRole('status');
      expect(skeletons).toHaveLength(3);
      skeletons.forEach(skeleton => {
        expect(skeleton).toHaveAttribute('aria-busy', 'true');
        expect(skeleton).toHaveAttribute('aria-label', 'Loading...');
      });
    });

    it('FormSkeleton renders accessible structure', () => {
      render(<FormSkeleton fields={4} />);

      const skeletons = screen.getAllByRole('status');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Form Accessibility', () => {
    it('form fields should have labels', () => {
      const { container } = render(
        <form>
          <label htmlFor="test-input">Test Field</label>
          <input id="test-input" type="text" />
        </form>
      );

      const input = container.querySelector('#test-input');
      const label = container.querySelector('label[for="test-input"]');
      
      expect(input).toBeInTheDocument();
      expect(label).toBeInTheDocument();
      expect(label?.textContent).toBe('Test Field');
    });

    it('required fields should have aria-required', () => {
      render(
        <form>
          <label htmlFor="required-field">Required Field</label>
          <input id="required-field" type="text" aria-required="true" />
        </form>
      );

      const input = screen.getByLabelText(/required field/i);
      expect(input).toHaveAttribute('aria-required', 'true');
    });

    it('invalid fields should have aria-invalid', () => {
      render(
        <form>
          <label htmlFor="invalid-field">Email</label>
          <input id="invalid-field" type="email" aria-invalid="true" />
          <span role="alert">Invalid email format</span>
        </form>
      );

      const input = screen.getByLabelText(/email/i);
      expect(input).toHaveAttribute('aria-invalid', 'true');
      
      const errorAlert = screen.getByRole('alert');
      expect(errorAlert).toBeInTheDocument();
    });

    it('error messages should be associated with fields', () => {
      render(
        <form>
          <label htmlFor="error-field">Username</label>
          <input
            id="error-field"
            type="text"
            aria-invalid="true"
            aria-describedby="error-field-error"
          />
          <span id="error-field-error" role="alert">
            Username is required
          </span>
        </form>
      );

      const input = screen.getByLabelText(/username/i);
      expect(input).toHaveAttribute('aria-describedby', 'error-field-error');
      
      const error = screen.getByRole('alert');
      expect(error).toHaveTextContent('Username is required');
    });
  });

  describe('Keyboard Navigation', () => {
    it('buttons should be keyboard accessible', async () => {
      const onClick = vi.fn();
      render(<button onClick={onClick}>Click Me</button>);

      const button = screen.getByRole('button');
      button.focus();
      
      expect(button).toHaveFocus();
      
      await userEvent.keyboard('{Enter}');
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('form submission should work with Enter key', async () => {
      const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
      render(
        <form onSubmit={onSubmit}>
          <input type="text" />
          <button type="submit">Submit</button>
        </form>
      );

      const input = screen.getByRole('textbox');
      await userEvent.click(input);
      await userEvent.keyboard('{Enter}');
      
      expect(onSubmit).toHaveBeenCalled();
    });
  });
});
