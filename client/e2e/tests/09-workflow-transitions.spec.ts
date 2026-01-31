/**
 * E2E tests for workflow state transitions
 * Tests ISO 21500 aligned workflow state machine
 */

import { test, expect } from '../fixtures';

test.describe('Workflow State Transitions', () => {
  test('should create project in Initiating state', async ({
    apiHelper,
    uniqueProjectKey,
  }) => {
    // Create project via API
    const project = await apiHelper.createProject(
      uniqueProjectKey,
      'Workflow Test Project',
      'Testing workflow state initialization',
    );

    expect(project.key).toBe(uniqueProjectKey);

    // Get workflow state - should be initiating
    const workflowState = await apiHelper.getWorkflowState(uniqueProjectKey);

    expect(workflowState.current_state).toBe('initiating');
    expect(workflowState.previous_state).toBeNull();
    expect(workflowState.transition_history).toHaveLength(0);
  });

  test('should transition from Initiating to Planning', async ({
    apiHelper,
    uniqueProjectKey,
  }) => {
    // Setup: Create project
    await apiHelper.createProject(uniqueProjectKey, 'Transition Test Project');

    // Transition to Planning
    const newState = await apiHelper.transitionWorkflowState(
      uniqueProjectKey,
      'planning',
      'test-user',
      'Ready to plan project',
    );

    expect(newState.current_state).toBe('planning');
    expect(newState.previous_state).toBe('initiating');
    expect(newState.updated_by).toBe('test-user');
    expect(newState.transition_history).toHaveLength(1);

    // Verify transition details
    const transition = newState.transition_history[0];
    expect(transition.from_state).toBe('initiating');
    expect(transition.to_state).toBe('planning');
    expect(transition.actor).toBe('test-user');
    expect(transition.reason).toBe('Ready to plan project');
    expect(transition.timestamp).toBeDefined();
  });

  test('should transition Planning → Executing → Monitoring', async ({
    apiHelper,
    uniqueProjectKey,
  }) => {
    // Setup: Create project and move to Planning
    await apiHelper.createProject(uniqueProjectKey, 'Multi-step Transition');
    await apiHelper.transitionWorkflowState(uniqueProjectKey, 'planning');

    // Planning → Executing
    const executingState = await apiHelper.transitionWorkflowState(
      uniqueProjectKey,
      'executing',
      'test-user',
      'Start execution',
    );

    expect(executingState.current_state).toBe('executing');
    expect(executingState.previous_state).toBe('planning');
    expect(executingState.transition_history).toHaveLength(2);

    // Executing → Monitoring
    const monitoringState = await apiHelper.transitionWorkflowState(
      uniqueProjectKey,
      'monitoring',
      'test-user',
      'Begin monitoring',
    );

    expect(monitoringState.current_state).toBe('monitoring');
    expect(monitoringState.previous_state).toBe('executing');
    expect(monitoringState.transition_history).toHaveLength(3);

    // Verify all transitions are recorded
    const transitions = monitoringState.transition_history;
    expect(transitions[0].to_state).toBe('planning');
    expect(transitions[1].to_state).toBe('executing');
    expect(transitions[2].to_state).toBe('monitoring');
  });

  test('should allow backward transition from Planning to Initiating', async ({
    apiHelper,
    uniqueProjectKey,
  }) => {
    // Setup: Create project and move to Planning
    await apiHelper.createProject(uniqueProjectKey, 'Backward Transition');
    await apiHelper.transitionWorkflowState(uniqueProjectKey, 'planning');

    // Planning → Initiating (valid backward transition)
    const newState = await apiHelper.transitionWorkflowState(
      uniqueProjectKey,
      'initiating',
      'test-user',
      'Need to refine initial requirements',
    );

    expect(newState.current_state).toBe('initiating');
    expect(newState.previous_state).toBe('planning');
    expect(newState.transition_history).toHaveLength(2);
  });

  test('should block invalid transitions', async ({
    apiHelper,
    uniqueProjectKey,
  }) => {
    // Setup: Create project (in Initiating state)
    await apiHelper.createProject(uniqueProjectKey, 'Invalid Transition Test');

    // Try invalid transition: Initiating → Executing (should fail)
    try {
      await apiHelper.transitionWorkflowState(
        uniqueProjectKey,
        'executing',
        'test-user',
        'Invalid jump',
      );
      // If we get here, the test should fail
      expect(true).toBe(false); // Force failure
    } catch (error: unknown) {
      // Should get 400 error for invalid transition
      const axiosError = error as { response?: { status?: number; data?: { detail?: string } } };
      expect(axiosError.response?.status).toBe(400);
      expect(axiosError.response?.data?.detail).toContain('Invalid transition');
    }

    // Verify state unchanged
    const workflowState = await apiHelper.getWorkflowState(uniqueProjectKey);
    expect(workflowState.current_state).toBe('initiating');
  });

  test('should block transition from Closed state', async ({
    apiHelper,
    uniqueProjectKey,
  }) => {
    // Setup: Create project and transition through to Closed
    await apiHelper.createProject(uniqueProjectKey, 'Closed State Test');
    await apiHelper.transitionWorkflowState(uniqueProjectKey, 'planning');
    await apiHelper.transitionWorkflowState(uniqueProjectKey, 'executing');
    await apiHelper.transitionWorkflowState(uniqueProjectKey, 'monitoring');
    await apiHelper.transitionWorkflowState(uniqueProjectKey, 'closing');
    await apiHelper.transitionWorkflowState(uniqueProjectKey, 'closed');

    // Verify we're in closed state
    let workflowState = await apiHelper.getWorkflowState(uniqueProjectKey);
    expect(workflowState.current_state).toBe('closed');

    // Try to transition from closed (should fail - terminal state)
    try {
      await apiHelper.transitionWorkflowState(
        uniqueProjectKey,
        'monitoring',
        'test-user',
        'Try to reopen',
      );
      expect(true).toBe(false); // Force failure if no error
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number; data?: { detail?: string } } };
      expect(axiosError.response?.status).toBe(400);
      expect(axiosError.response?.data?.detail).toContain('Invalid transition');
    }

    // Verify state still closed
    workflowState = await apiHelper.getWorkflowState(uniqueProjectKey);
    expect(workflowState.current_state).toBe('closed');
  });

  test('should get allowed transitions for current state', async ({
    apiHelper,
    uniqueProjectKey,
  }) => {
    // Create project in Initiating state
    await apiHelper.createProject(uniqueProjectKey, 'Allowed Transitions Test');

    // Check allowed transitions from Initiating
    let allowedTransitions =
      await apiHelper.getAllowedTransitions(uniqueProjectKey);
    expect(allowedTransitions.current_state).toBe('initiating');
    expect(allowedTransitions.allowed_transitions).toEqual(['planning']);

    // Transition to Planning
    await apiHelper.transitionWorkflowState(uniqueProjectKey, 'planning');

    // Check allowed transitions from Planning
    allowedTransitions =
      await apiHelper.getAllowedTransitions(uniqueProjectKey);
    expect(allowedTransitions.current_state).toBe('planning');
    expect(allowedTransitions.allowed_transitions).toHaveLength(2);
    expect(allowedTransitions.allowed_transitions).toContain('executing');
    expect(allowedTransitions.allowed_transitions).toContain('initiating');

    // Transition to Executing
    await apiHelper.transitionWorkflowState(uniqueProjectKey, 'executing');

    // Check allowed transitions from Executing
    allowedTransitions =
      await apiHelper.getAllowedTransitions(uniqueProjectKey);
    expect(allowedTransitions.current_state).toBe('executing');
    expect(allowedTransitions.allowed_transitions).toContain('monitoring');
    expect(allowedTransitions.allowed_transitions).toContain('planning');
  });

  test('should record transitions in audit trail', async ({
    apiHelper,
    uniqueProjectKey,
  }) => {
    // Create project
    await apiHelper.createProject(uniqueProjectKey, 'Audit Trail Test');

    // Make several transitions
    await apiHelper.transitionWorkflowState(
      uniqueProjectKey,
      'planning',
      'user-1',
      'Ready to plan',
    );
    await apiHelper.transitionWorkflowState(
      uniqueProjectKey,
      'executing',
      'user-2',
      'Start execution',
    );

    // Get audit events
    const auditEvents = await apiHelper.getAuditEvents(uniqueProjectKey);

    expect(auditEvents.events).toBeDefined();
    expect(auditEvents.events.length).toBeGreaterThan(0);

    // Find workflow transition events
    const workflowEvents = auditEvents.events.filter(
      (event: { event_type?: string }) => event.event_type === 'workflow.state_transition',
    );

    expect(workflowEvents.length).toBeGreaterThanOrEqual(2);

    // Verify event structure
    const firstTransition = workflowEvents.find(
      (e: { event_data?: { to_state?: string } }) => e.event_data?.to_state === 'planning',
    );
    expect(firstTransition).toBeDefined();
    expect(firstTransition.actor).toBe('user-1');
    expect(firstTransition.event_data.from_state).toBe('initiating');
    expect(firstTransition.event_data.to_state).toBe('planning');
  });

  test('should handle full lifecycle: Initiating → Closed', async ({
    apiHelper,
    uniqueProjectKey,
  }) => {
    // Create project
    await apiHelper.createProject(uniqueProjectKey, 'Full Lifecycle Test');

    // Verify starts in initiating
    let state = await apiHelper.getWorkflowState(uniqueProjectKey);
    expect(state.current_state).toBe('initiating');

    // Initiating → Planning
    state = await apiHelper.transitionWorkflowState(
      uniqueProjectKey,
      'planning',
    );
    expect(state.current_state).toBe('planning');

    // Planning → Executing
    state = await apiHelper.transitionWorkflowState(
      uniqueProjectKey,
      'executing',
    );
    expect(state.current_state).toBe('executing');

    // Executing → Monitoring
    state = await apiHelper.transitionWorkflowState(
      uniqueProjectKey,
      'monitoring',
    );
    expect(state.current_state).toBe('monitoring');

    // Monitoring → Closing
    state = await apiHelper.transitionWorkflowState(
      uniqueProjectKey,
      'closing',
    );
    expect(state.current_state).toBe('closing');

    // Closing → Closed
    state = await apiHelper.transitionWorkflowState(uniqueProjectKey, 'closed');
    expect(state.current_state).toBe('closed');

    // Verify complete transition history
    expect(state.transition_history).toHaveLength(5);
    const states = state.transition_history.map((t: { to_state?: string }) => t.to_state);
    expect(states).toEqual([
      'planning',
      'executing',
      'monitoring',
      'closing',
      'closed',
    ]);
  });

  test('should handle concurrent transition attempts gracefully', async ({
    apiHelper,
    uniqueProjectKey,
  }) => {
    // Create project
    await apiHelper.createProject(
      uniqueProjectKey,
      'Concurrent Transitions Test',
    );

    // Try two transitions at same time (one should succeed, one may fail)
    const [result1, result2] = await Promise.allSettled([
      apiHelper.transitionWorkflowState(uniqueProjectKey, 'planning', 'user-1'),
      apiHelper.transitionWorkflowState(uniqueProjectKey, 'planning', 'user-2'),
    ]);

    // At least one should succeed
    const successCount = [result1, result2].filter(
      (r) => r.status === 'fulfilled',
    ).length;
    expect(successCount).toBeGreaterThanOrEqual(1);

    // Final state should be planning
    const finalState = await apiHelper.getWorkflowState(uniqueProjectKey);
    expect(finalState.current_state).toBe('planning');
  });
});
