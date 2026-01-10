import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import apiClient from '../services/apiClient';
import './ProposePanel.css';

interface ProposePanelProps {
  projectKey?: string;
}

export default function ProposePanel({ projectKey: propProjectKey }: ProposePanelProps = {}) {
  const { projectKey: paramProjectKey } = useParams<{ projectKey: string }>();
  const projectKey = propProjectKey || paramProjectKey;
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [changesJson, setChangesJson] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [proposalId, setProposalId] = useState<string | null>(null);

  const proposeMutation = useMutation({
    mutationFn: async (changes: object) => {
      if (!projectKey) throw new Error('Project key is required');
      const response = await apiClient.propose(projectKey, changes);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create proposal');
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['proposals', projectKey] });
      setProposalId(data?.id || null);
      setError(null);
      // Reset form
      setTitle('');
      setDescription('');
      setChangesJson('');
    },
    onError: (error: Error) => {
      setError(error.message);
      setProposalId(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setProposalId(null);

    // Parse JSON changes
    let changes;
    try {
      changes = JSON.parse(changesJson || '{}');
    } catch {
      setError('Invalid JSON format in changes field');
      return;
    }

    // Add title and description to changes
    const proposalData = {
      title,
      description,
      changes,
    };

    proposeMutation.mutate(proposalData);
  };

  const loadExampleJson = () => {
    const example = {
      files: [
        {
          path: 'src/example.ts',
          type: 'modify',
          before: 'old content',
          after: 'new content',
        },
      ],
    };
    setChangesJson(JSON.stringify(example, null, 2));
  };

  return (
    <div className="propose-panel">
      <h2>Propose Document Changes</h2>
      <p className="description">
        Submit a proposal to modify documents in this project. Your changes will be reviewed
        before being applied.
      </p>

      {error && <div className="error-message">{error}</div>}

      {proposalId && (
        <div className="success-message">
          ✓ Proposal created successfully! ID: <strong>{proposalId}</strong>
          <br />
          Go to the "Apply Proposals" tab to review and apply it.
        </div>
      )}

      <form onSubmit={handleSubmit} className="propose-form">
        <div className="form-group">
          <label htmlFor="proposalTitle">Title *</label>
          <input
            id="proposalTitle"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief description of changes"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="proposalDescription">Description</label>
          <textarea
            id="proposalDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed explanation of the proposed changes"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="changesJson">Changes (JSON) *</label>
          <div className="json-editor-header">
            <button
              type="button"
              className="btn-link"
              onClick={loadExampleJson}
            >
              Load Example
            </button>
          </div>
          <textarea
            id="changesJson"
            value={changesJson}
            onChange={(e) => setChangesJson(e.target.value)}
            placeholder='{"files": [{"path": "file.txt", "type": "modify", "after": "new content"}]}'
            rows={12}
            className="json-editor"
            required
          />
          <small>
            Provide the changes as a JSON object. Must include file paths and modifications.
          </small>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={proposeMutation.isPending}
          >
            {proposeMutation.isPending ? 'Submitting...' : 'Submit Proposal'}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setTitle('');
              setDescription('');
              setChangesJson('');
              setError(null);
              setProposalId(null);
            }}
          >
            Clear Form
          </button>
        </div>
      </form>
    </div>
  );
}
