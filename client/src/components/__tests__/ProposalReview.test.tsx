/**
 * ProposalReview Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProposalReview } from '../ProposalReview';
import {
  proposalApiClient,
  type Proposal,
} from '../../services/ProposalApiClient';

// Mock the ProposalApiClient
vi.mock('../../services/ProposalApiClient', () => ({
  proposalApiClient: {
    getProposal: vi.fn(),
    applyProposal: vi.fn(),
    rejectProposal: vi.fn(),
  },
}));

const mockProposal: Proposal = {
  id: 'prop-001',
  project_key: 'TEST-123',
  target_artifact: 'docs/plan.md',
  change_type: 'update',
  diff: `--- a/docs/plan.md
+++ b/docs/plan.md
@@ -1,3 +1,3 @@
 # Project Plan
-Old content
+New content
 End of file`,
  rationale: 'Update project plan with new requirements',
  status: 'pending',
  author: 'test-user',
  created_at: '2026-02-01T10:00:00Z',
};

describe('ProposalReview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window methods
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
    vi.spyOn(window, 'prompt').mockImplementation(() => 'Test reason');
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('renders loading state initially', () => {
    vi.mocked(proposalApiClient.getProposal).mockImplementation(
      () => new Promise(() => {}), // Never resolves
    );

    render(<ProposalReview proposalId="prop-001" projectKey="TEST-123" />);
    expect(screen.getByText('Loading proposal...')).toBeInTheDocument();
  });

  it('loads and displays proposal details', async () => {
    vi.mocked(proposalApiClient.getProposal).mockResolvedValue(mockProposal);

    render(<ProposalReview proposalId="prop-001" projectKey="TEST-123" />);

    await waitFor(() => {
      expect(screen.getByText('Proposal Review')).toBeInTheDocument();
    });

    expect(screen.getAllByText(/docs\/plan.md/)[0]).toBeInTheDocument();
    expect(screen.getByText(/update/)).toBeInTheDocument();
    expect(screen.getByText(/pending/)).toBeInTheDocument();
    expect(screen.getByText(/test-user/)).toBeInTheDocument();
    expect(
      screen.getByText(/Update project plan with new requirements/),
    ).toBeInTheDocument();
  });

  it('displays apply and reject buttons for pending proposals', async () => {
    vi.mocked(proposalApiClient.getProposal).mockResolvedValue(mockProposal);

    render(<ProposalReview proposalId="prop-001" projectKey="TEST-123" />);

    await waitFor(() => {
      expect(screen.getByText('Apply')).toBeInTheDocument();
    });

    expect(screen.getByText('Reject')).toBeInTheDocument();
  });

  it('handles apply action with confirmation', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    vi.mocked(proposalApiClient.getProposal).mockResolvedValue(mockProposal);
    vi.mocked(proposalApiClient.applyProposal).mockResolvedValue();

    render(
      <ProposalReview
        proposalId="prop-001"
        projectKey="TEST-123"
        onComplete={onComplete}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Apply')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Apply'));

    expect(window.confirm).toHaveBeenCalledWith(
      'Are you sure you want to apply these changes?',
    );

    await waitFor(() => {
      expect(proposalApiClient.applyProposal).toHaveBeenCalledWith(
        'TEST-123',
        'prop-001',
      );
    });

    expect(window.alert).toHaveBeenCalledWith('Proposal applied successfully');
    expect(onComplete).toHaveBeenCalled();
  });

  it('cancels apply when user declines confirmation', async () => {
    const user = userEvent.setup();
    vi.mocked(proposalApiClient.getProposal).mockResolvedValue(mockProposal);
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(<ProposalReview proposalId="prop-001" projectKey="TEST-123" />);

    await waitFor(() => {
      expect(screen.getByText('Apply')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Apply'));

    expect(window.confirm).toHaveBeenCalled();
    expect(proposalApiClient.applyProposal).not.toHaveBeenCalled();
  });

  it('handles reject action with reason prompt', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    vi.mocked(proposalApiClient.getProposal).mockResolvedValue(mockProposal);
    vi.mocked(proposalApiClient.rejectProposal).mockResolvedValue();

    render(
      <ProposalReview
        proposalId="prop-001"
        projectKey="TEST-123"
        onComplete={onComplete}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Reject')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Reject'));

    expect(window.prompt).toHaveBeenCalledWith('Reason for rejection:');

    await waitFor(() => {
      expect(proposalApiClient.rejectProposal).toHaveBeenCalledWith(
        'TEST-123',
        'prop-001',
        'Test reason',
      );
    });

    expect(window.alert).toHaveBeenCalledWith('Proposal rejected');
    expect(onComplete).toHaveBeenCalled();
  });

  it('cancels reject when user cancels reason prompt', async () => {
    const user = userEvent.setup();
    vi.mocked(proposalApiClient.getProposal).mockResolvedValue(mockProposal);
    vi.spyOn(window, 'prompt').mockReturnValue(null);

    render(<ProposalReview proposalId="prop-001" projectKey="TEST-123" />);

    await waitFor(() => {
      expect(screen.getByText('Reject')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Reject'));

    expect(window.prompt).toHaveBeenCalled();
    expect(proposalApiClient.rejectProposal).not.toHaveBeenCalled();
  });

  it('displays error message on load failure', async () => {
    vi.mocked(proposalApiClient.getProposal).mockRejectedValue(
      new Error('Network error'),
    );

    render(<ProposalReview proposalId="prop-001" projectKey="TEST-123" />);

    await waitFor(() => {
      expect(screen.getByText(/Error: Network error/)).toBeInTheDocument();
    });
  });

  it('displays error message on apply failure', async () => {
    const user = userEvent.setup();
    vi.mocked(proposalApiClient.getProposal).mockResolvedValue(mockProposal);
    vi.mocked(proposalApiClient.applyProposal).mockRejectedValue(
      new Error('Apply failed'),
    );

    render(<ProposalReview proposalId="prop-001" projectKey="TEST-123" />);

    await waitFor(() => {
      expect(screen.getByText('Apply')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Apply'));

    await waitFor(() => {
      expect(
        screen.getAllByText((_content, element) => {
          return element?.textContent === 'Error: Apply failed';
        })[0],
      ).toBeInTheDocument();
    });
  });

  it('displays error message on reject failure', async () => {
    const user = userEvent.setup();
    vi.mocked(proposalApiClient.getProposal).mockResolvedValue(mockProposal);
    vi.mocked(proposalApiClient.rejectProposal).mockRejectedValue(
      new Error('Reject failed'),
    );

    render(<ProposalReview proposalId="prop-001" projectKey="TEST-123" />);

    await waitFor(() => {
      expect(screen.getByText('Reject')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Reject'));

    await waitFor(() => {
      expect(
        screen.getAllByText((_content, element) => {
          return element?.textContent === 'Error: Reject failed';
        })[0],
      ).toBeInTheDocument();
    });
  });

  it('disables buttons during action', async () => {
    const user = userEvent.setup();
    vi.mocked(proposalApiClient.getProposal).mockResolvedValue(mockProposal);
    vi.mocked(proposalApiClient.applyProposal).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000)),
    );

    render(<ProposalReview proposalId="prop-001" projectKey="TEST-123" />);

    await waitFor(() => {
      expect(screen.getByText('Apply')).toBeInTheDocument();
    });

    const applyButton = screen.getByText('Apply');
    const rejectButton = screen.getByText('Reject');

    await user.click(applyButton);

    expect(applyButton).toBeDisabled();
    expect(rejectButton).toBeDisabled();
  });

  it('hides action buttons for accepted proposals', async () => {
    const acceptedProposal = { ...mockProposal, status: 'accepted' as const };
    vi.mocked(proposalApiClient.getProposal).mockResolvedValue(
      acceptedProposal,
    );

    render(<ProposalReview proposalId="prop-001" projectKey="TEST-123" />);

    await waitFor(() => {
      expect(screen.getByText(/already been accepted/)).toBeInTheDocument();
    });

    expect(screen.queryByText('Apply')).not.toBeInTheDocument();
    expect(screen.queryByText('Reject')).not.toBeInTheDocument();
  });

  it('hides action buttons for rejected proposals', async () => {
    const rejectedProposal = { ...mockProposal, status: 'rejected' as const };
    vi.mocked(proposalApiClient.getProposal).mockResolvedValue(
      rejectedProposal,
    );

    render(<ProposalReview proposalId="prop-001" projectKey="TEST-123" />);

    await waitFor(() => {
      expect(screen.getByText(/already been rejected/)).toBeInTheDocument();
    });

    expect(screen.queryByText('Apply')).not.toBeInTheDocument();
    expect(screen.queryByText('Reject')).not.toBeInTheDocument();
  });
});
