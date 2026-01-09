/**
 * API Service for testing AI-Agent-Framework API endpoints
 * This service provides methods to test various API endpoints without workflows
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

export interface TestResult {
  endpoint: string;
  method: string;
  status: 'pending' | 'success' | 'error';
  response?: unknown;
  error?: string;
  duration?: number;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
  }

  /**
   * Set the base URL for API calls
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  /**
   * Get the current base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Generic HTTP request method
   */
  private async request<T = unknown>(
    endpoint: string,
    method: string = 'GET',
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const startTime = performance.now();
    
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      };

      if (body && method !== 'GET') {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      const duration = performance.now() - startTime;
      
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        return {
          success: false,
          error: typeof data === 'string' ? data : data.message || `HTTP ${response.status}`,
          status: response.status,
        };
      }

      return {
        success: true,
        data: { ...data, _meta: { duration: Math.round(duration) } },
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 0,
      };
    }
  }

  /**
   * Test endpoint: Health check
   */
  async testHealth(): Promise<TestResult> {
    const result: TestResult = {
      endpoint: '/health',
      method: 'GET',
      status: 'pending',
    };

    const startTime = performance.now();
    const response = await this.request('/health', 'GET');
    result.duration = Math.round(performance.now() - startTime);

    if (response.success) {
      result.status = 'success';
      result.response = response.data;
    } else {
      result.status = 'error';
      result.error = response.error;
    }

    return result;
  }

  /**
   * Test endpoint: Get API version/info
   */
  async testInfo(): Promise<TestResult> {
    const result: TestResult = {
      endpoint: '/info',
      method: 'GET',
      status: 'pending',
    };

    const startTime = performance.now();
    const response = await this.request('/info', 'GET');
    result.duration = Math.round(performance.now() - startTime);

    if (response.success) {
      result.status = 'success';
      result.response = response.data;
    } else {
      result.status = 'error';
      result.error = response.error;
    }

    return result;
  }

  /**
   * Test endpoint: List available agents
   */
  async testListAgents(): Promise<TestResult> {
    const result: TestResult = {
      endpoint: '/agents',
      method: 'GET',
      status: 'pending',
    };

    const startTime = performance.now();
    const response = await this.request('/agents', 'GET');
    result.duration = Math.round(performance.now() - startTime);

    if (response.success) {
      result.status = 'success';
      result.response = response.data;
    } else {
      result.status = 'error';
      result.error = response.error;
    }

    return result;
  }

  /**
   * Test endpoint: Get agent capabilities
   */
  async testAgentCapabilities(agentId: string = 'default'): Promise<TestResult> {
    const result: TestResult = {
      endpoint: `/agents/${agentId}/capabilities`,
      method: 'GET',
      status: 'pending',
    };

    const startTime = performance.now();
    const response = await this.request(`/agents/${agentId}/capabilities`, 'GET');
    result.duration = Math.round(performance.now() - startTime);

    if (response.success) {
      result.status = 'success';
      result.response = response.data;
    } else {
      result.status = 'error';
      result.error = response.error;
    }

    return result;
  }

  /**
   * Test endpoint: Execute a simple agent task (no workflow)
   */
  async testExecuteTask(task: string): Promise<TestResult> {
    const result: TestResult = {
      endpoint: '/execute',
      method: 'POST',
      status: 'pending',
    };

    const startTime = performance.now();
    const response = await this.request('/execute', 'POST', { task });
    result.duration = Math.round(performance.now() - startTime);

    if (response.success) {
      result.status = 'success';
      result.response = response.data;
    } else {
      result.status = 'error';
      result.error = response.error;
    }

    return result;
  }

  /**
   * Test custom endpoint
   */
  async testCustomEndpoint(
    endpoint: string,
    method: string = 'GET',
    body?: unknown
  ): Promise<TestResult> {
    const result: TestResult = {
      endpoint,
      method,
      status: 'pending',
    };

    const startTime = performance.now();
    const response = await this.request(endpoint, method, body);
    result.duration = Math.round(performance.now() - startTime);

    if (response.success) {
      result.status = 'success';
      result.response = response.data;
    } else {
      result.status = 'error';
      result.error = response.error;
    }

    return result;
  }
}

export const apiService = new ApiService();
export default apiService;
