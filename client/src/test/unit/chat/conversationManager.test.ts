/**
 * Unit tests for conversation manager
 */

import { describe, it, expect } from 'vitest';
import {
  initCreateRAIDConversation,
  processConversationResponse,
  startConversation,
  getConversationProgress,
} from '../../../chat/conversationManager';
import { CommandType, type CreateRAIDState } from '../../../chat/types';
import { RAIDType, RAIDStatus, RAIDPriority } from '../../../types/raid';

// Type guard helper for tests
function asCreateRAIDState(state: unknown): CreateRAIDState {
  return state as CreateRAIDState;
}

describe('conversationManager', () => {
  describe('initCreateRAIDConversation', () => {
    it('should initialize conversation with RAID type', () => {
      const state = initCreateRAIDConversation('PROJ-001', RAIDType.RISK);
      
      expect(state.intent).toBe(CommandType.CREATE_RAID);
      expect(state.projectKey).toBe('PROJ-001');
      expect(state.raidType).toBe(RAIDType.RISK);
      expect(state.currentStep).toBe(0);
      expect(state.collectedData.type).toBe(RAIDType.RISK);
      expect(state.collectedData.status).toBe(RAIDStatus.OPEN);
      expect(state.steps.length).toBeGreaterThan(0);
    });

    it('should initialize conversation without RAID type', () => {
      const state = initCreateRAIDConversation('PROJ-001', null);
      
      expect(state.raidType).toBeNull();
      expect(state.collectedData.type).toBeUndefined();
      // Should include 'type' step when type is not known
      expect(state.steps.some(s => s.field === 'type')).toBe(true);
    });

    it('should skip type step when RAID type is provided', () => {
      const state = initCreateRAIDConversation('PROJ-001', RAIDType.ASSUMPTION);
      
      // Should not include 'type' step when type is already known
      expect(state.steps.some(s => s.field === 'type')).toBe(false);
      expect(state.steps[0].field).not.toBe('type');
    });

    it('should set default values for status and priority', () => {
      const state = initCreateRAIDConversation('PROJ-001', RAIDType.ISSUE);
      
      expect(state.collectedData.status).toBe(RAIDStatus.OPEN);
      expect(state.collectedData.priority).toBe(RAIDPriority.MEDIUM);
      expect(state.collectedData.next_actions).toEqual([]);
      expect(state.collectedData.linked_decisions).toEqual([]);
    });
  });

  describe('processConversationResponse', () => {
    it('should process title response correctly', () => {
      const initialState = initCreateRAIDConversation('PROJ-001', RAIDType.RISK);
      // First step should be 'title' since type is already known
      expect(initialState.steps[0].field).toBe('title');
      
      const result = processConversationResponse(initialState, 'Security vulnerability in API');
      
      expect(result.isComplete).toBe(false);
      expect(result.error).toBeUndefined();
      expect((result.state as typeof initialState)?.collectedData.title).toBe('Security vulnerability in API');
      expect(result.nextPrompt).toBeTruthy();
    });

    it('should validate required fields', () => {
      const initialState = initCreateRAIDConversation('PROJ-001', RAIDType.RISK);
      
      const result = processConversationResponse(initialState, '   '); // Empty/whitespace
      
      expect(result.error).toBe('Validation failed');
      expect(result.isComplete).toBe(false);
      expect(result.nextPrompt).toContain('Invalid value');
    });

    it('should parse RAID type from natural language', () => {
      const initialState = initCreateRAIDConversation('PROJ-001', null);
      // First step should be 'type' when type is not known
      expect(initialState.steps[0].field).toBe('type');
      
      const result = processConversationResponse(initialState, "It's a risk");
      
      expect((result.state as CreateRAIDState)?.collectedData.type).toBe(RAIDType.RISK);
      expect(result.isComplete).toBe(false);
    });

    it('should parse priority from natural language', () => {
      const initialState = initCreateRAIDConversation('PROJ-001', RAIDType.RISK);
      // Skip to priority step (title -> description -> priority)
      let state = initialState;
      state = processConversationResponse(state, 'Test Title').state as CreateRAIDState;
      state = processConversationResponse(state, 'Test Description').state as CreateRAIDState;
      expect(state.steps[state.currentStep].field).toBe('priority');
      
      const result = processConversationResponse(state, 'This is critical');
      
      expect((result.state as CreateRAIDState)?.collectedData.priority).toBe(RAIDPriority.CRITICAL);
    });

    it('should advance to next step after valid response', () => {
      const initialState = initCreateRAIDConversation('PROJ-001', RAIDType.RISK);
      
      const result = processConversationResponse(initialState, 'Test Title');
      
      expect(result.state?.currentStep).toBe(1);
      expect(result.isComplete).toBe(false);
    });

    it('should mark conversation as complete after all steps', () => {
      let state = initCreateRAIDConversation('PROJ-001', RAIDType.RISK);
      
      // Complete all steps
      state = processConversationResponse(state, 'Test Title').state as CreateRAIDState;
      state = processConversationResponse(state, 'Test Description').state as CreateRAIDState;
      state = processConversationResponse(state, 'high').state as CreateRAIDState;
      const result = processConversationResponse(state, 'John Doe');
      
      expect(result.isComplete).toBe(true);
      expect(result.nextPrompt).toBeNull();
      expect((result.state as CreateRAIDState)?.collectedData.owner).toBe('John Doe');
    });

    it('should handle null state', () => {
      const result = processConversationResponse(null, 'test');
      
      expect(result.error).toBe('No active conversation');
      expect(result.isComplete).toBe(true);
    });
  });

  describe('startConversation', () => {
    it('should start CREATE RAID conversation with type', () => {
      const intent = {
        type: CommandType.CREATE_RAID,
        params: { raidType: RAIDType.RISK },
        confidence: 0.9,
        originalMessage: 'create a risk',
      };
      
      const result = startConversation(intent, 'PROJ-001');
      
      expect(result).not.toBeNull();
      expect(result?.state?.intent).toBe(CommandType.CREATE_RAID);
      expect(result?.initialPrompt).toBeTruthy();
    });

    it('should start CREATE RAID conversation without type', () => {
      const intent = {
        type: CommandType.CREATE_RAID,
        params: {},
        confidence: 0.7,
        originalMessage: 'create raid',
      };
      
      const result = startConversation(intent, 'PROJ-001');
      
      expect(result).not.toBeNull();
      expect(result?.initialPrompt).toContain('type');
    });

    it('should return null for unsupported command types', () => {
      const intent = {
        type: CommandType.LIST_RAID,
        params: {},
        confidence: 0.9,
        originalMessage: 'list raids',
      };
      
      const result = startConversation(intent, 'PROJ-001');
      
      expect(result).toBeNull();
    });
  });

  describe('getConversationProgress', () => {
    it('should calculate progress correctly', () => {
      let state = initCreateRAIDConversation('PROJ-001', RAIDType.RISK);
      
      let progress = getConversationProgress(state);
      expect(progress.currentStep).toBe(0);
      expect(progress.percentComplete).toBe(0);
      
      // Advance one step
      state = processConversationResponse(state, 'Test Title').state!;
      progress = getConversationProgress(state);
      expect(progress.currentStep).toBe(1);
      expect(progress.percentComplete).toBeGreaterThan(0);
      expect(progress.percentComplete).toBeLessThan(100);
    });

    it('should handle null state', () => {
      const progress = getConversationProgress(null);
      
      expect(progress.currentStep).toBe(0);
      expect(progress.totalSteps).toBe(0);
      expect(progress.percentComplete).toBe(0);
    });

    it('should show 100% when conversation is complete', () => {
      let state = initCreateRAIDConversation('PROJ-001', RAIDType.RISK);
      
      // Complete all steps
      state = processConversationResponse(state, 'Test Title').state as CreateRAIDState;
      state = processConversationResponse(state, 'Test Description').state as CreateRAIDState;
      state = processConversationResponse(state, 'high').state as CreateRAIDState;
      state = processConversationResponse(state, 'John Doe').state as CreateRAIDState;
      
      const progress = getConversationProgress(state);
      expect(progress.percentComplete).toBe(100);
    });
  });

  describe('field value parsing', () => {
    it('should parse various RAID type inputs', () => {
      const state = initCreateRAIDConversation('PROJ-001', null);
      
      const riskResult = processConversationResponse(state, 'risk');
      expect((riskResult.state as CreateRAIDState)?.collectedData.type).toBe(RAIDType.RISK);
      
      const assumptionResult = processConversationResponse(state, 'assumption');
      expect((assumptionResult.state as CreateRAIDState)?.collectedData.type).toBe(RAIDType.ASSUMPTION);
      
      const issueResult = processConversationResponse(state, 'issue');
      expect((issueResult.state as CreateRAIDState)?.collectedData.type).toBe(RAIDType.ISSUE);
      
      const depResult = processConversationResponse(state, 'dependency');
      expect((depResult.state as CreateRAIDState)?.collectedData.type).toBe(RAIDType.DEPENDENCY);
    });

    it('should parse various priority inputs', () => {
      let state = initCreateRAIDConversation('PROJ-001', RAIDType.RISK);
      state = processConversationResponse(state, 'Title').state as CreateRAIDState;
      state = processConversationResponse(state, 'Description').state as CreateRAIDState;
      
      const critResult = processConversationResponse(state, 'critical');
      expect((critResult.state as CreateRAIDState)?.collectedData.priority).toBe(RAIDPriority.CRITICAL);
      
      // Reset to priority step
      state = initCreateRAIDConversation('PROJ-001', RAIDType.RISK);
      state = processConversationResponse(state, 'Title').state as CreateRAIDState;
      state = processConversationResponse(state, 'Description').state as CreateRAIDState;
      
      const highResult = processConversationResponse(state, 'high');
      expect((highResult.state as CreateRAIDState)?.collectedData.priority).toBe(RAIDPriority.HIGH);
    });

    it('should trim whitespace from text fields', () => {
      const state = initCreateRAIDConversation('PROJ-001', RAIDType.RISK);
      
      const result = processConversationResponse(state, '  Test Title  ');
      
      expect((result.state as CreateRAIDState)?.collectedData.title).toBe('Test Title');
    });
  });
});
