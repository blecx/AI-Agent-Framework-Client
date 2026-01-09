export interface PromptMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: PromptMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  description?: string;
  result?: string;
}

export interface Workflow {
  id: string;
  name: string;
  steps: WorkflowStep[];
  currentStepIndex: number;
  status: 'idle' | 'running' | 'completed' | 'failed';
}

export interface ApiConfig {
  baseUrl: string;
  apiKey?: string;
}
