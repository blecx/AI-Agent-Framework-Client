import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/apiClient';
import ProposePanel from './ProposePanel';
import ApplyPanel from './ApplyPanel';
import CommandPanel from './CommandPanel';
import './ProjectView.css';

type TabType = 'overview' | 'propose' | 'apply' | 'commands';

export default function ProjectView() {
  const { key } = useParams<{ key: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Fetch project data
  const { data: projectResponse, isLoading, error } = useQuery({
    queryKey: ['project', key],
    queryFn: async () => {
      if (!key) throw new Error('Project key is required');
      const response = await apiClient.getProject(key);
      if (!response.success) {
        throw new Error(response.error || 'Failed to load project');
      }
      return response.data;
    },
    enabled: !!key,
  });

  if (isLoading) {
    return (
      <div className="project-view-container">
        <div className="loading">Loading project...</div>
      </div>
    );
  }

  if (error || !projectResponse) {
    return (
      <div className="project-view-container">
        <div className="error">
          Error loading project: {(error as Error)?.message || 'Unknown error'}
        </div>
        <button className="btn-secondary" onClick={() => navigate('/')}>
          Back to Projects
        </button>
      </div>
    );
  }

  const project = projectResponse;

  return (
    <div className="project-view-container">
      <header className="project-header">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate('/')}>
            ← Back to Projects
          </button>
          <div>
            <h1>{project.name}</h1>
            <p className="project-key">Key: {project.key}</p>
          </div>
        </div>
      </header>

      <nav className="project-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'propose' ? 'active' : ''}`}
          onClick={() => setActiveTab('propose')}
        >
          Propose Changes
        </button>
        <button
          className={`tab ${activeTab === 'apply' ? 'active' : ''}`}
          onClick={() => setActiveTab('apply')}
        >
          Apply Proposals
        </button>
        <button
          className={`tab ${activeTab === 'commands' ? 'active' : ''}`}
          onClick={() => setActiveTab('commands')}
        >
          Commands
        </button>
      </nav>

      <div className="project-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <section className="project-section">
              <h2>Project Details</h2>
              {project.description && <p>{project.description}</p>}
              <div className="detail-row">
                <span className="label">Created:</span>
                <span>{new Date(project.createdAt).toLocaleString()}</span>
              </div>
              <div className="detail-row">
                <span className="label">Last Updated:</span>
                <span>{new Date(project.updatedAt).toLocaleString()}</span>
              </div>
            </section>

            {project.gitRepo && (
              <section className="project-section">
                <h2>Git Repository</h2>
                <div className="detail-row">
                  <span className="label">URL:</span>
                  <span className="monospace">{project.gitRepo.url}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Branch:</span>
                  <span className="monospace">{project.gitRepo.branch}</span>
                </div>
                {project.gitRepo.lastCommit && (
                  <div className="detail-row">
                    <span className="label">Last Commit:</span>
                    <span className="monospace">{project.gitRepo.lastCommit}</span>
                  </div>
                )}
                {project.gitRepo.status && (
                  <div className="detail-row">
                    <span className="label">Status:</span>
                    <span className={`status-badge status-${project.gitRepo.status}`}>
                      {project.gitRepo.status}
                    </span>
                  </div>
                )}
              </section>
            )}

            {project.documents && project.documents.length > 0 && (
              <section className="project-section">
                <h2>Documents ({project.documents.length})</h2>
                <div className="documents-list">
                  {project.documents.map((doc) => (
                    <div key={doc.id} className="document-item">
                      <div className="document-name">{doc.name}</div>
                      <div className="document-path">{doc.path}</div>
                      <div className="document-meta">
                        Last modified: {new Date(doc.lastModified).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {activeTab === 'propose' && key && <ProposePanel projectKey={key} />}
        {activeTab === 'apply' && key && <ApplyPanel projectKey={key} />}
        {activeTab === 'commands' && key && <CommandPanel projectKey={key} />}
      </div>
    </div>
  );
}
