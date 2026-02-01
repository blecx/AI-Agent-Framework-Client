/**
 * ProposalList Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProposalList } from '../ProposalList';
import type { Proposal } from '../../services/ProposalApiClient';

// Mock the ProposalApiClient
vi.mock('../../services/ProposalApiClient', () => ({
  ProposalApiClient: vi.fn().mockImplementation(() => ({
    listProposals: vi.fn(),
  })),
}));

const mockProposals: Proposal[] = [
  {
    id: 'prop-001',
    project_key: 'TEST-123',
    target_artifact: 'docs/plan.md',
    change_type: 'update',
    diff: '+ Added line',
    rationale: 'Update plan',
    status: 'pending',
    author: 'Alice',
    created_at: '2026-02-01T10:00:00Z',
  },
  {
    id: 'prop-002',
    project_key: 'TEST-123',
    target_artifact: 'docs/spec.md',
    change_type: 'create',
    diff: '+ New file',
    rationale: 'Add spec',
    status: 'accepted',
    author: 'Bob',
    created_at: '2026-02-01T11:00:00Z',
    applied_at: '2026-02-01T12:00:00Z',
  },
  {
    id: 'prop-003',
    project_key: 'TEST-123',
    target_artifact: 'docs/old.md',
    change_type: 'delete',
    diff: '- Removed file',
    rationale: 'Remove old doc',
    status: 'rejected',
    author: 'Charlie',
    created_at: '2026-02-01T09:00:00Z',
  },
];

describe('ProposalList', () => {
  let mockListProposals: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockListProposals = vi.fn();
    const module = await import('../../services/ProposalApiClient');
    vi.mocked(module.ProposalApiClient).mockImplementation(
      () =>
        ({
          listProposals: mockListProposals,
          createProposal: vi.fn(),
          getProposal: vi.fn(),
        }) as unknown as InstanceType<typeof module.ProposalApiClient>,
    );
  });

  it('renders loading state initially', () => {
    mockListProposals.mockReturnValue(new Promise(() => {})); // Never resolves
    render(<ProposalList projectKey="TEST-123" />);
    expect(screen.getByText('Loading proposals...')).toBeInTheDocument();
  });

  it('renders proposals after loading', async () => {
    mockListProposals.mockResolvedValue(mockProposals);
    render(<ProposalList projectKey="TEST-123" />);

    await waitFor(() => {
      expect(screen.getByText('prop-001')).toBeInTheDocument();
      expect(screen.getByText('prop-002')).toBeInTheDocument();
      expect(screen.getByText('prop-003')).toBeInTheDocument();
    });
  });

  it('renders error state on failure', async () => {
    mockListProposals.mockRejectedValue(new Error('API Error'));
    render(<ProposalList projectKey="TEST-123" />);

    await waitFor(() => {
      expect(screen.getByText(/Error: API Error/)).toBeInTheDocument();
    });
  });

  it('renders empty state when no proposals', async () => {
    mockListProposals.mockResolvedValue([]);
    render(<ProposalList projectKey="TEST-123" />);

    await waitFor(() => {
      expect(screen.getByText(/No proposals found/)).toBeInTheDocument();
    });
  });

  it('filters proposals by status', async () => {
    const user = userEvent.setup();
    mockListProposals.mockResolvedValue(mockProposals);
    render(<ProposalList projectKey="TEST-123" />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('prop-001')).toBeInTheDocument();
    });

    // Verify the filter dropdown exists and can be changed
    const select = screen.getByLabelText(
      'Filter by status',
    ) as HTMLSelectElement;
    expect(select.value).toBe('pending');

    // Change filter to "all"
    await user.selectOptions(select, 'all');
    expect(select.value).toBe('all');

    // Change filter to "accepted"
    await user.selectOptions(select, 'accepted');
    expect(select.value).toBe('accepted');

    // Change filter to "rejected"
    await user.selectOptions(select, 'rejected');
    expect(select.value).toBe('rejected');
  });

  it('sorts proposals by created date', async () => {
    const user = userEvent.setup();
    mockListProposals.mockResolvedValue(mockProposals);
    render(<ProposalList projectKey="TEST-123" />);

    await waitFor(() => {
      expect(screen.getByText('prop-001')).toBeInTheDocument();
    });

    // Get all proposal IDs in order
    const getProposalOrder = () => {
      const rows = screen.getAllByRole('row').slice(1); // Skip header
      return rows.map((row) => row.querySelector('.proposal-id')?.textContent);
    };

    // Default sort is descending (newest first)
    const initialOrder = getProposalOrder();
    expect(initialOrder).toEqual(['prop-002', 'prop-001', 'prop-003']);

    // Click sort header to toggle to ascending
    const sortHeader = screen.getByText(/Created/);
    await user.click(sortHeader);

    const ascOrder = getProposalOrder();
    expect(ascOrder).toEqual(['prop-003', 'prop-001', 'prop-002']);
  });

  it('calls onSelectProposal when View button clicked', async () => {
    const user = userEvent.setup();
    const onSelectProposal = vi.fn();
    mockListProposals.mockResolvedValue([mockProposals[0]]);

    render(
      <ProposalList
        projectKey="TEST-123"
        onSelectProposal={onSelectProposal}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('prop-001')).toBeInTheDocument();
    });

    const viewButtons = screen.getAllByText('View');
    await user.click(viewButtons[0]);

    expect(onSelectProposal).toHaveBeenCalledWith(mockProposals[0]);
  });

  it('displays status badges with correct styling classes', async () => {
    mockListProposals.mockResolvedValue(mockProposals);
    render(<ProposalList projectKey="TEST-123" />);

    await waitFor(() => {
      const pendingBadge = screen.getByText('pending');
      expect(pendingBadge).toHaveClass('status-badge', 'status-pending');

      const acceptedBadge = screen.getByText('accepted');
      expect(acceptedBadge).toHaveClass('status-badge', 'status-accepted');

      const rejectedBadge = screen.getByText('rejected');
      expect(rejectedBadge).toHaveClass('status-badge', 'status-rejected');
    });
  });

  it('formats dates correctly', async () => {
    mockListProposals.mockResolvedValue([mockProposals[0]]);
    render(<ProposalList projectKey="TEST-123" />);

    await waitFor(() => {
      const dateCell = screen.getByText(/2026/);
      expect(dateCell).toBeInTheDocument();
      // Check that it's formatted as locale string (contains date/time separators)
      expect(dateCell.textContent).toMatch(/[/:]/);
    });
  });

  it('displays all proposal details in table', async () => {
    mockListProposals.mockResolvedValue([mockProposals[0]]);
    render(<ProposalList projectKey="TEST-123" />);

    await waitFor(() => {
      expect(screen.getByText('prop-001')).toBeInTheDocument();
      expect(screen.getByText('docs/plan.md')).toBeInTheDocument();
      expect(screen.getByText('pending')).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });
  });
});
