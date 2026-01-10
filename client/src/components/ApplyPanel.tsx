import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../services/apiClient';
import type { Proposal } from '../types';
import './ApplyPanel.css';

function ApplyPanel() {
  const { projectKey } = useParams<{ projectKey: string }>();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadProposals();
  }, [projectKey]);

  const loadProposals = async () => {
    try {
      setLoading(true);
      setError(null);
      // In real implementation, this would fetch proposals from the API
      // For now, using mock data
      setProposals([
        {
          id: '1',
          title: 'Update README documentation',
          description: 'Add installation instructions and usage examples',
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Add configuration file',
          description: 'Create initial config.json with default settings',
          status: 'pending',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ]);
    } catch (err) {
      setError((err as Error).message || 'Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setSuccess(null);
  };

  const handleApply = async (proposalId: string) => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.apply(projectKey!, proposalId);
      setSuccess('Proposal applied successfully!');
      setSelectedProposal(null);
      loadProposals();
    } catch (err) {
      setError((err as Error).message || 'Failed to apply proposal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="apply-panel">
      <div className="breadcrumb">
        <Link to="/">Projects</Link>
        <span className="separator">/</span>
        <Link to={`/projects/${projectKey}`}>{projectKey}</Link>
        <span className="separator">/</span>
        <span>Apply Proposals</span>
      </div>

      <h1>Apply Proposals</h1>

      {error && (
        <div className="error-message">{error}</div>
      )}

      {success && (
        <div className="success-message">{success}</div>
      )}

      <div className="apply-layout">
        <div className="proposals-list">
          <h2>Pending Proposals</h2>
          {loading && !proposals.length ? (
            <div className="loading">Loading proposals...</div>
          ) : proposals.length === 0 ? (
            <div className="empty-state">
              <p>No pending proposals</p>
              <Link to={`/projects/${projectKey}/propose`} className="btn btn-primary">
                Create Proposal
              </Link>
            </div>
          ) : (
            <ul className="proposal-items">
              {proposals.map((proposal) => (
                <li
                  key={proposal.id}
                  className={`proposal-item ${selectedProposal?.id === proposal.id ? 'active' : ''}`}
                  onClick={() => handleSelectProposal(proposal)}
                >
                  <div className="proposal-header">
                    <h3>{proposal.title}</h3>
                    <span className={`status-badge ${proposal.status}`}>
                      {proposal.status}
                    </span>
                  </div>
                  <p className="proposal-description">{proposal.description}</p>
                  <div className="proposal-meta">
                    <span className="proposal-date">
                      {new Date(proposal.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="proposal-detail">
          {selectedProposal ? (
            <>
              <h2>{selectedProposal.title}</h2>
              <div className="detail-content">
                <div className="detail-section">
                  <h3>Description</h3>
                  <p>{selectedProposal.description}</p>
                </div>

                <div className="detail-section">
                  <h3>Status</h3>
                  <span className={`status-badge ${selectedProposal.status}`}>
                    {selectedProposal.status}
                  </span>
                </div>

                <div className="detail-section">
                  <h3>Created</h3>
                  <p>{new Date(selectedProposal.createdAt).toLocaleString()}</p>
                </div>

                <div className="detail-section">
                  <h3>Changes Preview</h3>
                  <div className="changes-preview">
                    <pre>
{`// Example changes (would be loaded from API)
+ Added new feature
+ Updated documentation
- Removed deprecated code`}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="detail-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => handleApply(selectedProposal.id)}
                  disabled={loading}
                >
                  {loading ? 'Applying...' : 'Apply Proposal'}
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => setSelectedProposal(null)}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p>Select a proposal to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ApplyPanel;
