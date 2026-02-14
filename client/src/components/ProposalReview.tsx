/**
 * ProposalReview Component
 * Review and apply/reject proposals
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../hooks/useToast';
import ReviewGate from './ReviewGate';
import { DiffViewer } from './DiffViewer';
import {
  proposalApiClient,
  type Proposal,
} from '../services/ProposalApiClient';
import type { ValidationCheck } from '../types/reviewGate';

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
  const { t } = useTranslation();
  const toast = useToast();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  const loadProposal = useCallback(async () => {
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
  }, [projectKey, proposalId]);

  useEffect(() => {
    loadProposal();
  }, [loadProposal]);

  const handleApply = async () => {
    try {
      setActionInProgress(true);
      setError(null);
      await proposalApiClient.applyProposal(projectKey, proposalId);
      toast.showSuccess(t('reviewGate.toasts.approveSuccess'));
      if (onComplete) onComplete();
    } catch (err) {
      toast.showError(t('reviewGate.toasts.approveFailed'));
      setError(err instanceof Error ? err.message : 'Failed to apply proposal');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleReject = async (reason?: string) => {
    try {
      setActionInProgress(true);
      setError(null);
      await proposalApiClient.rejectProposal(projectKey, proposalId, reason);
      toast.showSuccess(t('reviewGate.toasts.rejectSuccess'));
      if (onComplete) onComplete();
    } catch (err) {
      toast.showError(t('reviewGate.toasts.rejectFailed'));
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

  const [oldContent, newContent] = parseDiff(proposal.diff);

  const checks: ValidationCheck[] = [
    {
      id: 'syntax-valid',
      label: t('reviewGate.defaultChecks.syntaxValid'),
      status: 'pass',
      blocking: true,
    },
    {
      id: 'conflicts',
      label: t('reviewGate.defaultChecks.noConflicts'),
      status: proposal.status === 'pending' ? 'pass' : 'warning',
      blocking: true,
    },
    {
      id: 'change-size',
      label: t('reviewGate.defaultChecks.changeSize'),
      status: proposal.diff.split('\n').length > 120 ? 'warning' : 'pass',
      message:
        proposal.diff.split('\n').length > 120
          ? t('reviewGate.defaultChecks.changeSizeWarning')
          : undefined,
      blocking: false,
    },
  ];

  return (
    <div className="proposal-review">
      <h2>{t('proposal.review.title')}</h2>
      <div className="proposal-metadata">
        <p>
          <strong>{t('reviewGate.meta.target')}:</strong> {proposal.target_artifact}
        </p>
        <p>
          <strong>{t('reviewGate.meta.changeType')}:</strong> {proposal.change_type}
        </p>
        <p>
          <strong>{t('reviewGate.meta.status')}:</strong> {proposal.status}
        </p>
        <p>
          <strong>{t('reviewGate.meta.author')}:</strong> {proposal.author}
        </p>
      </div>

      <div className="proposal-diff">
        <h3>{t('reviewGate.diff.title')}</h3>
        {proposal.status === 'pending' ? (
          <ReviewGate
            diff={{ before: oldContent, after: newContent }}
            checks={checks}
            onApprove={handleApply}
            onReject={handleReject}
            approveLabel={t('reviewGate.actions.approve')}
            rejectLabel={t('reviewGate.actions.reject')}
          />
        ) : (
          <DiffViewer
            oldContent={oldContent}
            newContent={newContent}
            fileName={proposal.target_artifact}
          />
        )}
      </div>

      <div className="proposal-rationale">
        <h3>{t('reviewGate.meta.rationale')}</h3>
        <p>{proposal.rationale}</p>
      </div>

      {proposal.status !== 'pending' && (
        <div className="proposal-status-message">
          {t('reviewGate.meta.alreadyProcessed', { status: proposal.status })}
        </div>
      )}

      {actionInProgress && (
        <div className="proposal-status-message">{t('reviewGate.actions.applying')}</div>
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
