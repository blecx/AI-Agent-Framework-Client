import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WorkflowTransitionUI } from '../../../components/workflow/WorkflowTransitionUI';
import { WorkflowStateEnum } from '../../../types/api';

describe('WorkflowTransitionUI', () => {
  const mockOnTransition = vi.fn();
  const defaultProps = {
    projectKey: 'PROJ1',
    currentState: WorkflowStateEnum.PLANNING,
    allowedTransitions: [WorkflowStateEnum.EXECUTING, WorkflowStateEnum.INITIATING],
    onTransition: mockOnTransition,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('State Display', () => {
    it('displays current workflow state prominently', () => {
      render(<WorkflowTransitionUI {...defaultProps} />);
      
      const currentStateDisplay = screen.getByText(WorkflowStateEnum.PLANNING);
      expect(currentStateDisplay).toBeInTheDocument();
      expect(currentStateDisplay).toHaveClass('bg-blue-100');
    });

    it('displays available transitions as buttons', () => {
      render(<WorkflowTransitionUI {...defaultProps} />);
      
      const executingBtn = screen.getByTestId(`transition-btn-${WorkflowStateEnum.EXECUTING}`);
      const initiatingBtn = screen.getByTestId(`transition-btn-${WorkflowStateEnum.INITIATING}`);
      
      expect(executingBtn).toBeInTheDocument();
      expect(initiatingBtn).toBeInTheDocument();
      expect(executingBtn).toHaveTextContent('Transition to Executing');
      expect(initiatingBtn).toHaveTextContent('Transition to Initiating');
    });

    it('shows message when no transitions available', () => {
      render(
        <WorkflowTransitionUI
          {...defaultProps}
          allowedTransitions={[]}
        />
      );
      
      const noTransitionsMsg = screen.getByTestId('no-transitions');
      expect(noTransitionsMsg).toHaveTextContent('No valid transitions available');
    });

    it('disables buttons when loading', () => {
      render(<WorkflowTransitionUI {...defaultProps} isLoading={true} />);
      
      const executingBtn = screen.getByTestId(`transition-btn-${WorkflowStateEnum.EXECUTING}`);
      expect(executingBtn).toBeDisabled();
      expect(executingBtn).toHaveClass('cursor-not-allowed');
    });
  });

  describe('Non-Critical Transitions', () => {
    it('executes non-critical transition immediately without confirmation', async () => {
      mockOnTransition.mockResolvedValue(undefined);
      render(<WorkflowTransitionUI {...defaultProps} />);
      
      const executingBtn = screen.getByTestId(`transition-btn-${WorkflowStateEnum.EXECUTING}`);
      fireEvent.click(executingBtn);
      
      // Should NOT show confirmation dialog
      expect(screen.queryByTestId('confirmation-dialog')).not.toBeInTheDocument();
      
      // Should call transition immediately
      await waitFor(() => {
        expect(mockOnTransition).toHaveBeenCalledWith(WorkflowStateEnum.EXECUTING, undefined);
      });
    });

    it('shows success message after successful transition', async () => {
      mockOnTransition.mockResolvedValue(undefined);
      render(<WorkflowTransitionUI {...defaultProps} />);
      
      const executingBtn = screen.getByTestId(`transition-btn-${WorkflowStateEnum.EXECUTING}`);
      fireEvent.click(executingBtn);
      
      await waitFor(() => {
        const successMsg = screen.getByTestId('success-message');
        expect(successMsg).toHaveTextContent('Successfully transitioned to Executing');
      });
    });

    it('shows error message when transition fails', async () => {
      mockOnTransition.mockRejectedValue(new Error('Invalid transition'));
      render(<WorkflowTransitionUI {...defaultProps} />);
      
      const executingBtn = screen.getByTestId(`transition-btn-${WorkflowStateEnum.EXECUTING}`);
      fireEvent.click(executingBtn);
      
      await waitFor(() => {
        const errorMsg = screen.getByTestId('error-message');
        expect(errorMsg).toHaveTextContent('Invalid transition');
      });
    });
  });

  describe('Critical Transitions', () => {
    it('shows confirmation dialog for CLOSING transition', () => {
      const closingProps = {
        ...defaultProps,
        currentState: WorkflowStateEnum.MONITORING,
        allowedTransitions: [WorkflowStateEnum.CLOSING],
      };
      render(<WorkflowTransitionUI {...closingProps} />);
      
      const closingBtn = screen.getByTestId(`transition-btn-${WorkflowStateEnum.CLOSING}`);
      fireEvent.click(closingBtn);
      
      const dialog = screen.getByTestId('confirmation-dialog');
      expect(dialog).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to transition/)).toBeInTheDocument();
      expect(screen.getByText(/critical state change/)).toBeInTheDocument();
    });

    it('shows confirmation dialog for CLOSED transition', () => {
      const closedProps = {
        ...defaultProps,
        currentState: WorkflowStateEnum.CLOSING,
        allowedTransitions: [WorkflowStateEnum.CLOSED],
      };
      render(<WorkflowTransitionUI {...closedProps} />);
      
      const closedBtn = screen.getByTestId(`transition-btn-${WorkflowStateEnum.CLOSED}`);
      fireEvent.click(closedBtn);
      
      const dialog = screen.getByTestId('confirmation-dialog');
      expect(dialog).toBeInTheDocument();
    });

    it('executes transition when confirmed', async () => {
      mockOnTransition.mockResolvedValue(undefined);
      const closingProps = {
        ...defaultProps,
        currentState: WorkflowStateEnum.MONITORING,
        allowedTransitions: [WorkflowStateEnum.CLOSING],
      };
      render(<WorkflowTransitionUI {...closingProps} />);
      
      const closingBtn = screen.getByTestId(`transition-btn-${WorkflowStateEnum.CLOSING}`);
      fireEvent.click(closingBtn);
      
      const confirmBtn = screen.getByTestId('confirm-btn');
      fireEvent.click(confirmBtn);
      
      await waitFor(() => {
        expect(mockOnTransition).toHaveBeenCalledWith(WorkflowStateEnum.CLOSING, undefined);
      });
    });

    it('cancels transition when canceled', () => {
      const closingProps = {
        ...defaultProps,
        currentState: WorkflowStateEnum.MONITORING,
        allowedTransitions: [WorkflowStateEnum.CLOSING],
      };
      render(<WorkflowTransitionUI {...closingProps} />);
      
      const closingBtn = screen.getByTestId(`transition-btn-${WorkflowStateEnum.CLOSING}`);
      fireEvent.click(closingBtn);
      
      const cancelBtn = screen.getByTestId('cancel-btn');
      fireEvent.click(cancelBtn);
      
      expect(screen.queryByTestId('confirmation-dialog')).not.toBeInTheDocument();
      expect(mockOnTransition).not.toHaveBeenCalled();
    });

    it('includes optional note in transition request', async () => {
      mockOnTransition.mockResolvedValue(undefined);
      const closingProps = {
        ...defaultProps,
        currentState: WorkflowStateEnum.MONITORING,
        allowedTransitions: [WorkflowStateEnum.CLOSING],
      };
      render(<WorkflowTransitionUI {...closingProps} />);
      
      const closingBtn = screen.getByTestId(`transition-btn-${WorkflowStateEnum.CLOSING}`);
      fireEvent.click(closingBtn);
      
      const noteInput = screen.getByTestId('transition-note');
      fireEvent.change(noteInput, { target: { value: 'Project complete' } });
      
      const confirmBtn = screen.getByTestId('confirm-btn');
      fireEvent.click(confirmBtn);
      
      await waitFor(() => {
        expect(mockOnTransition).toHaveBeenCalledWith(
          WorkflowStateEnum.CLOSING,
          'Project complete'
        );
      });
    });

    it('closes dialog and clears note after successful transition', async () => {
      mockOnTransition.mockResolvedValue(undefined);
      const closingProps = {
        ...defaultProps,
        currentState: WorkflowStateEnum.MONITORING,
        allowedTransitions: [WorkflowStateEnum.CLOSING],
      };
      render(<WorkflowTransitionUI {...closingProps} />);
      
      const closingBtn = screen.getByTestId(`transition-btn-${WorkflowStateEnum.CLOSING}`);
      fireEvent.click(closingBtn);
      
      const noteInput = screen.getByTestId('transition-note');
      fireEvent.change(noteInput, { target: { value: 'Test note' } });
      
      const confirmBtn = screen.getByTestId('confirm-btn');
      fireEvent.click(confirmBtn);
      
      await waitFor(() => {
        expect(screen.queryByTestId('confirmation-dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error for invalid transitions', async () => {
      mockOnTransition.mockRejectedValue(new Error('Invalid transition from planning to closed'));
      render(<WorkflowTransitionUI {...defaultProps} />);
      
      const executingBtn = screen.getByTestId(`transition-btn-${WorkflowStateEnum.EXECUTING}`);
      fireEvent.click(executingBtn);
      
      await waitFor(() => {
        const errorMsg = screen.getByTestId('error-message');
        expect(errorMsg).toHaveTextContent('Invalid transition from planning to closed');
      });
    });

    it('displays error for blocked states', async () => {
      mockOnTransition.mockRejectedValue(new Error('State is blocked'));
      render(<WorkflowTransitionUI {...defaultProps} />);
      
      const executingBtn = screen.getByTestId(`transition-btn-${WorkflowStateEnum.EXECUTING}`);
      fireEvent.click(executingBtn);
      
      await waitFor(() => {
        const errorMsg = screen.getByTestId('error-message');
        expect(errorMsg).toHaveTextContent('State is blocked');
      });
    });

    it('handles network errors gracefully', async () => {
      mockOnTransition.mockRejectedValue(new Error('Network error'));
      render(<WorkflowTransitionUI {...defaultProps} />);
      
      const executingBtn = screen.getByTestId(`transition-btn-${WorkflowStateEnum.EXECUTING}`);
      fireEvent.click(executingBtn);
      
      await waitFor(() => {
        const errorMsg = screen.getByTestId('error-message');
        expect(errorMsg).toHaveTextContent('Network error');
      });
    });

    it('handles generic errors with fallback message', async () => {
      mockOnTransition.mockRejectedValue('Something went wrong');
      render(<WorkflowTransitionUI {...defaultProps} />);
      
      const executingBtn = screen.getByTestId(`transition-btn-${WorkflowStateEnum.EXECUTING}`);
      fireEvent.click(executingBtn);
      
      await waitFor(() => {
        const errorMsg = screen.getByTestId('error-message');
        expect(errorMsg).toHaveTextContent('Failed to transition state');
      });
    });
  });

  describe('Accessibility', () => {
    it('uses proper ARIA labels on transition buttons', () => {
      render(<WorkflowTransitionUI {...defaultProps} />);
      
      const executingBtn = screen.getByTestId(`transition-btn-${WorkflowStateEnum.EXECUTING}`);
      expect(executingBtn).toHaveAttribute('aria-label', 'Transition to Executing');
    });

    it('uses proper ARIA roles on alerts', async () => {
      mockOnTransition.mockResolvedValue(undefined);
      render(<WorkflowTransitionUI {...defaultProps} />);
      
      const executingBtn = screen.getByTestId(`transition-btn-${WorkflowStateEnum.EXECUTING}`);
      fireEvent.click(executingBtn);
      
      await waitFor(() => {
        const successMsg = screen.getByTestId('success-message');
        expect(successMsg).toHaveAttribute('role', 'alert');
      });
    });

    it('uses proper dialog semantics for confirmation', () => {
      const closingProps = {
        ...defaultProps,
        currentState: WorkflowStateEnum.MONITORING,
        allowedTransitions: [WorkflowStateEnum.CLOSING],
      };
      render(<WorkflowTransitionUI {...closingProps} />);
      
      const closingBtn = screen.getByTestId(`transition-btn-${WorkflowStateEnum.CLOSING}`);
      fireEvent.click(closingBtn);
      
      const dialog = screen.getByTestId('confirmation-dialog');
      expect(dialog).toHaveAttribute('role', 'dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'dialog-title');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty allowed transitions array', () => {
      render(
        <WorkflowTransitionUI
          {...defaultProps}
          allowedTransitions={[]}
        />
      );
      
      expect(screen.getByTestId('no-transitions')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Transition to/ })).not.toBeInTheDocument();
    });

    it('handles CLOSED state with no transitions', () => {
      render(
        <WorkflowTransitionUI
          {...defaultProps}
          currentState={WorkflowStateEnum.CLOSED}
          allowedTransitions={[]}
        />
      );
      
      expect(screen.getByText(WorkflowStateEnum.CLOSED)).toBeInTheDocument();
      expect(screen.getByTestId('no-transitions')).toBeInTheDocument();
    });

    it('disables buttons during loading state', () => {
      render(<WorkflowTransitionUI {...defaultProps} isLoading={true} />);
      
      const buttons = screen.getAllByRole('button', { name: /Transition to/ });
      buttons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });
  });
});
