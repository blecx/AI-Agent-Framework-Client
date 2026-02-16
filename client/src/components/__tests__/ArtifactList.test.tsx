/**
 * ArtifactList Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ArtifactList } from '../ArtifactList';
import { ArtifactApiClient, type Artifact } from '../../services/ArtifactApiClient';
import { AuditApiClient } from '../../services/AuditApiClient';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string; message?: string }) => {
      if (options?.defaultValue) {
        return options.defaultValue;
      }

      const translations: Record<string, string> = {
        'art.list.loading': 'Loading artifacts...',
        'art.list.title': 'Artifacts',
        'art.list.columns.status': 'Status',
        'art.list.columns.name': 'Name',
        'art.list.columns.type': 'Type',
        'art.list.columns.path': 'Path',
        'art.list.columns.lastModified': 'Last Modified',
        'art.list.groups.aria': 'Artifact explorer groups',
        'art.list.groups.root': 'Root',
        'art.list.search.placeholder': 'Search by artifact name or path...',
        'art.list.search.aria': 'Search artifacts by name or path',
        'art.list.search.clear': 'Clear search',
        'art.list.search.noResults.title': 'No artifacts match your search',
        'art.list.search.noResults.description': 'Try a different name/path or clear the filter.',
        'art.list.actions.createNew': 'Create New Artifact',
        'art.list.actions.createNewAria': 'Create new artifact',
        'art.list.empty.title': 'No artifacts yet',
        'art.list.empty.description': 'Create your first artifact to get started.',
        'art.list.cta.create': 'Create New Artifact',
        'art.list.errors.loadingWithMessage': `Error: ${options?.message ?? ''}`,
      };

      return translations[key] ?? key;
    },
  }),
}));

describe('ArtifactList', () => {
  const mockProjectKey = 'TEST-001';
  const mockArtifacts: Artifact[] = [
    {
      path: 'artifacts/charter.md',
      name: 'charter.md',
      type: 'md',
      versions: [{ version: 'current', date: '2026-01-15T10:00:00Z' }],
    },
    {
      path: 'artifacts/raid.md',
      name: 'raid.md',
      type: 'md',
      versions: [{ version: 'current', date: '2026-01-20T12:00:00Z' }],
    },
    {
      path: 'artifacts/wbs.md',
      name: 'wbs.md',
      type: 'md',
      versions: [{ version: 'current', date: '2026-01-10T08:00:00Z' }],
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(AuditApiClient.prototype, 'getAuditResults').mockResolvedValue({
      projectKey: mockProjectKey,
      timestamp: new Date().toISOString(),
      issues: [],
      summary: {
        errors: 0,
        warnings: 0,
        info: 0,
      },
    });
  });

  it('renders loading state initially', () => {
    vi.spyOn(ArtifactApiClient.prototype, 'listArtifacts').mockResolvedValue([]);

    render(<ArtifactList projectKey={mockProjectKey} />);

    expect(screen.getByText('Loading artifacts...')).toBeInTheDocument();
  });

  it('renders artifact list after successful fetch', async () => {
    vi.spyOn(ArtifactApiClient.prototype, 'listArtifacts').mockResolvedValue(mockArtifacts);

    render(<ArtifactList projectKey={mockProjectKey} />);

    await waitFor(() => {
      expect(screen.getByText('charter.md')).toBeInTheDocument();
    });

    expect(screen.getByText('raid.md')).toBeInTheDocument();
    expect(screen.getByText('wbs.md')).toBeInTheDocument();
    expect(screen.getByText('artifacts')).toBeInTheDocument();
    expect(screen.getByText('artifacts/charter.md')).toBeInTheDocument();
  });

  it('renders empty state when no artifacts exist', async () => {
    vi.spyOn(ArtifactApiClient.prototype, 'listArtifacts').mockResolvedValue([]);

    render(<ArtifactList projectKey={mockProjectKey} />);

    await waitFor(() => {
      expect(screen.getByText(/No artifacts yet/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Create your first artifact to get started./i)
      ).toBeInTheDocument();
    });
  });

  it('renders error state on fetch failure', async () => {
    vi.spyOn(ArtifactApiClient.prototype, 'listArtifacts').mockRejectedValue(new Error('Network error'));

    render(<ArtifactList projectKey={mockProjectKey} />);

    await waitFor(() => {
      expect(screen.getByText(/Error: Network error/i)).toBeInTheDocument();
    });
  });

  it('renders "Create New Artifact" button', async () => {
    vi.spyOn(ArtifactApiClient.prototype, 'listArtifacts').mockResolvedValue(mockArtifacts);

    render(<ArtifactList projectKey={mockProjectKey} />);

    await waitFor(() => {
      expect(screen.getByText('charter.md')).toBeInTheDocument();
    });

    const createButton = screen.getByRole('button', { name: /create new artifact/i });
    expect(createButton).toBeInTheDocument();
  });

  it('calls onCreateNew when "Create New Artifact" is clicked', async () => {
    const mockOnCreateNew = vi.fn();
    vi.spyOn(ArtifactApiClient.prototype, 'listArtifacts').mockResolvedValue(mockArtifacts);

    const user = userEvent.setup();
    render(<ArtifactList projectKey={mockProjectKey} onCreateNew={mockOnCreateNew} />);

    await waitFor(() => {
      expect(screen.getByText('charter.md')).toBeInTheDocument();
    });

    const createButton = screen.getByRole('button', { name: /create new artifact/i });
    await user.click(createButton);

    expect(mockOnCreateNew).toHaveBeenCalledTimes(1);
  });

  it('calls onSelectArtifact when artifact row is clicked', async () => {
    const mockOnSelectArtifact = vi.fn();
    vi.spyOn(ArtifactApiClient.prototype, 'listArtifacts').mockResolvedValue(mockArtifacts);

    const user = userEvent.setup();
    render(<ArtifactList projectKey={mockProjectKey} onSelectArtifact={mockOnSelectArtifact} />);

    await waitFor(() => {
      expect(screen.getByText('charter.md')).toBeInTheDocument();
    });

    const charterRow = screen.getByText('charter.md').closest('tr');
    await user.click(charterRow!);

    expect(mockOnSelectArtifact).toHaveBeenCalledTimes(1);
    expect(mockOnSelectArtifact).toHaveBeenCalledWith(mockArtifacts[0]);
  });

  it('sorts artifacts by name in ascending order by default', async () => {
    vi.spyOn(ArtifactApiClient.prototype, 'listArtifacts').mockResolvedValue(mockArtifacts);

    render(<ArtifactList projectKey={mockProjectKey} />);

    await waitFor(() => {
      expect(screen.getByText('charter.md')).toBeInTheDocument();
    });

    const rows = screen.getAllByRole('row');
    // Skip header row (index 0)
    const artifactNames = rows.slice(1).map(row => within(row).getAllByRole('cell')[1].textContent);
    
    expect(artifactNames).toEqual(['charter.md', 'raid.md', 'wbs.md']);
  });

  it('sorts artifacts by name in descending order when name header clicked twice', async () => {
    vi.spyOn(ArtifactApiClient.prototype, 'listArtifacts').mockResolvedValue(mockArtifacts);

    const user = userEvent.setup();
    render(<ArtifactList projectKey={mockProjectKey} />);

    await waitFor(() => {
      expect(screen.getByText('charter.md')).toBeInTheDocument();
    });

    const nameHeader = screen.getByText(/Name/);
    
    // First click - already sorted asc by default, should toggle to desc
    await user.click(nameHeader);

    const rows = screen.getAllByRole('row');
    const artifactNames = rows.slice(1).map(row => within(row).getAllByRole('cell')[1].textContent);
    
    expect(artifactNames).toEqual(['wbs.md', 'raid.md', 'charter.md']);
  });

  it('sorts artifacts by date when date header is clicked', async () => {
    vi.spyOn(ArtifactApiClient.prototype, 'listArtifacts').mockResolvedValue(mockArtifacts);

    const user = userEvent.setup();
    render(<ArtifactList projectKey={mockProjectKey} />);

    await waitFor(() => {
      expect(screen.getByText('charter.md')).toBeInTheDocument();
    });

    const dateHeader = screen.getByText(/Last Modified/);
    await user.click(dateHeader);

    const rows = screen.getAllByRole('row');
    const artifactNames = rows.slice(1).map(row => within(row).getAllByRole('cell')[1].textContent);
    
    // Sorted by date ascending: wbs (Jan 10) -> charter (Jan 15) -> raid (Jan 20)
    expect(artifactNames).toEqual(['wbs.md', 'charter.md', 'raid.md']);
  });

  it('filters artifacts by search query (name or path)', async () => {
    vi.spyOn(ArtifactApiClient.prototype, 'listArtifacts').mockResolvedValue(mockArtifacts);

    const user = userEvent.setup();
    render(<ArtifactList projectKey={mockProjectKey} />);

    await waitFor(() => {
      expect(screen.getByText('charter.md')).toBeInTheDocument();
    });

    const searchInput = screen.getByRole('searchbox', {
      name: /search artifacts by name or path/i,
    });
    await user.type(searchInput, 'raid');

    expect(screen.getByText('raid.md')).toBeInTheDocument();
    expect(screen.queryByText('charter.md')).not.toBeInTheDocument();
    expect(screen.queryByText('wbs.md')).not.toBeInTheDocument();
  });

  it('groups artifacts by directory path and supports collapsing groups', async () => {
    const groupedArtifacts: Artifact[] = [
      {
        path: 'artifacts/planning/charter.md',
        name: 'charter.md',
        type: 'md',
        versions: [{ version: 'current', date: '2026-01-15T10:00:00Z' }],
      },
      {
        path: 'artifacts/controls/raid.md',
        name: 'raid.md',
        type: 'md',
        versions: [{ version: 'current', date: '2026-01-20T12:00:00Z' }],
      },
    ];

    vi.spyOn(ArtifactApiClient.prototype, 'listArtifacts').mockResolvedValue(groupedArtifacts);

    const user = userEvent.setup();
    render(<ArtifactList projectKey={mockProjectKey} />);

    await waitFor(() => {
      expect(screen.getByText('artifacts/planning')).toBeInTheDocument();
      expect(screen.getByText('artifacts/controls')).toBeInTheDocument();
    });

    const planningToggle = screen.getByRole('button', { name: /artifacts\/planning/i });
    expect(planningToggle).toHaveAttribute('aria-expanded', 'true');
    await user.click(planningToggle);
    expect(planningToggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('shows a no-results state when search has no match', async () => {
    vi.spyOn(ArtifactApiClient.prototype, 'listArtifacts').mockResolvedValue(mockArtifacts);

    const user = userEvent.setup();
    render(<ArtifactList projectKey={mockProjectKey} />);

    await waitFor(() => {
      expect(screen.getByText('charter.md')).toBeInTheDocument();
    });

    const searchInput = screen.getByRole('searchbox', {
      name: /search artifacts by name or path/i,
    });
    await user.type(searchInput, 'does-not-exist');

    expect(screen.getByText('No artifacts match your search')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument();
  });

  it('displays "N/A" for artifacts without version dates', async () => {
    const artifactsWithoutDates: Artifact[] = [
      { path: 'artifacts/test.md', name: 'test.md', type: 'md' },
    ];
    
    vi.spyOn(ArtifactApiClient.prototype, 'listArtifacts').mockResolvedValue(artifactsWithoutDates);

    render(<ArtifactList projectKey={mockProjectKey} />);

    await waitFor(() => {
      expect(screen.getByText('test.md')).toBeInTheDocument();
    });

    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('displays artifact type correctly', async () => {
    vi.spyOn(ArtifactApiClient.prototype, 'listArtifacts').mockResolvedValue(mockArtifacts);

    render(<ArtifactList projectKey={mockProjectKey} />);

    await waitFor(() => {
      expect(screen.getByText('charter.md')).toBeInTheDocument();
    });

    const mdTypes = screen.getAllByText('md');
    expect(mdTypes.length).toBe(3); // All test artifacts are .md files
  });
});
