/**
 * Workflow API Client - Single Responsibility: Workflow State Management
 * Handles all workflow state transition operations
 */

import { AxiosInstance } from 'axios';

export interface WorkflowTransition {
  to_state: string;
  actor?: string;
  reason?: string;
}

export interface AuditFilters {
  event_type?: string;
  limit?: number;
}

export class WorkflowApiClient {
  constructor(private client: AxiosInstance) {}

  async getState(projectKey: string) {
    const response = await this.client.get(
      `/projects/${projectKey}/workflow/state`,
    );
    return response.data;
  }

  async transition(
    projectKey: string,
    toState: string,
    actor: string = 'e2e-test',
    reason: string = 'E2E test transition',
  ) {
    const response = await this.client.patch(
      `/projects/${projectKey}/workflow/state`,
      {
        to_state: toState,
        actor,
        reason,
      },
    );
    return response.data;
  }

  async getAllowedTransitions(projectKey: string) {
    const response = await this.client.get(
      `/projects/${projectKey}/workflow/allowed-transitions`,
    );
    return response.data;
  }

  async getAuditEvents(projectKey: string, filters?: AuditFilters) {
    const params = this.buildQueryParams(filters);
    const url = `/projects/${projectKey}/workflow/audit${params ? `?${params}` : ''}`;
    const response = await this.client.get(url);
    return response.data;
  }

  /**
   * Transition through multiple states sequentially
   */
  async transitionThroughStates(
    projectKey: string,
    states: string[],
    actor: string = 'e2e-test',
  ): Promise<void> {
    for (const state of states) {
      await this.transition(projectKey, state, actor);
    }
  }

  private buildQueryParams(filters?: AuditFilters): string {
    if (!filters) return '';

    const params = new URLSearchParams();
    if (filters.event_type) params.append('event_type', filters.event_type);
    if (filters.limit) params.append('limit', filters.limit.toString());

    return params.toString();
  }
}
