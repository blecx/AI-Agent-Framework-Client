/**
 * ProjectList Component
 * Main view for browsing and managing all projects
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../../contexts/ProjectContext';
import { ProjectsService } from '../../services/api/projects';
import { ApiClient } from '../../services/api/client';
import type { ProjectInfo } from '../../types/api';
import './ProjectList.css';

type SortField = 'name' | 'key' | 'created_at' | 'updated_at';
type SortDirection = 'asc' | 'desc';

export function ProjectList() {
  const { setCurrentProjectKey } = useProject();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Lazy-load services for testability
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

  const handleProjectClick = (projectKey: string) => {
    setCurrentProjectKey(projectKey);
    navigate(`/projects/${projectKey}`);
  };

  const handleCreateProject = () => {
    navigate('/projects/new');
  };

  // Filter projects based on search query
  const filteredProjects = projects.filter((project) => {
    const query = searchQuery.toLowerCase();
    return (
      project.key.toLowerCase().includes(query) ||
      project.name.toLowerCase().includes(query) ||
      project.description?.toLowerCase().includes(query)
    );
  });

  // Sort filtered projects
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    let aVal: string | number = '';
    let bVal: string | number = '';

    switch (sortField) {
      case 'name':
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
        break;
      case 'key':
        aVal = a.key.toLowerCase();
        bVal = b.key.toLowerCase();
        break;
      case 'created_at':
        aVal = new Date(a.created_at).getTime();
        bVal = new Date(b.created_at).getTime();
        break;
      case 'updated_at':
        aVal = new Date(a.updated_at).getTime();
        bVal = new Date(b.updated_at).getTime();
        break;
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="project-list-container">
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="project-list-container">
        <div className="error-state">
          <p className="error-message">Error: {error}</p>
          <button onClick={loadProjects} className="btn-retry">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="project-list-container">
      <div className="project-list-header">
        <h1>Projects</h1>
        <button onClick={handleCreateProject} className="btn-create-project">
          + Create Project
        </button>
      </div>

      <div className="project-list-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search projects by name, key, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            aria-label="Search projects"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="btn-clear-search"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="controls-row">
          <div className="sort-controls">
            <label>Sort by:</label>
            <button
              onClick={() => toggleSort('name')}
              className={`btn-sort ${sortField === 'name' ? 'active' : ''}`}
            >
              Name{' '}
              {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => toggleSort('key')}
              className={`btn-sort ${sortField === 'key' ? 'active' : ''}`}
            >
              Key {sortField === 'key' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => toggleSort('created_at')}
              className={`btn-sort ${sortField === 'created_at' ? 'active' : ''}`}
            >
              Created{' '}
              {sortField === 'created_at' &&
                (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => toggleSort('updated_at')}
              className={`btn-sort ${sortField === 'updated_at' ? 'active' : ''}`}
            >
              Updated{' '}
              {sortField === 'updated_at' &&
                (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
          </div>

          <div className="view-controls">
            <button
              onClick={() => setViewMode('grid')}
              className={`btn-view ${viewMode === 'grid' ? 'active' : ''}`}
              aria-label="Grid view"
            >
              ⊞
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`btn-view ${viewMode === 'list' ? 'active' : ''}`}
              aria-label="List view"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {sortedProjects.length === 0 ? (
        <div className="empty-state">
          {searchQuery ? (
            <>
              <p>No projects match your search "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery('')}
                className="btn-clear-search-empty"
              >
                Clear search
              </button>
            </>
          ) : (
            <>
              <p>No projects yet</p>
              <p className="empty-hint">
                Create your first project to get started
              </p>
              <button
                onClick={handleCreateProject}
                className="btn-create-first"
              >
                + Create Project
              </button>
            </>
          )}
        </div>
      ) : (
        <div className={`projects-${viewMode}`}>
          {sortedProjects.map((project) => (
            <div
              key={project.key}
              className="project-card"
              onClick={() => handleProjectClick(project.key)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleProjectClick(project.key);
                }
              }}
            >
              <div className="project-card-header">
                <h3 className="project-name">{project.name}</h3>
                <span className="project-key">{project.key}</span>
              </div>
              {project.description && (
                <p className="project-description">{project.description}</p>
              )}
              {project.state && (
                <div className="project-state">{project.state}</div>
              )}
              <div className="project-card-footer">
                <span className="project-date">
                  Created: {formatDate(project.created_at)}
                </span>
                <span className="project-date">
                  Updated: {formatDate(project.updated_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="project-list-footer">
        <p className="project-count">
          {sortedProjects.length === projects.length
            ? `${projects.length} ${projects.length === 1 ? 'project' : 'projects'}`
            : `Showing ${sortedProjects.length} of ${projects.length} projects`}
        </p>
      </div>
    </div>
  );
}
