/**
 * ProjectSelector Component
 * Dropdown for selecting the active project
 */

import { useState, useEffect } from 'react';
import { useProject } from '../contexts/ProjectContext';
import { ProjectsService } from '../services/api/projects';
import { ApiClient } from '../services/api/client';
import type { ProjectInfo } from '../types/api';
import './ProjectSelector.css';

export function ProjectSelector() {
  const { currentProjectKey, setCurrentProjectKey } = useProject();
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Lazy-load services inside component for better testability
  const [projectsService] = useState(() => {
    const apiClient = new ApiClient({ baseURL: '' });
    return new ProjectsService(apiClient);
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const projectsList = await projectsService.listProjects();
      setProjects(projectsList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (projectKey: string) => {
    setCurrentProjectKey(projectKey);
    setIsOpen(false);
  };

  const handleClear = () => {
    setCurrentProjectKey(null);
    setIsOpen(false);
  };

  const currentProject = projects?.find((p) => p.key === currentProjectKey);

  if (loading) {
    return (
      <div className="project-selector loading">
        <span className="selector-label">Loading projects...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="project-selector error">
        <span className="selector-label">Error: {error}</span>
        <button
          onClick={loadProjects}
          className="btn-retry"
          aria-label="Retry loading projects"
        >
          ↻
        </button>
      </div>
    );
  }

  if (projects && projects.length === 0) {
    return (
      <div className="project-selector empty">
        <span className="selector-label">No projects available</span>
      </div>
    );
  }

  return (
    <div className="project-selector">
      <button
        className="selector-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select project"
      >
        <span className="selector-icon">📂</span>
        <span className="selector-label">
          {currentProject ? currentProject.name : 'Select Project'}
        </span>
        <span className="selector-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <>
          <div className="selector-overlay" onClick={() => setIsOpen(false)} />
          <div className="selector-dropdown" role="listbox">
            {currentProjectKey && (
              <>
                <button
                  className="dropdown-item clear"
                  onClick={handleClear}
                  role="option"
                  aria-selected={false}
                >
                  <span className="item-icon">✕</span>
                  <span className="item-text">Clear Selection</span>
                </button>
                <div className="dropdown-divider" />
              </>
            )}

            {projects?.map((project) => (
              <button
                key={project.key}
                className={`dropdown-item ${
                  project.key === currentProjectKey ? 'active' : ''
                }`}
                onClick={() => handleSelect(project.key)}
                role="option"
                aria-selected={project.key === currentProjectKey}
              >
                <span className="item-icon">
                  {project.key === currentProjectKey ? '✓' : '📁'}
                </span>
                <div className="item-content">
                  <span className="item-name">{project.name}</span>
                  <span className="item-key">{project.key}</span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
