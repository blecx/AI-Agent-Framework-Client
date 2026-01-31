/**
 * Tests for Workflow Panel Component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WorkflowPanel } from '../../../components/WorkflowPanel';
import { Workflow } from '../../../types';

describe('WorkflowPanel', () => {
  describe('No Workflow State', () => {
    it('displays empty state when no workflow is provided', () => {
      render(<WorkflowPanel workflow={null} />);

      expect(screen.getByText('Workflows')).toBeInTheDocument();
      expect(
        screen.getByText(
          'No active workflow. You can trigger workflows through chat commands.',
        ),
      ).toBeInTheDocument();
    });
  });

  describe('Active Workflow Display', () => {
    const mockWorkflow: Workflow = {
      id: 'wf-1',
      name: 'Test Workflow',
      currentStepIndex: 1,
      status: 'running',
      steps: [
        {
          id: 'step-1',
          name: 'Initialize',
          status: 'completed',
          description: 'Setup environment',
          result: 'Environment ready',
        },
        {
          id: 'step-2',
          name: 'Execute',
          status: 'in-progress',
          description: 'Run main tasks',
        },
        {
          id: 'step-3',
          name: 'Finalize',
          status: 'pending',
        },
      ],
    };

    it('displays workflow name and status', () => {
      render(<WorkflowPanel workflow={mockWorkflow} />);

      expect(screen.getByText('Test Workflow')).toBeInTheDocument();
      expect(screen.getByText(/Status:/)).toBeInTheDocument();
      expect(screen.getByText('running')).toBeInTheDocument();
    });

    it('renders all workflow steps with correct numbering', () => {
      render(<WorkflowPanel workflow={mockWorkflow} />);

      expect(screen.getByText('Step 1: Initialize')).toBeInTheDocument();
      expect(screen.getByText('Step 2: Execute')).toBeInTheDocument();
      expect(screen.getByText('Step 3: Finalize')).toBeInTheDocument();
    });

    it('displays step descriptions when available', () => {
      render(<WorkflowPanel workflow={mockWorkflow} />);

      expect(screen.getByText('Setup environment')).toBeInTheDocument();
      expect(screen.getByText('Run main tasks')).toBeInTheDocument();
    });

    it('displays step results when available', () => {
      render(<WorkflowPanel workflow={mockWorkflow} />);

      expect(screen.getByText('Environment ready')).toBeInTheDocument();
    });

    it('shows correct status icon for completed step', () => {
      render(<WorkflowPanel workflow={mockWorkflow} />);

      const step1 = screen.getByText('Step 1: Initialize');
      expect(step1.textContent).toContain('✓');
    });

    it('shows correct status icon for in-progress step', () => {
      render(<WorkflowPanel workflow={mockWorkflow} />);

      const step2 = screen.getByText('Step 2: Execute');
      expect(step2.textContent).toContain('⟳');
    });

    it('shows correct status icon for pending step', () => {
      render(<WorkflowPanel workflow={mockWorkflow} />);

      const step3 = screen.getByText('Step 3: Finalize');
      expect(step3.textContent).toContain('○');
    });
  });

  describe('Different Workflow States', () => {
    it('handles workflow with only pending steps', () => {
      const pendingWorkflow: Workflow = {
        id: 'wf-2',
        name: 'Pending Workflow',
        currentStepIndex: 0,
        status: 'idle',
        steps: [
          {
            id: 'step-1',
            name: 'First Step',
            status: 'pending',
          },
        ],
      };

      render(<WorkflowPanel workflow={pendingWorkflow} />);

      expect(screen.getByText('Pending Workflow')).toBeInTheDocument();
      expect(screen.getByText('idle')).toBeInTheDocument();
      expect(screen.getByText('Step 1: First Step')).toBeInTheDocument();
    });

    it('handles workflow with failed step', () => {
      const failedWorkflow: Workflow = {
        id: 'wf-3',
        name: 'Failed Workflow',
        currentStepIndex: 0,
        status: 'failed',
        steps: [
          {
            id: 'step-1',
            name: 'Failed Step',
            status: 'failed',
            description: 'This step failed',
            result: 'Error: Something went wrong',
          },
        ],
      };

      render(<WorkflowPanel workflow={failedWorkflow} />);

      expect(screen.getByText('Failed Workflow')).toBeInTheDocument();
      expect(screen.getByText('failed')).toBeInTheDocument();
      expect(screen.getByText('Step 1: Failed Step')).toBeInTheDocument();
      expect(screen.getByText('This step failed')).toBeInTheDocument();
      expect(
        screen.getByText('Error: Something went wrong'),
      ).toBeInTheDocument();

      const failedStep = screen.getByText('Step 1: Failed Step');
      expect(failedStep.textContent).toContain('✗');
    });

    it('handles workflow with all completed steps', () => {
      const completedWorkflow: Workflow = {
        id: 'wf-4',
        name: 'Completed Workflow',
        currentStepIndex: 2,
        status: 'completed',
        steps: [
          {
            id: 'step-1',
            name: 'Step One',
            status: 'completed',
          },
          {
            id: 'step-2',
            name: 'Step Two',
            status: 'completed',
          },
        ],
      };

      render(<WorkflowPanel workflow={completedWorkflow} />);

      expect(screen.getByText('Completed Workflow')).toBeInTheDocument();
      expect(screen.getByText('completed')).toBeInTheDocument();
      expect(screen.getByText('Step 1: Step One')).toBeInTheDocument();
      expect(screen.getByText('Step 2: Step Two')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles workflow with empty steps array', () => {
      const emptyStepsWorkflow: Workflow = {
        id: 'wf-5',
        name: 'Empty Workflow',
        currentStepIndex: 0,
        status: 'idle',
        steps: [],
      };

      render(<WorkflowPanel workflow={emptyStepsWorkflow} />);

      expect(screen.getByText('Empty Workflow')).toBeInTheDocument();
      expect(screen.getByText('idle')).toBeInTheDocument();
    });

    it('handles step without description', () => {
      const noDescWorkflow: Workflow = {
        id: 'wf-6',
        name: 'No Description Workflow',
        currentStepIndex: 1,
        status: 'running',
        steps: [
          {
            id: 'step-1',
            name: 'Step Without Description',
            status: 'completed',
          },
        ],
      };

      render(<WorkflowPanel workflow={noDescWorkflow} />);

      expect(
        screen.getByText('Step 1: Step Without Description'),
      ).toBeInTheDocument();
      expect(screen.queryByText('Setup environment')).not.toBeInTheDocument();
    });

    it('handles step without result', () => {
      const noResultWorkflow: Workflow = {
        id: 'wf-7',
        name: 'No Result Workflow',
        currentStepIndex: 0,
        status: 'running',
        steps: [
          {
            id: 'step-1',
            name: 'Step Without Result',
            status: 'in-progress',
            description: 'Running step',
          },
        ],
      };

      render(<WorkflowPanel workflow={noResultWorkflow} />);

      expect(
        screen.getByText('Step 1: Step Without Result'),
      ).toBeInTheDocument();
      expect(screen.getByText('Running step')).toBeInTheDocument();
      expect(screen.queryByText('Environment ready')).not.toBeInTheDocument();
    });

    it('applies correct CSS class for workflow-panel', () => {
      const { container } = render(<WorkflowPanel workflow={null} />);

      const panel = container.querySelector('.workflow-panel');
      expect(panel).toBeInTheDocument();
    });

    it('applies correct CSS class for workflow-step', () => {
      const workflow: Workflow = {
        id: 'wf-8',
        name: 'Test',
        currentStepIndex: 1,
        status: 'running',
        steps: [
          {
            id: 'step-1',
            name: 'Test Step',
            status: 'completed',
          },
        ],
      };

      const { container } = render(<WorkflowPanel workflow={workflow} />);

      const step = container.querySelector('.workflow-step');
      expect(step).toBeInTheDocument();
      expect(step).toHaveClass('completed');
    });
  });

  describe('Component Integration', () => {
    it('renders correctly with onStartWorkflow prop (even if unused)', () => {
      const mockStartWorkflow = () => {};

      render(
        <WorkflowPanel workflow={null} onStartWorkflow={mockStartWorkflow} />,
      );

      expect(screen.getByText('Workflows')).toBeInTheDocument();
    });

    it('handles multiple steps with mixed statuses', () => {
      const mixedWorkflow: Workflow = {
        id: 'wf-9',
        name: 'Mixed Status Workflow',
        currentStepIndex: 1,
        status: 'running',
        steps: [
          {
            id: 'step-1',
            name: 'Completed Step',
            status: 'completed',
            result: 'Success',
          },
          {
            id: 'step-2',
            name: 'In Progress Step',
            status: 'in-progress',
          },
          {
            id: 'step-3',
            name: 'Pending Step',
            status: 'pending',
          },
          {
            id: 'step-4',
            name: 'Failed Step',
            status: 'failed',
            result: 'Error occurred',
          },
        ],
      };

      render(<WorkflowPanel workflow={mixedWorkflow} />);

      expect(screen.getByText('Step 1: Completed Step')).toBeInTheDocument();
      expect(screen.getByText('Step 2: In Progress Step')).toBeInTheDocument();
      expect(screen.getByText('Step 3: Pending Step')).toBeInTheDocument();
      expect(screen.getByText('Step 4: Failed Step')).toBeInTheDocument();

      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Error occurred')).toBeInTheDocument();
    });
  });
});
