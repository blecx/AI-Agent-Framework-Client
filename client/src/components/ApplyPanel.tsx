import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/apiClient';
import type { Proposal } from '../types';
import ConfirmDialog from './ConfirmDialog';
import { useToast } from '../hooks/useToast';
import './ApplyPanel.css';

interface ApplyPanelProps {
  projectKey: string;
}

export default function ApplyPanel({ projectKey }: ApplyPanelProps) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'apply' | 'reject';
    proposalId: string | null;
  }>({ isOpen: false, type: 'apply', proposalId: null });

  // Fetch proposals
  const { data: proposalsResponse, isLoading } = useQuery({
    queryKey: ['proposals', projectKey],
    queryFn: async () => {
      const response = await apiClient.getProposals(projectKey);
      if (!response.success) {
        throw new Error(response.error || 'Failed to load proposals');
      }
      return response.data || [];
    },
  });

  // Apply proposal mutation
  const applyMutation = useMutation({
    mutationFn: async (proposalId: string) => {
      const response = await apiClient.applyProposal(projectKey, proposalId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to apply proposal');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals', projectKey] });
      queryClient.invalidateQueries({ queryKey: ['project', projectKey] });
      setError(null);
      setSelectedProposal(null);
      toast.showSuccess('Proposal applied successfully');
    },
    onError: (error: Error) => {
      console.error('Error applying proposal:', error);
      setError(error.message);
      toast.showError(`Failed to apply proposal: ${error.message}`);
    },
  });

  // Reject proposal mutation
  const rejectMutation = useMutation({
    mutationFn: async (proposalId: string) => {
      const response = await apiClient.rejectProposal(projectKey, proposalId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to reject proposal');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals', projectKey] });
      setError(null);
      setSelectedProposal(null);
      toast.showSuccess('Proposal rejected');
    },
    onError: (error: Error) => {
      console.error('Error rejecting proposal:', error);
      setError(error.message);
      toast.showError(`Failed to reject proposal: ${error.message}`);
    },
  });

  const handleApply = (proposalId: string) => {
    setConfirmDialog({ isOpen: true, type: 'apply', proposalId });
  };

  const handleReject = (proposalId: string) => {
    setConfirmDialog({ isOpen: true, type: 'reject', proposalId });
  };

  const handleConfirm = () => {
    if (confirmDialog.proposalId) {
      if (confirmDialog.type === 'apply') {
        applyMutation.mutate(confirmDialog.proposalId);
      } else {
        rejectMutation.mutate(confirmDialog.proposalId);
      }
    }
    setConfirmDialog({ isOpen: false, type: 'apply', proposalId: null });
  };

  const handleCancel = () => {
    setConfirmDialog({ isOpen: false, type: 'apply', proposalId: null });
  };

  if (isLoading) {
    return (
      <div className="apply-panel">
        <div className="loading">Loading proposals...</div>
      </div>
    );
  }

  const proposals = proposalsResponse || [];
  const pendingProposals = proposals.filter((p: Proposal) => p.status === 'pending');
  const selected = proposals.find((p: Proposal) => p.id === selectedProposal);

  return (
    <div className="apply-panel" data-testid="apply-panel">
      <h2>Apply Proposals</h2>
      <p className="description">
        Review and apply pending proposals. You can preview changes before applying them.
      </p>

      {error && <div className="error-message" data-testid="error-message">{error}</div>}

      {proposals.length === 0 ? (
        <div className="empty-state" data-testid="empty-state">
          <p>No proposals yet. Create a proposal in the "Propose Changes" tab.</p>
        </div>
      ) : (
        <div className="proposals-container">
          <div className="proposals-list">
            <h3>Proposals ({proposals.length})</h3>
            {pendingProposals.length === 0 ? (
              <p className="no-pending">No pending proposals</p>
            ) : (
              pendingProposals.map((proposal: Proposal) => (
                <div
                  key={proposal.id}
                  className={`proposal-item ${selectedProposal === proposal.id ? 'selected' : ''}`}
                  data-testid={`proposal-item-${proposal.id}`}
                  data-proposal-id={proposal.id}
                  onClick={() => setSelectedProposal(proposal.id)}
                >
                  <div className="proposal-header">
                    <h4>{proposal.title}</h4>
                    <span className={`status-badge status-${proposal.status}`}>
                      {proposal.status}
                    </span>
                  </div>
                  <p className="proposal-description">{proposal.description}</p>
                  <div className="proposal-meta">
                    <span>{proposal.changes.length} changes</span>
                    <span>Created: {new Date(proposal.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}

            {proposals.filter((p: Proposal) => p.status !== 'pending').length > 0 && (
              <>
                <h3 style={{ marginTop: '2rem' }}>History</h3>
                {proposals
                  .filter((p: Proposal) => p.status !== 'pending')
                  .map((proposal: Proposal) => (
                    <div
                      key={proposal.id}
                      className="proposal-item history-item"
                    >
                      <div className="proposal-header">
                        <h4>{proposal.title}</h4>
                        <span className={`status-badge status-${proposal.status}`}>
                          {proposal.status}
                        </span>
                      </div>
                      <div className="proposal-meta">
                        <span>Created: {new Date(proposal.createdAt).toLocaleDateString()}</span>
                        {proposal.appliedAt && (
                          <span>Applied: {new Date(proposal.appliedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  ))}
              </>
            )}
          </div>

          {selected && (
            <div className="proposal-preview">
              <div className="preview-header">
                <h3>Preview: {selected.title}</h3>
                <button
                  className="btn-close"
                  onClick={() => setSelectedProposal(null)}
                  aria-label="Close preview"
                >
                  ✕
                </button>
              </div>

              <div className="preview-content">
                <div className="preview-section">
                  <strong>Description:</strong>
                  <p>{selected.description}</p>
                </div>

                <div className="preview-section">
                  <strong>Changes ({selected.changes.length}):</strong>
                  {selected.changes.map((change, idx) => (
                    <div key={idx} className="change-item">
                      <div className="change-header">
                        <span className="change-file">{change.file}</span>
                        <span className={`change-type type-${change.type}`}>
                          {change.type}
                        </span>
                      </div>
                      {change.diff && (
                        <pre className="change-diff">{change.diff}</pre>
                      )}
                      {change.before && change.after && (
                        <div className="change-comparison">
                          <div className="before">
                            <strong>Before:</strong>
                            <pre>{change.before}</pre>
                          </div>
                          <div className="after">
                            <strong>After:</strong>
                            <pre>{change.after}</pre>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {selected.status === 'pending' && (
                <div className="preview-actions">
                  <button
                    className="btn-primary btn-apply"
                    onClick={() => handleApply(selected.id)}
                    disabled={applyMutation.isPending}
                    aria-label="Apply this proposal"
                  >
                    {applyMutation.isPending ? 'Applying...' : 'Apply Proposal'}
                  </button>
                  <button
                    className="btn-secondary btn-reject"
                    onClick={() => handleReject(selected.id)}
                    disabled={rejectMutation.isPending}
                    aria-label="Reject this proposal"
                  >
                    {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        title={confirmDialog.type === 'apply' ? 'Apply Proposal' : 'Reject Proposal'}
        message={
          confirmDialog.type === 'apply'
            ? 'Are you sure you want to apply this proposal? This will make changes to the project.'
            : 'Are you sure you want to reject this proposal? This action cannot be undone.'
        }
        confirmText={confirmDialog.type === 'apply' ? 'Apply' : 'Reject'}
      />
    </div>
  );
}
