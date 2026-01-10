import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/apiClient';
import './ProjectList.css';

interface Project {
  key: string;
  name: string;
  description?: string;
}

/**
 * ProjectList Component
 * Displays a list of all projects with create/manage functionality
 */
function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data: { projects?: Project[] } = await apiClient.listProjects();
      setProjects(data.projects || []);
    } catch (err) {
      setError((err as Error).message || 'Failed to load projects');
      // Mock data for development
      setProjects([
        { key: 'demo-project', name: 'Demo Project', description: 'Sample project for testing' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await apiClient.createProject(newProject);
      setNewProject({ name: '', description: '' });
      setShowCreateForm(false);
      loadProjects();
    } catch (err) {
      setError((err as Error).message || 'Failed to create project');
    }
  };

  if (loading) {
    return <div className="loading">Loading projects...</div>;
  }

  return (
    <div className="project-list">
      <div className="header">
        <h1>Projects</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          + Create Project
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {showCreateForm && (
        <div className="create-form">
          <h2>Create New Project</h2>
          <form onSubmit={handleCreateProject}>
            <div className="form-group">
              <label htmlFor="name">Project Name</label>
              <input
                id="name"
                type="text"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                required
                placeholder="Enter project name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                placeholder="Enter project description"
                rows={3}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Create</button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="projects-grid">
        {projects.length === 0 ? (
          <div className="empty-state">
            <p>No projects found. Create your first project to get started!</p>
          </div>
        ) : (
          projects.map((project) => (
            <Link 
              key={project.key} 
              to={`/projects/${project.key}`}
              className="project-card"
            >
              <h3>{project.name}</h3>
              <p>{project.description || 'No description available'}</p>
              <div className="project-meta">
                <span className="project-key">{project.key}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

export default ProjectList;
