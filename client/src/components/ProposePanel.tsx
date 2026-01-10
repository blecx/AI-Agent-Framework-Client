/**
 * ProposePanel Component
 * Form to propose document changes to a project
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient, { type Change, type ApiError } from '../services/apiClient';
import './ProposePanel.css';

export default function ProposePanel() {
  const { projectKey } = useParams<{ projectKey: string }>();
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [changes, setChanges] = useState<Change[]>([{
    path: '',
    operation: 'create',
    content: '',
  }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddChange = () => {
    setChanges([...changes, {
      path: '',
      operation: 'create',
      content: '',
    }]);
  };

  const handleRemoveChange = (index: number) => {
    setChanges(changes.filter((_, i) => i !== index));
  };

  const handleChangeUpdate = (index: number, field: keyof Change, value: string) => {
    const updatedChanges = [...changes];
    updatedChanges[index] = {
      ...updatedChanges[index],
      [field]: value,
    };
    setChanges(updatedChanges);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectKey) return;

    // Validate changes
    const validChanges = changes.filter(c => c.path.trim());
    if (validChanges.length === 0) {
      setError('At least one change with a path is required');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await apiClient.proposeChanges(projectKey, {
        description: description || undefined,
        changes: validChanges,
      });
      alert('Proposal submitted successfully!');
      navigate(`/projects/${projectKey}`);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to submit proposal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (confirm('Discard changes and go back?')) {
      navigate(`/projects/${projectKey}`);
    }
  };

  return (
    <div className="propose-panel-container">
      <div className="propose-panel-header">
        <button className="btn-back" onClick={handleCancel}>
          ← Back to Project
        </button>
        <h1>Propose Changes</h1>
        <p className="project-key-label">Project: {projectKey}</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="propose-form">
        <div className="form-section">
          <label htmlFor="description">Description (optional)</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the changes you're proposing..."
            rows={3}
          />
        </div>

        <div className="form-section">
          <div className="section-header">
            <h2>Changes</h2>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleAddChange}
            >
              + Add Change
            </button>
          </div>

          {changes.map((change, index) => (
            <div key={index} className="change-card">
              <div className="change-card-header">
                <span>Change #{index + 1}</span>
                {changes.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => handleRemoveChange(index)}
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="change-card-body">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor={`path-${index}`}>File Path *</label>
                    <input
                      id={`path-${index}`}
                      type="text"
                      value={change.path}
                      onChange={(e) => handleChangeUpdate(index, 'path', e.target.value)}
                      placeholder="e.g., src/components/Example.tsx"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor={`operation-${index}`}>Operation *</label>
                    <select
                      id={`operation-${index}`}
                      value={change.operation}
                      onChange={(e) => handleChangeUpdate(index, 'operation', e.target.value as 'create' | 'update' | 'delete')}
                      required
                    >
                      <option value="create">Create</option>
                      <option value="update">Update</option>
                      <option value="delete">Delete</option>
                    </select>
                  </div>
                </div>

                {change.operation !== 'delete' && (
                  <div className="form-group">
                    <label htmlFor={`content-${index}`}>Content</label>
                    <textarea
                      id={`content-${index}`}
                      value={change.content || ''}
                      onChange={(e) => handleChangeUpdate(index, 'content', e.target.value)}
                      placeholder="Enter file content or changes..."
                      rows={6}
                      className="code-textarea"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCancel}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Proposal'}
          </button>
        </div>
      </form>
    </div>
  );
}
