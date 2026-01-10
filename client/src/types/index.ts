// Shared type definitions for components

export interface Proposal {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  changes?: string;
}

export interface Message {
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  status?: 'success' | 'error';
}

export interface CommandHistoryItem {
  command: string;
  result?: string;
  timestamp: string;
}
