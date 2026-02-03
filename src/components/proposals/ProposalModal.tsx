/**
 * ProposalModal Component
 * Displays proposal details with diff viewer and allows apply/reject actions
 */

import React, { useState } from 'react';
import './ProposalModal.css';

interface ProposalModalProps {
  projectKey: string;
  proposalId: string;
  proposalData: {
    command: string;
    params: Record<string, any>;
    assistant_message: string;
    file_changes: Array<{
      path: string;
      change_type: string;
      diff?: string;
      content?: string;
    }>;
    draft_commit_message: string;
  };
  onClose: () => void;
  onApplied: () => void;
}

export const ProposalModal: React.FC<ProposalModalProps> = ({
  projectKey,
  proposalId,
  proposalData,
  onClose,
  onApplied,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);

  const handleApplyProposal = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/v1/projects/${projectKey}/commands/apply`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            proposal_id: proposalId,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to apply proposal');
      }

      const result = await response.json();
      console.log('Proposal applied successfully:', result);
      onApplied();
    } catch (err: any) {
      console.error('Failed to apply proposal:', err);
      setError(err.message || 'Failed to apply proposal');
    } finally {
      setLoading(false);
    }
  };

  const renderDiff = (fileChange: any) => {
    if (fileChange.diff) {
      // Parse and render diff
      const diffLines = fileChange.diff.split('\n');
      return (
        <div className="diff-viewer">
          {diffLines.map((line: string, index: number) => {
            let lineClass = 'diff-line';
            if (line.startsWith('+')) {
              lineClass += ' diff-line-added';
            } else if (line.startsWith('-')) {
              lineClass += ' diff-line-removed';
            } else if (line.startsWith('@@')) {
              lineClass += ' diff-line-hunk';
            }

            return (
              <div key={index} className={lineClass}>
                {line}
              </div>
            );
          })}
        </div>
      );
    } else if (fileChange.content) {
      // Show full content for new files
      return (
        <div className="file-content">
          <pre>{fileChange.content}</pre>
        </div>
      );
    } else {
      return <div className="no-preview">No preview available</div>;
    }
  };

  const selectedFile = proposalData.file_changes[selectedFileIndex];

  return (
    <div className="proposal-modal-overlay" onClick={onClose}>
      <div className="proposal-modal" onClick={(e) => e.stopPropagation()}>
        <div className="proposal-modal-header">
          <h2>Review Proposal</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="proposal-modal-body">
          {/* Command Info */}
          <div className="proposal-section">
            <h3>Command</h3>
            <div className="command-info">
              <span className="command-badge">{proposalData.command}</span>
              {Object.keys(proposalData.params).length > 0 && (
                <div className="command-params">
                  <strong>Parameters:</strong>
                  <pre>{JSON.stringify(proposalData.params, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>

          {/* Assistant Message */}
          <div className="proposal-section">
            <h3>Description</h3>
            <div className="assistant-message">
              {proposalData.assistant_message}
            </div>
          </div>

          {/* File Changes */}
          <div className="proposal-section">
            <h3>File Changes ({proposalData.file_changes.length})</h3>

            {/* File Tabs */}
            <div className="file-tabs">
              {proposalData.file_changes.map((file, index) => (
                <button
                  key={index}
                  className={`file-tab ${index === selectedFileIndex ? 'active' : ''}`}
                  onClick={() => setSelectedFileIndex(index)}
                >
                  <span className={`change-type-badge ${file.change_type}`}>
                    {file.change_type}
                  </span>
                  {file.path}
                </button>
              ))}
            </div>

            {/* Diff Viewer */}
            {selectedFile && renderDiff(selectedFile)}
          </div>

          {/* Commit Message */}
          <div className="proposal-section">
            <h3>Commit Message</h3>
            <div className="commit-message">
              {proposalData.draft_commit_message}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="error-message">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        <div className="proposal-modal-footer">
          <button
            className="btn-reject"
            onClick={onClose}
            disabled={loading}
          >
            Reject
          </button>
          <button
            className="btn-apply"
            onClick={handleApplyProposal}
            disabled={loading}
          >
            {loading ? 'Applying...' : 'Apply Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
