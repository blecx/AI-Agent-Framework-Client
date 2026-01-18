/**
 * Projects API Service
 * Handles all project-related API calls
 */

import { ApiClient } from './client';
import {
  ProjectCreate,
  ProjectInfo,
  ProjectUpdate,
  ProjectState,
} from '../../types/api';

export class ProjectsService {
  private client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  /**
   * List all projects
   */
  async listProjects(): Promise<ProjectInfo[]> {
    return this.client.get<ProjectInfo[]>('/api/v1/projects');
  }

  /**
   * Get project by key
   */
  async getProject(projectKey: string): Promise<ProjectInfo> {
    return this.client.get<ProjectInfo>(`/api/v1/projects/${projectKey}`);
  }

  /**
   * Create new project
   */
  async createProject(project: ProjectCreate): Promise<ProjectInfo> {
    return this.client.post<ProjectInfo, ProjectCreate>(
      '/api/v1/projects',
      project,
    );
  }

  /**
   * Update project
   */
  async updateProject(
    projectKey: string,
    update: ProjectUpdate,
  ): Promise<ProjectInfo> {
    return this.client.put<ProjectInfo, ProjectUpdate>(
      `/api/v1/projects/${projectKey}`,
      update,
    );
  }

  /**
   * Delete project
   */
  async deleteProject(projectKey: string): Promise<void> {
    return this.client.delete<void>(`/api/v1/projects/${projectKey}`);
  }

  /**
   * Get project state
   */
  async getProjectState(projectKey: string): Promise<ProjectState> {
    return this.client.get<ProjectState>(
      `/api/v1/projects/${projectKey}/state`,
    );
  }
}
