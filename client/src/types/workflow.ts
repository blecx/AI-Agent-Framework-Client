/**
 * Workflow type definitions matching the AI-Agent-Framework backend models.
 *
 * Source of truth:
 * - Backend models: `AI-Agent-Framework/apps/api/models.py`
 * - Valid transitions: `AI-Agent-Framework/apps/api/services/workflow_service.py`
 *
 * Note: This repo uses `erasableSyntaxOnly`, so we avoid TypeScript `enum`.
 */

/**
 * ISO 21500 aligned project workflow states.
 *
 * Values are lower_snake_case to match backend JSON.
 */
export const WorkflowState = {
  /** Project initiation and authorization */
  INITIATING: 'initiating',
  /** Planning and baseline definition */
  PLANNING: 'planning',
  /** Executing project work */
  EXECUTING: 'executing',
  /** Monitoring & controlling performance */
  MONITORING: 'monitoring',
  /** Closing activities and handover */
  CLOSING: 'closing',
  /** Terminal state */
  CLOSED: 'closed',
} as const;

export type WorkflowState = (typeof WorkflowState)[keyof typeof WorkflowState];

/** Workflow state transition information. */
export interface WorkflowTransition {
  from_state: WorkflowState;
  to_state: WorkflowState;
  /** ISO 8601 timestamp */
  timestamp: string;
  actor: string;
  reason: string | null;
}

/** Request model for updating workflow state. */
export interface WorkflowStateUpdate {
  /** Target state to transition to */
  to_state: WorkflowState;
  /** User/actor performing transition */
  actor?: string;
  /** Reason for state transition */
  reason?: string | null;
}

/** Current workflow state information. */
export interface WorkflowStateInfo {
  current_state: WorkflowState;
  previous_state: WorkflowState | null;
  transition_history: WorkflowTransition[];
  /** ISO 8601 timestamp */
  updated_at: string;
  updated_by: string;
}

/** Allowed transitions response shape from backend endpoint. */
export interface AllowedTransitionsResponse {
  current_state: WorkflowState;
  allowed_transitions: WorkflowState[];
}

/**
 * Valid state transitions.
 *
 * Mirrors `VALID_TRANSITIONS` in the backend workflow service.
 */
export const VALID_WORKFLOW_TRANSITIONS: Record<
  WorkflowState,
  WorkflowState[]
> = {
  [WorkflowState.INITIATING]: [WorkflowState.PLANNING],
  [WorkflowState.PLANNING]: [WorkflowState.EXECUTING, WorkflowState.INITIATING],
  [WorkflowState.EXECUTING]: [WorkflowState.MONITORING, WorkflowState.PLANNING],
  [WorkflowState.MONITORING]: [WorkflowState.EXECUTING, WorkflowState.CLOSING],
  [WorkflowState.CLOSING]: [WorkflowState.CLOSED],
  [WorkflowState.CLOSED]: [],
};

/** Audit event types as defined by the backend. */
export const AuditEventType = {
  PROJECT_CREATED: 'project_created',
  PROJECT_UPDATED: 'project_updated',
  WORKFLOW_STATE_CHANGED: 'workflow_state_changed',
  GOVERNANCE_METADATA_CREATED: 'governance_metadata_created',
  GOVERNANCE_METADATA_UPDATED: 'governance_metadata_updated',
  DECISION_CREATED: 'decision_created',
  RAID_ITEM_CREATED: 'raid_item_created',
  RAID_ITEM_UPDATED: 'raid_item_updated',
  ARTIFACT_CREATED: 'artifact_created',
  ARTIFACT_UPDATED: 'artifact_updated',
  COMMAND_PROPOSED: 'command_proposed',
  COMMAND_APPLIED: 'command_applied',
} as const;

export type AuditEventType =
  (typeof AuditEventType)[keyof typeof AuditEventType];

/** Audit event schema for NDJSON storage. */
export interface AuditEvent {
  event_id: string;
  event_type: AuditEventType;
  /** ISO 8601 timestamp */
  timestamp: string;
  actor: string;
  correlation_id: string | null;
  project_key: string;
  payload_summary: Record<string, unknown>;
  resource_hash: string | null;
}

/** Response model for audit event list. */
export interface AuditEventList {
  events: AuditEvent[];
  total: number;
  limit: number;
  offset: number;
  filtered_by: Record<string, unknown> | null;
}
