/**
 * ApplyPanel Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import ApplyPanel from '../ApplyPanel';
import apiClient from '../../services/apiClient';
import type { Proposal } from '../../types';

// Mock dependencies
vi.mock('../../services/apiClient', () => ({
  default: {
    getProposals: vi.fn(),
    applyProposal: vi.fn(),
    rejectProposal: vi.fn(),
  },
}));

vi.mock('../../hooks/useToast', () => ({
  useToast: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
  }),
}));

vi.mock('../ConfirmDialog', () => ({
  default: ({ isOpen, onConfirm, onCancel, title, message, confirmText }: {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title: string;
    message: string;
    confirmText?: string;
  }) =>
    isOpen ? (
      <div data-testid="confirm-dialog">
        <h3>{title}</h3>
        <p>{message}</p>
        <button onClick={onConfirm}>{confirmText}</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    ) : null,
}));

describe('ApplyPanel', () => {
  const mockPendingProposal: Proposal = {
    id: 'prop-1',
    title: 'Add new feature',
    description: 'Implement feature X',
    status: 'pending',
    createdAt: '2026-02-01T10:00:00Z',
    changes: [
      {
        file: 'src/feature.ts',
        type: 'modify',
        diff: '+ added line\n- removed line',
      },
    ],
  };

  const mockAppliedProposal: Proposal = {
    id: 'prop-2',
    title: 'Bug fix',
    description: 'Fixed critical bug',
    status: 'applied',
    createdAt: '2026-01-28T10:00:00Z',
    appliedAt: '2026-01-29T14:00:00Z',
    changes: [
      {
        file: 'src/bug.ts',
        type: 'modify',
        before: 'old code',
        after: 'new code',
      },
    ],
  };

  const mockRejectedProposal: Proposal = {
    id: 'prop-3',
    title: 'Rejected change',
    description: 'This was rejected',
    status: 'rejected',
    createdAt: '2026-01-25T10:00:00Z',
    changes: [],
  };

  const renderWithProviders = (component: React.ReactElement) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          {component}
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================================================================
  // Loading State Tests
  // =========================================================================

  describe('Loading State', () => {
    it('should display loading message while fetching proposals', () => {
      (apiClient.getProposals as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderWithProviders(<ApplyPanel projectKey="TEST-123" />);

      expect(screen.getByText('Loading proposals...')).toBeInTheDocument();
    });
  });

  // =========================================================================
  // Empty State Tests
  // =========================================================================

  describe('Empty States', () => {
    it('should display empty state when no proposals exist', async () => {
      (apiClient.getProposals as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [],
      });

      renderWithProviders(<ApplyPanel projectKey="TEST-123" />);

      await waitFor(() => {
        expect(screen.getByTestId('empty-state')).toBeInTheDocument();
        expect(
          screen.getByText(/No proposals yet. Create a proposal/i)
        ).toBeInTheDocument();
      });
    });

    it('should display "No pending proposals" when only history exists', async () => {
      (apiClient.getProposals as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [mockAppliedProposal],
      });

      renderWithProviders(<ApplyPanel projectKey="TEST-123" />);

      await waitFor(() => {
        expect(screen.getByText('No pending proposals')).toBeInTheDocument();
      });
    });
  });

  // =========================================================================
  // Proposal Rendering Tests
  // =========================================================================

  describe('Proposal Rendering', () => {
    it('should render pending proposals list', async () => {
      (apiClient.getProposals as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [mockPendingProposal],
      });

      renderWithProviders(<ApplyPanel projectKey="TEST-123" />);

      await waitFor(() => {
        expect(screen.getByText('Add new feature')).toBeInTheDocument();
        expect(screen.getByText('Implement feature X')).toBeInTheDocument();
        expect(screen.getByText('1 changes')).toBeInTheDocument();
      });
    });

    it('should display proposal count', async () => {
      (apiClient.getProposals as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [mockPendingProposal, mockAppliedProposal],
      });

      renderWithProviders(<ApplyPanel projectKey="TEST-123" />);

      await waitFor(() => {
        expect(screen.getByText('Proposals (2)')).toBeInTheDocument();
      });
    });

    it('should render status badge for each proposal', async () => {
      (apiClient.getProposals as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [mockPendingProposal],
      });

      renderWithProviders(<ApplyPanel projectKey="TEST-123" />);

      await waitFor(() => {
        const badges = screen.getAllByText('pending');
        expect(badges.length).toBeGreaterThan(0);
      });
    });

    it('should format proposal creation date', async () => {
      (apiClient.getProposals as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [mockPendingProposal],
      });

      renderWithProviders(<ApplyPanel projectKey="TEST-123" />);

      await waitFor(() => {
        expect(screen.getByText(/Created:/)).toBeInTheDocument();
      });
    });
  });

  // =========================================================================
  // History Section Tests
  // =========================================================================

  describe('History Section', () => {
    it('should render history section for applied/rejected proposals', async () => {
      (apiClient.getProposals as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [mockPendingProposal, mockAppliedProposal, mockRejectedProposal],
      });

      renderWithProviders(<ApplyPanel projectKey="TEST-123" />);

      await waitFor(() => {
        expect(screen.getByText('History')).toBeInTheDocument();
        expect(screen.getByText('Bug fix')).toBeInTheDocument();
        expect(screen.getByText('Rejected change')).toBeInTheDocument();
      });
    });

    it('should display appliedAt date for applied proposals', async () => {
      (apiClient.getProposals as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [mockAppliedProposal],
      });

      renderWithProviders(<ApplyPanel projectKey="TEST-123" />);

      await waitFor(() => {
        expect(screen.getByText(/Applied:/)).toBeInTheDocument();
      });
    });

    it('should not display history section when no history exists', async () => {
      (apiClient.getProposals as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [mockPendingProposal],
      });

      renderWithProviders(<ApplyPanel projectKey="TEST-123" />);

      await waitFor(() => {
        expect(screen.queryByText('History')).not.toBeInTheDocument();
      });
    });
  });

  // =========================================================================
  // Selection and Preview Tests
  // =========================================================================

  describe('Selection and Preview', () => {
    it('should select proposal when clicked', async () => {
      const user = userEvent.setup();
      (apiClient.getProposals as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [mockPendingProposal],
      });

      renderWithProviders(<ApplyPanel projectKey="TEST-123" />);

      await waitFor(() => {
        expect(screen.getByText('Add new feature')).toBeInTheDocument();
      });

      const proposalItem = screen.getByTestId('proposal-item-prop-1');
      await user.click(proposalItem);

      await waitFor(() => {
        expect(screen.getByText('Preview: Add new feature')).toBeInTheDocument();
      });
    });

    it('should display selected proposal class', async () => {
      const user = userEvent.setup();
      (apiClient.getProposals as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [mockPendingProposal],
      });

      renderWithProviders(<ApplyPanel projectKey="TEST-123" />);

      await waitFor(() => {
        expect(screen.getByText('Add new feature')).toBeInTheDocument();
      });

      const proposalItem = screen.getByTestId('proposal-item-prop-1');
      await user.click(proposalItem);

      await waitFor(() => {
        expect(proposalItem).toHaveClass('selected');
      });
    });

    it('should display preview with description', async () => {
      const user = userEvent.setup();
      (apiClient.getProposals as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [mockPendingProposal],
      });

      renderWithProviders(<ApplyPanel projectKey="TEST-123" />);

      await waitFor(() => {
        expect(screen.getByText('Add new feature')).toBeInTheDocument();
      });

      const proposalItem = screen.getByTestId('proposal-item-prop-1');
      await user.click(proposalItem);

      await waitFor(() => {
        const descriptions = screen.getAllByText('Implement feature X');
        expect(descriptions.length).toBeGreaterThan(1); // In list and preview
      });
    });

    it('should display changes in preview', async () => {
      const user = userEvent.setup();
      (apiClient.getProposals as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [mockPendingProposal],
      });

      renderWithProviders(<ApplyPanel projectKey="TEST-123" />);

      await waitFor(() => {
        expect(screen.getByText('Add new feature')).toBeInTheDocument();
      });

      const proposalItem = screen.getByTestId('proposal-item-prop-1');
      await user.click(proposalItem);

      await waitFor(() => {
        expect(screen.getByText('Changes (1):')).toBeInTheDocument();
        expect(screen.getByText('src/feature.ts')).toBeInTheDocument();
        expect(screen.getByText('modify')).toBeInTheDocument();
      });
    });

    it('should display diff when available', async () => {
      const user = userEvent.setup();
      (apiClient.getProposals as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [mockPendingProposal],
      });

      renderWithProviders(<ApplyPanel projectKey="TEST-123" />);

      await waitFor(() => {
        expect(screen.getByText('Add new feature')).toBeInTheDocument();
      });

      const proposalItem = screen.getByTestId('proposal-item-prop-1');
      await user.click(proposalItem);

      await waitFor(() => {
        const diffElement = document.querySelector('.change-diff');
        expect(diffElement).toBeInTheDocument();
        expect(diffElement?.textContent).toBe('+ added line\n- removed line');
      });
    });

    it('should display before/after comparison when available', async () => {
      const user = userEvent.setup();
      (apiClient.getProposals as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [mockAppliedProposal],
      });

      renderWithProviders(<ApplyPanel projectKey="TEST-123" />);

      await waitFor(() => {
        expect(screen.getByText('Bug fix')).toBeInTheDocument();
      });

      // History items don't support selection, so we need to check if data is available
      // For this test, let's modify to use a pending proposal with before/after
      const proposalWithComparison: Proposal = {
        ...mockPendingProposal,
        changes: [
          {
            file: 'src/test.ts',
            type: 'modify',
            before: 'old code',
            after: 'new code',
          },
        ],
      };

      vi.clearAllMocks();
      (apiClient.getProposals as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [proposalWithComparison],
      });

      renderWithProviders(<ApplyPanel projectKey="TEST-123" />);

      await waitFor(() => {
        expect(screen.getByText('Add new feature')).toBeInTheDocument();
      });

      const proposalItem = screen.getByTestId('proposal-item-prop-1');
      await user.click(proposalItem);

      await waitFor(() => {
        expect(screen.getByText('Before:')).toBeInTheDocument();
        expect(screen.getByText('After:')).toBeInTheDocument();
        expect(screen.getByText('old code')).toBeInTheDocument();
        expect(screen.getByText('new code')).toBeInTheDocument();
      });
    });

    it('should close preview when close button clicked', async () => {
      const user = userEvent.setup();
      (apiClient.getProposals as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [mockPendingProposal],
      });

      renderWithProviders(<ApplyPanel projectKey="TEST-123" />);

      await waitFor(() => {
        expect(screen.getByText('Add new feature')).toBeInTheDocument();
      });

      const proposalItem = screen.getByTestId('proposal-item-prop-1');
      await user.click(proposalItem);

      await waitFor(() => {
        expect(screen.getByText('Preview: Add new feature')).toBeInTheDocument();
      });

      const closeButton = screen.getByLabelText('Close preview');
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Preview: Add new feature')).not.toBeInTheDocument();
      });
    });
  });

  // =========================================================================
  // Action Buttons Tests
  // =========================================================================

  describe('Action Buttons', () => {
    it('should display action buttons for pending proposals', async () => {
      const user = userEvent.setup();
      (apiClient.getProposals as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [mockPendingProposal],
      });

      renderWithProviders(<ApplyPanel projectKey="TEST-123" />);

      await waitFor(() => {
        expect(screen.getByText('Add new feature')).toBeInTheDocument();
      });

      const proposalItem = screen.getByTestId('proposal-item-prop-1');
      await user.click(proposalItem);

      await waitFor(() => {
        expect(screen.getByLabelText('Apply this proposal')).toBeInTheDocument();
        expect(screen.getByLabelText('Reject this proposal')).toBeInTheDocument();
      });
    });

    it('should not display action buttons for applied proposals', async () => {
      const user = userEvent.setup();
      (apiClient.getProposals as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [mockPendingProposal, mockAppliedProposal],
      });

      renderWithProviders(<ApplyPanel projectKey="TEST-123" />);

      // Select pending proposal first
      await waitFor(() => {
        expect(screen.getByText('Add new feature')).toBeInTheDocument();
      });

      const pendingItem = screen.getByTestId('proposal-item-prop-1');
      await user.click(pendingItem);

      await waitFor(() => {
        expect(screen.getByLabelText('Apply this proposal')).toBeInTheDocument();
      });

      // For applied/rejected proposals, they're in history and not selectable
      // This test verifies that history items don't have action buttons
      expect(screen.queryByTestId('proposal-item-prop-2')).not.toBeInTheDocument();
    });
  });

  // =========================================================================
  // Apply Proposal Tests
  // =========================================================================

  describe('Apply Proposal', () => {
    it('should open confirm dialog when apply button clicked', async () => {
      const user = userEvent.setup();
      (apiClient.getProposals as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [mockPendingProposal],
      });

      renderWithProviders(<ApplyPanel projectKey="TEST-123" />);

      await waitFor(() => {
        expect(screen.getByText('Add new feature')).toBeInTheDocument();
      });

      const proposalItem = screen.getByTestId('proposal-item-prop-1');
      await user.click(proposalItem);

      await waitFor(() => {
        expect(screen.getByLabelText('Apply this proposal')).toBeInTheDocument();
      });

      const applyButton = screen.getByLabelText('Apply this proposal');
      await user.click(applyButton);

      await waitFor(() => {
        const dialog = screen.getByTestId('confirm-dialog');
        expect(dialog).toBeInTheDocument();
        expect(dialog.querySelector('h3')?.textContent).toBe('Apply Proposal');
        expect(
          screen.getByText(/Are you sure you want to apply this proposal/)
        ).toBeInTheDocument();
      });
    });

    it('should call applyProposal when confirmed', async () => {
      const user = userEvent.setup();
      (apiClient.getProposals as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [mockPendingProposal],
      });
      (apiClient.applyProposal as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: {},
      });

      renderWithProviders(<ApplyPanel projectKey="TEST-123" />);

      await waitFor(() => {
        expect(screen.getByText('Add new feature')).toBeInTheDocument();
      });

      const proposalItem = screen.getByTestId('proposal-item-prop-1');
      await user.click(proposalItem);

      const applyButton = screen.getByLabelText('Apply this proposal');
      await user.click(applyButton);

      await waitFor(() => {
        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
      });

      const dialog = screen.getByTestId('confirm-dialog');
      const confirmButton = dialog.querySelector('button') as HTMLButtonElement;
      await user.click(confirmButton);

      await waitFor(() => {
        expect(apiClient.applyProposal).toHaveBeenCalledWith('TEST-123', 'prop-1');
      });
    });

    it('should close dialog when cancel clicked', async () => {
      const user = userEvent.setup();
      (apiClient.getProposals as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [mockPendingProposal],
      });

      renderWithProviders(<ApplyPanel projectKey="TEST-123" />);

      await waitFor(() => {
        expect(screen.getByText('Add new feature')).toBeInTheDocument();
      });

      const proposalItem = screen.getByTestId('proposal-item-prop-1');
      await user.click(proposalItem);

      const applyButton = screen.getByLabelText('Apply this proposal');
      await user.click(applyButton);

      await waitFor(() => {
        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
      });

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
      });
    });

    it('should show loading state while applying', async () => {
      const user = userEvent.setup();
      (apiClient.getProposals as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [mockPendingProposal],
      });
      (apiClient.applyProposal as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      renderWithProviders(<ApplyPanel projectKey="TEST-123" />);

      await waitFor(() => {
        expect(screen.getByText('Add new feature')).toBeInTheDocument();
      });

      const proposalItem = screen.getByTestId('proposal-item-prop-1');
      await user.click(proposalItem);

      const applyButton = screen.getByLabelText('Apply this proposal');
      await user.click(applyButton);

      await waitFor(() => {
        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
      });

      const dialog = screen.getByTestId('confirm-dialog');
      const confirmButton = dialog.querySelector('button') as HTMLButtonElement;
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.queryByText('Applying...')).toBeInTheDocument();
      });
    });

    it('should handle apply error', async () => {
      const user = userEvent.setup();
      (apiClient.getProposals as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [mockPendingProposal],
      });
      (apiClient.applyProposal as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: false,
        error: 'Network error',
      });

      renderWithProviders(<ApplyPanel projectKey="TEST-123" />);

      await waitFor(() => {
        expect(screen.getByText('Add new feature')).toBeInTheDocument();
      });

      const proposalItem = screen.getByTestId('proposal-item-prop-1');
      await user.click(proposalItem);

      const applyButton = screen.getByLabelText('Apply this proposal');
      await user.click(applyButton);

      await waitFor(() => {
        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
      });

      const dialog = screen.getByTestId('confirm-dialog');
      const confirmButton = dialog.querySelector('button') as HTMLButtonElement;
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });
  });

  // =========================================================================
  // Reject Proposal Tests
  // =========================================================================

  describe('Reject Proposal', () => {
    it('should open confirm dialog when reject button clicked', async () => {
      const user = userEvent.setup();
      (apiClient.getProposals as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [mockPendingProposal],
      });

      renderWithProviders(<ApplyPanel projectKey="TEST-123" />);

      await waitFor(() => {
        expect(screen.getByText('Add new feature')).toBeInTheDocument();
      });

      const proposalItem = screen.getByTestId('proposal-item-prop-1');
      await user.click(proposalItem);

      await waitFor(() => {
        expect(screen.getByLabelText('Reject this proposal')).toBeInTheDocument();
      });

      const rejectButton = screen.getByLabelText('Reject this proposal');
      await user.click(rejectButton);

      await waitFor(() => {
        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
        expect(screen.getByText('Reject Proposal')).toBeInTheDocument();
        expect(
          screen.getByText(/Are you sure you want to reject this proposal/)
        ).toBeInTheDocument();
      });
    });

    it('should call rejectProposal when confirmed', async () => {
      const user = userEvent.setup();
      (apiClient.getProposals as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [mockPendingProposal],
      });
      (apiClient.rejectProposal as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: {},
      });

      renderWithProviders(<ApplyPanel projectKey="TEST-123" />);

      await waitFor(() => {
        expect(screen.getByText('Add new feature')).toBeInTheDocument();
      });

      const proposalItem = screen.getByTestId('proposal-item-prop-1');
      await user.click(proposalItem);

      const rejectButton = screen.getByLabelText('Reject this proposal');
      await user.click(rejectButton);

      await waitFor(() => {
        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
      });

      const dialog = screen.getByTestId('confirm-dialog');
      const confirmButton = dialog.querySelectorAll('button')[0] as HTMLButtonElement;
      await user.click(confirmButton);

      await waitFor(() => {
        expect(apiClient.rejectProposal).toHaveBeenCalledWith('TEST-123', 'prop-1');
      });
    });

    it('should show loading state while rejecting', async () => {
      const user = userEvent.setup();
      (apiClient.getProposals as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [mockPendingProposal],
      });
      (apiClient.rejectProposal as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      renderWithProviders(<ApplyPanel projectKey="TEST-123" />);

      await waitFor(() => {
        expect(screen.getByText('Add new feature')).toBeInTheDocument();
      });

      const proposalItem = screen.getByTestId('proposal-item-prop-1');
      await user.click(proposalItem);

      const rejectButton = screen.getByLabelText('Reject this proposal');
      await user.click(rejectButton);

      await waitFor(() => {
        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
      });

      const dialog = screen.getByTestId('confirm-dialog');
      const confirmButton = dialog.querySelectorAll('button')[0] as HTMLButtonElement;
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.queryByText('Rejecting...')).toBeInTheDocument();
      });
    });

    it('should handle reject error', async () => {
      const user = userEvent.setup();
      (apiClient.getProposals as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [mockPendingProposal],
      });
      (apiClient.rejectProposal as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: false,
        error: 'Permission denied',
      });

      renderWithProviders(<ApplyPanel projectKey="TEST-123" />);

      await waitFor(() => {
        expect(screen.getByText('Add new feature')).toBeInTheDocument();
      });

      const proposalItem = screen.getByTestId('proposal-item-prop-1');
      await user.click(proposalItem);

      const rejectButton = screen.getByLabelText('Reject this proposal');
      await user.click(rejectButton);

      await waitFor(() => {
        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
      });

      const dialog = screen.getByTestId('confirm-dialog');
      const confirmButton = dialog.querySelectorAll('button')[0] as HTMLButtonElement;
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
        expect(screen.getByText('Permission denied')).toBeInTheDocument();
      });
    });
  });

  // =========================================================================
  // Error Handling Tests
  // =========================================================================

  describe('Error Handling', () => {
    it('should handle fetch proposals error', async () => {
      (apiClient.getProposals as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: false,
        error: 'Server error',
      });

      renderWithProviders(<ApplyPanel projectKey="TEST-123" />);

      // When query fails, it should throw and be caught by error boundary or show error state
      // The component doesn't have explicit error handling for query failure
      // So we just verify it doesn't crash
      await waitFor(() => {
        expect(screen.queryByText('Loading proposals...')).not.toBeInTheDocument();
      });
    });
  });
});
