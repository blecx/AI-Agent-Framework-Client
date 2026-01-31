/**
 * ProjectDashboard Tests
 * Comprehensive test suite for the dashboard component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProjectDashboard } from '../../../../components/projects/ProjectDashboard';
import {
  ProjectsService,
  RAIDService,
  WorkflowService,
  AuditService,
} from '../../../../services/api';
import { ApiClient } from '../../../../services/api/client';
import {
  ProjectInfo,
  RAIDType,
  RAIDStatus,
  WorkflowStateEnum,
} from '../../../../types/api';

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock project context
const mockSetCurrentProjectKey = vi.fn();
let mockCurrentProjectKey = 'PROJ1';
vi.mock('../../../../contexts/ProjectContext', () => ({
  useProject: () => ({
    currentProjectKey: mockCurrentProjectKey,
    setCurrentProjectKey: mockSetCurrentProjectKey,
  }),
}));

// Mock services
const mockGetProject = vi.fn();
const mockGetWorkflowState = vi.fn();
const mockListRAIDItems = vi.fn();
const mockGetAuditEvents = vi.fn();

vi.mock('../../../../services/api/client');
vi.mock('../../../../services/api/projects');
vi.mock('../../../../services/api/raid');
vi.mock('../../../../services/api/workflow');
vi.mock('../../../../services/api/audit');

// Mock data
const mockProject: ProjectInfo = {
  key: 'PROJ1',
  name: 'Test Project',
  description: 'Test project description',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-31T00:00:00Z',
  state: 'Planning',
};

const mockWorkflowState = {
  project_key: 'PROJ1',
  current_state: WorkflowStateEnum.PLANNING,
  allowed_transitions: [WorkflowStateEnum.EXECUTING],
  updated_at: '2026-01-31T12:00:00Z',
};

const mockRAIDItems = {
  items: [
    {
      id: '1',
      project_key: 'PROJ1',
      type: RAIDType.RISK,
      title: 'Risk 1',
      description: 'Test risk',
      status: RAIDStatus.OPEN,
      priority: 'High' as any,
      created_at: '2026-01-30T00:00:00Z',
      updated_at: '2026-01-30T00:00:00Z',
    },
    {
      id: '2',
      project_key: 'PROJ1',
      type: RAIDType.ISSUE,
      title: 'Issue 1',
      description: 'Test issue',
      status: RAIDStatus.IN_PROGRESS,
      priority: 'Medium' as any,
      created_at: '2026-01-29T00:00:00Z',
      updated_at: '2026-01-29T00:00:00Z',
    },
  ],
  total: 2,
};

const mockAuditEvents = {
  events: [
    {
      event_id: '1',
      timestamp: '2026-01-31T10:00:00Z',
      event_type: 'project.created',
      actor: 'user@example.com',
      project_key: 'PROJ1',
      payload_summary: 'Project created',
    },
    {
      event_id: '2',
      timestamp: '2026-01-31T11:00:00Z',
      event_type: 'raid.created',
      actor: 'user@example.com',
      project_key: 'PROJ1',
      payload_summary: 'RAID item created',
    },
  ],
  total: 2,
};

// Test helper
const renderWithContext = (
  ui: React.ReactElement,
  projectKey: string = 'PROJ1',
) => {
  mockCurrentProjectKey = projectKey;
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('ProjectDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();

    // Setup mock constructors
    (ApiClient as any).mockImplementation(function (this: any) {
      return {};
    });

    (ProjectsService as any).mockImplementation(function (this: any) {
      this.getProject = mockGetProject;
      return this;
    });

    (RAIDService as any).mockImplementation(function (this: any) {
      this.listRAIDItems = mockListRAIDItems;
      return this;
    });

    (WorkflowService as any).mockImplementation(function (this: any) {
      this.getWorkflowState = mockGetWorkflowState;
      return this;
    });

    (AuditService as any).mockImplementation(function (this: any) {
      this.getAuditEvents = mockGetAuditEvents;
      return this;
    });

    // Default mock responses
    mockGetProject.mockResolvedValue(mockProject);
    mockGetWorkflowState.mockResolvedValue(mockWorkflowState);
    mockListRAIDItems.mockResolvedValue(mockRAIDItems);
    mockGetAuditEvents.mockResolvedValue(mockAuditEvents);
  });

  describe('Initial Rendering', () => {
    it('shows loading state initially', () => {
      renderWithContext(<ProjectDashboard />);

      expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
    });

    it('redirects to project list when no project selected', () => {
      renderWithContext(<ProjectDashboard />, '');

      expect(mockNavigate).toHaveBeenCalledWith('/projects');
    });

    it('loads dashboard data on mount', async () => {
      renderWithContext(<ProjectDashboard />);

      await waitFor(() => {
        expect(mockGetProject).toHaveBeenCalledWith('PROJ1');
        expect(mockGetWorkflowState).toHaveBeenCalledWith('PROJ1');
        expect(mockListRAIDItems).toHaveBeenCalledWith('PROJ1');
        expect(mockGetAuditEvents).toHaveBeenCalledWith('PROJ1', { limit: 10 });
      });
    });
  });

  describe('Project Information Display', () => {
    it('displays project name and key', async () => {
      renderWithContext(<ProjectDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Test Project')).toBeInTheDocument();
        expect(screen.getByText('PROJ1')).toBeInTheDocument();
      });
    });

    it('displays project description when available', async () => {
      renderWithContext(<ProjectDashboard />);

      await waitFor(() => {
        expect(
          screen.getByText('Test project description'),
        ).toBeInTheDocument();
      });
    });

    it('does not show description section when not available', async () => {
      mockGetProject.mockResolvedValue({
        ...mockProject,
        description: undefined,
      });

      renderWithContext(<ProjectDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Test Project')).toBeInTheDocument();
      });

      expect(
        screen.queryByText('Test project description'),
      ).not.toBeInTheDocument();
    });
  });

  describe('Workflow State Section', () => {
    it('displays current workflow state', async () => {
      renderWithContext(<ProjectDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Planning')).toBeInTheDocument();
      });
    });

    it('shows allowed transitions', async () => {
      renderWithContext(<ProjectDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Allowed transitions:/)).toBeInTheDocument();
        expect(screen.getByText(/Executing/)).toBeInTheDocument();
      });
    });

    it('navigates to workflow page when transition button clicked', async () => {
      renderWithContext(<ProjectDashboard />);

      await waitFor(() => {
        const button = screen.getByText('Transition State');
        button.click();
      });

      expect(mockNavigate).toHaveBeenCalledWith('/projects/PROJ1/workflow');
    });

    it('shows empty state when workflow data unavailable', async () => {
      mockGetWorkflowState.mockResolvedValue(null);

      renderWithContext(<ProjectDashboard />);

      await waitFor(() => {
        expect(
          screen.getByText('No workflow state available'),
        ).toBeInTheDocument();
      });
    });
  });

  describe('RAID Summary Section', () => {
    it('displays total RAID items count', async () => {
      renderWithContext(<ProjectDashboard />);

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('Total Items')).toBeInTheDocument();
      });
    });

    it('displays RAID items by type', async () => {
      renderWithContext(<ProjectDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Risk')).toBeInTheDocument();
        expect(screen.getByText('Issue')).toBeInTheDocument();
      });
    });

    it('displays RAID items by status', async () => {
      renderWithContext(<ProjectDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Open')).toBeInTheDocument();
        expect(screen.getByText('In Progress')).toBeInTheDocument();
      });
    });

    it('navigates to RAID page when view all button clicked', async () => {
      renderWithContext(<ProjectDashboard />);

      await waitFor(() => {
        const button = screen.getByText('View All RAID Items');
        button.click();
      });

      expect(mockNavigate).toHaveBeenCalledWith('/projects/PROJ1/raid');
    });

    it('shows empty state with add button when no RAID items', async () => {
      mockListRAIDItems.mockResolvedValue({ items: [], total: 0 });

      renderWithContext(<ProjectDashboard />);

      await waitFor(() => {
        expect(screen.getByText('No RAID items yet')).toBeInTheDocument();
      });

      const addButtons = screen.getAllByText('Add RAID Item');
      // Should have buttons in both empty state and quick actions
      expect(addButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Recent Activity Section', () => {
    it('displays recent audit events', async () => {
      renderWithContext(<ProjectDashboard />);

      await waitFor(() => {
        expect(screen.getByText('project.created')).toBeInTheDocument();
        expect(screen.getByText('raid.created')).toBeInTheDocument();
      });
    });

    it('displays event actors', async () => {
      renderWithContext(<ProjectDashboard />);

      await waitFor(() => {
        const actors = screen.getAllByText('user@example.com');
        expect(actors.length).toBeGreaterThan(0);
      });
    });

    it('displays event summaries', async () => {
      renderWithContext(<ProjectDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Project created')).toBeInTheDocument();
        expect(screen.getByText('RAID item created')).toBeInTheDocument();
      });
    });

    it('shows empty state when no activity', async () => {
      mockGetAuditEvents.mockResolvedValue({ events: [], total: 0 });

      renderWithContext(<ProjectDashboard />);

      await waitFor(() => {
        expect(screen.getByText('No recent activity')).toBeInTheDocument();
      });
    });
  });

  describe('Quick Actions', () => {
    it('renders all quick action buttons', async () => {
      renderWithContext(<ProjectDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      });

      const addRaidButtons = screen.getAllByText('Add RAID Item');
      expect(addRaidButtons.length).toBeGreaterThan(0);

      expect(screen.getByText('Transition Workflow')).toBeInTheDocument();
      expect(screen.getByText('View Audit Log')).toBeInTheDocument();
    });

    it('navigates to RAID page from quick action', async () => {
      renderWithContext(<ProjectDashboard />);

      await waitFor(() => {
        const buttons = screen.getAllByText('Add RAID Item');
        // Click the quick action button (last one in quick actions section)
        buttons[buttons.length - 1].click();
      });

      expect(mockNavigate).toHaveBeenCalledWith('/projects/PROJ1/raid');
    });

    it('navigates to workflow page from quick action', async () => {
      renderWithContext(<ProjectDashboard />);

      await waitFor(() => {
        const button = screen.getByText('Transition Workflow');
        button.click();
      });

      expect(mockNavigate).toHaveBeenCalledWith('/projects/PROJ1/workflow');
    });

    it('navigates to audit page from quick action', async () => {
      renderWithContext(<ProjectDashboard />);

      await waitFor(() => {
        const button = screen.getByText('View Audit Log');
        button.click();
      });

      expect(mockNavigate).toHaveBeenCalledWith('/projects/PROJ1/audit');
    });
  });

  describe('Error Handling', () => {
    it('displays error message when project load fails', async () => {
      mockGetProject.mockRejectedValue(new Error('Failed to load project'));

      renderWithContext(<ProjectDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load project')).toBeInTheDocument();
      });
    });

    it('shows retry button on error', async () => {
      mockGetProject.mockRejectedValue(new Error('Network error'));

      renderWithContext(<ProjectDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
    });

    it('retries loading data when retry button clicked', async () => {
      mockGetProject.mockRejectedValueOnce(new Error('Network error'));
      mockGetProject.mockResolvedValueOnce(mockProject);

      renderWithContext(<ProjectDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });

      const retryButton = screen.getByText('Retry');
      retryButton.click();

      await waitFor(() => {
        expect(mockGetProject).toHaveBeenCalledTimes(2);
      });
    });

    it('continues loading when optional services fail', async () => {
      mockGetWorkflowState.mockRejectedValue(new Error('Workflow unavailable'));
      mockListRAIDItems.mockRejectedValue(new Error('RAID unavailable'));

      renderWithContext(<ProjectDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Test Project')).toBeInTheDocument();
        expect(
          screen.getByText('No workflow state available'),
        ).toBeInTheDocument();
        expect(screen.getByText('No RAID items yet')).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading', () => {
    it('loads all services in parallel', async () => {
      renderWithContext(<ProjectDashboard />);

      await waitFor(() => {
        expect(mockGetProject).toHaveBeenCalled();
        expect(mockGetWorkflowState).toHaveBeenCalled();
        expect(mockListRAIDItems).toHaveBeenCalled();
        expect(mockGetAuditEvents).toHaveBeenCalled();
      });
    });

    it('correctly calculates RAID summary counts', async () => {
      const customRAIDItems = {
        items: [
          {
            ...mockRAIDItems.items[0],
            type: RAIDType.RISK,
            status: RAIDStatus.OPEN,
          },
          {
            ...mockRAIDItems.items[1],
            type: RAIDType.RISK,
            status: RAIDStatus.OPEN,
          },
          {
            ...mockRAIDItems.items[0],
            id: '3',
            type: RAIDType.ISSUE,
            status: RAIDStatus.CLOSED,
          },
        ],
        total: 3,
      };

      mockListRAIDItems.mockResolvedValue(customRAIDItems);

      renderWithContext(<ProjectDashboard />);

      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument(); // Total
      });
    });
  });
});
