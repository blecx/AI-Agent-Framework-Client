import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import WorkflowStatePanel from '../../../components/WorkflowStatePanel';

const tMock = (key: string, options?: Record<string, string | number>) => {
  const map: Record<string, string> = {
    'wf.title': 'Workflow State',
    'wf.loading': 'Loading workflow state...',
    'wf.currentState': 'Current state',
    'wf.updatedAt': 'Updated',
    'wf.updatedBy': 'Updated by',
    'wf.allowedTransitions': 'Allowed transitions',
    'wf.noTransitions': 'No transitions available from this state',
    'wf.transitioning': 'Transitioning...',
    'wf.states.initiating': 'Initiating',
    'wf.states.planning': 'Planning',
    'wf.states.executing': 'Executing',
    'wf.states.monitoring': 'Monitoring',
    'wf.states.closing': 'Closing',
    'wf.states.closed': 'Closed',
    'wf.errors.missingProjectKey': 'Project key is required',
    'wf.errors.loadFailed': 'Error loading workflow state',
    'wf.errors.transitionFailed': 'Error transitioning workflow state',
  };

  if (key === 'wf.actions.transitionTo') {
    return `Transition to ${options?.state}`;
  }

  return map[key] ?? key;
};

const { mockApiClient } = vi.hoisted(() => ({
  mockApiClient: {
    getWorkflowState: vi.fn(),
    getAllowedTransitions: vi.fn(),
    transitionWorkflowState: vi.fn(),
  },
}));

vi.mock('../../../services/apiClient', () => ({
  default: mockApiClient,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: tMock,
  }),
}));

describe('WorkflowStatePanel', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('loads and renders persisted workflow state with backend transitions', async () => {
    mockApiClient.getWorkflowState.mockResolvedValue({
      success: true,
      data: {
        current_state: 'planning',
        previous_state: 'initiating',
        transition_history: [],
        updated_at: '2026-02-16T10:00:00Z',
        updated_by: 'tester',
      },
    });
    mockApiClient.getAllowedTransitions.mockResolvedValue({
      success: true,
      data: {
        current_state: 'planning',
        allowed_transitions: ['executing', 'initiating'],
      },
    });

    render(<WorkflowStatePanel projectKey="TEST-123" />);

    expect(screen.getByText('Loading workflow state...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Planning')).toBeInTheDocument();
    });

    expect(screen.getByText('Updated by: tester')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Transition to Executing' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Transition to Initiating' })).toBeInTheDocument();
  });

  it('transitions workflow state and refreshes persisted state', async () => {
    mockApiClient.getWorkflowState.mockResolvedValue({
      success: true,
      data: {
        current_state: 'executing',
        previous_state: 'planning',
        transition_history: [],
        updated_at: '2026-02-16T10:05:00Z',
        updated_by: 'tester',
      },
    });
    mockApiClient.getWorkflowState
      .mockResolvedValueOnce({
        success: true,
        data: {
          current_state: 'planning',
          previous_state: 'initiating',
          transition_history: [],
          updated_at: '2026-02-16T10:00:00Z',
          updated_by: 'tester',
        },
      });

    mockApiClient.getAllowedTransitions.mockResolvedValue({
      success: true,
      data: {
        current_state: 'executing',
        allowed_transitions: ['monitoring'],
      },
    });

    mockApiClient.getAllowedTransitions.mockResolvedValueOnce({
      success: true,
      data: {
        current_state: 'planning',
        allowed_transitions: ['executing'],
      },
    });

    mockApiClient.transitionWorkflowState.mockResolvedValue({ success: true, data: {} });

    render(<WorkflowStatePanel projectKey="TEST-123" />);

    const transitionButton = await screen.findByRole('button', {
      name: 'Transition to Executing',
    });

    expect(transitionButton).not.toBeDisabled();
    fireEvent.click(transitionButton);

    await waitFor(() => {
      expect(mockApiClient.transitionWorkflowState).toHaveBeenCalledTimes(1);
    });

    expect(mockApiClient.transitionWorkflowState).toHaveBeenCalledWith('TEST-123', {
      to_state: 'executing',
    });

    await waitFor(() => {
      expect(screen.getByText('Executing')).toBeInTheDocument();
    });
  });

  it('surfaces load errors from backend calls', async () => {
    mockApiClient.getWorkflowState.mockResolvedValue({
      success: false,
      error: 'Failed to fetch workflow state',
    });
    mockApiClient.getAllowedTransitions.mockResolvedValue({
      success: true,
      data: {
        current_state: 'planning',
        allowed_transitions: ['executing'],
      },
    });

    render(<WorkflowStatePanel projectKey="TEST-123" />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to fetch workflow state');
    });
  });

  it('surfaces transition errors clearly', async () => {
    mockApiClient.getWorkflowState.mockResolvedValue({
      success: true,
      data: {
        current_state: 'planning',
        previous_state: 'initiating',
        transition_history: [],
        updated_at: '2026-02-16T10:00:00Z',
        updated_by: 'tester',
      },
    });
    mockApiClient.getAllowedTransitions.mockResolvedValue({
      success: true,
      data: {
        current_state: 'planning',
        allowed_transitions: ['executing'],
      },
    });
    mockApiClient.transitionWorkflowState.mockResolvedValue({
      success: false,
      error: 'Invalid transition',
    });

    render(<WorkflowStatePanel projectKey="TEST-123" />);

    const transitionButton = await screen.findByRole('button', {
      name: 'Transition to Executing',
    });
    fireEvent.click(transitionButton);

    await waitFor(() => {
      expect(mockApiClient.transitionWorkflowState).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid transition');
    });
  });
});
