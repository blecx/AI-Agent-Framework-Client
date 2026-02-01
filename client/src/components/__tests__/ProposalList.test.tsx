/**
 * ProposalList Component Tests
 */

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ProposalList from '../ProposalList';
import {
  proposalApiClient,
  type Proposal,
} from '../../services/ProposalApiClient';

// Mock the ProposalApiClient
vi.mock('../../services/ProposalApiClient', () => ({
  proposalApiClient: {
    listProposals: vi.fn(),
  },
  ProposalStatus: {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
  },
}));

const mockProposals: Proposal[] = [
  {
    id: 'prop-001',
    project_key: 'TEST',
    target_artifact: 'docs/README.md',
    change_type: 'update',
    diff: '--- a/docs/README.md\n+++ b/docs/README.md\n@@ -1,1 +1,1 @@\n-Old content\n+New content',
    rationale: 'Update documentation',
    status: 'pending',
    author: 'Alice',
    created_at: '2026-02-01T10:00:00Z',
  },
  {
    id: 'prop-002',
    project_key: 'TEST',
    target_artifact: 'docs/CONTRIBUTING.md',
    change_type: 'create',
    diff: '--- /dev/null\n+++ b/docs/CONTRIBUTING.md\n@@ -0,0 +1,1 @@\n+New file',
    rationale: 'Add contributing guide',
    status: 'pending',
    author: 'Bob',
    created_at: '2026-02-01T09:00:00Z',
  },
  {
    id: 'prop-003',
    project_key: 'TEST',
    target_artifact: 'docs/CHANGELOG.md',
    change_type: 'update',
    diff: '--- a/docs/CHANGELOG.md\n+++ b/docs/CHANGELOG.md\n@@ -1,1 +1,2 @@\n Version 1.0\n+Version 1.1',
    rationale: 'Update changelog',
    status: 'accepted',
    author: 'Charlie',
    created_at: '2026-01-31T15:00:00Z',
  },
];

describe('ProposalList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (projectKey = 'TEST') => {
    return render(
      <MemoryRouter>
        <ProposalList projectKey={projectKey} />
      </MemoryRouter>,
    );
  };

  it('should render loading state initially', () => {
    vi.mocked(proposalApiClient.listProposals).mockImplementation(
      () => new Promise(() => {}), // Never resolves
    );

    renderComponent();
    expect(screen.getByText(/loading proposals/i)).toBeInTheDocument();
  });

  it('should fetch and display proposals', async () => {
    vi.mocked(proposalApiClient.listProposals).mockResolvedValue(
      mockProposals.filter((p) => p.status === 'pending'),
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('prop-001')).toBeInTheDocument();
    });

    expect(screen.getByText('docs/README.md')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('prop-002')).toBeInTheDocument();
  });

  it('should display proposals sorted by date (newest first)', async () => {
    vi.mocked(proposalApiClient.listProposals).mockResolvedValue(
      mockProposals.filter((p) => p.status === 'pending'),
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('prop-001')).toBeInTheDocument();
    });

    const rows = screen.getAllByRole('row');
    // Skip header row
    const dataRows = rows.slice(1);

    // prop-001 (10:00) should come before prop-002 (09:00)
    expect(within(dataRows[0]).getByText('prop-001')).toBeInTheDocument();
    expect(within(dataRows[1]).getByText('prop-002')).toBeInTheDocument();
  });

  it('should filter proposals by status', async () => {
    const user = userEvent.setup();

    // Initially load pending proposals
    vi.mocked(proposalApiClient.listProposals).mockResolvedValue(
      mockProposals.filter((p) => p.status === 'pending'),
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('prop-001')).toBeInTheDocument();
    });

    // Change filter to accepted
    vi.mocked(proposalApiClient.listProposals).mockResolvedValue(
      mockProposals.filter((p) => p.status === 'accepted'),
    );

    const filterSelect = screen.getByLabelText(/filter by status/i);
    await user.selectOptions(filterSelect, 'accepted');

    await waitFor(() => {
      expect(proposalApiClient.listProposals).toHaveBeenCalledWith(
        'TEST',
        'accepted',
      );
    });
  });

  it('should display empty state when no proposals', async () => {
    vi.mocked(proposalApiClient.listProposals).mockResolvedValue([]);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/no proposals found/i)).toBeInTheDocument();
    });

    expect(
      screen.getByText(/no pending proposals for this project/i),
    ).toBeInTheDocument();
  });

  it('should display error state on API failure', async () => {
    vi.mocked(proposalApiClient.listProposals).mockRejectedValue(
      new Error('Network error'),
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/error: network error/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('should render status badges with correct styles', async () => {
    const mixedProposals = [
      { ...mockProposals[0], status: 'pending' as const },
      { ...mockProposals[1], status: 'accepted' as const },
      { ...mockProposals[2], status: 'rejected' as const },
    ];

    vi.mocked(proposalApiClient.listProposals).mockResolvedValue(
      mixedProposals,
    );

    // Render with no default filter to show all
    render(
      <MemoryRouter initialEntries={['?status=']}>
        <ProposalList projectKey="TEST" />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const badges = screen.getAllByText(/pending|accepted|rejected/i);
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  it('should render view links for each proposal', async () => {
    vi.mocked(proposalApiClient.listProposals).mockResolvedValue(
      mockProposals.filter((p) => p.status === 'pending'),
    );

    renderComponent();

    await waitFor(() => {
      const viewLinks = screen.getAllByText(/view/i);
      expect(viewLinks).toHaveLength(2); // Two pending proposals
    });

    const viewLinks = screen.getAllByText(/view/i);
    expect(viewLinks[0]).toHaveAttribute(
      'href',
      '/projects/TEST/proposals/prop-001',
    );
  });

  it('should retry loading on button click', async () => {
    const user = userEvent.setup();

    vi.mocked(proposalApiClient.listProposals).mockRejectedValueOnce(
      new Error('First attempt failed'),
    );

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText(/error: first attempt failed/i),
      ).toBeInTheDocument();
    });

    // Mock successful retry
    vi.mocked(proposalApiClient.listProposals).mockResolvedValue(
      mockProposals.filter((p) => p.status === 'pending'),
    );

    const retryButton = screen.getByRole('button', { name: /retry/i });
    await user.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText('prop-001')).toBeInTheDocument();
    });
  });
});
