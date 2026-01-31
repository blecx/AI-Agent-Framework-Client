/**
 * ProjectSelector Component Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ProjectSelector } from '../../../components/ProjectSelector';
import { ProjectProvider } from '../../../contexts/ProjectContext';
import type { ProjectInfo } from '../../../types/api';

const mockProjects: ProjectInfo[] = [
  {
    key: 'PROJ1',
    name: 'Project One',
    description: 'First project',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    key: 'PROJ2',
    name: 'Project Two',
    description: 'Second project',
    created_at: '2026-01-02T00:00:00Z',
    updated_at: '2026-01-02T00:00:00Z',
  },
  {
    key: 'TEST-ALPHA',
    name: 'Test Alpha Project',
    created_at: '2026-01-03T00:00:00Z',
    updated_at: '2026-01-03T00:00:00Z',
  },
];

// Create a persistent mock function that tests can reconfigure
const mockListProjects = vi.fn();

// Mock modules with proper constructors
vi.mock('../../../services/api/client', () => ({
  ApiClient: vi.fn(function (this: any, _config: any) {
    // Empty API client mock
  }),
}));

vi.mock('../../../services/api/projects', () => ({
  ProjectsService: vi.fn(function (this: any, _apiClient: any) {
    this.listProjects = mockListProjects;
  }),
}));

describe('ProjectSelector', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Reset and configure the mock function
    mockListProjects.mockReset();
    mockListProjects.mockResolvedValue(mockProjects);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderWithContext = (ui: React.ReactElement) => {
    return render(<ProjectProvider>{ui}</ProjectProvider>);
  };

  describe('Loading State', () => {
    it('displays loading state initially', () => {
      mockListProjects.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(mockProjects), 100),
          ),
      );

      renderWithContext(<ProjectSelector />);
      expect(screen.getByText('Loading projects...')).toBeInTheDocument();
    });

    it('loads and displays projects', async () => {
      renderWithContext(<ProjectSelector />);

      await waitFor(() => {
        expect(screen.getByText('Select Project')).toBeInTheDocument();
      });

      expect(mockListProjects).toHaveBeenCalledOnce();
    });
  });

  describe('Error Handling', () => {
    it('displays error message when loading fails', async () => {
      mockListProjects.mockRejectedValue(new Error('Network error'));

      renderWithContext(<ProjectSelector />);

      await waitFor(() => {
        expect(screen.getByText(/Error: Network error/)).toBeInTheDocument();
      });
    });

    it('shows retry button on error', async () => {
      mockListProjects.mockRejectedValueOnce(new Error('Network error'));

      renderWithContext(<ProjectSelector />);

      await waitFor(() => {
        expect(
          screen.getByLabelText('Retry loading projects'),
        ).toBeInTheDocument();
      });
    });

    it('retries loading when retry button clicked', async () => {
      mockListProjects
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockProjects);

      renderWithContext(<ProjectSelector />);

      await waitFor(() => {
        expect(
          screen.getByLabelText('Retry loading projects'),
        ).toBeInTheDocument();
      });

      fireEvent.click(screen.getByLabelText('Retry loading projects'));

      await waitFor(() => {
        expect(screen.getByText('Select Project')).toBeInTheDocument();
      });

      expect(mockListProjects).toHaveBeenCalledTimes(2);
    });
  });

  describe('Empty State', () => {
    it('displays empty state when no projects available', async () => {
      mockListProjects.mockResolvedValue([]);

      renderWithContext(<ProjectSelector />);

      await waitFor(() => {
        expect(screen.getByText('No projects available')).toBeInTheDocument();
      });
    });
  });

  describe('Dropdown Interaction', () => {
    it('opens dropdown when button clicked', async () => {
      renderWithContext(<ProjectSelector />);

      await waitFor(() => {
        expect(screen.getByText('Select Project')).toBeInTheDocument();
      });

      const button = screen.getByLabelText('Select project');
      fireEvent.click(button);

      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.getByText('Project One')).toBeInTheDocument();
      expect(screen.getByText('PROJ1')).toBeInTheDocument();
    });

    it('displays all projects in dropdown', async () => {
      renderWithContext(<ProjectSelector />);

      await waitFor(() => {
        expect(screen.getByText('Select Project')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByLabelText('Select project'));

      mockProjects.forEach((project) => {
        expect(screen.getByText(project.name)).toBeInTheDocument();
        expect(screen.getByText(project.key)).toBeInTheDocument();
      });
    });

    it('closes dropdown when overlay clicked', async () => {
      renderWithContext(<ProjectSelector />);

      await waitFor(() => {
        expect(screen.getByText('Select Project')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByLabelText('Select project'));
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      const overlay = document.querySelector(
        '.selector-overlay',
      ) as HTMLElement;
      fireEvent.click(overlay);

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('closes dropdown when arrow clicked again', async () => {
      renderWithContext(<ProjectSelector />);

      await waitFor(() => {
        expect(screen.getByText('Select Project')).toBeInTheDocument();
      });

      const button = screen.getByLabelText('Select project');
      fireEvent.click(button);
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });
  });

  describe('Project Selection', () => {
    it('selects project when clicked', async () => {
      renderWithContext(<ProjectSelector />);

      await waitFor(() => {
        expect(screen.getByText('Select Project')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByLabelText('Select project'));

      const projectButton = screen.getByText('Project One').closest('button');
      fireEvent.click(projectButton!);

      await waitFor(() => {
        expect(screen.getByText('Project One')).toBeInTheDocument();
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('highlights selected project in dropdown', async () => {
      renderWithContext(<ProjectSelector />);

      await waitFor(() => {
        expect(screen.getByText('Select Project')).toBeInTheDocument();
      });

      // Select first project
      fireEvent.click(screen.getByLabelText('Select project'));
      const project1Button = screen
        .getAllByText('Project One')[0]
        .closest('button');
      fireEvent.click(project1Button!);

      await waitFor(() => {
        expect(screen.getByText('Project One')).toBeInTheDocument();
      });

      // Open dropdown again
      fireEvent.click(screen.getByLabelText('Select project'));

      const dropdownItems = screen.getAllByRole('option');
      const selectedItem = dropdownItems.find(
        (item) =>
          item.textContent?.includes('Project One') &&
          item.classList.contains('active'),
      );
      expect(selectedItem).toHaveClass('active');
    });

    it('shows checkmark for selected project', async () => {
      renderWithContext(<ProjectSelector />);

      await waitFor(() => {
        expect(screen.getByText('Select Project')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByLabelText('Select project'));
      const projectButton = screen
        .getAllByText('Project Two')[0]
        .closest('button');
      fireEvent.click(projectButton!);

      await waitFor(() => {
        expect(screen.getByText('Project Two')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByLabelText('Select project'));

      const dropdownItems = screen.getAllByRole('option');
      const selectedItem = dropdownItems.find((item) =>
        item.textContent?.includes('Project Two'),
      );
      expect(selectedItem?.textContent).toContain('✓');
    });
  });

  describe('Clear Selection', () => {
    it('shows clear button when project selected', async () => {
      renderWithContext(<ProjectSelector />);

      await waitFor(() => {
        expect(screen.getByText('Select Project')).toBeInTheDocument();
      });

      // Select project
      fireEvent.click(screen.getByLabelText('Select project'));
      const projectButton = screen.getByText('Project One').closest('button');
      fireEvent.click(projectButton!);

      await waitFor(() => {
        expect(screen.getByText('Project One')).toBeInTheDocument();
      });

      // Open dropdown again
      fireEvent.click(screen.getByLabelText('Select project'));

      expect(screen.getByText('Clear Selection')).toBeInTheDocument();
    });

    it('does not show clear button when no project selected', async () => {
      renderWithContext(<ProjectSelector />);

      await waitFor(() => {
        expect(screen.getByText('Select Project')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByLabelText('Select project'));

      expect(screen.queryByText('Clear Selection')).not.toBeInTheDocument();
    });

    it('clears selection when clear button clicked', async () => {
      renderWithContext(<ProjectSelector />);

      await waitFor(() => {
        expect(screen.getByText('Select Project')).toBeInTheDocument();
      });

      // Select project
      fireEvent.click(screen.getByLabelText('Select project'));
      const projectButton = screen.getByText('Project One').closest('button');
      fireEvent.click(projectButton!);

      await waitFor(() => {
        expect(screen.getByText('Project One')).toBeInTheDocument();
      });

      // Clear selection
      fireEvent.click(screen.getByLabelText('Select project'));
      const clearButton = screen.getByText('Clear Selection');
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(screen.getByText('Select Project')).toBeInTheDocument();
      });
    });
  });

  describe('LocalStorage Persistence', () => {
    it('persists selected project to localStorage', async () => {
      renderWithContext(<ProjectSelector />);

      await waitFor(() => {
        expect(screen.getByText('Select Project')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByLabelText('Select project'));
      const projectButton = screen.getByText('Project One').closest('button');
      fireEvent.click(projectButton!);

      await waitFor(() => {
        expect(localStorage.getItem('ai-agent-framework:current-project')).toBe(
          'PROJ1',
        );
      });
    });

    it('loads selected project from localStorage on mount', async () => {
      localStorage.setItem('ai-agent-framework:current-project', 'PROJ2');

      renderWithContext(<ProjectSelector />);

      await waitFor(() => {
        expect(screen.getByText('Project Two')).toBeInTheDocument();
      });
    });

    it('removes project from localStorage when cleared', async () => {
      localStorage.setItem('ai-agent-framework:current-project', 'PROJ1');

      renderWithContext(<ProjectSelector />);

      await waitFor(() => {
        expect(screen.getByText('Project One')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByLabelText('Select project'));
      const clearButton = screen.getByText('Clear Selection');
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(
          localStorage.getItem('ai-agent-framework:current-project'),
        ).toBeNull();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes on button', async () => {
      renderWithContext(<ProjectSelector />);

      await waitFor(() => {
        expect(screen.getByText('Select Project')).toBeInTheDocument();
      });

      const button = screen.getByLabelText('Select project');
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button).toHaveAttribute('aria-haspopup', 'listbox');

      fireEvent.click(button);

      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('has proper ARIA attributes on dropdown items', async () => {
      renderWithContext(<ProjectSelector />);

      await waitFor(() => {
        expect(screen.getByText('Select Project')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByLabelText('Select project'));

      const options = screen.getAllByRole('option');
      options.forEach((option) => {
        expect(option).toHaveAttribute('aria-selected');
      });
    });

    it('marks selected item with aria-selected=true', async () => {
      renderWithContext(<ProjectSelector />);

      await waitFor(() => {
        expect(screen.getByText('Select Project')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByLabelText('Select project'));
      const projectButton = screen
        .getAllByText('Project One')[0]
        .closest('button');
      fireEvent.click(projectButton!);

      await waitFor(() => {
        expect(screen.getByText('Project One')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByLabelText('Select project'));

      const dropdownItems = screen.getAllByRole('option');
      const selectedOption = dropdownItems.find(
        (item) =>
          item.textContent?.includes('Project One') &&
          !item.textContent?.includes('Clear'),
      );
      expect(selectedOption).toHaveAttribute('aria-selected', 'true');
    });
  });
});
