/**
 * Project API Client - Single Responsibility: Project Management
 * Handles all project-related API operations
 */

import { AxiosInstance } from 'axios';

export class ProjectApiClient {
  constructor(private client: AxiosInstance) {}

  async create(key: string, name: string, description?: string) {
    const response = await this.client.post('/projects', {
      key,
      name,
      description,
    });
    return response.data;
  }

  async get(key: string) {
    const response = await this.client.get(`/projects/${key}`);
    return response.data;
  }

  async list() {
    const response = await this.client.get('/projects');
    return response.data;
  }

  async delete(key: string): Promise<boolean> {
    try {
      await this.client.delete(`/projects/${key}`);
      return true;
    } catch {
      return false;
    }
  }

  async cleanup(prefix: string = 'e2e-'): Promise<boolean> {
    try {
      const projects = await this.list();
      const testProjects = projects.filter((p: { key: string }) =>
        p.key.startsWith(prefix),
      );

      await Promise.all(
        testProjects.map((project: { key: string }) =>
          this.delete(project.key),
        ),
      );
      return true;
    } catch (error) {
      console.error('Error cleaning up test projects:', error);
      return false;
    }
  }
}
