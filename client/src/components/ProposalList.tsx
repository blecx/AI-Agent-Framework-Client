/**
 * ProposalList Component
 * Displays list of proposals with filtering and navigation to review
 */

import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  proposalApiClient,
  type ProposalStatus,
  type Proposal,
} from '../services/ProposalApiClient';
import EmptyState from './ui/EmptyState';
import { Button } from './ui/Button';
import './ProposalList.css';

interface ProposalListProps {
  projectKey: string;
}

export default function ProposalList({ projectKey }: ProposalListProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get status filter from URL, default to 'pending'
  const statusFilter =
    (searchParams.get('status') as ProposalStatus) || 'pending';

  useEffect(() => {
    loadProposals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectKey, statusFilter]);

  const loadProposals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await proposalApiClient.listProposals(
        projectKey,
        statusFilter,
      );
      // Sort by date (newest first)
      const sorted = data.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      setProposals(sorted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (status: ProposalStatus) => {
    setSearchParams({ status });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadgeClass = (status: ProposalStatus): string => {
    switch (status) {
      case 'pending':
        return 'proposal-status-badge proposal-status-pending';
      case 'accepted':
        return 'proposal-status-badge proposal-status-accepted';
      case 'rejected':
        return 'proposal-status-badge proposal-status-rejected';
      default:
        return 'proposal-status-badge';
    }
  };

  if (loading) {
    return (
      <div className="proposal-list-container">
        <div className="proposal-list-header">
          <h2>Proposals</h2>
        </div>
        <div className="proposal-list-loading">Loading proposals...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="proposal-list-container">
        <div className="proposal-list-header">
          <h2>Proposals</h2>
        </div>
        <div className="proposal-list-error" role="alert">
          Error: {error}
        </div>
        <Button onClick={loadProposals}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="proposal-list-container">
      <div className="proposal-list-header">
        <h2>Proposals</h2>
        <div className="proposal-list-filters">
          <label htmlFor="status-filter">Filter by status:</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) =>
              handleFilterChange(e.target.value as ProposalStatus)
            }
            className="proposal-status-filter"
          >
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {proposals.length === 0 ? (
        <EmptyState
          icon="📝"
          title="No proposals found"
          description={`No ${statusFilter} proposals for this project.`}
        />
      ) : (
        <div className="proposal-list-table-wrapper">
          <table className="proposal-list-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Target Artifact</th>
                <th>Status</th>
                <th>Created</th>
                <th>Author</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((proposal) => (
                <tr key={proposal.id}>
                  <td className="proposal-id">{proposal.id}</td>
                  <td className="proposal-target">
                    {proposal.target_artifact}
                  </td>
                  <td>
                    <span className={getStatusBadgeClass(proposal.status)}>
                      {proposal.status}
                    </span>
                  </td>
                  <td className="proposal-date">
                    {formatDate(proposal.created_at)}
                  </td>
                  <td className="proposal-author">{proposal.author}</td>
                  <td>
                    <Link
                      to={`/projects/${projectKey}/proposals/${proposal.id}`}
                      className="proposal-view-link"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
