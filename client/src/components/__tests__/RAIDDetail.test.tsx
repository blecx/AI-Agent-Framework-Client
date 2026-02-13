/**
 * RAIDDetail Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { RAIDDetail } from '../RAIDDetail';
import apiClient from '../../services/apiClient';
import type { RAIDItem, RAIDItemUpdate } from '../../types';

// Mock dependencies
vi.mock('../../services/apiClient', () => ({
  default: {
    updateRAIDItem: vi.fn(),
  },
}));

let mockShowToast: ReturnType<typeof vi.fn>;
vi.mock('../../utils/toast', () => ({
  showToast: (message: string, type?: string) => {
    mockShowToast(message, type);
  },
}));

vi.mock('../raid/RAIDBadge', () => ({
  TypeBadge: ({ value }: any) => (
    <span data-testid="type-badge">
      {value.charAt(0).toUpperCase() + value.slice(1)}
    </span>
  ),
  StatusBadge: ({ value }: any) => (
    <span data-testid="status-badge">
      {value.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
    </span>
  ),
  PriorityBadge: ({ value }: any) => (
    <span data-testid="priority-badge">
      {value.toUpperCase()}
    </span>
  ),
}));

describe('RAIDDetail', () => {
  const mockRiskItem: RAIDItem = {
    id: 'raid-1',
    type: 'risk',
    status: 'open',
    priority: 'high',
    title: 'Security Risk',
    description: 'Potential security vulnerability',
    owner: 'john@example.com',
    created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-02-01T10:00:00Z',
    created_by: 'admin',
    updated_by: 'admin',
    impact: 'high',
    likelihood: 'likely',
    target_resolution_date: '2026-03-01',
    mitigation_plan: 'Apply security patches and review code',
    next_actions: ['Review code', 'Apply patch'],
    linked_decisions: [],
    linked_change_requests: [],
  };

  const mockAssumptionItem: RAIDItem = {
    id: 'raid-2',
    type: 'assumption',
    status: 'open',
    priority: 'medium',
    title: 'Resource Assumption',
    description: 'Assuming team availability',
    owner: 'jane@example.com',
    created_at: '2026-01-28T10:00:00Z',
    updated_at: '2026-01-28T10:00:00Z',
    created_by: 'admin',
    updated_by: 'admin',
    target_resolution_date: '2026-02-15',
    impact: null,
    likelihood: null,
    mitigation_plan: '',
    next_actions: [],
    linked_decisions: [],
    linked_change_requests: [],
  };

  const renderWithProviders = (component: React.ReactElement) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          {component}
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockShowToast = vi.fn();
  });

  // =========================================================================
  // View Mode Tests
  // =========================================================================

  describe('View Mode', () => {
    it('should render modal overlay', () => {
      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockRiskItem}

          onClose={vi.fn()}
        />
      );

      expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
    });

    it('should render item title', () => {
      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockRiskItem}

          onClose={vi.fn()}
        />
      );

      expect(screen.getByText('Security Risk')).toBeInTheDocument();
    });

    it('should render type badge', () => {
      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockRiskItem}

          onClose={vi.fn()}
        />
      );

      const typeBadges = screen.getAllByTestId('type-badge');
      expect(typeBadges.length).toBeGreaterThan(0);
      expect(screen.getByText('Risk')).toBeInTheDocument();
    });

    it('should render status badge', () => {
      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockRiskItem}

          onClose={vi.fn()}
        />
      );

      const statusBadges = screen.getAllByTestId('status-badge');
      expect(statusBadges.length).toBeGreaterThan(0);
      expect(screen.getByText('Open')).toBeInTheDocument();
    });

    it('should render priority badge', () => {
      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockRiskItem}

          onClose={vi.fn()}
        />
      );

      const priorityBadges = screen.getAllByTestId('priority-badge');
      expect(priorityBadges.length).toBeGreaterThan(0);
      expect(screen.getByText('HIGH')).toBeInTheDocument();
    });

    it('should display description', () => {
      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockRiskItem}

          onClose={vi.fn()}
        />
      );

      expect(screen.getByText('Potential security vulnerability')).toBeInTheDocument();
    });

    it('should display owner information', () => {
      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockRiskItem}

          onClose={vi.fn()}
        />
      );

      expect(screen.getByText(/Owner:/)).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    it('should display target resolution date', () => {
      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockRiskItem}

          onClose={vi.fn()}
        />
      );

      expect(screen.getByText(/Target Resolution:/)).toBeInTheDocument();
      expect(screen.getByText(/Mar 1, 2026/)).toBeInTheDocument();
    });

    it('should display created date', () => {
      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockRiskItem}

          onClose={vi.fn()}
        />
      );

      expect(screen.getByText(/Created:/)).toBeInTheDocument();
    });

    it('should display updated date', () => {
      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockRiskItem}

          onClose={vi.fn()}
        />
      );

      expect(screen.getByText(/Updated:/)).toBeInTheDocument();
    });

    it('should display impact for RISK items', () => {
      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockRiskItem}

          onClose={vi.fn()}
        />
      );

      expect(screen.getByText(/Impact:/)).toBeInTheDocument();
      expect(screen.getByText('high')).toBeInTheDocument();
    });

    it('should display likelihood for RISK items', () => {
      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockRiskItem}

          onClose={vi.fn()}
        />
      );

      expect(screen.getByText(/Likelihood:/)).toBeInTheDocument();
      expect(screen.getByText('likely')).toBeInTheDocument();
    });

    it('should not display impact/likelihood for non-RISK items', () => {
      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockAssumptionItem}

          onClose={vi.fn()}
        />
      );

      expect(screen.queryByText(/Impact:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Likelihood:/)).not.toBeInTheDocument();
    });

    it('should display next actions list', () => {
      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockRiskItem}

          onClose={vi.fn()}
        />
      );

      expect(screen.getByText('Next Actions:')).toBeInTheDocument();
      expect(screen.getByText('Review code')).toBeInTheDocument();
      expect(screen.getByText('Apply patch')).toBeInTheDocument();
    });

    it('should display "None" when no next actions', () => {
      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockAssumptionItem}

          onClose={vi.fn()}
        />
      );

      expect(screen.getByText('Next Actions:')).toBeInTheDocument();
      expect(screen.getByText('None')).toBeInTheDocument();
    });

    it.skip('should not render when isOpen is false', () => {
      // Note: Component no longer has isOpen prop - always renders when mounted
      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockRiskItem}

          onClose={vi.fn()}
        />
      );

      expect(screen.queryByTestId('modal-overlay')).not.toBeInTheDocument();
    });
  });

  // =========================================================================
  // Edit Mode Activation Tests
  // =========================================================================

  describe('Edit Mode Activation', () => {
    it('should display Edit button in view mode', () => {
      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockRiskItem}

          onClose={vi.fn()}
        />
      );

      expect(screen.getByLabelText('Edit item')).toBeInTheDocument();
    });

    it('should enter edit mode when Edit button clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockRiskItem}

          onClose={vi.fn()}
        />
      );

      const editButton = screen.getByLabelText('Edit item');
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Title')).toBeInTheDocument();
        expect(screen.getByLabelText('Description')).toBeInTheDocument();
      });
    });

    it('should display form fields in edit mode', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockRiskItem}

          onClose={vi.fn()}
        />
      );

      const editButton = screen.getByLabelText('Edit item');
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Title')).toBeInTheDocument();
        expect(screen.getByLabelText('Description')).toBeInTheDocument();
        expect(screen.getByLabelText('Status')).toBeInTheDocument();
        expect(screen.getByLabelText('Priority')).toBeInTheDocument();
        expect(screen.getByLabelText('Owner')).toBeInTheDocument();
        expect(screen.getByLabelText('Target Resolution Date')).toBeInTheDocument();
      });
    });

    it('should display impact/likelihood fields for RISK items in edit mode', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockRiskItem}

          onClose={vi.fn()}
        />
      );

      const editButton = screen.getByLabelText('Edit item');
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Impact')).toBeInTheDocument();
        expect(screen.getByLabelText('Likelihood')).toBeInTheDocument();
      });
    });

    it('should not display impact/likelihood fields for non-RISK items in edit mode', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockAssumptionItem}

          onClose={vi.fn()}
        />
      );

      const editButton = screen.getByLabelText('Edit item');
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.queryByLabelText('Impact')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Likelihood')).not.toBeInTheDocument();
      });
    });

    it('should populate form fields with current values', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockRiskItem}

          onClose={vi.fn()}
        />
      );

      const editButton = screen.getByLabelText('Edit item');
      await user.click(editButton);

      await waitFor(() => {
        const titleInput = screen.getByLabelText('Title') as HTMLInputElement;
        expect(titleInput.value).toBe('Security Risk');

        const descInput = screen.getByLabelText('Description') as HTMLTextAreaElement;
        expect(descInput.value).toBe('Potential security vulnerability');

        const ownerInput = screen.getByLabelText('Owner') as HTMLInputElement;
        expect(ownerInput.value).toBe('john@example.com');
      });
    });
  });

  // =========================================================================
  // Form Field Interaction Tests
  // =========================================================================

  describe('Form Field Interactions', () => {
    it('should allow editing title field', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockRiskItem}

          onClose={vi.fn()}
        />
      );

      const editButton = screen.getByLabelText('Edit item');
      await user.click(editButton);

      await waitFor(() => {
        const titleInput = screen.getByLabelText('Title') as HTMLInputElement;
        expect(titleInput).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText('Title') as HTMLInputElement;
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Security Risk');

      expect(titleInput.value).toBe('Updated Security Risk');
    });

    it('should allow editing description field', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockRiskItem}

          onClose={vi.fn()}
        />
      );

      const editButton = screen.getByLabelText('Edit item');
      await user.click(editButton);

      await waitFor(() => {
        const descInput = screen.getByLabelText('Description') as HTMLTextAreaElement;
        expect(descInput).toBeInTheDocument();
      });

      const descInput = screen.getByLabelText('Description') as HTMLTextAreaElement;
      await user.clear(descInput);
      await user.type(descInput, 'Updated description');

      expect(descInput.value).toBe('Updated description');
    });

    it('should allow changing status via dropdown', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockRiskItem}

          onClose={vi.fn()}
        />
      );

      const editButton = screen.getByLabelText('Edit item');
      await user.click(editButton);

      await waitFor(() => {
        const statusSelect = screen.getByLabelText('Status') as HTMLSelectElement;
        expect(statusSelect).toBeInTheDocument();
      });

      const statusSelect = screen.getByLabelText('Status') as HTMLSelectElement;
      await user.selectOptions(statusSelect, 'mitigated');

      expect(statusSelect.value).toBe('mitigated');
    });

    it('should allow changing priority via dropdown', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockRiskItem}

          onClose={vi.fn()}
        />
      );

      const editButton = screen.getByLabelText('Edit item');
      await user.click(editButton);

      await waitFor(() => {
        const prioritySelect = screen.getByLabelText('Priority') as HTMLSelectElement;
        expect(prioritySelect).toBeInTheDocument();
      });

      const prioritySelect = screen.getByLabelText('Priority') as HTMLSelectElement;
      await user.selectOptions(prioritySelect, 'medium');

      expect(prioritySelect.value).toBe('medium');
    });

    it('should allow editing owner field', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockRiskItem}

          onClose={vi.fn()}
        />
      );

      const editButton = screen.getByLabelText('Edit item');
      await user.click(editButton);

      await waitFor(() => {
        const ownerInput = screen.getByLabelText('Owner') as HTMLInputElement;
        expect(ownerInput).toBeInTheDocument();
      });

      const ownerInput = screen.getByLabelText('Owner') as HTMLInputElement;
      await user.clear(ownerInput);
      await user.type(ownerInput, 'jane@example.com');

      expect(ownerInput.value).toBe('jane@example.com');
    });

    it('should allow editing target resolution date', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockRiskItem}

          onClose={vi.fn()}
        />
      );

      const editButton = screen.getByLabelText('Edit item');
      await user.click(editButton);

      await waitFor(() => {
        const dateInput = screen.getByLabelText('Target Resolution Date') as HTMLInputElement;
        expect(dateInput).toBeInTheDocument();
      });

      const dateInput = screen.getByLabelText('Target Resolution Date') as HTMLInputElement;
      await user.clear(dateInput);
      await user.type(dateInput, '2026-04-01');

      expect(dateInput.value).toBe('2026-04-01');
    });

    it('should allow changing impact for RISK items', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockRiskItem}

          onClose={vi.fn()}
        />
      );

      const editButton = screen.getByLabelText('Edit item');
      await user.click(editButton);

      await waitFor(() => {
        const impactSelect = screen.getByLabelText('Impact') as HTMLSelectElement;
        expect(impactSelect).toBeInTheDocument();
      });

      const impactSelect = screen.getByLabelText('Impact') as HTMLSelectElement;
      await user.selectOptions(impactSelect, 'high');

      expect(impactSelect.value).toBe('high');
    });

    it('should allow changing likelihood for RISK items', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockRiskItem}

          onClose={vi.fn()}
        />
      );

      const editButton = screen.getByLabelText('Edit item');
      await user.click(editButton);

      await waitFor(() => {
        const likelihoodSelect = screen.getByLabelText('Likelihood') as HTMLSelectElement;
        expect(likelihoodSelect).toBeInTheDocument();
      });

      const likelihoodSelect = screen.getByLabelText('Likelihood') as HTMLSelectElement;
      await user.selectOptions(likelihoodSelect, 'likely');

      expect(likelihoodSelect.value).toBe('likely');
    });
  });

  // =========================================================================
  // Next Actions Management Tests
  // =========================================================================

  describe('Next Actions Management', () => {
    it('should display next actions array in edit mode', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockRiskItem}

          onClose={vi.fn()}
        />
      );

      const editButton = screen.getByLabelText('Edit item');
      await user.click(editButton);

      await waitFor(() => {
        const inputs = screen.getAllByPlaceholderText(/Action \d+/);
        expect(inputs).toHaveLength(2);
        expect(inputs[0]).toHaveValue('Review code');
        expect(inputs[1]).toHaveValue('Apply patch');
      });
    });

    it('should allow adding new next action', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockAssumptionItem}

          onClose={vi.fn()}
        />
      );

      const editButton = screen.getByLabelText('Edit item');
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Add action')).toBeInTheDocument();
      });

      const initialInputs = screen.getAllByPlaceholderText(/Action \d+/);
      const initialCount = initialInputs.length;

      const addButton = screen.getByLabelText('Add action');
      await user.click(addButton);

      await waitFor(() => {
        const newInputs = screen.getAllByPlaceholderText(/Action \d+/);
        expect(newInputs).toHaveLength(initialCount + 1);
      });
    });

    it('should allow editing next action fields', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockRiskItem}

          onClose={vi.fn()}
        />
      );

      const editButton = screen.getByLabelText('Edit item');
      await user.click(editButton);

      await waitFor(() => {
        const actionInputs = screen.getAllByPlaceholderText('Action description');
        expect(actionInputs.length).toBe(2);
      });

      const actionInput = screen.getAllByPlaceholderText('Action description')[0];
      await user.clear(actionInput);
      await user.type(actionInput, 'Updated action');

      expect(actionInput).toHaveValue('Updated action');
    });

    it('should allow removing next action', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockRiskItem}

          onClose={vi.fn()}
        />
      );

      const editButton = screen.getByLabelText('Edit item');
      await user.click(editButton);

      await waitFor(() => {
        const removeButtons = screen.getAllByLabelText('Remove action');
        expect(removeButtons.length).toBe(2);
      });

      const removeButton = screen.getAllByLabelText('Remove action')[0];
      await user.click(removeButton);

      await waitFor(() => {
        const remainingButtons = screen.getAllByLabelText('Remove action');
        expect(remainingButtons.length).toBe(1);
      });
    });
  });

  // =========================================================================
  // Save Action Tests
  // =========================================================================

  describe('Save Action', () => {
    it('should display Save button in edit mode', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockRiskItem}

          onClose={vi.fn()}
        />
      );

      const editButton = screen.getByLabelText('Edit item');
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Save changes')).toBeInTheDocument();
      });
    });

    it('should call updateRAIDItem when Save clicked', async () => {
      const user = userEvent.setup();
      (apiClient.updateRAIDItem as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: { ...mockRiskItem, title: 'Updated Title' },
      });

      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockRiskItem}

          onClose={vi.fn()}
        />
      );

      const editButton = screen.getByLabelText('Edit item');
      await user.click(editButton);

      await waitFor(() => {
        const titleInput = screen.getByLabelText('Title');
        expect(titleInput).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText('Title') as HTMLInputElement;
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Title');

      const saveButton = screen.getByLabelText('Save changes');
      await user.click(saveButton);

      await waitFor(() => {
        expect(apiClient.updateRAIDItem).toHaveBeenCalledWith(
          'TEST-123',
          'raid-1',
          expect.objectContaining({
            title: 'Updated Title',
          })
        );
      });
    });

    it('should only send modified fields', async () => {
      const user = userEvent.setup();
      (apiClient.updateRAIDItem as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: { ...mockRiskItem, title: 'Updated Title' },
      });

      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockRiskItem}

          onClose={vi.fn()}
        />
      );

      const editButton = screen.getByLabelText('Edit item');
      await user.click(editButton);

      await waitFor(() => {
        const titleInput = screen.getByLabelText('Title');
        expect(titleInput).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText('Title') as HTMLInputElement;
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Title');

      const saveButton = screen.getByLabelText('Save changes');
      await user.click(saveButton);

      await waitFor(() => {
        const updateCall = (apiClient.updateRAIDItem as ReturnType<typeof vi.fn>).mock.calls[0];
        const updateData = updateCall[2] as RAIDItemUpdate;

        // Should only include changed field
        expect(updateData).toHaveProperty('title');
        // Should not include unchanged fields like description
        expect(updateData).not.toHaveProperty('description');
      });
    });

    it('should show info toast when no changes made', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockRiskItem}

          onClose={vi.fn()}
        />
      );

      const editButton = screen.getByLabelText('Edit item');
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Save changes')).toBeInTheDocument();
      });

      const saveButton = screen.getByLabelText('Save changes');
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          expect.stringContaining('No changes'),
          'info'
        );
      });
    });

    it('should show loading state while saving', async () => {
      const user = userEvent.setup();
      (apiClient.updateRAIDItem as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockRiskItem}

          onClose={vi.fn()}
        />
      );

      const editButton = screen.getByLabelText('Edit item');
      await user.click(editButton);

      await waitFor(() => {
        const titleInput = screen.getByLabelText('Title');
        expect(titleInput).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText('Title') as HTMLInputElement;
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Title');

      const saveButton = screen.getByLabelText('Save changes');
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Saving...')).toBeInTheDocument();
      });
    });

    it('should disable Save button while saving', async () => {
      const user = userEvent.setup();
      (apiClient.updateRAIDItem as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockRiskItem}

          onClose={vi.fn()}
        />
      );

      const editButton = screen.getByLabelText('Edit item');
      await user.click(editButton);

      await waitFor(() => {
        const titleInput = screen.getByLabelText('Title');
        expect(titleInput).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText('Title') as HTMLInputElement;
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Title');

      const saveButton = screen.getByLabelText('Save changes');
      await user.click(saveButton);

      await waitFor(() => {
        expect(saveButton).toBeDisabled();
      });
    });

    it('should handle save error', async () => {
      const user = userEvent.setup();
      (apiClient.updateRAIDItem as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: false,
        error: 'Validation error',
      });

      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockRiskItem}

          onClose={vi.fn()}
        />
      );

      const editButton = screen.getByLabelText('Edit item');
      await user.click(editButton);

      await waitFor(() => {
        const titleInput = screen.getByLabelText('Title');
        expect(titleInput).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText('Title') as HTMLInputElement;
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Title');

      const saveButton = screen.getByLabelText('Save changes');
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          expect.stringContaining('Validation error'),
          'error'
        );
      });
    });

    it('should exit edit mode after successful save', async () => {
      const user = userEvent.setup();
      (apiClient.updateRAIDItem as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: { ...mockRiskItem, title: 'Updated Title' },
      });

      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockRiskItem}

          onClose={vi.fn()}
        />
      );

      const editButton = screen.getByLabelText('Edit item');
      await user.click(editButton);

      await waitFor(() => {
        const titleInput = screen.getByLabelText('Title');
        expect(titleInput).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText('Title') as HTMLInputElement;
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Title');

      const saveButton = screen.getByLabelText('Save changes');
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.queryByLabelText('Title')).not.toBeInTheDocument();
        expect(screen.getByLabelText('Edit item')).toBeInTheDocument();
      });
    });
  });

  // =========================================================================
  // Cancel Action Tests
  // =========================================================================

  describe('Cancel Action', () => {
    it('should display Cancel button in edit mode', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockRiskItem}

          onClose={vi.fn()}
        />
      );

      const editButton = screen.getByLabelText('Edit item');
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Cancel editing')).toBeInTheDocument();
      });
    });

    it('should revert changes when Cancel clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockRiskItem}

          onClose={vi.fn()}
        />
      );

      const editButton = screen.getByLabelText('Edit item');
      await user.click(editButton);

      await waitFor(() => {
        const titleInput = screen.getByLabelText('Title');
        expect(titleInput).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText('Title') as HTMLInputElement;
      await user.clear(titleInput);
      await user.type(titleInput, 'Modified Title');

      const cancelButton = screen.getByLabelText('Cancel editing');
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByLabelText('Title')).not.toBeInTheDocument();
        expect(screen.getByText('Security Risk')).toBeInTheDocument();
      });
    });

    it('should exit edit mode when Cancel clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockRiskItem}

          onClose={vi.fn()}
        />
      );

      const editButton = screen.getByLabelText('Edit item');
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Cancel editing')).toBeInTheDocument();
      });

      const cancelButton = screen.getByLabelText('Cancel editing');
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByLabelText('Title')).not.toBeInTheDocument();
        expect(screen.getByLabelText('Edit item')).toBeInTheDocument();
      });
    });
  });

  // =========================================================================
  // Close Modal Tests
  // =========================================================================

  describe('Close Modal', () => {
    it('should call onClose when close button clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockRiskItem}

          onClose={onClose}
        />
      );

      const closeButton = screen.getByLabelText('Close');
      await user.click(closeButton);

      expect(onClose).toHaveBeenCalled();
    });

    it('should call onClose when clicking overlay', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockRiskItem}

          onClose={onClose}
        />
      );

      const overlay = screen.getByTestId('modal-overlay');
      await user.click(overlay);

      expect(onClose).toHaveBeenCalled();
    });

    it('should not close when clicking modal content', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      renderWithProviders(
        <RAIDDetail
          projectKey="TEST-123"
          item={mockRiskItem}

          onClose={onClose}
        />
      );

      const modalContent = screen.getByTestId('modal-content');
      await user.click(modalContent);

      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
