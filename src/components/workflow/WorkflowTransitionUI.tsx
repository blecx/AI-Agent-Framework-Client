import React, { useState, useEffect } from 'react';
import { WorkflowStateEnum } from '../../types/api';

export interface WorkflowTransitionUIProps {
  /** Current project key */
  projectKey: string;
  /** Current workflow state */
  currentState: WorkflowStateEnum;
  /** Allowed transitions from current state */
  allowedTransitions: WorkflowStateEnum[];
  /** Callback when transition is requested */
  onTransition: (newState: WorkflowStateEnum, note?: string) => Promise<void>;
  /** Optional loading state */
  isLoading?: boolean;
}

/** Critical transitions that require confirmation */
const CRITICAL_TRANSITIONS = new Set([
  WorkflowStateEnum.CLOSING,
  WorkflowStateEnum.CLOSED,
]);

export const WorkflowTransitionUI: React.FC<WorkflowTransitionUIProps> = ({
  currentState,
  allowedTransitions,
  onTransition,
  isLoading = false,
}) => {
  const [selectedTransition, setSelectedTransition] = useState<WorkflowStateEnum | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [transitionNote, setTransitionNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Clear messages after timeout
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleTransitionClick = (newState: WorkflowStateEnum) => {
    setSelectedTransition(newState);
    if (CRITICAL_TRANSITIONS.has(newState)) {
      setShowConfirmation(true);
    } else {
      executeTransition(newState);
    }
  };

  const executeTransition = async (newState: WorkflowStateEnum) => {
    setError(null);
    setSuccess(null);
    try {
      await onTransition(newState, transitionNote || undefined);
      setSuccess(`Successfully transitioned to ${newState}`);
      setShowConfirmation(false);
      setTransitionNote('');
      setSelectedTransition(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to transition state');
      setShowConfirmation(false);
    }
  };

  const confirmTransition = () => {
    if (selectedTransition) {
      executeTransition(selectedTransition);
    }
  };

  const cancelConfirmation = () => {
    setShowConfirmation(false);
    setTransitionNote('');
    setSelectedTransition(null);
  };

  const hasValidTransitions = allowedTransitions && allowedTransitions.length > 0;

  return (
    <div className="workflow-transition-ui" data-testid="workflow-transition-ui">
      {/* Current State Display */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Current Workflow State</h3>
        <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-md font-medium">
          {currentState}
        </div>
      </div>

      {/* Transition Buttons */}
      <div className="mb-4">
        <h4 className="text-md font-medium mb-2">Available Transitions</h4>
        {!hasValidTransitions ? (
          <p className="text-gray-500 italic" data-testid="no-transitions">
            No valid transitions available from current state
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {allowedTransitions.map((state) => (
              <button
                key={state}
                onClick={() => handleTransitionClick(state)}
                disabled={isLoading}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  isLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500'
                }`}
                data-testid={`transition-btn-${state}`}
                aria-label={`Transition to ${state}`}
              >
                Transition to {state}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Success Message */}
      {success && (
        <div
          className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-800"
          role="alert"
          data-testid="success-message"
        >
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div
          className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800"
          role="alert"
          data-testid="error-message"
        >
          {error}
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmation && selectedTransition && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          data-testid="confirmation-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
        >
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 id="dialog-title" className="text-lg font-bold mb-3">
              Confirm Workflow Transition
            </h3>
            <p className="mb-4 text-gray-700">
              Are you sure you want to transition from <strong>{currentState}</strong> to{' '}
              <strong>{selectedTransition}</strong>?
            </p>
            <p className="mb-4 text-sm text-gray-600">
              This is a critical state change and may affect project progress.
            </p>

            {/* Optional Note */}
            <div className="mb-4">
              <label htmlFor="transition-note" className="block text-sm font-medium mb-1">
                Reason (optional)
              </label>
              <textarea
                id="transition-note"
                value={transitionNote}
                onChange={(e) => setTransitionNote(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Enter reason for transition..."
                data-testid="transition-note"
              />
            </div>

            {/* Dialog Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelConfirmation}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
                data-testid="cancel-btn"
              >
                Cancel
              </button>
              <button
                onClick={confirmTransition}
                disabled={isLoading}
                className={`px-4 py-2 rounded-md font-medium ${
                  isLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500'
                }`}
                data-testid="confirm-btn"
              >
                {isLoading ? 'Transitioning...' : 'Confirm Transition'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
