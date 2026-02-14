import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
  describe('Rendering', () => {
    it('renders loading spinner', () => {
      render(<LoadingSpinner />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('renders with default medium size', () => {
      render(<LoadingSpinner />);
      const spinner = screen.getByRole('status').querySelector('.loading-spinner');
      expect(spinner).toHaveClass('medium');
    });

    it('renders with small size', () => {
      render(<LoadingSpinner size="small" />);
      const spinner = screen.getByRole('status').querySelector('.loading-spinner');
      expect(spinner).toHaveClass('small');
    });

    it('renders with large size', () => {
      render(<LoadingSpinner size="large" />);
      const spinner = screen.getByRole('status').querySelector('.loading-spinner');
      expect(spinner).toHaveClass('large');
    });

    it('renders without message by default', () => {
      render(<LoadingSpinner />);
      expect(screen.queryByText(/loading/i)).toHaveTextContent('Loading...');
    });

    it('renders with custom message', () => {
      render(<LoadingSpinner message="Loading projects..." />);
      expect(screen.getByText('Loading projects...', { selector: 'p.loading-message' })).toBeInTheDocument();
    });

    it('renders as inline by default', () => {
      render(<LoadingSpinner />);
      const container = screen.getByRole('status');
      expect(container).not.toHaveClass('fullscreen');
    });

    it('renders fullscreen when specified', () => {
      render(<LoadingSpinner fullScreen />);
      const container = screen.getByRole('status');
      expect(container).toHaveClass('fullscreen');
    });
  });

  describe('Accessibility', () => {
    it('has role="status" for screen readers', () => {
      render(<LoadingSpinner />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('has aria-live="polite" for screen reader announcements', () => {
      render(<LoadingSpinner />);
      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-live', 'polite');
    });

    it('has visually hidden "Loading..." text for screen readers', () => {
      render(<LoadingSpinner />);
      const srText = screen.getByText('Loading...');
      expect(srText).toHaveClass('sr-only');
    });

    it('marks spinner circle as aria-hidden', () => {
      render(<LoadingSpinner />);
      const spinner = screen.getByRole('status').querySelector('.loading-spinner');
      expect(spinner).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
