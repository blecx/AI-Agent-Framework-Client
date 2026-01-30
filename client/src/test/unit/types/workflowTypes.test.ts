import { describe, expect, it } from 'vitest';

import {
  AuditEventType,
  VALID_WORKFLOW_TRANSITIONS,
  WorkflowState,
} from '../../../types/workflow';

describe('Workflow types', () => {
  it('exposes expected workflow state values', () => {
    expect(WorkflowState.INITIATING).toBe('initiating');
    expect(WorkflowState.PLANNING).toBe('planning');
    expect(WorkflowState.EXECUTING).toBe('executing');
    expect(WorkflowState.MONITORING).toBe('monitoring');
    expect(WorkflowState.CLOSING).toBe('closing');
    expect(WorkflowState.CLOSED).toBe('closed');
  });

  it('documents valid transitions consistent with ISO 21500 workflow', () => {
    expect(VALID_WORKFLOW_TRANSITIONS[WorkflowState.INITIATING]).toEqual([
      WorkflowState.PLANNING,
    ]);

    expect(VALID_WORKFLOW_TRANSITIONS[WorkflowState.PLANNING]).toEqual([
      WorkflowState.EXECUTING,
      WorkflowState.INITIATING,
    ]);

    expect(VALID_WORKFLOW_TRANSITIONS[WorkflowState.EXECUTING]).toEqual([
      WorkflowState.MONITORING,
      WorkflowState.PLANNING,
    ]);

    expect(VALID_WORKFLOW_TRANSITIONS[WorkflowState.MONITORING]).toEqual([
      WorkflowState.EXECUTING,
      WorkflowState.CLOSING,
    ]);

    expect(VALID_WORKFLOW_TRANSITIONS[WorkflowState.CLOSING]).toEqual([
      WorkflowState.CLOSED,
    ]);

    expect(VALID_WORKFLOW_TRANSITIONS[WorkflowState.CLOSED]).toEqual([]);
  });

  it('includes workflow state audit event type', () => {
    expect(AuditEventType.WORKFLOW_STATE_CHANGED).toBe(
      'workflow_state_changed',
    );
  });
});
