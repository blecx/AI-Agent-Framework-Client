import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import ProjectList from '../ProjectList';

const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();
const mockListProjects = vi.fn();
const mockCreateProject = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string>) => {
      const map: Record<string, string> = {
        'projects.list.title': 'Projects',
        'projects.list.cta.new': 'New project',
        'projects.create.cta.cancel': 'Cancel',
        'projects.create.cta.create': 'Create project',
        'projects.create.title': 'Create project',
        'projects.create.form.keyLabel': 'Project key *',
        'projects.create.form.keyPlaceholder': 'e.g., my-project',
        'projects.create.form.keyHelp': 'Unique identifier',
        'projects.create.form.nameLabel': 'Project name *',
        'projects.create.form.namePlaceholder': 'e.g., My Project',
        'projects.create.form.descriptionLabel': 'Description',
        'projects.create.form.descriptionPlaceholder': 'Optional project description',
        'projects.create.errors.requiredKeyAndName': 'Project key and name are required',
        'projects.list.errors.create': 'Failed to create project',
        'projects.list.errors.load': 'Failed to load projects',
        'projects.list.toast.created': 'Project created successfully!',
        'projects.list.toast.createFailed': `Failed to create project: ${options?.message ?? ''}`,
        'projects.list.empty.title': 'No projects yet',
        'projects.list.empty.text': 'Create a project',
        'table.search': 'Search',
        'projects.list.table.searchPlaceholder': 'Search projects',
        'projects.list.meta.key': 'Key',
        'projects.list.table.name': 'Name',
        'projects.list.table.description': 'Description',
        'projects.list.meta.created': 'Created',
        'projects.list.table.branch': 'Branch',
      };
      return map[key] ?? key;
    },
  }),
}));

vi.mock('../../hooks/useToast', () => ({
  useToast: () => ({
    showSuccess: mockShowSuccess,
    showError: mockShowError,
  }),
}));

vi.mock('../../services/apiClient', () => ({
  default: {
    listProjects: (...args: unknown[]) => mockListProjects(...args),
    createProject: (...args: unknown[]) => mockCreateProject(...args),
  },
}));

vi.mock('../DataTable', () => ({
  default: () => <div data-testid="projects-table" />,
}));

function renderProjectList() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ProjectList />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('ProjectList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListProjects.mockResolvedValue({ success: true, data: [] });
  });

  it('includes optional description field in create form', async () => {
    const user = userEvent.setup();
    renderProjectList();

    const openCreateButton = await screen.findByRole('button', {
      name: 'New project',
    });
    await user.click(openCreateButton);

    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  it('sends description when provided and falls back without description if backend rejects it', async () => {
    const user = userEvent.setup();

    mockCreateProject
      .mockResolvedValueOnce({
        success: false,
        error: 'Backend does not accept description field',
      })
      .mockResolvedValueOnce({
        success: true,
        data: {
          key: 'TEST-204',
          name: 'Issue 204',
          createdAt: '2026-02-16T00:00:00Z',
          updatedAt: '2026-02-16T00:00:00Z',
        },
      });

    renderProjectList();

    const openCreateButton = await screen.findByRole('button', {
      name: 'New project',
    });
    await user.click(openCreateButton);
    await user.type(screen.getByLabelText('Project key *'), 'TEST-204');
    await user.type(screen.getByLabelText('Project name *'), 'Issue 204');
    await user.type(screen.getByLabelText('Description'), 'Optional summary');
    await user.click(screen.getByRole('button', { name: 'Create project' }));

    await waitFor(() => {
      expect(mockCreateProject).toHaveBeenCalledTimes(2);
    });

    expect(mockCreateProject).toHaveBeenNthCalledWith(
      1,
      'TEST-204',
      'Issue 204',
      'Optional summary',
    );
    expect(mockCreateProject).toHaveBeenNthCalledWith(2, 'TEST-204', 'Issue 204');
    expect(mockShowSuccess).toHaveBeenCalledWith('Project created successfully!');
  });
});
