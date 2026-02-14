import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReviewGate from '../ReviewGate';
import type { ValidationCheck } from '../../types/reviewGate';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'reviewGate.diff.modeLabel': 'View',
        'reviewGate.diff.sideBySide': 'Side-by-Side',
        'reviewGate.diff.unified': 'Unified',
        'reviewGate.diff.inline': 'Inline',
        'reviewGate.diff.before': 'Current',
        'reviewGate.diff.after': 'Proposed',
        'reviewGate.checks.title': 'Validation Checks',
        'reviewGate.actions.approve': 'Apply Changes',
        'reviewGate.actions.reject': 'Reject',
        'reviewGate.actions.edit': 'Edit',
        'reviewGate.actions.applying': 'Processing...',
        'reviewGate.actions.approveBlocked': 'Fix blocking checks',
        'reviewGate.reject.title': 'Reject Changes',
        'reviewGate.reject.reasonLabel': 'Reason (optional)',
        'reviewGate.reject.reasonPlaceholder': 'Explain why',
        'reviewGate.reject.cancel': 'Cancel',
        'reviewGate.reject.confirm': 'Reject',
      };
      return map[key] ?? key;
    },
  }),
}));

const passingChecks: ValidationCheck[] = [
  { id: '1', label: 'Syntax valid', status: 'pass', blocking: true },
  { id: '2', label: 'No conflicts', status: 'pass', blocking: true },
];

describe('ReviewGate', () => {
  it('renders validation checks and diff controls', () => {
    render(
      <ReviewGate
        diff={{ before: 'old line', after: 'new line' }}
        checks={passingChecks}
        onApprove={vi.fn().mockResolvedValue(undefined)}
        onReject={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    expect(screen.getByTestId('review-gate')).toBeInTheDocument();
    expect(screen.getByText('Validation Checks')).toBeInTheDocument();
    expect(screen.getByText('Syntax valid')).toBeInTheDocument();
    expect(screen.getByLabelText('View')).toBeInTheDocument();
  });

  it('disables approve button when blocking check fails', () => {
    render(
      <ReviewGate
        diff={{ before: 'a', after: 'b' }}
        checks={[{ id: 'blocked', label: 'Has conflicts', status: 'fail', blocking: true }]}
        onApprove={vi.fn().mockResolvedValue(undefined)}
        onReject={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    expect(screen.getByRole('button', { name: 'Apply Changes' })).toBeDisabled();
  });

  it('calls onApprove when approve clicked', async () => {
    const user = userEvent.setup();
    const onApprove = vi.fn().mockResolvedValue(undefined);

    render(
      <ReviewGate
        diff={{ before: 'a', after: 'b' }}
        checks={passingChecks}
        onApprove={onApprove}
        onReject={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Apply Changes' }));
    expect(onApprove).toHaveBeenCalledTimes(1);
  });

  it('opens reject modal and calls onReject with reason', async () => {
    const user = userEvent.setup();
    const onReject = vi.fn().mockResolvedValue(undefined);

    render(
      <ReviewGate
        diff={{ before: 'a', after: 'b' }}
        checks={passingChecks}
        onApprove={vi.fn().mockResolvedValue(undefined)}
        onReject={onReject}
      />,
    );

    await user.click(screen.getAllByRole('button', { name: 'Reject' })[0]);
    await user.type(screen.getByLabelText('Reason (optional)'), 'Needs revision');
    await user.click(screen.getAllByRole('button', { name: 'Reject' })[1]);

    expect(onReject).toHaveBeenCalledWith('Needs revision');
  });

  it('supports keyboard shortcut Ctrl+Enter to approve', async () => {
    const user = userEvent.setup();
    const onApprove = vi.fn().mockResolvedValue(undefined);

    render(
      <ReviewGate
        diff={{ before: 'a', after: 'b' }}
        checks={passingChecks}
        onApprove={onApprove}
        onReject={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    await user.keyboard('{Control>}{Enter}{/Control}');
    expect(onApprove).toHaveBeenCalledTimes(1);
  });
});
