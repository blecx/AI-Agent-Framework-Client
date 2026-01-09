import { Workflow } from '../types';
import { ApiService } from './apiService';

export class WorkflowService {
  private apiService: ApiService;

  constructor(apiService: ApiService) {
    this.apiService = apiService;
  }

  /**
   * Create a new workflow
   */
  createWorkflow(name: string, steps: Array<{ name: string; description?: string }>): Workflow {
    return {
      id: `workflow_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      name,
      steps: steps.map((step, index) => ({
        id: `step_${index}_${Date.now()}`,
        name: step.name,
        description: step.description,
        status: 'pending'
      })),
      currentStepIndex: 0,
      status: 'idle'
    };
  }

  /**
   * Execute a workflow step by step
   */
  async executeWorkflowStep(
    workflow: Workflow,
    onStepUpdate: (workflow: Workflow) => void
  ): Promise<Workflow> {
    const updatedWorkflow: Workflow = { ...workflow, status: 'running' };
    onStepUpdate(updatedWorkflow);

    try {
      const currentStep = updatedWorkflow.steps[updatedWorkflow.currentStepIndex];
      if (!currentStep) {
        updatedWorkflow.status = 'completed';
        return updatedWorkflow;
      }

      // Mark current step as in-progress
      currentStep.status = 'in-progress';
      onStepUpdate(updatedWorkflow);

      // Execute the step via API
      const result = await this.apiService.executeWorkflow(
        updatedWorkflow.name,
        { stepId: currentStep.id, stepName: currentStep.name }
      );

      // Update step with result
      currentStep.status = 'completed';
      currentStep.result = result.result;
      
      // Move to next step or complete workflow
      if (result.isComplete || updatedWorkflow.currentStepIndex >= updatedWorkflow.steps.length - 1) {
        updatedWorkflow.status = 'completed';
      } else {
        updatedWorkflow.currentStepIndex++;
      }

      onStepUpdate(updatedWorkflow);
      return updatedWorkflow;
    } catch (error) {
      // Mark step as failed
      const currentStep = updatedWorkflow.steps[updatedWorkflow.currentStepIndex];
      if (currentStep) {
        currentStep.status = 'failed';
        currentStep.result = error instanceof Error ? error.message : 'Step failed';
      }
      updatedWorkflow.status = 'failed';
      onStepUpdate(updatedWorkflow);
      throw error;
    }
  }

  /**
   * Execute all remaining steps in a workflow
   */
  async executeAllSteps(
    workflow: Workflow,
    onStepUpdate: (workflow: Workflow) => void
  ): Promise<Workflow> {
    let currentWorkflow = workflow;
    
    while (
      currentWorkflow.currentStepIndex < currentWorkflow.steps.length &&
      currentWorkflow.status !== 'failed'
    ) {
      currentWorkflow = await this.executeWorkflowStep(currentWorkflow, onStepUpdate);
      
      // Add a small delay between steps for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return currentWorkflow;
  }

  /**
   * Parse a workflow command from user input
   * Example: "workflow: data-analysis with steps: collect, process, visualize"
   */
  parseWorkflowCommand(input: string): { name: string; steps: string[] } | null {
    const workflowMatch = input.match(/workflow:\s*([^\s]+)\s+with steps:\s*(.+)/i);
    if (!workflowMatch) {
      return null;
    }

    const name = workflowMatch[1].trim();
    const stepsStr = workflowMatch[2].trim();
    const steps = stepsStr.split(',').map(s => s.trim()).filter(s => s.length > 0);

    return { name, steps };
  }
}
