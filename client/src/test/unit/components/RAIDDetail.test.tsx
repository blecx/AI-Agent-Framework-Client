import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RAIDDetail } from '../../../components/RAIDDetail';
import type { RAIDItem } from '../../../types/raid';
import {
  RAIDType,
  RAIDStatus,
  RAIDPriority,
} from '../../../types/raid';
import { apiClient } from '../../../services/apiClient';
import * as toastUtils from '../../../utils/toast';

// Mock dependencies
vi.mock('../../../services/apiClient');
vi.mock('../../../utils/toast');

const mockItem: RAIDItem = {
  id: 'RAID-001',
  type: RAIDType.RISK,
  title: 'Test Risk',
  description: 'Test risk description',
  status: RAIDStatus.OPEN,
  owner: 'test-user',
  priority: RAIDPriority.HIGH,
  impact: 'high',
  likelihood: 'likely',
  mitigation_plan: 'Test mitigation plan',
  next_actions: ['Action 1', 'Action 2'],
  linked_decisions: [],
  linked_change_requests: [],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  created_by: 'creator-user',
  updated_by: 'updater-user',
  target_resolution_date: '2024-12-31',
};

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe('RAIDDetail', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display RAID item details in view mode', () => {
    renderWithQuery(
      <RAIDDetail
        item={mockItem}
        projectKey="TEST-001"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('RAID-001')).toBeInTheDocument();
    expect(screen.getByText('Test Risk')).toBeInTheDocument();
    expect(screen.getByText('Test risk description')).toBeInTheDocument();
    expect(screen.getByText('test-user')).toBeInTheDocument();
    expect(screen.getByText('Test mitigation plan')).toBeInTheDocument();
    expect(screen.getByText('Action 1')).toBeInTheDocument();
    expect(screen.getByText('Action 2')).toBeInTheDocument();
  });

  it('should display type badge', () => {
    renderWithQuery(
      <RAIDDetail
        item={mockItem}
        projectKey="TEST-001"
        onClose={mockOnClose}
      />
    );

    const badge = screen.getByText('Risk');
    expect(badge).toHaveClass('raid-badge', 'raid-badge-type', 'raid-badge-type-risk');
  });

  it('should display status and priority badges', () => {
    renderWithQuery(
      <RAIDDetail
        item={mockItem}
        projectKey="TEST-001"
        onClose={mockOnClose}
      />
    );

    const statusBadge = screen.getByText('Open');
    expect(statusBadge).toHaveClass('raid-badge', 'raid-badge-status', 'raid-badge-status-open');

    const priorityBadge = screen.getByText('HIGH');
    expect(priorityBadge).toHaveClass('raid-badge', 'raid-badge-priority', 'raid-badge-priority-high');
  });

  it('should format dates correctly', () => {
    renderWithQuery(
      <RAIDDetail
        item={mockItem}
        projectKey="TEST-001"
        onClose={mockOnClose}
      />
    );

    // There are 2 instances of "Jan 1, 2024" (created and updated)
    const jan1Dates = screen.getAllByText('Jan 1, 2024');
    expect(jan1Dates.length).toBeGreaterThan(0);

    expect(screen.getByText('Dec 31, 2024')).toBeInTheDocument();
  });

  it('should show Edit button in view mode', () => {
    renderWithQuery(
      <RAIDDetail
        item={mockItem}
        projectKey="TEST-001"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByRole('button', { name: /^edit$/i })).toBeInTheDocument();
    const closeButtons = screen.getAllByRole('button', {
      name: /close/i,
    });
    expect(closeButtons.length).toBeGreaterThan(0);
  });

  it('should switch to edit mode when Edit button clicked', async () => {
    const user = userEvent.setup();
    renderWithQuery(
      <RAIDDetail
        item={mockItem}
        projectKey="TEST-001"
        onClose={mockOnClose}
      />
    );

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    // Form inputs should appear
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/owner/i)).toBeInTheDocument();

    // Buttons should change
    expect(
      screen.getByRole('button', { name: /save changes/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /cancel/i })
    ).toBeInTheDocument();
  });

  it('should populate form fields with item data in edit mode', async () => {
    const user = userEvent.setup();
    renderWithQuery(
      <RAIDDetail
        item={mockItem}
        projectKey="TEST-001"
        onClose={mockOnClose}
      />
    );

    await user.click(screen.getByRole('button', { name: /edit/i }));

    const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
    const descriptionInput = screen.getByLabelText(
      /description/i
    ) as HTMLTextAreaElement;

    expect(titleInput.value).toBe('Test Risk');
    expect(descriptionInput.value).toBe('Test risk description');
  });

  it('should cancel edit mode and reset form data', async () => {
    const user = userEvent.setup();
    renderWithQuery(
      <RAIDDetail
        item={mockItem}
        projectKey="TEST-001"
        onClose={mockOnClose}
      />
    );

    await user.click(screen.getByRole('button', { name: /edit/i }));

    const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
    await user.clear(titleInput);
    await user.type(titleInput, 'Modified Title');

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    // Should return to view mode
    expect(screen.getByText('Test Risk')).toBeInTheDocument();
    expect(screen.queryByLabelText(/title/i)).not.toBeInTheDocument();
  });

  it('should call API and show success toast on save', async () => {
    const user = userEvent.setup();
    const mockUpdateResponse = {
      success: true,
      data: { ...mockItem, title: 'Updated Title' },
    };

    vi.spyOn(apiClient, 'updateRAIDItem').mockResolvedValue(
      mockUpdateResponse
    );
    const showToastSpy = vi.spyOn(toastUtils, 'showToast');

    renderWithQuery(
      <RAIDDetail
        item={mockItem}
        projectKey="TEST-001"
        onClose={mockOnClose}
      />
    );

    await user.click(screen.getByRole('button', { name: /edit/i }));

    const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Title');

    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(apiClient.updateRAIDItem).toHaveBeenCalledWith(
        'TEST-001',
        'RAID-001',
        expect.objectContaining({
          title: 'Updated Title',
        })
      );
    });

    await waitFor(() => {
      expect(showToastSpy).toHaveBeenCalledWith(
        'RAID item updated successfully',
        'success'
      );
    });
  });

  it('should show error toast when API call fails', async () => {
    const user = userEvent.setup();
    vi.spyOn(apiClient, 'updateRAIDItem').mockResolvedValue({
      success: false,
      error: 'Update failed',
    });
    const showToastSpy = vi.spyOn(toastUtils, 'showToast');

    renderWithQuery(
      <RAIDDetail
        item={mockItem}
        projectKey="TEST-001"
        onClose={mockOnClose}
      />
    );

    await user.click(screen.getByRole('button', { name: /edit/i }));

    const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
    await user.clear(titleInput);
    await user.type(titleInput, 'New Title');

    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(showToastSpy).toHaveBeenCalledWith('Update failed', 'error');
    });
  });

  it('should not call API if no changes made', async () => {
    const user = userEvent.setup();
    const updateSpy = vi.spyOn(apiClient, 'updateRAIDItem');
    const showToastSpy = vi.spyOn(toastUtils, 'showToast');

    renderWithQuery(
      <RAIDDetail
        item={mockItem}
        projectKey="TEST-001"
        onClose={mockOnClose}
      />
    );

    await user.click(screen.getByRole('button', { name: /edit/i }));
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(updateSpy).not.toHaveBeenCalled();
    expect(showToastSpy).toHaveBeenCalledWith('No changes to save', 'info');
  });

  it('should add and remove next actions', async () => {
    const user = userEvent.setup();
    renderWithQuery(
      <RAIDDetail
        item={mockItem}
        projectKey="TEST-001"
        onClose={mockOnClose}
      />
    );

    await user.click(screen.getByRole('button', { name: /edit/i }));

    // Add new action
    const addButton = screen.getByRole('button', { name: /add action/i });
    await user.click(addButton);

    const actionInputs = screen.getAllByPlaceholderText(/action \d+/i);
    expect(actionInputs).toHaveLength(3); // 2 existing + 1 new

    // Remove an action
    const removeButtons = screen.getAllByLabelText(/remove action/i);
    await user.click(removeButtons[0]);

    const updatedInputs = screen.getAllByPlaceholderText(/action \d+/i);
    expect(updatedInputs).toHaveLength(2);
  });

  it('should close modal when close button clicked', async () => {
    const user = userEvent.setup();
    renderWithQuery(
      <RAIDDetail
        item={mockItem}
        projectKey="TEST-001"
        onClose={mockOnClose}
      />
    );

    // Find the × close button by its aria-label
    const xButton = screen.getByLabelText('Close');
    await user.click(xButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should close modal when overlay clicked', async () => {
    const user = userEvent.setup();
    const { container } = renderWithQuery(
      <RAIDDetail
        item={mockItem}
        projectKey="TEST-001"
        onClose={mockOnClose}
      />
    );

    const overlay = container.querySelector('.raid-detail-overlay');
    if (overlay) {
      await user.click(overlay);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it('should show impact and likelihood fields for risk items', async () => {
    const user = userEvent.setup();
    renderWithQuery(
      <RAIDDetail
        item={mockItem}
        projectKey="TEST-001"
        onClose={mockOnClose}
      />
    );

    await user.click(screen.getByRole('button', { name: /edit/i }));

    expect(screen.getByLabelText(/impact/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/likelihood/i)).toBeInTheDocument();
  });

  it('should not show impact and likelihood fields for non-risk items', async () => {
    const user = userEvent.setup();
    const issueItem = { ...mockItem, type: RAIDType.ISSUE, impact: null, likelihood: null };

    renderWithQuery(
      <RAIDDetail
        item={issueItem}
        projectKey="TEST-001"
        onClose={mockOnClose}
      />
    );

    await user.click(screen.getByRole('button', { name: /edit/i }));

    expect(screen.queryByLabelText(/^impact$/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^likelihood$/i)).not.toBeInTheDocument();
  });

  it('should disable save button while saving', async () => {
    const user = userEvent.setup();
    vi.spyOn(apiClient, 'updateRAIDItem').mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ success: true, data: mockItem }), 100)
        )
    );

    renderWithQuery(
      <RAIDDetail
        item={mockItem}
        projectKey="TEST-001"
        onClose={mockOnClose}
      />
    );

    await user.click(screen.getByRole('button', { name: /edit/i }));

    const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
    await user.clear(titleInput);
    await user.type(titleInput, 'New Title');

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    expect(saveButton).toBeDisabled();
    expect(screen.getByText(/saving.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(saveButton).not.toBeDisabled();
    });
  });
});
