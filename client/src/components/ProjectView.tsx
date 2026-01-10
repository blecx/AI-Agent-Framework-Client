/**
 * ProjectView Component
 * Displays detailed information about a specific project
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import type { Project, Proposal, ApiError } from '../services/apiClient';
import './ProjectView.css';

export default function ProjectView() {
  const { projectKey } = useParams<{ projectKey: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');

  const loadProject = useCallback(async () => {
    if (!projectKey) return;
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getProject(projectKey);
      setProject(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  }, [projectKey]);

  const loadProposals = useCallback(async () => {
    if (!projectKey) return;
    try {
      const response = await apiClient.getProposals(projectKey);
      if (response.success && response.data) {
        setProposals(response.data);
      }
    } catch (err) {
      // Silently fail for proposals if endpoint doesn't exist
      console.error('Failed to load proposals:', err);
    }
  }, [projectKey]);

  useEffect(() => {
    if (projectKey) {
      loadProject();
      loadProposals();
    }
  }, [projectKey, loadProject, loadProposals]);

  const handleProposeChanges = () => {
    navigate(`/projects/${projectKey}/propose`);
  };

  const handleApplyProposal = async (proposalId: string) => {
    if (!projectKey) return;
    if (!confirm('Are you sure you want to apply this proposal?')) return;

    try {
      await apiClient.applyProposal(projectKey, proposalId);
      alert('Proposal applied successfully!');
      loadProject();
      loadProposals();
    } catch (err) {
      const apiError = err as ApiError;
      alert(apiError.message || 'Failed to apply proposal');
    }
  };

  if (loading) {
    return (
      <div className="project-view-container">
        <div className="loading">Loading project...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="project-view-container">
        <div className="error-message">
          {error || 'Project not found'}
          <button onClick={() => navigate('/projects')}>← Back to Projects</button>
        </div>
      </div>
    );
  }

  return (
    <div className="project-view-container">
      <div className="project-view-header">
        <button className="btn-back" onClick={() => navigate('/projects')}>
          ← Back to Projects
        </button>
        <div className="project-title-section">
          <h1>{project.name}</h1>
          <span className={`status-badge status-${project.status}`}>
            {project.status}
          </span>
        </div>
        <button className="btn btn-primary" onClick={handleProposeChanges}>
          Propose Changes
        </button>
      </div>

      <div className="project-info-card">
        <div className="info-item">
          <label>Project Key:</label>
          <span>{project.key}</span>
        </div>
        {project.createdAt && (
          <div className="info-item">
            <label>Created:</label>
            <span>{new Date(project.createdAt).toLocaleString()}</span>
          </div>
        )}
        {project.updatedAt && (
          <div className="info-item">
            <label>Last Updated:</label>
            <span>{new Date(project.updatedAt).toLocaleString()}</span>
          </div>
        )}
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Details
        </button>
        <button
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History ({proposals.length})
        </button>
      </div>

      {activeTab === 'details' && (
        <div className="tab-content">
          <h2>Documents</h2>
          {project.documents && project.documents.length > 0 ? (
            <div className="documents-list">
              {project.documents.map((doc, index) => (
                <div key={index} className="document-card">
                  <div className="document-header">
                    <span className="document-path">{doc.path}</span>
                    {doc.type && (
                      <span className="document-type">{doc.type}</span>
                    )}
                  </div>
                  <pre className="document-content">{doc.content}</pre>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-message">No documents in this project yet.</p>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="tab-content">
          <h2>Proposal History</h2>
          {proposals.length > 0 ? (
            <div className="proposals-list">
              {proposals.map((proposal) => (
                <div key={proposal.id} className="proposal-card">
                  <div className="proposal-header">
                    <span className="proposal-id">#{proposal.id}</span>
                    <span className={`proposal-status status-${proposal.status}`}>
                      {proposal.status}
                    </span>
                  </div>
                  <div className="proposal-body">
                    <p className="proposal-date">
                      Created: {new Date(proposal.createdAt).toLocaleString()}
                    </p>
                    <p className="proposal-changes">
                      {proposal.changes.length} change(s)
                    </p>
                  </div>
                  {proposal.status === 'pending' && (
                    <div className="proposal-actions">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleApplyProposal(proposal.id)}
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-message">No proposals yet. Create your first proposal!</p>
          )}
        </div>
      )}
    </div>
  );
}
