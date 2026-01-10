import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../services/apiClient';
import './ProjectView.css';

interface Document {
  id: string;
  name: string;
  path: string;
}

interface Project {
  key: string;
  name: string;
  description?: string;
  documents?: Document[];
  status?: string;
  createdAt?: string;
}

/**
 * ProjectView Component
 * Displays detailed information about a single project
 */
function ProjectView() {
  const { projectKey } = useParams<{ projectKey: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProject = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getProject(projectKey!);
      setProject(data);
    } catch (err) {
      setError((err as Error).message || 'Failed to load project');
      // Mock data for development
      setProject({
        key: projectKey!,
        name: 'Demo Project',
        description: 'Sample project for testing',
        documents: [
          { id: '1', name: 'README.md', path: '/README.md' },
          { id: '2', name: 'config.json', path: '/config.json' },
        ],
        status: 'active',
        createdAt: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  }, [projectKey]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  if (loading) {
    return <div className="loading">Loading project...</div>;
  }

  if (error) {
    return (
      <div className="project-view">
        <div className="error-message">{error}</div>
        <Link to="/" className="btn btn-secondary">Back to Projects</Link>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="project-view">
        <div className="empty-state">Project not found</div>
        <Link to="/" className="btn btn-secondary">Back to Projects</Link>
      </div>
    );
  }

  return (
    <div className="project-view">
      <div className="breadcrumb">
        <Link to="/">Projects</Link>
        <span className="separator">/</span>
        <span>{project.name}</span>
      </div>

      <div className="project-header">
        <div>
          <h1>{project.name}</h1>
          <p className="project-description">{project.description}</p>
          <div className="project-info">
            <span className="info-item">
              <strong>Key:</strong> {project.key}
            </span>
            <span className="info-item">
              <strong>Status:</strong> <span className="status-badge">{project.status || 'active'}</span>
            </span>
          </div>
        </div>
        <div className="action-buttons">
          <Link to={`/projects/${projectKey}/propose`} className="btn btn-primary">
            Propose Changes
          </Link>
          <Link to={`/projects/${projectKey}/apply`} className="btn btn-secondary">
            Apply Proposals
          </Link>
        </div>
      </div>

      <div className="project-content">
        <section className="documents-section">
          <h2>Document Structure</h2>
          {project.documents && project.documents.length > 0 ? (
            <ul className="document-list">
              {project.documents.map((doc) => (
                <li key={doc.id} className="document-item">
                  <span className="doc-icon">📄</span>
                  <div className="doc-info">
                    <span className="doc-name">{doc.name}</span>
                    <span className="doc-path">{doc.path}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state">No documents in this project</p>
          )}
        </section>

        <section className="proposals-section">
          <h2>Recent Proposals</h2>
          <p className="empty-state">No proposals yet</p>
        </section>
      </div>
    </div>
  );
}

export default ProjectView;
