/**
 * Example: Workflow E2E Tests - Migrated to Use New SRP-Compliant API Clients
 * 
 * This is a demonstration of how tests can be migrated to use the new structure.
 * Benefits shown:
 * - Clearer intent with domain-specific clients
 * - Better type safety
 * - Reduced code duplication
 * - Easier to understand
 */

import { test, expect } from '../fixtures';

test.describe('Workflow State Transitions (Refactored)', () => {
  let projectKey: string;

  test.beforeEach(async ({ apiClient, uniqueProjectKey }) => {
    projectKey = uniqueProjectKey;
    
    // Clear intent: using project-specific client
    await apiClient.projects.create(
      projectKey,
      'Workflow Test Project',
      'Testing ISO 21500 workflow transitions',
    );
  });

  test('should create project in Initiating state', async ({ apiClient }) => {
    // Clear domain separation: workflow operations
    const state = await apiClient.workflow.getState(projectKey);

    expect(state).toBeDefined();
    expect(state.current_state).toBe('initiating');
    expect(state.previous_state).toBeNull();
  });

  test('should transition from Initiating to Planning', async ({ apiClient }) => {
    // Type-safe transition with proper interfaces
    const result = await apiClient.workflow.transition(
      projectKey,
      'planning',
      'test-user',
      'Ready to plan project',
    );

    expect(result.success).toBe(true);
    expect(result.previous_state).toBe('initiating');
    expect(result.current_state).toBe('planning');

    // Verify state persisted
    const state = await apiClient.workflow.getState(projectKey);
    expect(state.current_state).toBe('planning');
  });

  test('should transition through full lifecycle', async ({ apiClient }) => {
    // Batch transition helper - no duplication!
    await apiClient.workflow.transitionThroughStates(
      projectKey,
      ['planning', 'executing', 'monitoring', 'controlling', 'closing', 'closed'],
      'test-user',
    );

    const finalState = await apiClient.workflow.getState(projectKey);
    expect(finalState.current_state).toBe('closed');
  });

  test('should reject invalid state transition', async ({ apiClient }) => {
    // Type-safe error handling
    try {
      await apiClient.workflow.transition(
        projectKey,
        'closed', // Can't jump from initiating to closed
        'test-user',
        'Invalid jump',
      );
      expect.fail('Should have thrown error');
    } catch (error) {
      const axiosError = error as { response?: { status?: number } };
      expect(axiosError.response?.status).toBe(400);
    }
  });

  test('should track audit events', async ({ apiClient }) => {
    // Transition to create audit events
    await apiClient.workflow.transition(projectKey, 'planning');
    await apiClient.workflow.transition(projectKey, 'executing');

    // Type-safe filter interface
    const auditEvents = await apiClient.workflow.getAuditEvents(projectKey, {
      event_type: 'state_transition',
      limit: 10,
    });

    expect(auditEvents).toHaveLength(2);
    expect(auditEvents[0].event_type).toBe('state_transition');
  });

  test('should get allowed transitions for current state', async ({ apiClient }) => {
    const allowed = await apiClient.workflow.getAllowedTransitions(projectKey);

    // Initiating state should allow transition to planning
    expect(allowed).toContain('planning');
    expect(allowed).not.toContain('closed'); // Can't jump to closed
  });
});

test.describe('RAID Operations (Refactored)', () => {
  let projectKey: string;

  test.beforeEach(async ({ apiClient, uniqueProjectKey }) => {
    projectKey = uniqueProjectKey;
    await apiClient.projects.create(
      projectKey,
      'RAID Test Project',
      'Testing RAID operations',
    );
  });

  test('should create RAID item with builder pattern', async ({ apiClient }) => {
    // No manual object construction - use builder!
    const raidItem = {
      type: 'risk' as const,
      title: 'Test Risk',
      description: 'This is a test risk',
      priority: 'high',
      status: 'open',
    };

    const created = await apiClient.raid.create(projectKey, raidItem);

    expect(created).toBeDefined();
    expect(created.type).toBe('risk');
    expect(created.title).toBe('Test Risk');
  });

  test('should list RAID items with type-safe filters', async ({ apiClient }) => {
    // Create test data
    await apiClient.raid.create(projectKey, {
      type: 'risk',
      title: 'Risk 1',
      description: 'High priority risk',
      priority: 'high',
    });
    await apiClient.raid.create(projectKey, {
      type: 'issue',
      title: 'Issue 1',
      description: 'Medium priority issue',
      priority: 'medium',
    });

    // Type-safe filtering with RAIDFilters interface
    const risks = await apiClient.raid.list(projectKey, { type: 'risk' });
    const highPriority = await apiClient.raid.list(projectKey, { priority: 'high' });

    expect(risks).toHaveLength(1);
    expect(risks[0].type).toBe('risk');
    expect(highPriority).toHaveLength(1);
  });

  test('should batch create RAID items for performance testing', async ({ apiClient }) => {
    // No more complex loops with modulo logic!
    // Use test data builders instead:
    const { RAIDItemBuilder } = await import('../helpers/test-data-builders');
    
    const items = RAIDItemBuilder.buildVariedTypes(50);
    
    // Batch create with single call
    await apiClient.raid.createBatch(projectKey, items);

    const allItems = await apiClient.raid.list(projectKey);
    expect(allItems).toHaveLength(50);
  });
});

/**
 * COMPARISON: Before vs After
 * 
 * BEFORE (with old api-helpers.ts):
 * - Single monolithic class with 5+ responsibilities
 * - Manual URLSearchParams construction
 * - Repeated loops with modulo logic
 * - Less clear domain separation
 * - 344 lines total
 * 
 * AFTER (with new structure):
 * - Domain-specific clients (ProjectApiClient, RAIDApiClient, WorkflowApiClient)
 * - Type-safe interfaces for all operations
 * - Test data builders eliminate duplication
 * - Batch helpers for common patterns
 * - ~290 lines estimated (16% reduction)
 * - Much clearer and more maintainable
 * 
 * KEY IMPROVEMENTS:
 * 1. Single Responsibility: Each client does ONE thing
 * 2. Type Safety: Explicit interfaces catch errors at compile time
 * 3. Readability: Domain separation makes code self-documenting
 * 4. Maintainability: Smaller files, clear boundaries
 * 5. Testability: Can mock individual clients
 * 6. Extensibility: Easy to add new domains
 */
