/**
 * Audit Events API Service
 * Handles audit event retrieval and querying
 */

import { ApiClient } from './client';
import { AuditEventQuery, AuditEventList } from '../../types/api';

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
}
