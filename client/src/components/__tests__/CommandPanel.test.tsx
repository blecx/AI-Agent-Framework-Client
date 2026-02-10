/**
 * CommandPanel Component Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import CommandPanel from '../CommandPanel';

// Create mock navigate function
const mockNavigate = vi.fn();

// Mock dependencies
vi.mock('../../services/apiClient', () => ({
  default: {
    createProject: vi.fn(),
    listProjects: vi.fn(),
    checkHealth: vi.fn(),
    getInfo: vi.fn(),
  },
}));

vi.mock('../../hooks/useToast', () => ({
  useToast: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
    showInfo: vi.fn(),
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('CommandPanel', () => {
  let mockCreateProject: ReturnType<typeof vi.fn>;
  let mockListProjects: ReturnType<typeof vi.fn>;
  let mockCheckHealth: ReturnType<typeof vi.fn>;
  let mockGetInfo: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    mockNavigate.mockClear();

    // Import mocked apiClient after mocks are set up
    const apiClient = await import('../../services/apiClient');
    mockCreateProject = apiClient.default.createProject as ReturnType<typeof vi.fn>;
    mockListProjects = apiClient.default.listProjects as ReturnType<typeof vi.fn>;
    mockCheckHealth = apiClient.default.checkHealth as ReturnType<typeof vi.fn>;
    mockGetInfo = apiClient.default.getInfo as ReturnType<typeof vi.fn>;
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    cleanup();
  });

  it('renders command panel with header', () => {
    renderWithRouter(<CommandPanel />);
    
    expect(screen.getByText('Command Panel')).toBeInTheDocument();
    expect(screen.getByText('Quick actions and command history')).toBeInTheDocument();
  });

  it('renders all quick action buttons', () => {
    renderWithRouter(<CommandPanel />);
    
    expect(screen.getByRole('button', { name: /Create new project/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /List all projects/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Check API health/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Get API information/i })).toBeInTheDocument();
  });

  it('shows empty history message initially', () => {
    renderWithRouter(<CommandPanel />);
    
    expect(screen.getByText(/No commands executed yet/i)).toBeInTheDocument();
  });

  it('opens project name modal when create project is clicked', async () => {
    const user = userEvent.setup();
    renderWithRouter(<CommandPanel />);
    
    const createButton = screen.getByRole('button', { name: /Create new project/i });
    await user.click(createButton);
    
    expect(screen.getByText('Create New Project')).toBeInTheDocument();
    expect(screen.getByLabelText(/Project Name/i)).toBeInTheDocument();
  });

  it('progresses through project creation flow', async () => {
    mockCreateProject.mockResolvedValue({
      success: true,
      data: { key: 'test-project', name: 'Test Project' },
    });

    const user = userEvent.setup();
    renderWithRouter(<CommandPanel />);
    
    // Click create project
    const createButton = screen.getByRole('button', { name: /Create new project/i });
    await user.click(createButton);
    
    // Enter project name
    const nameInput = screen.getByPlaceholderText(/My Awesome Project/i);
    await user.type(nameInput, 'Test Project');
    await user.click(screen.getByRole('button', { name: /Next/i }));
    
    // Should show key input modal
    await waitFor(() => {
      expect(screen.getByLabelText(/Project Key/i)).toBeInTheDocument();
    });
    
    // Enter project key and submit
    const keyInput = screen.getByPlaceholderText(/my-project/i);
    await user.type(keyInput, 'test-project');
    
    // Get submit button within modal dialog
    const modal = screen.getByRole('dialog');
    const submitButton = within(modal).getByRole('button', { name: /Create/i });
    await user.click(submitButton);
    
    // Should call API
    await waitFor(() => {
      expect(mockCreateProject).toHaveBeenCalledWith('test-project', 'Test Project');
    });
  });

  it('creates project with auto-generated key when empty', async () => {
    mockCreateProject.mockResolvedValue({
      success: true,
      data: { key: 'my-project', name: 'My Project' },
    });

    const user = userEvent.setup();
    renderWithRouter(<CommandPanel />);
    
    // Open modal and enter name
    await user.click(screen.getByRole('button', { name: /Create new project/i }));
    await user.type(screen.getByPlaceholderText(/My Awesome Project/i), 'My Project');
    await user.click(screen.getByRole('button', { name: /Next/i }));
    
    // Skip key input (empty) and submit
    await waitFor(() => {
      expect(screen.getByLabelText(/Project Key/i)).toBeInTheDocument();
    });
    
    // Get submit button within modal dialog
    const modal = screen.getByRole('dialog');
    const submitButton = within(modal).getByRole('button', { name: /Create/i });
    await user.click(submitButton);
    
    // Should create with auto-generated key
    await waitFor(() => {
      expect(mockCreateProject).toHaveBeenCalledWith('my-project', 'My Project');
    });
  });

  it('shows success message and navigates after project creation', async () => {
    mockCreateProject.mockResolvedValue({
      success: true,
      data: { key: 'test-123', name: 'Test Project' },
    });

    vi.useFakeTimers();
    const user = userEvent.setup({ delay: null });
    renderWithRouter(<CommandPanel />);
    
    // Complete create flow
    await user.click(screen.getByRole('button', { name: /Create new project/i }));
    await user.type(screen.getByPlaceholderText(/My Awesome Project/i), 'Test Project');
    await user.click(screen.getByRole('button', { name: /Next/i }));
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Project Key/i)).toBeInTheDocument();
    });
    
    // Get submit button within modal dialog
    const modal = screen.getByRole('dialog');
    const submitButton = within(modal).getByRole('button', { name: /Create/i });
    await user.click(submitButton);
    
    // Should show success message
    await waitFor(() => {
      expect(screen.getByText(/Project "Test Project" created successfully/i)).toBeInTheDocument();
    });
    
    // Should navigate after timeout
    vi.advanceTimersByTime(1000);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/projects/test-123');
    });
    
    vi.useRealTimers();
  });

  it('shows error message when project creation fails', async () => {
    mockCreateProject.mockResolvedValue({
      success: false,
      error: 'Project key already exists',
    });

    const user = userEvent.setup();
    renderWithRouter(<CommandPanel />);
    
    // Complete create flow
    await user.click(screen.getByRole('button', { name: /Create new project/i }));
    await user.type(screen.getByPlaceholderText(/My Awesome Project/i), 'Test Project');
    await user.click(screen.getByRole('button', { name: /Next/i }));
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Project Key/i)).toBeInTheDocument();
    });
    
    // Get submit button within modal dialog
    const modal = screen.getByRole('dialog');
    const submitButton = within(modal).getByRole('button', { name: /Create/i });
    await user.click(submitButton);
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/Project key already exists/i)).toBeInTheDocument();
    });
  });

  it('lists projects successfully', async () => {
    mockListProjects.mockResolvedValue({
      success: true,
      data: [{ key: 'test-1' }, { key: 'test-2' }],
    });

    vi.useFakeTimers();
    const user = userEvent.setup({ delay: null });
    renderWithRouter(<CommandPanel />);
    
    const listButton = screen.getByRole('button', { name: /List all projects/i });
    await user.click(listButton);
    
    await waitFor(() => {
      expect(mockListProjects).toHaveBeenCalled();
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Found 2 project\(s\)/i)).toBeInTheDocument();
    });
    
    // Should navigate after timeout
    vi.advanceTimersByTime(500);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/projects');
    });
    
    vi.useRealTimers();
  });

  it('handles list projects error', async () => {
    mockListProjects.mockRejectedValue(new Error('Network error'));

    const user = userEvent.setup();
    renderWithRouter(<CommandPanel />);
    
    await user.click(screen.getByRole('button', { name: /List all projects/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });
  });

  it('checks API health successfully', async () => {
    mockCheckHealth.mockResolvedValue({ status: 'healthy' });

    const user = userEvent.setup();
    renderWithRouter(<CommandPanel />);
    
    await user.click(screen.getByRole('button', { name: /Check API health/i }));
    
    await waitFor(() => {
      expect(mockCheckHealth).toHaveBeenCalled();
    });
    
    await waitFor(() => {
      expect(screen.getByText(/API is healthy/i)).toBeInTheDocument();
    });
  });

  it('handles health check error', async () => {
    mockCheckHealth.mockRejectedValue(new Error('API unreachable'));

    const user = userEvent.setup();
    renderWithRouter(<CommandPanel />);
    
    await user.click(screen.getByRole('button', { name: /Check API health/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/API unreachable/i)).toBeInTheDocument();
    });
  });

  it('gets API info successfully', async () => {
    mockGetInfo.mockResolvedValue({
      name: 'Test API',
      version: '1.0.0',
    });

    const user = userEvent.setup();
    renderWithRouter(<CommandPanel />);
    
    await user.click(screen.getByRole('button', { name: /Get API information/i }));
    
    await waitFor(() => {
      expect(mockGetInfo).toHaveBeenCalled();
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Test API v1\.0\.0/i)).toBeInTheDocument();
    });
  });

  it('handles get info error', async () => {
    mockGetInfo.mockRejectedValue(new Error('Failed to get info'));

    const user = userEvent.setup();
    renderWithRouter(<CommandPanel />);
    
    await user.click(screen.getByRole('button', { name: /Get API information/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to get info/i)).toBeInTheDocument();
    });
  });

  it('adds commands to history', async () => {
    mockCheckHealth.mockResolvedValue({ status: 'healthy' });

    const user = userEvent.setup();
    renderWithRouter(<CommandPanel />);
    
    // Initially no history
    expect(screen.getByText(/No commands executed yet/i)).toBeInTheDocument();
    
    // Execute command
    await user.click(screen.getByRole('button', { name: /Check API health/i }));
    
    await waitFor(() => {
      expect(screen.queryByText(/No commands executed yet/i)).not.toBeInTheDocument();
    });
    
    // Should show in history
    expect(screen.getByText('Check API health')).toBeInTheDocument();
    expect(screen.getByText(/Status: healthy/i)).toBeInTheDocument();
  });

  it('shows clear history button when history exists', async () => {
    mockCheckHealth.mockResolvedValue({ status: 'healthy' });

    const user = userEvent.setup();
    renderWithRouter(<CommandPanel />);
    
    // No clear button initially
    expect(screen.queryByRole('button', { name: /Clear History/i })).not.toBeInTheDocument();
    
    // Execute command
    await user.click(screen.getByRole('button', { name: /Check API health/i }));
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Clear History/i })).toBeInTheDocument();
    });
  });

  it('clears history with confirmation', async () => {
    mockCheckHealth.mockResolvedValue({ status: 'healthy' });

    const user = userEvent.setup();
    renderWithRouter(<CommandPanel />);
    
    // Execute command to create history
    await user.click(screen.getByRole('button', { name: /Check API health/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Check API health')).toBeInTheDocument();
    });
    
    // Click clear history
    await user.click(screen.getByRole('button', { name: /Clear History/i }));
    
    // Should show confirmation dialog
    expect(screen.getByText(/Are you sure you want to clear all command history/i)).toBeInTheDocument();
    
    // Confirm
    await user.click(screen.getByRole('button', { name: /Clear/i }));
    
    // History should be cleared
    await waitFor(() => {
      expect(screen.getByText(/No commands executed yet/i)).toBeInTheDocument();
    });
  });

  it('cancels clear history', async () => {
    mockCheckHealth.mockResolvedValue({ status: 'healthy' });

    const user = userEvent.setup();
    renderWithRouter(<CommandPanel />);
    
    // Execute command
    await user.click(screen.getByRole('button', { name: /Check API health/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Check API health')).toBeInTheDocument();
    });
    
    // Click clear history then cancel
    await user.click(screen.getByRole('button', { name: /Clear History/i }));
    await user.click(screen.getByRole('button', { name: /Cancel/i }));
    
    // History should still exist
    expect(screen.getByText('Check API health')).toBeInTheDocument();
  });

  it('disables buttons while loading', async () => {
    mockCheckHealth.mockImplementation(() => new Promise(() => {})); // Never resolves

    const user = userEvent.setup();
    renderWithRouter(<CommandPanel />);
    
    const healthButton = screen.getByRole('button', { name: /Check API health/i });
    await user.click(healthButton);
    
    // All action buttons should be disabled during loading
    expect(screen.getByRole('button', { name: /Create new project/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /List all projects/i })).toBeDisabled();
    expect(healthButton).toBeDisabled();
    expect(screen.getByRole('button', { name: /Get API information/i })).toBeDisabled();
  });

  it('can cancel input modal', async () => {
    const user = userEvent.setup();
    renderWithRouter(<CommandPanel />);
    
    // Open create project modal
    await user.click(screen.getByRole('button', { name: /Create new project/i }));
    
    expect(screen.getByText('Create New Project')).toBeInTheDocument();
    
    // Cancel
    await user.click(screen.getByRole('button', { name: /Cancel/i }));
    
    // Modal should close
    await waitFor(() => {
      expect(screen.queryByText('Create New Project')).not.toBeInTheDocument();
    });
  });

  it('dismisses status message when close button clicked', async () => {
    mockCheckHealth.mockResolvedValue({ status: 'healthy' });

    const user = userEvent.setup();
    renderWithRouter(<CommandPanel />);
    
    await user.click(screen.getByRole('button', { name: /Check API health/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/API is healthy/i)).toBeInTheDocument();
    });
    
    // Click close button
    const closeButton = screen.getByRole('button', { name: /×/i });
    await user.click(closeButton);
    
    // Status message should be dismissed
    await waitFor(() => {
      expect(screen.queryByText(/API is healthy/i)).not.toBeInTheDocument();
    });
  });

  it('displays error status with error styling', async () => {
    mockCheckHealth.mockRejectedValue(new Error('Connection failed'));

    const user = userEvent.setup();
    renderWithRouter(<CommandPanel />);
    
    await user.click(screen.getByRole('button', { name: /Check API health/i }));
    
    await waitFor(() => {
      const statusMessage = screen.getByText(/Connection failed/i).closest('.status-message');
      expect(statusMessage).toHaveClass('error');
    });
  });

  it('displays success status with success styling', async () => {
    mockCheckHealth.mockResolvedValue({ status: 'healthy' });

    const user = userEvent.setup();
    renderWithRouter(<CommandPanel />);
    
    await user.click(screen.getByRole('button', { name: /Check API health/i }));
    
    await waitFor(() => {
      const statusMessage = screen.getByText(/API is healthy/i).closest('.status-message');
      expect(statusMessage).toHaveClass('success');
    });
  });

  it('shows timestamps for history entries', async () => {
    mockCheckHealth.mockResolvedValue({ status: 'healthy' });

    const user = userEvent.setup();
    renderWithRouter(<CommandPanel />);
    
    await user.click(screen.getByRole('button', { name: /Check API health/i }));
    
    await waitFor(() => {
      // Should show formatted time
      const timeElements = document.querySelectorAll('.history-timestamp');
      expect(timeElements.length).toBeGreaterThan(0);
    });
  });
});
