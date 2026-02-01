/**
 * ProposalCreator Component
 * Allows users to edit artifact content and create proposals with diff visualization
 */

import React, { useState, useEffect } from 'react';
import { DiffViewer } from './DiffViewer';
import { proposalApiClient, type ChangeType } from '../services/ProposalApiClient';
import { artifactApiClient } from '../services/ArtifactApiClient';
import './ProposalCreator.css';

export interface ProposalCreatorProps {
  projectKey: string;
  artifactPath: string;
  onComplete?: () => void;
  onCancel?: () => void;
}

export const ProposalCreator: React.FC<ProposalCreatorProps> = ({
  projectKey,
  artifactPath,
  onComplete,
  onCancel,
}) => {
  const [originalContent, setOriginalContent] = useState('');
  const [newContent, setNewContent] = useState('');
  const [rationale, setRationale] = useState('');
  const [author, setAuthor] = useState('system');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadArtifact();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectKey, artifactPath]);

  const loadArtifact = async () => {
    try {
      setLoading(true);
      setError(null);
      const content = await artifactApiClient.getArtifact(projectKey, artifactPath);
      setOriginalContent(content);
      setNewContent(content);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('404')) {
          // Artifact doesn't exist yet - create mode
          setOriginalContent('');
          setNewContent('');
        } else {
          setError(`Failed to load artifact: ${err.message}`);
        }
      } else {
        setError('Failed to load artifact');
      }
    } finally {
      setLoading(false);
    }
  };

  const generateUnifiedDiff = (oldContent: string, newContent: string): string => {
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');
    const diff: string[] = ['--- a/' + artifactPath, '+++ b/' + artifactPath];

    let i = 0;
    while (i < Math.max(oldLines.length, newLines.length)) {
      if (oldLines[i] === newLines[i]) {
        diff.push(' ' + (oldLines[i] || ''));
      } else {
        if (oldLines[i] !== undefined) {
          diff.push('-' + oldLines[i]);
        }
        if (newLines[i] !== undefined) {
          diff.push('+' + newLines[i]);
        }
      }
      i++;
    }

    return diff.join('\n');
  };

  const determineChangeType = (): ChangeType => {
    if (originalContent === '' && newContent !== '') {
      return 'create';
    } else if (originalContent !== '' && newContent === '') {
      return 'delete';
    } else {
      return 'update';
    }
  };

  const handleSubmit = async () => {
    if (!rationale.trim()) {
      setError('Rationale is required');
      return;
    }

    if (originalContent === newContent) {
      setError('No changes detected');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const changeType = determineChangeType();
      const diff = generateUnifiedDiff(originalContent, newContent);
      const proposalId = `prop-${Date.now()}`;

      await proposalApiClient.createProposal(projectKey, {
        id: proposalId,
        target_artifact: artifactPath,
        change_type: changeType,
        diff,
        rationale: rationale.trim(),
        author,
      });

      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(`Failed to create proposal: ${err.message}`);
      } else {
        setError('Failed to create proposal');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const hasChanges = originalContent !== newContent;

  if (loading) {
    return <div className="proposal-creator-loading">Loading artifact...</div>;
  }

  return (
    <div className="proposal-creator">
      <h2>Create Proposal</h2>
      <p className="proposal-creator-artifact">
        <strong>Artifact:</strong> {artifactPath}
      </p>

      {error && <div className="proposal-creator-error">{error}</div>}

      <div className="proposal-creator-editor">
        <label htmlFor="content-editor">Edit Content:</label>
        <textarea
          id="content-editor"
          className="proposal-creator-textarea"
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          rows={15}
          placeholder="Enter artifact content..."
        />
      </div>

      {hasChanges && (
        <div className="proposal-creator-preview">
          <div className="proposal-creator-preview-header">
            <h3>Preview Changes</h3>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="proposal-creator-toggle"
            >
              {showPreview ? 'Hide' : 'Show'} Diff
            </button>
          </div>
          {showPreview && (
            <DiffViewer
              oldContent={originalContent}
              newContent={newContent}
              splitView={true}
              fileName={artifactPath}
            />
          )}
        </div>
      )}

      <div className="proposal-creator-rationale">
        <label htmlFor="rationale">Rationale (required):</label>
        <textarea
          id="rationale"
          className="proposal-creator-textarea"
          value={rationale}
          onChange={(e) => setRationale(e.target.value)}
          rows={4}
          placeholder="Explain why these changes are needed..."
          required
        />
      </div>

      <div className="proposal-creator-author">
        <label htmlFor="author">Author:</label>
        <input
          id="author"
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="system"
        />
      </div>

      <div className="proposal-creator-actions">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || !hasChanges || !rationale.trim()}
          className="proposal-creator-submit"
        >
          {submitting ? 'Creating...' : 'Create Proposal'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="proposal-creator-cancel"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};
