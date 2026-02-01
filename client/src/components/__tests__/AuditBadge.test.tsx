/**
 * Unit tests for AuditBadge component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuditBadge } from '../AuditBadge';

describe('AuditBadge', () => {
  it('displays success status when no errors or warnings', () => {
    render(<AuditBadge errorCount={0} warningCount={0} infoCount={1} />);
    
    expect(screen.getByText('✓')).toBeInTheDocument();
    expect(screen.getByText('No Issues')).toBeInTheDocument();
  });

  it('displays warning status when warnings exist but no errors', () => {
    render(<AuditBadge errorCount={0} warningCount={2} infoCount={1} />);
    
    expect(screen.getByText('⚠')).toBeInTheDocument();
    expect(screen.getByText(/0 errors, 2 warnings/)).toBeInTheDocument();
  });

  it('displays error status when errors exist', () => {
    render(<AuditBadge errorCount={3} warningCount={2} infoCount={1} />);
    
    expect(screen.getByText('✗')).toBeInTheDocument();
    expect(screen.getByText(/3 errors, 2 warnings/)).toBeInTheDocument();
  });

  it('handles singular error count correctly', () => {
    render(<AuditBadge errorCount={1} warningCount={0} infoCount={0} />);
    
    expect(screen.getByText(/1 error, 0 warnings/)).toBeInTheDocument();
  });

  it('handles singular warning count correctly', () => {
    render(<AuditBadge errorCount={0} warningCount={1} infoCount={0} />);
    
    expect(screen.getByText(/0 errors, 1 warning/)).toBeInTheDocument();
  });

  it('displays correct title attribute', () => {
    render(<AuditBadge errorCount={3} warningCount={2} infoCount={1} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', '3 errors, 2 warnings, 1 info');
  });

  it('calls onClick handler when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(
      <AuditBadge
        errorCount={1}
        warningCount={2}
        infoCount={0}
        onClick={handleClick}
      />
    );
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies correct CSS class for success status', () => {
    render(<AuditBadge errorCount={0} warningCount={0} infoCount={0} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('audit-badge--success');
  });

  it('applies correct CSS class for warning status', () => {
    render(<AuditBadge errorCount={0} warningCount={1} infoCount={0} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('audit-badge--warning');
  });

  it('applies correct CSS class for error status', () => {
    render(<AuditBadge errorCount={1} warningCount={0} infoCount={0} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('audit-badge--error');
  });

  it('has proper accessibility attributes', () => {
    render(<AuditBadge errorCount={2} warningCount={3} infoCount={1} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Audit status: 2 errors, 3 warnings');
  });
});
