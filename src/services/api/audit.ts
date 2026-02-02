/**
 * Audit Events API Service
 * Handles audit event retrieval and querying, plus audit execution
 */

import { ApiClient } from './client';
import {
  AuditEventQuery,
  AuditEventList,
  AuditResult,
} from '../../types/api';

export class AuditService {
  private client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  /**
   * Get audit events with optional filters
   */
  async getAuditEvents(
    projectKey: string,
    query?: AuditEventQuery,
  ): Promise<AuditEventList> {
    return this.client.get<AuditEventList>(
      `/api/v1/projects/${projectKey}/audit-events`,
      { params: query },
    );
  }

  /**
   * Get audit events by event type
   */
  async getAuditEventsByType(
    projectKey: string,
    eventType: string,
  ): Promise<AuditEventList> {
    return this.getAuditEvents(projectKey, { event_type: eventType });
  }

  /**
   * Get audit events by actor
   */
  async getAuditEventsByActor(
    projectKey: string,
    actor: string,
  ): Promise<AuditEventList> {
    return this.getAuditEvents(projectKey, { actor });
  }

  /**
   * Get audit events in date range
   */
  async getAuditEventsByDateRange(
    projectKey: string,
    since: string,
    until: string,
  ): Promise<AuditEventList> {
    return this.getAuditEvents(projectKey, { since, until });
  }

  /**
   * Run audit rules on a project
   */
  async runAudit(
    projectKey: string,
    ruleSet?: string[],
  ): Promise<AuditResult> {
    return this.client.post<AuditResult>(
      `/api/v1/projects/${projectKey}/audit`,
      ruleSet ? { rule_set: ruleSet } : {},
    );
  }

  /**
   * Get latest audit results (from history)
   */
  async getAuditResults(
    projectKey: string,
    limit: number = 1,
  ): Promise<AuditResult[]> {
    const response = await this.client.get<{ results: AuditResult[] }>(
      `/api/v1/projects/${projectKey}/audit/history`,
      { params: { limit } },
    );
    return response.results || [];
  }
}
