/**
 * ProposalReview Component
 * Review and apply/reject proposals
 */

import React, { useState, useEffect } from 'react';
import { DiffViewer } from './DiffViewer';
import {
  proposalApiClient,
  type Proposal,
} from '../services/ProposalApiClient';

export interface ProposalReviewProps {
  proposalId: string;
  projectKey: string;
  onComplete?: () => void;
}

export const ProposalReview: React.FC<ProposalReviewProps> = ({
  proposalId,
  projectKey,
  onComplete,
}) => {
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  useEffect(() => {
    loadProposal();
  }, [proposalId, projectKey]);

  const loadProposal = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await proposalApiClient.getProposal(projectKey, proposalId);
      setProposal(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load proposal');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!window.confirm('Are you sure you want to apply these changes?')) {
      return;
    }

    try {
      setActionInProgress(true);
      setError(null);
      await proposalApiClient.applyProposal(projectKey, proposalId);
      alert('Proposal applied successfully');
      if (onComplete) onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply proposal');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleReject = async () => {
    const reason = window.prompt('Reason for rejection:');
    if (!reason) {
      return;
    }

    try {
      setActionInProgress(true);
      setError(null);
      await proposalApiClient.rejectProposal(projectKey, proposalId, reason);
      alert('Proposal rejected');
      if (onComplete) onComplete();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to reject proposal',
      );
    } finally {
      setActionInProgress(false);
    }
  };

  if (loading) {
    return <div>Loading proposal...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!proposal) {
    return <div>Proposal not found</div>;
  }

  // Parse diff to extract old/new content
  const [oldContent, newContent] = parseDiff(proposal.diff);

  return (
    <div className="proposal-review">
      <h2>Proposal Review</h2>
      <div className="proposal-metadata">
        <p>
          <strong>Target:</strong> {proposal.target_artifact}
        </p>
        <p>
          <strong>Change Type:</strong> {proposal.change_type}
        </p>
        <p>
          <strong>Status:</strong> {proposal.status}
        </p>
        <p>
          <strong>Author:</strong> {proposal.author}
        </p>
      </div>

      <div className="proposal-diff">
        <h3>Changes</h3>
        <DiffViewer
          oldContent={oldContent}
          newContent={newContent}
          fileName={proposal.target_artifact}
        />
      </div>

      <div className="proposal-rationale">
        <h3>Rationale</h3>
        <p>{proposal.rationale}</p>
      </div>

      {proposal.status === 'pending' && (
        <div className="proposal-actions">
          <button
            onClick={handleApply}
            disabled={actionInProgress}
            className="btn-apply"
          >
            Apply
          </button>
          <button
            onClick={handleReject}
            disabled={actionInProgress}
            className="btn-reject"
          >
            Reject
          </button>
        </div>
      )}

      {proposal.status !== 'pending' && (
        <div className="proposal-status-message">
          This proposal has already been {proposal.status}.
        </div>
      )}
    </div>
  );
};

/**
 * Parse unified diff to extract old and new content
 * Simple implementation: extract content from diff lines
 */
function parseDiff(diff: string): [string, string] {
  const lines = diff.split('\n');
  const oldLines: string[] = [];
  const newLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith('-') && !line.startsWith('---')) {
      oldLines.push(line.substring(1));
    } else if (line.startsWith('+') && !line.startsWith('+++')) {
      newLines.push(line.substring(1));
    } else if (
      !line.startsWith('@@') &&
      !line.startsWith('---') &&
      !line.startsWith('+++')
    ) {
      // Context line
      oldLines.push(line.startsWith(' ') ? line.substring(1) : line);
      newLines.push(line.startsWith(' ') ? line.substring(1) : line);
    }
  }

  return [oldLines.join('\n'), newLines.join('\n')];
}
