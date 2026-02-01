/**
 * ProposalList Component
 * Displays proposals with filtering and navigation to review
 */

import React, { useEffect, useState, useMemo } from 'react';
import {
  ProposalApiClient,
  type Proposal,
  type ProposalStatus,
} from '../services/ProposalApiClient';
import './ProposalList.css';

interface ProposalListProps {
  projectKey: string;
  onSelectProposal?: (proposal: Proposal) => void;
}

type SortDirection = 'asc' | 'desc';

export const ProposalList: React.FC<ProposalListProps> = ({
  projectKey,
  onSelectProposal,
}) => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | 'all'>(
    'pending',
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const apiClient = useMemo(() => new ProposalApiClient(), []);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        setLoading(true);
        setError(null);
        const filter = statusFilter === 'all' ? undefined : statusFilter;
        const data = await apiClient.listProposals(projectKey, filter);
        setProposals(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load proposals',
        );
      } finally {
        setLoading(false);
      }
    };

    if (projectKey) {
      fetchProposals();
    }
  }, [projectKey, statusFilter, apiClient]);

  const sortedProposals = useMemo(() => {
    const sorted = [...proposals];
    sorted.sort((a, b) => {
      const comparison = a.created_at.localeCompare(b.created_at);
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [proposals, sortDirection]);

  const handleSort = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const handleProposalClick = (proposal: Proposal) => {
    if (onSelectProposal) {
      onSelectProposal(proposal);
    }
  };

  const getStatusBadgeClass = (status: ProposalStatus): string => {
    return `status-badge status-${status}`;
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return <div className="proposal-list-loading">Loading proposals...</div>;
  }

  if (error) {
    return <div className="proposal-list-error">Error: {error}</div>;
  }

  return (
    <div className="proposal-list">
      <div className="proposal-list-header">
        <h2>Proposals</h2>
        <div className="filter-controls">
          <label htmlFor="status-filter">Status:</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as ProposalStatus | 'all')
            }
            aria-label="Filter by status"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {sortedProposals.length === 0 ? (
        <div className="proposal-list-empty">
          <p>
            No proposals found.{' '}
            {statusFilter !== 'all' && `Try changing the filter.`}
          </p>
        </div>
      ) : (
        <table className="proposal-list-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Target</th>
              <th>
                <span
                  className={`status-header ${statusFilter !== 'all' ? 'filtered' : ''}`}
                >
                  Status
                </span>
              </th>
              <th onClick={handleSort} className="sortable">
                Created {sortDirection === 'asc' ? '↑' : '↓'}
              </th>
              <th>Author</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedProposals.map((proposal) => (
              <tr key={proposal.id} className="proposal-row">
                <td className="proposal-id">{proposal.id}</td>
                <td className="proposal-target">{proposal.target_artifact}</td>
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
                  <button
                    className="btn-view-proposal"
                    onClick={() => handleProposalClick(proposal)}
                    aria-label={`View proposal ${proposal.id}`}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
