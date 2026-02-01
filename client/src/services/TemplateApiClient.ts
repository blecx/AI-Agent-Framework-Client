/**
 * Template API Client
 * Domain-specific client for template operations (SRP compliance)
 */

import axios, { type AxiosInstance } from 'axios';
import type { Template, TemplateCreate, TemplateUpdate } from '../types/template';

export class TemplateApiClient {
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
   * List all templates
   */
  async listTemplates(): Promise<Template[]> {
    const response = await this.client.get<Template[]>('/api/v1/templates');
    return response.data;
  }

  /**
   * Get template by ID
   */
  async getTemplate(templateId: string): Promise<Template> {
    const response = await this.client.get<Template>(`/api/v1/templates/${templateId}`);
    return response.data;
  }

  /**
   * Create new template
   */
  async createTemplate(template: TemplateCreate): Promise<Template> {
    const response = await this.client.post<Template>('/api/v1/templates', template);
    return response.data;
  }

  /**
   * Update existing template
   */
  async updateTemplate(
    templateId: string,
    update: TemplateUpdate
  ): Promise<Template> {
    const response = await this.client.put<Template>(
      `/api/v1/templates/${templateId}`,
      update
    );
    return response.data;
  }

  /**
   * Delete template
   */
  async deleteTemplate(templateId: string): Promise<void> {
    await this.client.delete(`/api/v1/templates/${templateId}`);
  }
}

// Export singleton instance
export const templateApiClient = new TemplateApiClient();
