/**
 * API Client for AI-Agent-Framework
 * Provides methods for project management, document proposals, and command execution
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_KEY = import.meta.env.VITE_API_KEY;

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

/**
 * Generic request handler
 */
async function request(endpoint: string, options: RequestOptions = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(API_KEY && { 'Authorization': `Bearer ${API_KEY}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

/**
 * API Client object with all methods
 */
export const apiClient = {
  /**
   * List all projects
   * @returns {Promise<Array>} Array of projects
   */
  listProjects: async () => {
    return request('/projects', { method: 'GET' });
  },

  /**
   * Get a specific project by key
   * @param {string} key - Project key/ID
   * @returns {Promise<Object>} Project details
   */
  getProject: async (key: string) => {
    return request(`/projects/${key}`, { method: 'GET' });
  },

  /**
   * Create a new project
   * @param {Object} data - Project data
   * @returns {Promise<Object>} Created project
   */
  createProject: async (data: Record<string, unknown>) => {
    return request('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Propose document changes for a project
   * @param {string} projectKey - Project key/ID
   * @param {Object} changes - Proposed changes
   * @returns {Promise<Object>} Proposal details
   */
  propose: async (projectKey: string, changes: Record<string, unknown>) => {
    return request(`/projects/${projectKey}/propose`, {
      method: 'POST',
      body: JSON.stringify(changes),
    });
  },

  /**
   * Apply a proposal to a project
   * @param {string} projectKey - Project key/ID
   * @param {string} proposalId - Proposal ID
   * @returns {Promise<Object>} Apply result
   */
  apply: async (projectKey: string, proposalId: string) => {
    return request(`/projects/${projectKey}/proposals/${proposalId}/apply`, {
      method: 'POST',
    });
  },

  /**
   * Execute a command
   * @param {string} command - Command to execute
   * @param {Object} context - Optional context
   * @returns {Promise<Object>} Command result
   */
  executeCommand: async (command: string, context: Record<string, unknown> = {}) => {
    return request('/commands', {
      method: 'POST',
      body: JSON.stringify({ command, context }),
    });
  },

  /**
   * Get command history
   * @returns {Promise<Array>} Command history
   */
  getCommandHistory: async () => {
    return request('/commands/history', { method: 'GET' });
  },
};

export default apiClient;
