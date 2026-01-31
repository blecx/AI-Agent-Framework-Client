/**
 * Conversation manager for multi-turn chat dialogs
 * 
 * Manages conversation state for creating/editing RAID items and transitioning workflows.
 */

import { CommandType, type ConversationState, type CreateRAIDState, type ConversationStep, type CommandIntent } from './types';
import { RAIDType, RAIDStatus, RAIDPriority } from '../types/raid';

/**
 * Initialize conversation state for CREATE RAID command
 */
export function initCreateRAIDConversation(
  projectKey: string,
  raidType: RAIDType | null
): CreateRAIDState {
  const steps = getCreateRAIDSteps(raidType);
  
  return {
    intent: CommandType.CREATE_RAID,
    projectKey,
    raidType,
    collectedData: {
      type: raidType || undefined,
      status: RAIDStatus.OPEN,
      priority: RAIDPriority.MEDIUM,
      next_actions: [],
      linked_decisions: [],
      linked_change_requests: [],
    },
    currentStep: 0,
    steps,
  };
}

/**
 * Get conversation steps for creating a RAID item
 */
function getCreateRAIDSteps(raidType: RAIDType | null): ConversationStep[] {
  const commonSteps: ConversationStep[] = [
    {
      field: 'type',
      prompt: 'What type of RAID item? (risk, assumption, issue, dependency)',
      required: true,
      validate: (value) => Object.values(RAIDType).includes(value as RAIDType),
    },
    {
      field: 'title',
      prompt: 'What is the title?',
      required: true,
      validate: (value) => typeof value === 'string' && value.trim().length > 0,
    },
    {
      field: 'description',
      prompt: 'Please provide a description:',
      required: true,
      validate: (value) => typeof value === 'string' && value.trim().length > 0,
    },
    {
      field: 'priority',
      prompt: 'What is the priority? (critical, high, medium, low)',
      required: true,
      validate: (value) => Object.values(RAIDPriority).includes(value as RAIDPriority),
    },
    {
      field: 'owner',
      prompt: 'Who is the owner/assignee?',
      required: true,
      validate: (value) => typeof value === 'string' && value.trim().length > 0,
    },
  ];

  // If type is already known, skip the type question
  if (raidType) {
    return commonSteps.filter(step => step.field !== 'type');
  }

  return commonSteps;
}

/**
 * Process user response and advance conversation
 */
export function processConversationResponse(
  state: ConversationState,
  userResponse: string
): {
  state: ConversationState;
  nextPrompt: string | null;
  isComplete: boolean;
  error?: string;
} {
  if (!state) {
    return {
      state: null,
      nextPrompt: null,
      isComplete: true,
      error: 'No active conversation',
    };
  }

  if (state.intent === CommandType.CREATE_RAID) {
    return processCreateRAIDResponse(state, userResponse);
  }

  // Other intent types will be implemented in Part 3
  return {
    state,
    nextPrompt: null,
    isComplete: true,
    error: 'Unsupported conversation type',
  };
}

/**
 * Process response for CREATE RAID conversation
 */
function processCreateRAIDResponse(
  state: CreateRAIDState,
  userResponse: string
): {
  state: CreateRAIDState;
  nextPrompt: string | null;
  isComplete: boolean;
  error?: string;
} {
  const currentStepDef = state.steps[state.currentStep];
  
  if (!currentStepDef) {
    return {
      state,
      nextPrompt: null,
      isComplete: true,
      error: 'Invalid conversation step',
    };
  }

  // Parse and validate the response
  const parsedValue = parseFieldValue(currentStepDef.field, userResponse);
  
  if (currentStepDef.validate && !currentStepDef.validate(parsedValue)) {
    return {
      state,
      nextPrompt: `Invalid value. ${currentStepDef.prompt}`,
      isComplete: false,
      error: 'Validation failed',
    };
  }

  // Store the value
  const updatedData = {
    ...state.collectedData,
    [currentStepDef.field]: parsedValue,
  };

  // Move to next step
  const nextStep = state.currentStep + 1;
  const isComplete = nextStep >= state.steps.length;

  const nextPrompt = isComplete ? null : state.steps[nextStep].prompt;

  return {
    state: {
      ...state,
      collectedData: updatedData,
      currentStep: nextStep,
    },
    nextPrompt,
    isComplete,
  };
}

/**
 * Parse field value based on field type
 */
function parseFieldValue(field: string, value: string): unknown {
  const trimmedValue = value.trim();

  switch (field) {
    case 'type':
      return parseRAIDType(trimmedValue);
    case 'priority':
      return parseRAIDPriority(trimmedValue);
    case 'status':
      return parseRAIDStatus(trimmedValue);
    default:
      return trimmedValue;
  }
}

/**
 * Parse RAID type from user input
 */
function parseRAIDType(input: string): RAIDType {
  const lower = input.toLowerCase();
  if (lower.includes('risk')) return RAIDType.RISK;
  if (lower.includes('assumption')) return RAIDType.ASSUMPTION;
  if (lower.includes('issue')) return RAIDType.ISSUE;
  if (lower.includes('dependency') || lower.includes('depend')) return RAIDType.DEPENDENCY;
  return input as RAIDType; // Will fail validation
}

/**
 * Parse RAID priority from user input
 */
function parseRAIDPriority(input: string): RAIDPriority {
  const lower = input.toLowerCase();
  if (lower.includes('critical') || lower.includes('crit')) return RAIDPriority.CRITICAL;
  if (lower.includes('high')) return RAIDPriority.HIGH;
  if (lower.includes('medium') || lower.includes('med')) return RAIDPriority.MEDIUM;
  if (lower.includes('low')) return RAIDPriority.LOW;
  return input as RAIDPriority; // Will fail validation
}

/**
 * Parse RAID status from user input
 */
function parseRAIDStatus(input: string): RAIDStatus {
  const lower = input.toLowerCase();
  if (lower.includes('open')) return RAIDStatus.OPEN;
  if (lower.includes('progress') || lower.includes('in progress')) return RAIDStatus.IN_PROGRESS;
  if (lower.includes('mitigat')) return RAIDStatus.MITIGATED;
  if (lower.includes('clos')) return RAIDStatus.CLOSED;
  if (lower.includes('accept')) return RAIDStatus.ACCEPTED;
  return input as RAIDStatus; // Will fail validation
}

/**
 * Start a conversation based on parsed command intent
 */
export function startConversation(
  intent: CommandIntent,
  projectKey: string
): {
  state: ConversationState;
  initialPrompt: string;
} | null {
  if (intent.type === CommandType.CREATE_RAID) {
    const raidType = intent.params.raidType as RAIDType | undefined;
    const state = initCreateRAIDConversation(projectKey, raidType || null);
    const initialPrompt = state.steps[0].prompt;
    
    return { state, initialPrompt };
  }

  // Other command types will be implemented in Part 3
  return null;
}

/**
 * Get current conversation progress
 */
export function getConversationProgress(state: ConversationState): {
  currentStep: number;
  totalSteps: number;
  percentComplete: number;
} {
  if (!state) {
    return { currentStep: 0, totalSteps: 0, percentComplete: 0 };
  }

  return {
    currentStep: state.currentStep,
    totalSteps: state.steps.length,
    percentComplete: Math.round((state.currentStep / state.steps.length) * 100),
  };
}
