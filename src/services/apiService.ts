import { ApiConfig } from '../types';

export class ApiService {
  private config: ApiConfig;

  constructor(config: ApiConfig) {
    this.config = config;
  }

  /**
   * Send a prompt to the AI Agent Framework API
   */
  async sendPrompt(prompt: string, conversationHistory?: Array<{ role: string; content: string }>): Promise<string> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: JSON.stringify({
          prompt,
          history: conversationHistory || []
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.response || data.message || 'No response from API';
    } catch (error) {
      console.error('Error sending prompt:', error);
      throw error;
    }
  }

  /**
   * Execute a workflow step by step
   */
  async executeWorkflow(workflowName: string, params?: Record<string, unknown>): Promise<{
    stepId: string;
    result: string;
    isComplete: boolean;
  }> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/workflow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: JSON.stringify({
          workflow: workflowName,
          params: params || {}
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return {
        stepId: data.stepId || '',
        result: data.result || '',
        isComplete: data.isComplete || false
      };
    } catch (error) {
      console.error('Error executing workflow:', error);
      throw error;
    }
  }

  /**
   * Get the status of the API
   */
  async getStatus(): Promise<{ status: string; version?: string }> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/status`, {
        method: 'GET',
        headers: {
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting API status:', error);
      throw error;
    }
  }
}
