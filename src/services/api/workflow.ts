/**
 * Workflow API Service
 * Handles ISO 21500 workflow state machine API calls
 */

import { ApiClient } from './client';
import {
  WorkflowState,
  WorkflowTransitionRequest,
  WorkflowTransitionResponse,
  AllowedTransitions,
} from '../../types/api';

export class WorkflowService {
  private client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  /**
   * Get current workflow state
   */
  async getWorkflowState(projectKey: string): Promise<WorkflowState> {
    return this.client.get<WorkflowState>(
      `/api/v1/projects/${projectKey}/workflow/state`,
    );
  }

  /**
   * Transition to new workflow state
   */
  async transitionWorkflowState(
    projectKey: string,
    transition: WorkflowTransitionRequest,
  ): Promise<WorkflowTransitionResponse> {
    return this.client.patch<
      WorkflowTransitionResponse,
      WorkflowTransitionRequest
    >(`/api/v1/projects/${projectKey}/workflow/state`, transition);
  }

  /**
   * Get allowed transitions from current state
   */
  async getAllowedTransitions(projectKey: string): Promise<AllowedTransitions> {
    return this.client.get<AllowedTransitions>(
      `/api/v1/projects/${projectKey}/workflow/allowed-transitions`,
    );
  }
}
