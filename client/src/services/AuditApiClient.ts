/**
 * Audit API Client
 * Domain-specific client for audit operations (SRP compliance)
 */

import axios, { type AxiosInstance } from 'axios';

export interface AuditIssue {
  id: string;
  severity: 'error' | 'warning' | 'info';
  artifact: string;
  field: string;
  message: string;
  rule?: string;
}

export interface AuditResult {
  projectKey: string;
  timestamp: string;
  issues: AuditIssue[];
  summary: {
    errors: number;
    warnings: number;
    info: number;
  };
}

export class AuditApiClient {
  private client: AxiosInstance;

  constructor(baseUrl?: string) {
    const apiBaseUrl =
      baseUrl || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

    this.client = axios.create({
      baseURL: apiBaseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  /**
   * Fetch audit results for a project
   */
  async getAuditResults(projectKey: string): Promise<AuditResult> {
    const response = await this.client.get<AuditResult>(
      `/api/v1/projects/${projectKey}/audit/results`,
    );
    return response.data;
  }

  /**
   * Trigger audit run for a project
   */
  async runAudit(projectKey: string): Promise<AuditResult> {
    const response = await this.client.post<AuditResult>(
      `/api/v1/projects/${projectKey}/audit/run`,
    );
    return response.data;
  }
}
