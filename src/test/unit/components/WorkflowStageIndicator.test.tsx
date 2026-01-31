/**
 * Tests for Workflow Stage Indicator Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkflowStageIndicator } from '../../../components/workflow/WorkflowStageIndicator';
import { WorkflowStateEnum } from '../../../types/api';

describe('WorkflowStageIndicator', () => {
  const getStageElement = (text: string) => {
    return screen.getByText(text).parentElement?.parentElement;
  };

  describe('Stage Display', () => {
    it('renders all 6 workflow stages', () => {
      render(
        <WorkflowStageIndicator currentState={WorkflowStateEnum.INITIATING} />,
      );

      expect(screen.getByText('Initiating')).toBeInTheDocument();
      expect(screen.getByText('Planning')).toBeInTheDocument();
      expect(screen.getByText('Executing')).toBeInTheDocument();
      expect(screen.getByText('Monitoring')).toBeInTheDocument();
      expect(screen.getByText('Closing')).toBeInTheDocument();
      expect(screen.getByText('Closed')).toBeInTheDocument();
    });

    it('highlights current stage correctly', () => {
      render(
        <WorkflowStageIndicator currentState={WorkflowStateEnum.EXECUTING} />,
      );

      const executingStage = getStageElement('Executing');
      expect(executingStage).toHaveClass('bg-blue-600');
    });

    it('shows completed stages with green background', () => {
      render(
        <WorkflowStageIndicator currentState={WorkflowStateEnum.EXECUTING} />,
      );

      const initiatingStage = getStageElement('Initiating');
      const planningStage = getStageElement('Planning');

      // Completed stages should have green background
      expect(initiatingStage).toHaveClass('bg-green-100');
      expect(planningStage).toHaveClass('bg-green-100');
    });

    it('shows checkmarks on completed stages', () => {
      const { container } = render(
        <WorkflowStageIndicator currentState={WorkflowStateEnum.EXECUTING} />,
      );

      const svgs = container.querySelectorAll('svg path[fill-rule="evenodd"]');
      // Should have at least 2 checkmarks (Initiating and Planning completed)
      expect(svgs.length).toBeGreaterThanOrEqual(2);
    });

    it('shows locked future stages as grayed out', () => {
      render(
        <WorkflowStageIndicator
          currentState={WorkflowStateEnum.INITIATING}
          allowedTransitions={[WorkflowStateEnum.PLANNING]}
        />,
      );

      const executingStage = getStageElement('Executing');
      const monitoringStage = getStageElement('Monitoring');

      // Locked stages should be grayed out
      expect(executingStage).toHaveClass('bg-gray-50');
      expect(executingStage).toHaveClass('text-gray-400');
      expect(monitoringStage).toHaveClass('bg-gray-50');
    });

    it('shows available transitions with clickable styling', () => {
      render(
        <WorkflowStageIndicator
          currentState={WorkflowStateEnum.PLANNING}
          allowedTransitions={[
            WorkflowStateEnum.EXECUTING,
            WorkflowStateEnum.CLOSING,
          ]}
        />,
      );

      const executingStage = getStageElement('Executing');
      const monitoringStage = getStageElement('Monitoring');
      const closingStage = getStageElement('Closing');

      // Available transitions should have lighter styling
      expect(executingStage).toHaveClass('bg-gray-100');
      expect(closingStage).toHaveClass('bg-gray-100');
      expect(monitoringStage).toHaveClass('bg-gray-50'); // Locked
    });
  });

  describe('Stage Interaction', () => {
    it('calls onStageClick when clicking available transition', () => {
      const handleClick = vi.fn();
      render(
        <WorkflowStageIndicator
          currentState={WorkflowStateEnum.INITIATING}
          allowedTransitions={[WorkflowStateEnum.PLANNING]}
          onStageClick={handleClick}
        />,
      );

      const planningStage = screen.getByText('Planning');
      fireEvent.click(planningStage);

      expect(handleClick).toHaveBeenCalledWith(WorkflowStateEnum.PLANNING);
    });

    it('calls onStageClick when clicking current stage', () => {
      const handleClick = vi.fn();
      render(
        <WorkflowStageIndicator
          currentState={WorkflowStateEnum.EXECUTING}
          onStageClick={handleClick}
        />,
      );

      const executingStage = screen.getByText('Executing');
      fireEvent.click(executingStage);

      expect(handleClick).toHaveBeenCalledWith(WorkflowStateEnum.EXECUTING);
    });

    it('does not call onStageClick when clicking locked stage', () => {
      const handleClick = vi.fn();
      render(
        <WorkflowStageIndicator
          currentState={WorkflowStateEnum.INITIATING}
          allowedTransitions={[WorkflowStateEnum.PLANNING]}
          onStageClick={handleClick}
        />,
      );

      const executingStage = screen.getByText('Executing');
      fireEvent.click(executingStage);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not call onStageClick when clicking completed stage', () => {
      const handleClick = vi.fn();
      render(
        <WorkflowStageIndicator
          currentState={WorkflowStateEnum.EXECUTING}
          onStageClick={handleClick}
        />,
      );

      const initiatingStage = screen.getByText('Initiating');
      fireEvent.click(initiatingStage);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('supports keyboard navigation for available stages', () => {
      const handleClick = vi.fn();
      render(
        <WorkflowStageIndicator
          currentState={WorkflowStateEnum.PLANNING}
          allowedTransitions={[WorkflowStateEnum.EXECUTING]}
          onStageClick={handleClick}
        />,
      );

      const executingStage = screen.getByText('Executing');

      fireEvent.keyDown(executingStage, { key: 'Enter' });
      expect(handleClick).toHaveBeenCalledWith(WorkflowStateEnum.EXECUTING);

      handleClick.mockClear();
      fireEvent.keyDown(executingStage, { key: ' ' });
      expect(handleClick).toHaveBeenCalledWith(WorkflowStateEnum.EXECUTING);
    });

    it('does not respond to keyboard on locked stages', () => {
      const handleClick = vi.fn();
      render(
        <WorkflowStageIndicator
          currentState={WorkflowStateEnum.INITIATING}
          onStageClick={handleClick}
        />,
      );

      const executingStage = screen.getByText('Executing');
      fireEvent.keyDown(executingStage, { key: 'Enter' });

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Tooltips and Accessibility', () => {
    it('provides descriptive tooltips for each stage', () => {
      render(<WorkflowStageIndicator currentState={WorkflowStateEnum.PLANNING} />);

      const initiatingStage = getStageElement('Initiating');
      expect(initiatingStage).toHaveAttribute(
        'title',
        expect.stringContaining('Project initialization'),
      );

      const planningStage = getStageElement('Planning');
      expect(planningStage).toHaveAttribute(
        'title',
        expect.stringContaining('Detailed planning'),
      );
    });

    it('indicates locked stages in tooltips', () => {
      render(<WorkflowStageIndicator currentState={WorkflowStateEnum.INITIATING} />);

      const executingStage = getStageElement('Executing');
      expect(executingStage).toHaveAttribute(
        'title',
        expect.stringContaining('Not yet available'),
      );
    });

    it('sets proper ARIA roles for interactive elements', () => {
      render(
        <WorkflowStageIndicator
          currentState={WorkflowStateEnum.INITIATING}
          allowedTransitions={[WorkflowStateEnum.PLANNING]}
        />,
      );

      const planningStage = getStageElement('Planning');
      const executingStage = getStageElement('Executing');

      expect(planningStage).toHaveAttribute('role', 'button');
      expect(executingStage).toHaveAttribute('role', 'status');
    });

    it('sets tabindex correctly for keyboard navigation', () => {
      render(
        <WorkflowStageIndicator
          currentState={WorkflowStateEnum.PLANNING}
          allowedTransitions={[WorkflowStateEnum.EXECUTING]}
        />,
      );

      const planningStage = getStageElement('Planning');
      const executingStage = getStageElement('Executing');
      const lockedStage = getStageElement('Monitoring');

      expect(planningStage).toHaveAttribute('tabIndex', '0');
      expect(executingStage).toHaveAttribute('tabIndex', '0');
      expect(lockedStage).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('Edge Cases', () => {
    it('handles no allowed transitions gracefully', () => {
      render(<WorkflowStageIndicator currentState={WorkflowStateEnum.CLOSED} />);

      expect(screen.getByText('Closed')).toBeInTheDocument();
      const closedStage = getStageElement('Closed');
      expect(closedStage).toHaveClass('bg-blue-600'); // Current state
    });

    it('works without onStageClick callback', () => {
      render(
        <WorkflowStageIndicator
          currentState={WorkflowStateEnum.EXECUTING}
          allowedTransitions={[WorkflowStateEnum.MONITORING]}
        />,
      );

      const monitoringStage = screen.getByText('Monitoring');

      // Should not throw error when clicking without callback
      expect(() => fireEvent.click(monitoringStage)).not.toThrow();
    });

    it('handles CLOSED state correctly', () => {
      render(<WorkflowStageIndicator currentState={WorkflowStateEnum.CLOSED} />);

      // All previous stages should be completed
      const initiatingStage = getStageElement('Initiating');
      const closingStage = getStageElement('Closing');
      const closedStage = getStageElement('Closed');

      expect(initiatingStage).toHaveClass('bg-green-100');
      expect(closingStage).toHaveClass('bg-green-100');
      expect(closedStage).toHaveClass('bg-blue-600'); // Current
    });
  });
});
