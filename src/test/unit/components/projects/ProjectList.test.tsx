/**
 * ProjectList Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProjectList } from '../../../../components/projects/ProjectList';
import { ProjectProvider } from '../../../../contexts/ProjectContext';
import type { ProjectInfo } from '../../../../types/api';

const mockProjects: ProjectInfo[] = [
  {
    key: 'PROJ1',
    name: 'Alpha Project',
    description: 'First test project',
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-20T15:30:00Z',
    state: 'Planning',
  },
  {
    key: 'PROJ2',
    name: 'Beta Project',
    description: 'Second test project',
    created_at: '2026-01-10T08:00:00Z',
    updated_at: '2026-01-25T12:00:00Z',
    state: 'In Progress',
  },
  {
    key: 'TEST-GAMMA',
    name: 'Gamma Testing',
    created_at: '2026-01-20T14:00:00Z',
    updated_at: '2026-01-22T09:00:00Z',
  },
];

// Create persistent mock function
const mockListProjects = vi.fn();

// Mock modules with proper constructors
vi.mock('../../../../services/api/client', () => ({
  ApiClient: vi.fn(function (this: any, _config: any) {}),
}));

vi.mock('../../../../services/api/projects', () => ({
  ProjectsService: vi.fn(function (this: any, _apiClient: any) {
    this.listProjects = mockListProjects;
  }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderWithContext(component: React.ReactElement) {
  return render(
    <BrowserRouter>
      <ProjectProvider>{component}</ProjectProvider>
    </BrowserRouter>
  );
}

describe('ProjectList', () => {
  beforeEach(() => {
    localStorage.clear();
    mockListProjects.mockReset();
    mockListProjects.mockResolvedValue(mockProjects);
    mockNavigate.mockReset();
  });

  describe('Loading State', () => {
    it('displays loading state initially', () => {
      renderWithContext(<ProjectList />);
      expect(screen.getByText('Loading projects...')).toBeInTheDocument();
    });

    it('loads and displays projects', async () => {
      renderWithContext(<ProjectList />);

      await waitFor(() => {
        expect(screen.getByText('Alpha Project')).toBeInTheDocument();
      });

      expect(screen.getByText('Beta Project')).toBeInTheDocument();
      expect(screen.getByText('Gamma Testing')).toBeInTheDocument();
      expect(mockListProjects).toHaveBeenCalledOnce();
    });
  });

  describe('Error Handling', () => {
    it('displays error message when loading fails', async () => {
      mockListProjects.mockRejectedValue(new Error('Network error'));
      renderWithContext(<ProjectList />);

      await waitFor(() => {
        expect(screen.getByText(/Error: Network error/)).toBeInTheDocument();
      });
    });

    it('shows retry button on error', async () => {
      mockListProjects.mockRejectedValue(new Error('Network error'));
      renderWithContext(<ProjectList />);

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
    });

    it('retries loading when retry button clicked', async () => {
      mockListProjects.mockRejectedValueOnce(new Error('Network error'));
      mockListProjects.mockResolvedValueOnce(mockProjects);

      renderWithContext(<ProjectList />);

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Retry'));

      await waitFor(() => {
        expect(screen.getByText('Alpha Project')).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('displays empty state when no projects available', async () => {
      mockListProjects.mockResolvedValue([]);
      renderWithContext(<ProjectList />);

      await waitFor(() => {
        expect(screen.getByText('No projects yet')).toBeInTheDocument();
      });

      expect(
        screen.getByText('Create your first project to get started')
      ).toBeInTheDocument();
    });
  });

  describe('Project Display', () => {
    it('displays project cards with all information', async () => {
      renderWithContext(<ProjectList />);

      await waitFor(() => {
        expect(screen.getByText('Alpha Project')).toBeInTheDocument();
      });

      // Check project key
      expect(screen.getByText('PROJ1')).toBeInTheDocument();
      // Check description
      expect(screen.getByText('First test project')).toBeInTheDocument();
      // Check state
      expect(screen.getByText('Planning')).toBeInTheDocument();
    });

    it('displays project without description', async () => {
      renderWithContext(<ProjectList />);

      await waitFor(() => {
        expect(screen.getByText('Gamma Testing')).toBeInTheDocument();
      });

      // Should have key
      expect(screen.getByText('TEST-GAMMA')).toBeInTheDocument();
    });

    it('displays project count', async () => {
      renderWithContext(<ProjectList />);

      await waitFor(() => {
        expect(screen.getByText('3 projects')).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('filters projects by name', async () => {
      renderWithContext(<ProjectList />);

      await waitFor(() => {
        expect(screen.getByText('Alpha Project')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(
        /Search projects by name, key, or description.../
      );
      fireEvent.change(searchInput, { target: { value: 'alpha' } });

      expect(screen.getByText('Alpha Project')).toBeInTheDocument();
      expect(screen.queryByText('Beta Project')).not.toBeInTheDocument();
    });

    it('filters projects by key', async () => {
      renderWithContext(<ProjectList />);

      await waitFor(() => {
        expect(screen.getByText('Alpha Project')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(
        /Search projects by name, key, or description.../
      );
      fireEvent.change(searchInput, { target: { value: 'TEST-GAMMA' } });

      expect(screen.getByText('Gamma Testing')).toBeInTheDocument();
      expect(screen.queryByText('Alpha Project')).not.toBeInTheDocument();
    });

    it('filters projects by description', async () => {
      renderWithContext(<ProjectList />);

      await waitFor(() => {
        expect(screen.getByText('Alpha Project')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(
        /Search projects by name, key, or description.../
      );
      fireEvent.change(searchInput, { target: { value: 'second test' } });

      expect(screen.getByText('Beta Project')).toBeInTheDocument();
      expect(screen.queryByText('Alpha Project')).not.toBeInTheDocument();
    });

    it('shows clear search button when search active', async () => {
      renderWithContext(<ProjectList />);

      await waitFor(() => {
        expect(screen.getByText('Alpha Project')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(
        /Search projects by name, key, or description.../
      );
      fireEvent.change(searchInput, { target: { value: 'alpha' } });

      const clearButtons = screen.getAllByLabelText('Clear search');
      expect(clearButtons.length).toBeGreaterThan(0);
    });

    it('clears search when clear button clicked', async () => {
      renderWithContext(<ProjectList />);

      await waitFor(() => {
        expect(screen.getByText('Alpha Project')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(
        /Search projects by name, key, or description.../
      ) as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'alpha' } });

      const clearButton = screen.getAllByLabelText('Clear search')[0];
      fireEvent.click(clearButton);

      expect(searchInput.value).toBe('');
      expect(screen.getByText('Beta Project')).toBeInTheDocument();
    });

    it('shows empty search result message', async () => {
      renderWithContext(<ProjectList />);

      await waitFor(() => {
        expect(screen.getByText('Alpha Project')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(
        /Search projects by name, key, or description.../
      );
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      expect(screen.getByText(/No projects match your search "nonexistent"/)).toBeInTheDocument();
    });

    it('updates project count when filtering', async () => {
      renderWithContext(<ProjectList />);

      await waitFor(() => {
        expect(screen.getByText('3 projects')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(
        /Search projects by name, key, or description.../
      );
      fireEvent.change(searchInput, { target: { value: 'project' } });

      expect(screen.getByText('Showing 2 of 3 projects')).toBeInTheDocument();
    });
  });

  describe('Sorting Functionality', () => {
    it('sorts projects by name ascending by default', async () => {
      renderWithContext(<ProjectList />);

      await waitFor(() => {
        expect(screen.getByText('Alpha Project')).toBeInTheDocument();
      });

      const projectCards = document.querySelectorAll('.project-card');
      const firstProjectName = projectCards[0].querySelector('.project-name')?.textContent;

      expect(firstProjectName).toBe('Alpha Project');
    });

    it('sorts projects by name descending when clicked twice', async () => {
      renderWithContext(<ProjectList />);

      await waitFor(() => {
        expect(screen.getByText('Alpha Project')).toBeInTheDocument();
      });

      const nameButton = screen.getByText(/Name/);
      fireEvent.click(nameButton);

      await waitFor(() => {
        const projectCards = screen.getAllByRole('button');
        const firstCard = projectCards.find((card) => card.classList.contains('project-card'));
        expect(firstCard?.textContent).toContain('Gamma Testing');
      });
    });

    it('sorts projects by key', async () => {
      renderWithContext(<ProjectList />);

      await waitFor(() => {
        expect(screen.getByText('Alpha Project')).toBeInTheDocument();
      });

      const keyButton = screen.getByText(/^Key/);
      fireEvent.click(keyButton);

      await waitFor(() => {
        const projectCards = screen.getAllByRole('button');
        const firstCard = projectCards.find((card) => card.classList.contains('project-card'));
        expect(firstCard?.textContent).toContain('PROJ1');
      });
    });

    it('shows sort direction indicator', async () => {
      renderWithContext(<ProjectList />);

      await waitFor(() => {
        expect(screen.getByText('Alpha Project')).toBeInTheDocument();
      });

      expect(screen.getByText(/Name ↑/)).toBeInTheDocument();
    });
  });

  describe('View Mode', () => {
    it('defaults to grid view', async () => {
      renderWithContext(<ProjectList />);

      await waitFor(() => {
        expect(screen.getByText('Alpha Project')).toBeInTheDocument();
      });

      const container = document.querySelector('.projects-grid');
      expect(container).toBeInTheDocument();
    });

    it('switches to list view when list button clicked', async () => {
      renderWithContext(<ProjectList />);

      await waitFor(() => {
        expect(screen.getByText('Alpha Project')).toBeInTheDocument();
      });

      const listButton = screen.getByLabelText('List view');
      fireEvent.click(listButton);

      const container = document.querySelector('.projects-list');
      expect(container).toBeInTheDocument();
    });

    it('switches back to grid view', async () => {
      renderWithContext(<ProjectList />);

      await waitFor(() => {
        expect(screen.getByText('Alpha Project')).toBeInTheDocument();
      });

      const listButton = screen.getByLabelText('List view');
      fireEvent.click(listButton);

      const gridButton = screen.getByLabelText('Grid view');
      fireEvent.click(gridButton);

      const container = document.querySelector('.projects-grid');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Project Interaction', () => {
    it('navigates to project when clicked', async () => {
      renderWithContext(<ProjectList />);

      await waitFor(() => {
        expect(screen.getByText('Alpha Project')).toBeInTheDocument();
      });

      const projectCard = screen.getByText('Alpha Project').closest('div[role="button"]');
      fireEvent.click(projectCard!);

      expect(mockNavigate).toHaveBeenCalledWith('/projects/PROJ1');
    });

    it('navigates to project on Enter key', async () => {
      renderWithContext(<ProjectList />);

      await waitFor(() => {
        expect(screen.getByText('Alpha Project')).toBeInTheDocument();
      });

      const projectCard = screen.getByText('Alpha Project').closest('div[role="button"]');
      fireEvent.keyDown(projectCard!, { key: 'Enter' });

      expect(mockNavigate).toHaveBeenCalledWith('/projects/PROJ1');
    });

    it('navigates to project on Space key', async () => {
      renderWithContext(<ProjectList />);

      await waitFor(() => {
        expect(screen.getByText('Alpha Project')).toBeInTheDocument();
      });

      const projectCard = screen.getByText('Alpha Project').closest('div[role="button"]');
      fireEvent.keyDown(projectCard!, { key: ' ' });

      expect(mockNavigate).toHaveBeenCalledWith('/projects/PROJ1');
    });
  });

  describe('Create Project', () => {
    it('shows create project button in header', async () => {
      renderWithContext(<ProjectList />);

      await waitFor(() => {
        expect(screen.getByText('Alpha Project')).toBeInTheDocument();
      });

      const createButtons = screen.getAllByText('+ Create Project');
      expect(createButtons[0]).toBeInTheDocument();
    });

    it('navigates to create project page when button clicked', async () => {
      renderWithContext(<ProjectList />);

      await waitFor(() => {
        expect(screen.getByText('Alpha Project')).toBeInTheDocument();
      });

      const createButton = screen.getAllByText('+ Create Project')[0];
      fireEvent.click(createButton);

      expect(mockNavigate).toHaveBeenCalledWith('/projects/new');
    });

    it('shows create button in empty state', async () => {
      mockListProjects.mockResolvedValue([]);
      renderWithContext(<ProjectList />);

      await waitFor(() => {
        expect(screen.getByText('No projects yet')).toBeInTheDocument();
      });

      const createButton = document.querySelector('.btn-create-first');
      expect(createButton).toBeInTheDocument();
      fireEvent.click(createButton!);

      expect(mockNavigate).toHaveBeenCalledWith('/projects/new');
    });
  });

  describe('Accessibility', () => {
    it('has accessible search input', async () => {
      renderWithContext(<ProjectList />);

      await waitFor(() => {
        expect(screen.getByText('Alpha Project')).toBeInTheDocument();
      });

      const searchInput = screen.getByLabelText('Search projects');
      expect(searchInput).toBeInTheDocument();
    });

    it('project cards are keyboard accessible', async () => {
      renderWithContext(<ProjectList />);

      await waitFor(() => {
        expect(screen.getByText('Alpha Project')).toBeInTheDocument();
      });

      const projectCard = screen.getByText('Alpha Project').closest('div[role="button"]');
      expect(projectCard).toHaveAttribute('tabIndex', '0');
    });
  });
});
