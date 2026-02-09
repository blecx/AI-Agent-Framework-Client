import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/apiClient';
import type { Project } from '../types';
import { useToast } from '../hooks/useToast';
import { SkeletonProjectCard } from './ui/Skeleton';
import EmptyState from './ui/EmptyState';
import { Button } from './ui/Button';
import './ProjectList.css';

export default function ProjectList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProject, setNewProject] = useState({
    key: '',
    name: '',
    description: '',
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch projects
  const {
    data: projectsResponse,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await apiClient.listProjects();
      if (!response.success) {
        throw new Error(response.error || 'Failed to load projects');
      }
      return response.data || [];
    },
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (project: {
      key: string;
      name: string;
      description?: string;
    }) => {
      const response = await apiClient.createProject(
        project.key,
        project.name,
        project.description,
      );
      if (!response.success) {
        throw new Error(response.error || 'Failed to create project');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowCreateForm(false);
      setNewProject({ key: '', name: '', description: '' });
      setError(null);
      toast.showSuccess('Project created successfully!');
    },
    onError: (error: Error) => {
      console.error('Error creating project:', error);
      setError(error.message);
      toast.showError(`Failed to create project: ${error.message}`);
    },
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.key || !newProject.name) {
      setError('Project key and name are required');
      return;
    }
    createProjectMutation.mutate(newProject);
  };

  const handleViewProject = (projectKey: string) => {
    navigate(`/project/${projectKey}`);
  };

  if (isLoading) {
    return (
      <div className="project-list-container">
        <header className="project-list-header">
          <h1>Projects</h1>
        </header>
        <div className="projects-grid">
          <SkeletonProjectCard />
          <SkeletonProjectCard />
          <SkeletonProjectCard />
        </div>
      </div>
    );
  }

  if (queryError) {
    return (
      <div className="project-list-container">
        <div className="error">
          Error loading projects: {(queryError as Error).message}
        </div>
      </div>
    );
  }

  const projects = projectsResponse || [];

  return (
    <div className="project-list-container">
      <header className="project-list-header">
        <h1>Projects</h1>
        <Button
          variant="primary"
          data-testid="create-project-button"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : '+ Create Project'}
        </Button>
      </header>

      {error && <div className="error-message">{error}</div>}

      {showCreateForm && (
        <div className="create-project-form" data-testid="create-project-form">
          <h2>Create New Project</h2>
          <form onSubmit={handleCreateProject}>
            <div className="form-group">
              <label htmlFor="projectKey">Project Key *</label>
              <input
                id="projectKey"
                type="text"
                value={newProject.key}
                onChange={(e) =>
                  setNewProject({ ...newProject, key: e.target.value })
                }
                placeholder="e.g., my-project"
                required
              />
              <small>Unique identifier (lowercase, hyphens allowed)</small>
            </div>
            <div className="form-group">
              <label htmlFor="projectName">Project Name *</label>
              <input
                id="projectName"
                type="text"
                value={newProject.name}
                onChange={(e) =>
                  setNewProject({ ...newProject, name: e.target.value })
                }
                placeholder="e.g., My Awesome Project"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="projectDescription">Description</label>
              <textarea
                id="projectDescription"
                value={newProject.description}
                onChange={(e) =>
                  setNewProject({ ...newProject, description: e.target.value })
                }
                placeholder="Optional project description"
                rows={3}
              />
            </div>
            <div className="form-actions">
              <Button
                type="submit"
                variant="primary"
                isLoading={createProjectMutation.isPending}
                disabled={createProjectMutation.isPending}
              >
                Create Project
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowCreateForm(false);
                  setError(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {projects.length === 0 ? (
        <EmptyState
          icon="📁"
          title="No projects yet"
          description="Create your first project to start managing your work with AI-powered assistance."
          action={{
            label: '+ Create Project',
            onClick: () => setShowCreateForm(true),
          }}
        />
      ) : (
        <div className="projects-grid">
          {projects.map((project: Project) => (
            <div
              key={project.key}
              className="project-card"
              data-testid={`project-card-${project.key}`}
              onClick={() => handleViewProject(project.key)}
            >
              <h3>{project.name}</h3>
              <p className="project-key">Key: {project.key}</p>
              {project.description && (
                <p className="project-description">{project.description}</p>
              )}
              <div className="project-meta">
                <span>
                  Created: {new Date(project.createdAt).toLocaleDateString()}
                </span>
                {project.gitRepo && (
                  <span className="git-status">
                    📁 {project.gitRepo.branch}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
