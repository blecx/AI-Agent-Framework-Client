/**
 * CreateProjectForm Tests
 * Comprehensive test suite for the multi-step project creation form
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ProjectProvider } from '../../../../contexts/ProjectContext';
import { CreateProjectForm } from '../../../../components/projects/CreateProjectForm';
import { ProjectsService } from '../../../../services/api/projects';
import { ApiClient } from '../../../../services/api/client';

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock API client and service
const mockCreateProject = vi.fn();

vi.mock('../../../../services/api/client');
vi.mock('../../../../services/api/projects');

// Test helper to render component with context
const renderWithContext = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ProjectProvider>{ui}</ProjectProvider>
    </BrowserRouter>
  );
};

describe('CreateProjectForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    
    // Mock ApiClient constructor
    (ApiClient as any).mockImplementation(function(this: any) {
      return {};
    });
    
    // Mock ProjectsService constructor
    (ProjectsService as any).mockImplementation(function(this: any) {
      this.createProject = mockCreateProject;
      return this;
    });
  });

  describe('Initial Rendering', () => {
    it('renders the form with header and note', () => {
      renderWithContext(<CreateProjectForm />);
      
      expect(screen.getByText('Create New Project')).toBeInTheDocument();
      expect(screen.getByText(/This is a quick-add form/i)).toBeInTheDocument();
      expect(screen.getByText(/AI Chat workflow/i)).toBeInTheDocument();
    });

    it('renders step indicator with three steps', () => {
      renderWithContext(<CreateProjectForm />);
      
      expect(screen.getByText('Basic Info')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Confirmation')).toBeInTheDocument();
    });

    it('starts on basic info step', () => {
      renderWithContext(<CreateProjectForm />);
      
      expect(screen.getByText('Basic Information')).toBeInTheDocument();
      expect(screen.getByLabelText(/Project Key/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Project Name/i)).toBeInTheDocument();
    });
  });

  describe('Basic Info Step - Validation', () => {
    it('shows error when project key is empty', async () => {
      const user = userEvent.setup();
      renderWithContext(<CreateProjectForm />);
      
      const nextButton = screen.getByText('Next');
      await user.click(nextButton);
      
      expect(screen.getByText('Project key is required')).toBeInTheDocument();
    });

    it('shows error when project key has invalid format', async () => {
      const user = userEvent.setup();
      renderWithContext(<CreateProjectForm />);
      
      const keyInput = screen.getByLabelText(/Project Key/i);
      // Type lowercase (will be converted to uppercase), then manually set invalid
      await user.type(keyInput, '123');
      
      const nextButton = screen.getByText('Next');
      await user.click(nextButton);
      
      expect(screen.getByText(/must start with uppercase letter/i)).toBeInTheDocument();
    });

    it('accepts valid project key format', async () => {
      const user = userEvent.setup();
      renderWithContext(<CreateProjectForm />);
      
      const keyInput = screen.getByLabelText(/Project Key/i);
      await user.type(keyInput, 'PROJ1');
      
      expect(keyInput).toHaveValue('PROJ1');
    });

    it('converts key input to uppercase', async () => {
      const user = userEvent.setup();
      renderWithContext(<CreateProjectForm />);
      
      const keyInput = screen.getByLabelText(/Project Key/i);
      await user.type(keyInput, 'proj1');
      
      expect(keyInput).toHaveValue('PROJ1');
    });

    it('shows error when project name is empty', async () => {
      const user = userEvent.setup();
      renderWithContext(<CreateProjectForm />);
      
      const keyInput = screen.getByLabelText(/Project Key/i);
      await user.type(keyInput, 'PROJ1');
      
      const nextButton = screen.getByText('Next');
      await user.click(nextButton);
      
      expect(screen.getByText('Project name is required')).toBeInTheDocument();
    });

    it('shows error when project name is too short', async () => {
      const user = userEvent.setup();
      renderWithContext(<CreateProjectForm />);
      
      const keyInput = screen.getByLabelText(/Project Key/i);
      await user.type(keyInput, 'PROJ1');
      
      const nameInput = screen.getByLabelText(/Project Name/i);
      await user.type(nameInput, 'AB');
      
      const nextButton = screen.getByText('Next');
      await user.click(nextButton);
      
      expect(screen.getByText(/must be at least 3 characters/i)).toBeInTheDocument();
    });

    it('clears error when user corrects input', async () => {
      const user = userEvent.setup();
      renderWithContext(<CreateProjectForm />);
      
      const nextButton = screen.getByText('Next');
      await user.click(nextButton);
      
      expect(screen.getByText('Project key is required')).toBeInTheDocument();
      
      const keyInput = screen.getByLabelText(/Project Key/i);
      await user.type(keyInput, 'PROJ1');
      
      expect(screen.queryByText('Project key is required')).not.toBeInTheDocument();
    });
  });

  describe('Multi-Step Navigation', () => {
    it('advances to settings step when basic info is valid', async () => {
      const user = userEvent.setup();
      renderWithContext(<CreateProjectForm />);
      
      const keyInput = screen.getByLabelText(/Project Key/i);
      await user.type(keyInput, 'PROJ1');
      
      const nameInput = screen.getByLabelText(/Project Name/i);
      await user.type(nameInput, 'Test Project');
      
      const nextButton = screen.getByText('Next');
      await user.click(nextButton);
      
      expect(screen.getByText('Project Settings')).toBeInTheDocument();
      expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    });

    it('advances to confirmation step from settings', async () => {
      const user = userEvent.setup();
      renderWithContext(<CreateProjectForm />);
      
      // Fill basic info
      await user.type(screen.getByLabelText(/Project Key/i), 'PROJ1');
      await user.type(screen.getByLabelText(/Project Name/i), 'Test Project');
      await user.click(screen.getByText('Next'));
      
      // Click next on settings
      await user.click(screen.getByText('Next'));
      
      expect(screen.getByText('Review & Confirm')).toBeInTheDocument();
      expect(screen.getByText('Project Key:')).toBeInTheDocument();
    });

    it('navigates back from settings to basic', async () => {
      const user = userEvent.setup();
      renderWithContext(<CreateProjectForm />);
      
      // Go to settings
      await user.type(screen.getByLabelText(/Project Key/i), 'PROJ1');
      await user.type(screen.getByLabelText(/Project Name/i), 'Test Project');
      await user.click(screen.getByText('Next'));
      
      // Click back
      await user.click(screen.getByText('Back'));
      
      expect(screen.getByText('Basic Information')).toBeInTheDocument();
    });

    it('navigates back from confirmation to settings', async () => {
      const user = userEvent.setup();
      renderWithContext(<CreateProjectForm />);
      
      // Go to confirmation
      await user.type(screen.getByLabelText(/Project Key/i), 'PROJ1');
      await user.type(screen.getByLabelText(/Project Name/i), 'Test Project');
      await user.click(screen.getByText('Next'));
      await user.click(screen.getByText('Next'));
      
      // Click back
      await user.click(screen.getByText('Back'));
      
      expect(screen.getByText('Project Settings')).toBeInTheDocument();
    });

    it('preserves form data when navigating between steps', async () => {
      const user = userEvent.setup();
      renderWithContext(<CreateProjectForm />);
      
      // Fill basic info
      await user.type(screen.getByLabelText(/Project Key/i), 'PROJ1');
      await user.type(screen.getByLabelText(/Project Name/i), 'Test Project');
      await user.click(screen.getByText('Next'));
      
      // Add description
      await user.type(screen.getByLabelText(/Description/i), 'Test description');
      await user.click(screen.getByText('Next'));
      
      // Go back to basic
      await user.click(screen.getByText('Back'));
      await user.click(screen.getByText('Back'));
      
      // Verify data preserved
      expect(screen.getByLabelText(/Project Key/i)).toHaveValue('PROJ1');
      expect(screen.getByLabelText(/Project Name/i)).toHaveValue('Test Project');
    });
  });

  describe('Settings Step', () => {
    it('allows optional description', async () => {
      const user = userEvent.setup();
      renderWithContext(<CreateProjectForm />);
      
      await user.type(screen.getByLabelText(/Project Key/i), 'PROJ1');
      await user.type(screen.getByLabelText(/Project Name/i), 'Test Project');
      await user.click(screen.getByText('Next'));
      
      const descriptionInput = screen.getByLabelText(/Description/i);
      await user.type(descriptionInput, 'Optional description');
      
      expect(descriptionInput).toHaveValue('Optional description');
    });

    it('shows character count for description', async () => {
      const user = userEvent.setup();
      renderWithContext(<CreateProjectForm />);
      
      await user.type(screen.getByLabelText(/Project Key/i), 'PROJ1');
      await user.type(screen.getByLabelText(/Project Name/i), 'Test Project');
      await user.click(screen.getByText('Next'));
      
      expect(screen.getByText('0/500 characters')).toBeInTheDocument();
      
      await user.type(screen.getByLabelText(/Description/i), 'Test');
      
      expect(screen.getByText('4/500 characters')).toBeInTheDocument();
    });
  });

  describe('Confirmation Step', () => {
    it('displays all entered information', async () => {
      const user = userEvent.setup();
      renderWithContext(<CreateProjectForm />);
      
      await user.type(screen.getByLabelText(/Project Key/i), 'PROJ1');
      await user.type(screen.getByLabelText(/Project Name/i), 'Test Project');
      await user.click(screen.getByText('Next'));
      
      await user.type(screen.getByLabelText(/Description/i), 'Test description');
      await user.click(screen.getByText('Next'));
      
      expect(screen.getByText('PROJ1')).toBeInTheDocument();
      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    it('shows placeholder when no description provided', async () => {
      const user = userEvent.setup();
      renderWithContext(<CreateProjectForm />);
      
      await user.type(screen.getByLabelText(/Project Key/i), 'PROJ1');
      await user.type(screen.getByLabelText(/Project Name/i), 'Test Project');
      await user.click(screen.getByText('Next'));
      await user.click(screen.getByText('Next'));
      
      expect(screen.getByText('No description provided')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('creates project with correct data', async () => {
      const user = userEvent.setup();
      mockCreateProject.mockResolvedValue({
        key: 'PROJ1',
        name: 'Test Project',
        description: 'Test description',
        created_at: '2026-01-31T12:00:00Z',
        updated_at: '2026-01-31T12:00:00Z',
      });
      
      renderWithContext(<CreateProjectForm />);
      
      await user.type(screen.getByLabelText(/Project Key/i), 'PROJ1');
      await user.type(screen.getByLabelText(/Project Name/i), 'Test Project');
      await user.click(screen.getByText('Next'));
      
      await user.type(screen.getByLabelText(/Description/i), 'Test description');
      await user.click(screen.getByText('Next'));
      
      await user.click(screen.getByText('Create Project'));
      
      await waitFor(() => {
        expect(mockCreateProject).toHaveBeenCalledWith({
          key: 'PROJ1',
          name: 'Test Project',
          description: 'Test description',
        });
      });
    });

    it('creates project without description', async () => {
      const user = userEvent.setup();
      mockCreateProject.mockResolvedValue({
        key: 'PROJ1',
        name: 'Test Project',
        created_at: '2026-01-31T12:00:00Z',
        updated_at: '2026-01-31T12:00:00Z',
      });
      
      renderWithContext(<CreateProjectForm />);
      
      await user.type(screen.getByLabelText(/Project Key/i), 'PROJ1');
      await user.type(screen.getByLabelText(/Project Name/i), 'Test Project');
      await user.click(screen.getByText('Next'));
      await user.click(screen.getByText('Next'));
      
      await user.click(screen.getByText('Create Project'));
      
      await waitFor(() => {
        expect(mockCreateProject).toHaveBeenCalledWith({
          key: 'PROJ1',
          name: 'Test Project',
          description: undefined,
        });
      });
    });

    it('navigates to project list after successful creation', async () => {
      const user = userEvent.setup();
      mockCreateProject.mockResolvedValue({
        key: 'PROJ1',
        name: 'Test Project',
        created_at: '2026-01-31T12:00:00Z',
        updated_at: '2026-01-31T12:00:00Z',
      });
      
      renderWithContext(<CreateProjectForm />);
      
      await user.type(screen.getByLabelText(/Project Key/i), 'PROJ1');
      await user.type(screen.getByLabelText(/Project Name/i), 'Test Project');
      await user.click(screen.getByText('Next'));
      await user.click(screen.getByText('Next'));
      await user.click(screen.getByText('Create Project'));
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/projects');
      });
    });

    it('shows loading state during submission', async () => {
      const user = userEvent.setup();
      mockCreateProject.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );
      
      renderWithContext(<CreateProjectForm />);
      
      await user.type(screen.getByLabelText(/Project Key/i), 'PROJ1');
      await user.type(screen.getByLabelText(/Project Name/i), 'Test Project');
      await user.click(screen.getByText('Next'));
      await user.click(screen.getByText('Next'));
      await user.click(screen.getByText('Create Project'));
      
      expect(screen.getByText('Creating...')).toBeInTheDocument();
      expect(screen.getByText('Back')).toBeDisabled();
    });

    it('displays error message on submission failure', async () => {
      const user = userEvent.setup();
      mockCreateProject.mockRejectedValue(new Error('Network error'));
      
      renderWithContext(<CreateProjectForm />);
      
      await user.type(screen.getByLabelText(/Project Key/i), 'PROJ1');
      await user.type(screen.getByLabelText(/Project Name/i), 'Test Project');
      await user.click(screen.getByText('Next'));
      await user.click(screen.getByText('Next'));
      await user.click(screen.getByText('Create Project'));
      
      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Cancel Functionality', () => {
    it('navigates to project list when cancel is clicked', async () => {
      const user = userEvent.setup();
      renderWithContext(<CreateProjectForm />);
      
      await user.click(screen.getByText('Cancel'));
      
      expect(mockNavigate).toHaveBeenCalledWith('/projects');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for inputs', () => {
      renderWithContext(<CreateProjectForm />);
      
      expect(screen.getByLabelText(/Project Key/i)).toHaveAttribute('aria-invalid', 'false');
      expect(screen.getByLabelText(/Project Name/i)).toHaveAttribute('aria-invalid', 'false');
    });

    it('sets aria-invalid when field has error', async () => {
      const user = userEvent.setup();
      renderWithContext(<CreateProjectForm />);
      
      await user.click(screen.getByText('Next'));
      
      expect(screen.getByLabelText(/Project Key/i)).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByLabelText(/Project Name/i)).toHaveAttribute('aria-invalid', 'true');
    });

    it('links error messages with inputs via aria-describedby', async () => {
      const user = userEvent.setup();
      renderWithContext(<CreateProjectForm />);
      
      await user.click(screen.getByText('Next'));
      
      const keyInput = screen.getByLabelText(/Project Key/i);
      expect(keyInput).toHaveAttribute('aria-describedby', 'key-error');
      expect(screen.getByText('Project key is required')).toHaveAttribute('id', 'key-error');
    });

    it('error messages have alert role', async () => {
      const user = userEvent.setup();
      renderWithContext(<CreateProjectForm />);
      
      await user.click(screen.getByText('Next'));
      
      const errorMessages = screen.getAllByRole('alert');
      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });
});
