/**
 * Chat command types and conversation state management
 *
 * This module defines the types for parsing user chat messages into structured commands
 * and managing multi-turn conversation state.
 */

import type { RAIDType, RAIDItem } from '../types/raid';

/**
 * Command types that can be parsed from chat messages
 */
export const CommandType = {
  CREATE_RAID: 'CREATE_RAID',
  EDIT_RAID: 'EDIT_RAID',
  LIST_RAID: 'LIST_RAID',
  TRANSITION_WORKFLOW: 'TRANSITION_WORKFLOW',
  UNKNOWN: 'UNKNOWN',
} as const;

export type CommandType = (typeof CommandType)[keyof typeof CommandType];

/**
 * Parsed command intent with extracted parameters
 */
export interface CommandIntent {
  type: CommandType;
  params: Record<string, unknown>;
  confidence: number; // 0-1 score for how confident the parser is
  originalMessage: string;
}

/**
 * Conversation step tracking for multi-turn dialogs
 */
export interface ConversationStep {
  field: string; // Which field are we collecting (e.g., 'title', 'description')
  prompt: string; // Question to ask the user
  required: boolean; // Is this field mandatory?
  validate?: (value: unknown) => boolean; // Optional validation function
}

/**
 * Current conversation state for creating a RAID item
 */
export interface CreateRAIDState {
  intent: typeof CommandType.CREATE_RAID;
  projectKey: string;
  raidType: RAIDType | null;
  collectedData: Partial<RAIDItem>;
  currentStep: number;
  steps: ConversationStep[];
}

/**
 * Current conversation state for editing a RAID item
 */
export interface EditRAIDState {
  intent: typeof CommandType.EDIT_RAID;
  projectKey: string;
  raidId: string;
  updates: Partial<RAIDItem>;
  currentStep: number;
  steps: ConversationStep[];
}

/**
 * Current conversation state for workflow transition
 */
export interface TransitionWorkflowState {
  intent: typeof CommandType.TRANSITION_WORKFLOW;
  projectKey: string;
  targetState: string | null;
  currentStep: number;
  steps: ConversationStep[];
}

/**
 * Union type for all possible conversation states
 */
export type ConversationState =
  | CreateRAIDState
  | EditRAIDState
  | TransitionWorkflowState
  | null; // null = no active conversation

/**
 * Chat message types
 */
export const MessageRole = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system',
  ERROR: 'error',
} as const;

export type MessageRole = (typeof MessageRole)[keyof typeof MessageRole];

/**
 * A single chat message
 */
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  metadata?: {
    command?: CommandIntent;
    raidId?: string;
    raidItem?: unknown;
    error?: string;
  };
}
