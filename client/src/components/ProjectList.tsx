/**
 * ProjectList Component
 * Displays a list of all projects with options to view details and create new projects
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient, { type Project, type ApiError } from '../services/apiClient';
import './ProjectList.css';

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectKey, setNewProjectKey] = useState('');
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.fetchProjects();
      setProjects(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      setCreating(true);
      setError(null);
      const project = await apiClient.createProject({
        name: newProjectName,
        key: newProjectKey || undefined,
      });
      setProjects([...projects, project]);
      setShowCreateForm(false);
      setNewProjectName('');
      setNewProjectKey('');
      // Navigate to the new project
      navigate(`/projects/${project.key}`);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const handleProjectClick = (projectKey: string) => {
    navigate(`/projects/${projectKey}`);
  };

  if (loading) {
    return (
      <div className="project-list-container">
        <div className="loading">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="project-list-container">
      <div className="project-list-header">
        <h1>Projects</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          + Create Project
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label htmlFor="projectName">Project Name *</label>
                <input
                  id="projectName"
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Enter project name"
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label htmlFor="projectKey">Project Key (optional)</label>
                <input
                  id="projectKey"
                  type="text"
                  value={newProjectKey}
                  onChange={(e) => setNewProjectKey(e.target.value)}
                  placeholder="Auto-generated if not provided"
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateForm(false)}
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={creating}
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="empty-state">
          <p>No projects found. Create your first project to get started!</p>
        </div>
      ) : (
        <div className="project-grid">
          {projects.map((project) => (
            <div
              key={project.key}
              className="project-card"
              onClick={() => handleProjectClick(project.key)}
            >
              <div className="project-card-header">
                <h3>{project.name}</h3>
                <span className={`status-badge status-${project.status}`}>
                  {project.status}
                </span>
              </div>
              <div className="project-card-body">
                <p className="project-key">Key: {project.key}</p>
                {project.documents && (
                  <p className="project-documents">
                    {project.documents.length} document(s)
                  </p>
                )}
              </div>
              <div className="project-card-footer">
                {project.updatedAt && (
                  <small>Updated: {new Date(project.updatedAt).toLocaleDateString()}</small>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
