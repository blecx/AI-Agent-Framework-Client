/**
 * Type definitions for AI Agent Framework Client
 */

export * from './raid';
export * from './workflow';
export * from './template';

// Project types
export interface Project {
  key: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  documents?: Document[];
  gitRepo?: GitRepoInfo;
}

export interface Document {
  id: string;
  name: string;
  path: string;
  content: string;
  lastModified: string;
}

export interface GitRepoInfo {
  url: string;
  branch: string;
  lastCommit?: string;
  status?: 'clean' | 'dirty' | 'unknown';
}

// Proposal types
export interface Proposal {
  id: string;
  projectKey: string;
  title: string;
  description: string;
  changes: ProposalChange[];
  status: 'pending' | 'approved' | 'rejected' | 'applied';
  createdAt: string;
  appliedAt?: string;
}

export interface ProposalChange {
  file: string;
  type: 'add' | 'modify' | 'delete';
  before?: string;
  after?: string;
  diff?: string;
}

// Command types
export interface Command {
  id: string;
  projectKey?: string;
  command: string;
  args?: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  output?: string;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface CommandHistory {
  commands: Command[];
  limit?: number;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// API Configuration
export interface ApiConfig {
  baseUrl: string;
  apiKey?: string;
}
