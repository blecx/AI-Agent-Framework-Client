import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RAIDCreateModal } from '../../../components/raid/RAIDCreateModal';
import { apiClient } from '../../../services/apiClient';
import { showToast } from '../../../utils/toast';
import { RAIDType, RAIDStatus, RAIDPriority } from '../../../types/raid';

// Note: RAIDCreateModal refactored to use sub-components (TypeSection, DetailsSection, MetadataSection, DatesSection).
// These tests remain valid as they test the public API of RAIDCreateModal, not implementation details.

vi.mock('../../../services/apiClient');
vi.mock('../../../utils/toast');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('RAIDCreateModal', () => {
  const mockOnClose = vi.fn();
  const mockCreateRAIDItem = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    apiClient.createRAIDItem = mockCreateRAIDItem;
  });

  it('should render modal with all form fields', () => {
    render(<RAIDCreateModal projectKey="TEST-001" onClose={mockOnClose} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('Add RAID Item')).toBeInTheDocument();
    expect(
      screen.getByText('Optional - Chat is primary for complex RAID creation'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Type/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Title/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Status/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Priority/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Owner/)).toBeInTheDocument();
  });

  it('should close modal when close button clicked', () => {
    render(<RAIDCreateModal projectKey="TEST-001" onClose={mockOnClose} />, {
      wrapper: createWrapper(),
    });

    fireEvent.click(screen.getByLabelText('Close'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should close modal when overlay clicked', () => {
    render(<RAIDCreateModal projectKey="TEST-001" onClose={mockOnClose} />, {
      wrapper: createWrapper(),
    });

    fireEvent.click(screen.getByRole('dialog').parentElement!);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should show validation errors for required fields', async () => {
    render(<RAIDCreateModal projectKey="TEST-001" onClose={mockOnClose} />, {
      wrapper: createWrapper(),
    });

    const submitButton = screen.getByText('Create RAID Item');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
      expect(screen.getByText('Description is required')).toBeInTheDocument();
      expect(screen.getByText('Owner is required')).toBeInTheDocument();
    });
  });

  it('should show risk-specific fields when type is Risk', () => {
    render(<RAIDCreateModal projectKey="TEST-001" onClose={mockOnClose} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByLabelText(/Impact/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Likelihood/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mitigation Plan/)).toBeInTheDocument();
  });

  it('should hide risk-specific fields when type is not Risk', () => {
    render(<RAIDCreateModal projectKey="TEST-001" onClose={mockOnClose} />, {
      wrapper: createWrapper(),
    });

    const typeSelect = screen.getByLabelText(/Type/);
    fireEvent.change(typeSelect, { target: { value: RAIDType.ISSUE } });

    expect(screen.queryByLabelText(/Impact/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Likelihood/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Mitigation Plan/)).not.toBeInTheDocument();
  });

  it('should validate risk-specific fields for Risk type', async () => {
    render(<RAIDCreateModal projectKey="TEST-001" onClose={mockOnClose} />, {
      wrapper: createWrapper(),
    });

    const titleInput = screen.getByLabelText(/Title/);
    const descriptionInput = screen.getByLabelText(/Description/);
    const ownerInput = screen.getByLabelText(/Owner/);

    await userEvent.type(titleInput, 'Test Risk');
    await userEvent.type(descriptionInput, 'Test Description');
    await userEvent.type(ownerInput, 'John Doe');

    const submitButton = screen.getByText('Create RAID Item');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('Impact is required for risks'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Likelihood is required for risks'),
      ).toBeInTheDocument();
    });
  });

  it('should add and remove next actions', async () => {
    render(<RAIDCreateModal projectKey="TEST-001" onClose={mockOnClose} />, {
      wrapper: createWrapper(),
    });

    const addButton = screen.getByText('+ Add Action');
    fireEvent.click(addButton);

    const actionInputs = screen.getAllByPlaceholderText('Enter action...');
    expect(actionInputs).toHaveLength(2); // Initial + added

    const removeButtons = screen.getAllByLabelText('Remove action');
    fireEvent.click(removeButtons[0]);

    await waitFor(() => {
      const updatedInputs = screen.getAllByPlaceholderText('Enter action...');
      expect(updatedInputs).toHaveLength(1);
    });
  });

  it('should successfully create a RAID item', async () => {
    mockCreateRAIDItem.mockResolvedValue({
      success: true,
      data: { id: 'RAID-001', title: 'Test RAID' },
    });

    render(<RAIDCreateModal projectKey="TEST-001" onClose={mockOnClose} />, {
      wrapper: createWrapper(),
    });

    const typeSelect = screen.getByLabelText(/Type/);
    const titleInput = screen.getByLabelText(/Title/);
    const descriptionInput = screen.getByLabelText(/Description/);
    const ownerInput = screen.getByLabelText(/Owner/);

    await userEvent.selectOptions(typeSelect, RAIDType.ISSUE);
    await userEvent.type(titleInput, 'Test Issue');
    await userEvent.type(descriptionInput, 'Test Description');
    await userEvent.type(ownerInput, 'John Doe');

    const submitButton = screen.getByText('Create RAID Item');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateRAIDItem).toHaveBeenCalledWith('TEST-001', {
        type: RAIDType.ISSUE,
        title: 'Test Issue',
        description: 'Test Description',
        owner: 'John Doe',
        status: RAIDStatus.OPEN,
        priority: RAIDPriority.MEDIUM,
        impact: undefined,
        likelihood: undefined,
        mitigation_plan: undefined,
        next_actions: [],
        target_resolution_date: undefined,
      });
      expect(showToast).toHaveBeenCalledWith(
        'RAID item created successfully',
        'success',
      );
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should show error toast when API fails', async () => {
    mockCreateRAIDItem.mockResolvedValue({
      success: false,
      error: 'API Error',
    });

    render(<RAIDCreateModal projectKey="TEST-001" onClose={mockOnClose} />, {
      wrapper: createWrapper(),
    });

    const typeSelect = screen.getByLabelText(/Type/);
    const titleInput = screen.getByLabelText(/Title/);
    const descriptionInput = screen.getByLabelText(/Description/);
    const ownerInput = screen.getByLabelText(/Owner/);

    await userEvent.selectOptions(typeSelect, RAIDType.ISSUE);
    await userEvent.type(titleInput, 'Test Issue');
    await userEvent.type(descriptionInput, 'Test Description');
    await userEvent.type(ownerInput, 'John Doe');

    const submitButton = screen.getByText('Create RAID Item');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith('API Error', 'error');
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  it('should disable submit button while creating', async () => {
    mockCreateRAIDItem.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () => resolve({ success: true, data: { id: 'RAID-001' } }),
            100,
          ),
        ),
    );

    render(<RAIDCreateModal projectKey="TEST-001" onClose={mockOnClose} />, {
      wrapper: createWrapper(),
    });

    const typeSelect = screen.getByLabelText(/Type/);
    const titleInput = screen.getByLabelText(/Title/);
    const descriptionInput = screen.getByLabelText(/Description/);
    const ownerInput = screen.getByLabelText(/Owner/);

    await userEvent.selectOptions(typeSelect, RAIDType.ISSUE);
    await userEvent.type(titleInput, 'Test Issue');
    await userEvent.type(descriptionInput, 'Test Description');
    await userEvent.type(ownerInput, 'John Doe');

    const submitButton = screen.getByText('Create RAID Item');
    fireEvent.click(submitButton);

    expect(screen.getByText('Creating...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should clean empty next actions before submission', async () => {
    mockCreateRAIDItem.mockResolvedValue({
      success: true,
      data: { id: 'RAID-001' },
    });

    render(<RAIDCreateModal projectKey="TEST-001" onClose={mockOnClose} />, {
      wrapper: createWrapper(),
    });

    const typeSelect = screen.getByLabelText(/Type/);
    const titleInput = screen.getByLabelText(/Title/);
    const descriptionInput = screen.getByLabelText(/Description/);
    const ownerInput = screen.getByLabelText(/Owner/);

    await userEvent.selectOptions(typeSelect, RAIDType.ISSUE);
    await userEvent.type(titleInput, 'Test Issue');
    await userEvent.type(descriptionInput, 'Test Description');
    await userEvent.type(ownerInput, 'John Doe');

    // Initial next action is empty
    const submitButton = screen.getByText('Create RAID Item');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateRAIDItem).toHaveBeenCalledWith(
        'TEST-001',
        expect.objectContaining({
          next_actions: [], // Empty actions should be filtered out
        }),
      );
    });
  });
});
