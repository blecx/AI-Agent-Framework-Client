import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../hooks/useToast';
import ConfirmDialog from './ConfirmDialog';
import apiClient from '../services/apiClient';
import type { Proposal } from '../types';
import './ApplyPanel.css';

interface ApplyPanelProps {
  projectKey: string;
}

export default function ApplyPanel({ projectKey }: ApplyPanelProps) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showApplyConfirm, setShowApplyConfirm] = useState<string | null>(null);
  const [showRejectConfirm, setShowRejectConfirm] = useState<string | null>(null);

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
      setShowApplyConfirm(null);
      toast.showSuccess('Proposal applied successfully!');
    },
    onError: (error: Error) => {
      console.error('Failed to apply proposal:', error);
      setError(error.message);
      setShowApplyConfirm(null);
      toast.showError(error.message);
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
      setShowRejectConfirm(null);
      toast.showSuccess('Proposal rejected');
    },
    onError: (error: Error) => {
      console.error('Failed to reject proposal:', error);
      setError(error.message);
      setShowRejectConfirm(null);
      toast.showError(error.message);
    },
  });

  const handleApply = (proposalId: string) => {
    applyMutation.mutate(proposalId);
  };

  const handleReject = (proposalId: string) => {
    rejectMutation.mutate(proposalId);
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
    <div className="apply-panel">
      <h2>Apply Proposals</h2>
      <p className="description">
        Review and apply pending proposals. You can preview changes before applying them.
      </p>

      {error && (
        <div className="error-message">
          {error}
          <button aria-label="Dismiss error" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {proposals.length === 0 ? (
        <div className="empty-state">
          <p>No proposals found for this project.</p>
        </div>
      ) : pendingProposals.length === 0 ? (
        <div className="empty-state">
          <p>No pending proposals. All proposals have been processed.</p>
        </div>
      ) : (
        <>
          <div className="proposals-grid">
            {pendingProposals.map((proposal: Proposal) => (
              <div key={proposal.id} className="proposal-card">
                <div className="proposal-card-header">
                  <h3>{proposal.title}</h3>
                  <span className="proposal-status">{proposal.status}</span>
                </div>
                <div className="proposal-card-body">
                  <p className="proposal-description">{proposal.description}</p>
                  <div className="proposal-meta">
                    <span>Created: {new Date(proposal.createdAt).toLocaleDateString()}</span>
                    <span>{proposal.changes.length} change(s)</span>
                  </div>
                </div>
                <div className="proposal-card-actions">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedProposal(proposal.id)}
                  >
                    Preview
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowApplyConfirm(proposal.id)}
                    disabled={applyMutation.isPending}
                  >
                    Apply
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => setShowRejectConfirm(proposal.id)}
                    disabled={rejectMutation.isPending}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>

          {selected && (
            <div className="proposal-preview">
              <div className="preview-header">
                <h3>Preview: {selected.title}</h3>
                <button
                  className="btn-close"
                  aria-label="Close preview"
                  onClick={() => setSelectedProposal(null)}
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
                        <span className={`change-operation ${change.type}`}>
                          {change.type}
                        </span>
                        <span className="change-path">{change.file}</span>
                      </div>
                      {change.after && (
                        <pre className="change-content">{change.after}</pre>
                      )}
                    </div>
                  ))}
                </div>

                <div className="preview-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setSelectedProposal(null)}
                  >
                    Close
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setSelectedProposal(null);
                      setShowApplyConfirm(selected.id);
                    }}
                    disabled={applyMutation.isPending}
                  >
                    Apply This Proposal
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {showApplyConfirm && (
        <ConfirmDialog
          title="Apply Proposal"
          message="Are you sure you want to apply this proposal? This will make changes to the project."
          onConfirm={() => handleApply(showApplyConfirm)}
          onCancel={() => setShowApplyConfirm(null)}
          confirmText="Apply"
          confirmButtonStyle="primary"
        />
      )}

      {showRejectConfirm && (
        <ConfirmDialog
          title="Reject Proposal"
          message="Are you sure you want to reject this proposal? This action cannot be undone."
          onConfirm={() => handleReject(showRejectConfirm)}
          onCancel={() => setShowRejectConfirm(null)}
          confirmText="Reject"
          confirmButtonStyle="danger"
        />
      )}
    </div>
  );
}
