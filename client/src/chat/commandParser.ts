/**
 * Command parser for chat messages
 * 
 * Parses user chat messages and extracts command intents with parameters.
 */

import { CommandType, type CommandIntent } from './types';
import { RAIDType } from '../types/raid';

/**
 * Parse a user message into a command intent
 */
export function parseCommand(message: string): CommandIntent {
  const lowerMessage = message.toLowerCase().trim();
  
  // CREATE RAID patterns
  if (matchesCreateRAID(lowerMessage)) {
    const raidType = extractRAIDType(lowerMessage);
    return {
      type: CommandType.CREATE_RAID,
      params: raidType ? { raidType } : {},
      confidence: raidType ? 0.9 : 0.7,
      originalMessage: message,
    };
  }

  // EDIT RAID patterns
  if (matchesEditRAID(lowerMessage)) {
    const raidId = extractRAIDId(lowerMessage);
    return {
      type: CommandType.EDIT_RAID,
      params: raidId ? { raidId } : {},
      confidence: raidId ? 0.9 : 0.7,
      originalMessage: message,
    };
  }

  // LIST RAID patterns
  if (matchesListRAID(lowerMessage)) {
    return {
      type: CommandType.LIST_RAID,
      params: {},
      confidence: 0.9,
      originalMessage: message,
    };
  }

  // TRANSITION WORKFLOW patterns
  if (matchesTransitionWorkflow(lowerMessage)) {
    const targetState = extractTargetState(lowerMessage);
    return {
      type: CommandType.TRANSITION_WORKFLOW,
      params: targetState ? { targetState } : {},
      confidence: targetState ? 0.9 : 0.7,
      originalMessage: message,
    };
  }

  // Unknown command
  return {
    type: CommandType.UNKNOWN,
    params: {},
    confidence: 0,
    originalMessage: message,
  };
}

/**
 * Check if message matches CREATE RAID patterns
 */
function matchesCreateRAID(message: string): boolean {
  const createPatterns = [
    /create\s+(a\s+)?(new\s+)?(raid|risk|assumption|issue|dependency)/i,
    /add\s+(a\s+)?(new\s+)?(raid|risk|assumption|issue|dependency)/i,
    /new\s+(raid|risk|assumption|issue|dependency)/i,
    /log\s+(a\s+|an\s+)?(new\s+)?(risk|assumption|issue|dependency)/i,
  ];
  
  return createPatterns.some(pattern => pattern.test(message));
}

/**
 * Check if message matches EDIT RAID patterns
 */
function matchesEditRAID(message: string): boolean {
  const editPatterns = [
    /edit\s+(raid|risk|assumption|issue|dependency)/i,
    /update\s+(raid|risk|assumption|issue|dependency|[RAIDraid]-\d+)/i,
    /modify\s+(raid|risk|assumption|issue|dependency)/i,
    /change\s+(raid|risk|assumption|issue|dependency)/i,
  ];
  
  return editPatterns.some(pattern => pattern.test(message));
}

/**
 * Check if message matches LIST RAID patterns
 */
function matchesListRAID(message: string): boolean {
  const listPatterns = [
    /list\s+(all\s+)?(raid|risks|assumptions|issues|dependencies)/i,
    /show\s+(all\s+)?(raid|risks|assumptions|issues|dependencies)/i,
    /view\s+(all\s+)?(raid|risks|assumptions|issues|dependencies)/i,
    /get\s+(all\s+)?(raid|risks|assumptions|issues|dependencies)/i,
  ];
  
  return listPatterns.some(pattern => pattern.test(message));
}

/**
 * Check if message matches TRANSITION WORKFLOW patterns
 */
function matchesTransitionWorkflow(message: string): boolean {
  const transitionPatterns = [
    /transition\s+to\s+\w+/i,
    /move\s+to\s+\w+/i,
    /change\s+state\s+to\s+\w+/i,
    /set\s+state\s+to\s+\w+/i,
  ];
  
  return transitionPatterns.some(pattern => pattern.test(message));
}

/**
 * Extract RAID type from message
 */
function extractRAIDType(message: string): RAIDType | null {
  if (/\b(risk|risks)\b/i.test(message)) return RAIDType.RISK;
  if (/\b(assumption|assumptions)\b/i.test(message)) return RAIDType.ASSUMPTION;
  if (/\b(issue|issues)\b/i.test(message)) return RAIDType.ISSUE;
  if (/\b(dependency|dependencies)\b/i.test(message)) return RAIDType.DEPENDENCY;
  return null;
}

/**
 * Extract RAID ID from message (e.g., "RAID-001", "R-42")
 */
function extractRAIDId(message: string): string | null {
  const idPattern = /\b(RAID|R|A|I|D)-(\d+)\b/i;
  const match = message.match(idPattern);
  return match ? match[0].toUpperCase() : null;
}

/**
 * Extract target workflow state from message
 */
function extractTargetState(message: string): string | null {
  const statePattern = /to\s+(\w+)/i;
  const match = message.match(statePattern);
  return match ? match[1].toLowerCase() : null;
}
