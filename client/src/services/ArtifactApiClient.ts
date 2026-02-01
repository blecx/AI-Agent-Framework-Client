/**
 * Artifact API Client
 * Domain-specific client for artifact operations (SRP compliance)
 */

import axios, { type AxiosInstance } from 'axios';

export interface Artifact {
  path: string;
  name: string;
  type: string;
  versions?: Array<{ version: string; date: string }>;
}

export class ArtifactApiClient {
  private client: AxiosInstance;

  constructor(baseUrl?: string) {
    const apiBaseUrl = baseUrl || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    
    this.client = axios.create({
      baseURL: apiBaseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  /**
   * List all artifacts for a project
   */
  async listArtifacts(projectKey: string): Promise<Artifact[]> {
    const response = await this.client.get<Artifact[]>(
      `/api/v1/projects/${projectKey}/artifacts`
    );
    return response.data;
  }

  /**
   * Get artifact content
   */
  async getArtifact(projectKey: string, artifactPath: string): Promise<string> {
    const response = await this.client.get<string>(
      `/api/v1/projects/${projectKey}/artifacts/${artifactPath}`,
      { responseType: 'text' }
    );
    return response.data;
  }
}

// Singleton instance
export const artifactApiClient = new ArtifactApiClient();
