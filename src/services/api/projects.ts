/**
 * Projects API Service
 * Handles all project-related API calls with type-safe validation
 */

import { z } from 'zod';
import { ApiClient } from './client';
import {
  ProjectCreate,
  ProjectInfo,
  ProjectUpdate,
  ProjectState,
  ProjectCreateSchema,
  ProjectInfoSchema,
  ProjectStateSchema,
} from '../../types/api';

export class ProjectsService {
  private client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  /**
   * List all projects with validation
   */
  async listProjects(): Promise<ProjectInfo[]> {
    return this.client.getValidated(
      '/api/v1/projects',
      z.array(ProjectInfoSchema),
    );
  }

  /**
   * Get project by key with validation
   */
  async getProject(projectKey: string): Promise<ProjectInfo> {
    return this.client.getValidated(
      `/api/v1/projects/${projectKey}`,
      ProjectInfoSchema,
    );
  }

  /**
   * Create new project with validation
   */
  async createProject(project: ProjectCreate): Promise<ProjectInfo> {
    // Validate input before sending
    ProjectCreateSchema.parse(project);

    return this.client.postValidated<ProjectInfo, ProjectCreate>(
      '/api/v1/projects',
      project,
      ProjectInfoSchema,
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
   * Get project state with validation
   */
  async getProjectState(projectKey: string): Promise<ProjectState> {
    return this.client.getValidated(
      `/api/v1/projects/${projectKey}/state`,
      ProjectStateSchema,
    );
  }
}
