/**
 * ArtifactList Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ArtifactList } from '../ArtifactList';
import { ArtifactApiClient, type Artifact } from '../../services/ArtifactApiClient';

vi.mock('../../services/ArtifactApiClient');

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
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    const mockListArtifacts = vi.fn(() => new Promise(() => {})); // Never resolves
    vi.mocked(ArtifactApiClient).mockImplementation(() => ({
      listArtifacts: mockListArtifacts,
      getArtifact: vi.fn(),
    } as unknown as ArtifactApiClient));

    render(<ArtifactList projectKey={mockProjectKey} />);

    expect(screen.getByText('Loading artifacts...')).toBeInTheDocument();
  });

  it('renders artifact list after successful fetch', async () => {
    const mockListArtifacts = vi.fn().mockResolvedValue(mockArtifacts);
    vi.mocked(ArtifactApiClient).mockImplementation(() => ({
      listArtifacts: mockListArtifacts,
      getArtifact: vi.fn(),
    } as unknown as ArtifactApiClient));

    render(<ArtifactList projectKey={mockProjectKey} />);

    await waitFor(() => {
      expect(screen.getByText('charter.md')).toBeInTheDocument();
    });

    expect(screen.getByText('raid.md')).toBeInTheDocument();
    expect(screen.getByText('wbs.md')).toBeInTheDocument();
  });

  it('renders empty state when no artifacts exist', async () => {
    const mockListArtifacts = vi.fn().mockResolvedValue([]);
    vi.mocked(ArtifactApiClient).mockImplementation(() => ({
      listArtifacts: mockListArtifacts,
      getArtifact: vi.fn(),
    } as unknown as ArtifactApiClient));

    render(<ArtifactList projectKey={mockProjectKey} />);

    await waitFor(() => {
      expect(
        screen.getByText(/No artifacts yet. Create your first artifact to get started./i)
      ).toBeInTheDocument();
    });
  });

  it('renders error state on fetch failure', async () => {
    const mockListArtifacts = vi.fn().mockRejectedValue(new Error('Network error'));
    vi.mocked(ArtifactApiClient).mockImplementation(() => ({
      listArtifacts: mockListArtifacts,
      getArtifact: vi.fn(),
    } as unknown as ArtifactApiClient));

    render(<ArtifactList projectKey={mockProjectKey} />);

    await waitFor(() => {
      expect(screen.getByText(/Error: Network error/i)).toBeInTheDocument();
    });
  });

  it('renders "Create New Artifact" button', async () => {
    const mockListArtifacts = vi.fn().mockResolvedValue(mockArtifacts);
    vi.mocked(ArtifactApiClient).mockImplementation(() => ({
      listArtifacts: mockListArtifacts,
      getArtifact: vi.fn(),
    } as unknown as ArtifactApiClient));

    render(<ArtifactList projectKey={mockProjectKey} />);

    await waitFor(() => {
      expect(screen.getByText('charter.md')).toBeInTheDocument();
    });

    const createButton = screen.getByRole('button', { name: /create new artifact/i });
    expect(createButton).toBeInTheDocument();
  });

  it('calls onCreateNew when "Create New Artifact" is clicked', async () => {
    const mockOnCreateNew = vi.fn();
    const mockListArtifacts = vi.fn().mockResolvedValue(mockArtifacts);
    vi.mocked(ArtifactApiClient).mockImplementation(() => ({
      listArtifacts: mockListArtifacts,
      getArtifact: vi.fn(),
    } as unknown as ArtifactApiClient));

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
    const mockListArtifacts = vi.fn().mockResolvedValue(mockArtifacts);
    vi.mocked(ArtifactApiClient).mockImplementation(() => ({
      listArtifacts: mockListArtifacts,
      getArtifact: vi.fn(),
    } as unknown as ArtifactApiClient));

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
    const mockListArtifacts = vi.fn().mockResolvedValue(mockArtifacts);
    vi.mocked(ArtifactApiClient).mockImplementation(() => ({
      listArtifacts: mockListArtifacts,
      getArtifact: vi.fn(),
    } as unknown as ArtifactApiClient));

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
    const mockListArtifacts = vi.fn().mockResolvedValue(mockArtifacts);
    vi.mocked(ArtifactApiClient).mockImplementation(() => ({
      listArtifacts: mockListArtifacts,
      getArtifact: vi.fn(),
    } as unknown as ArtifactApiClient));

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
    const mockListArtifacts = vi.fn().mockResolvedValue(mockArtifacts);
    vi.mocked(ArtifactApiClient).mockImplementation(() => ({
      listArtifacts: mockListArtifacts,
      getArtifact: vi.fn(),
    } as unknown as ArtifactApiClient));

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

  it('displays "N/A" for artifacts without version dates', async () => {
    const artifactsWithoutDates: Artifact[] = [
      { path: 'artifacts/test.md', name: 'test.md', type: 'md' },
    ];
    
    const mockListArtifacts = vi.fn().mockResolvedValue(artifactsWithoutDates);
    vi.mocked(ArtifactApiClient).mockImplementation(() => ({
      listArtifacts: mockListArtifacts,
      getArtifact: vi.fn(),
    } as unknown as ArtifactApiClient));

    render(<ArtifactList projectKey={mockProjectKey} />);

    await waitFor(() => {
      expect(screen.getByText('test.md')).toBeInTheDocument();
    });

    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('displays artifact type correctly', async () => {
    const mockListArtifacts = vi.fn().mockResolvedValue(mockArtifacts);
    vi.mocked(ArtifactApiClient).mockImplementation(() => ({
      listArtifacts: mockListArtifacts,
      getArtifact: vi.fn(),
    } as unknown as ArtifactApiClient));

    render(<ArtifactList projectKey={mockProjectKey} />);

    await waitFor(() => {
      expect(screen.getByText('charter.md')).toBeInTheDocument();
    });

    const mdTypes = screen.getAllByText('md');
    expect(mdTypes.length).toBe(3); // All test artifacts are .md files
  });
});
