/**
 * Chat API Integration Layer
 *
 * Connects conversation manager to backend RAID APIs.
 * Executes commands based on collected conversation data and formats responses for chat display.
 */

import { apiClient } from '../services/apiClient';
import type { ApiResponse, RAIDItem } from '../types';
import type { RAIDItemCreate } from '../types/raid';
import { RAIDStatus, RAIDPriority } from '../types/raid';
import type {
  ConversationState,
  CreateRAIDState,
  EditRAIDState,
  ChatMessage,
} from './types';
import { CommandType } from './types';

/**
 * Result of executing a chat command
 */
export interface CommandExecutionResult {
  success: boolean;
  message: ChatMessage;
  data?: RAIDItem;
  error?: string;
}

/**
 * Execute a chat command after conversation is complete
 *
 * @param state The completed conversation state
 * @returns Result with formatted chat message
 */
export async function executeCommand(
  state: ConversationState,
): Promise<CommandExecutionResult> {
  if (!state || !isConversationComplete(state)) {
    return {
      success: false,
      message: {
        id: crypto.randomUUID(),
        role: 'assistant',
        content:
          'Conversation is not complete yet. Please answer all questions first.',
        timestamp: new Date(),
      },
      error: 'Incomplete conversation',
    };
  }

  switch (state.intent) {
    case CommandType.CREATE_RAID:
      return await executeCreateRAID(state as CreateRAIDState);

    case CommandType.EDIT_RAID:
      return await executeEditRAID(state as EditRAIDState);

    default:
      return {
        success: false,
        message: {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Command type "${state.intent}" is not yet supported.`,
          timestamp: new Date(),
        },
        error: 'Unsupported command',
      };
  }
}

/**
 * Execute CREATE_RAID command
 */
async function executeCreateRAID(
  state: CreateRAIDState,
): Promise<CommandExecutionResult> {
  const { projectKey, collectedData } = state;

  // Validate required fields
  if (
    !collectedData.type ||
    !collectedData.title ||
    !collectedData.description
  ) {
    return {
      success: false,
      message: {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Missing required fields: type, title, or description.',
        timestamp: new Date(),
      },
      error: 'Missing required fields',
    };
  }

  // Build create request
  const createData: RAIDItemCreate = {
    type: collectedData.type,
    title: collectedData.title,
    description: collectedData.description,
    status: collectedData.status || RAIDStatus.OPEN,
    priority: collectedData.priority || RAIDPriority.MEDIUM,
    owner: collectedData.owner || '',
  };

  // Call backend API
  const response: ApiResponse<RAIDItem> = await apiClient.createRAIDItem(
    projectKey,
    createData,
  );

  if (!response.success || !response.data) {
    return {
      success: false,
      message: {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Failed to create RAID item: ${response.error || 'Unknown error'}`,
        timestamp: new Date(),
      },
      error: response.error,
    };
  }

  // Format success message
  const item = response.data;
  const message = formatRAIDCreatedMessage(item);

  return {
    success: true,
    message: {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: message,
      timestamp: new Date(),
      metadata: { raidItem: item },
    },
    data: item,
  };
}

/**
 * Execute EDIT_RAID command
 */
async function executeEditRAID(
  state: EditRAIDState,
): Promise<CommandExecutionResult> {
  const { projectKey, raidId, updates } = state;

  if (!raidId) {
    return {
      success: false,
      message: {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'No RAID item ID specified for editing.',
        timestamp: new Date(),
      },
      error: 'Missing RAID ID',
    };
  }

  // Call backend API
  const response: ApiResponse<RAIDItem> = await apiClient.updateRAIDItem(
    projectKey,
    raidId,
    updates,
  );

  if (!response.success || !response.data) {
    return {
      success: false,
      message: {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Failed to update RAID item: ${response.error || 'Unknown error'}`,
        timestamp: new Date(),
      },
      error: response.error,
    };
  }

  // Format success message
  const item = response.data;
  const message = formatRAIDUpdatedMessage(item);

  return {
    success: true,
    message: {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: message,
      timestamp: new Date(),
      metadata: { raidItem: item },
    },
    data: item,
  };
}

/**
 * Format a success message for RAID creation
 */
function formatRAIDCreatedMessage(item: RAIDItem): string {
  const typeLabel = item.type.charAt(0) + item.type.slice(1).toLowerCase();

  let message = `✅ **Created ${typeLabel} ${item.id}**\n\n`;
  message += `**Title:** ${item.title}\n`;
  message += `**Description:** ${item.description}\n`;
  message += `**Priority:** ${item.priority}\n`;
  message += `**Status:** ${item.status}\n`;

  if (item.owner) {
    message += `**Owner:** ${item.owner}\n`;
  }

  return message;
}

/**
 * Format a success message for RAID update
 */
function formatRAIDUpdatedMessage(item: RAIDItem): string {
  const typeLabel = item.type.charAt(0) + item.type.slice(1).toLowerCase();

  let message = `✅ **Updated ${typeLabel} ${item.id}**\n\n`;
  message += `**Title:** ${item.title}\n`;
  message += `**Status:** ${item.status}\n`;
  message += `**Priority:** ${item.priority}\n`;

  if (item.owner) {
    message += `**Owner:** ${item.owner}\n`;
  }

  return message;
}

/**
 * Format an API error for chat display
 */
export function formatApiError(error: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role: 'assistant',
    content: `❌ **Error:** ${error}`,
    timestamp: new Date(),
  };
}

/**
 * Validate conversation state before execution
 */
export function canExecuteCommand(state: ConversationState | null): boolean {
  if (!state) return false;
  if (!isConversationComplete(state)) return false;

  switch (state.intent) {
    case CommandType.CREATE_RAID: {
      const createState = state as CreateRAIDState;
      return !!(
        createState.projectKey &&
        createState.collectedData.type &&
        createState.collectedData.title &&
        createState.collectedData.description
      );
    }

    case CommandType.EDIT_RAID: {
      const editState = state as EditRAIDState;
      return !!(
        editState.projectKey &&
        editState.raidId &&
        Object.keys(editState.updates).length > 0
      );
    }

    default:
      return false;
  }
}

/**
 * Check if conversation has completed all steps
 */
function isConversationComplete(state: ConversationState): boolean {
  if (!state) return false;
  return state.currentStep >= state.steps.length;
}
