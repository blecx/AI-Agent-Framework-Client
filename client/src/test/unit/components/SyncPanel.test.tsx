import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SyncPanel from '../../../components/SyncPanel';
import type { SyncConflict, SyncState } from '../../../types/sync';

const mockSetDemoState = vi.fn();
const mockUseSyncStatus = vi.fn(() => ({
  status: { state: 'clean' as SyncState, localCommits: 0, remoteCommits: 0 },
  conflicts: [] as SyncConflict[],
  events: [],
  availableStates: ['clean', 'ahead', 'behind', 'diverged', 'running', 'failed', 'conflict'] as SyncState[],
  setDemoState: mockSetDemoState,
}));

vi.mock('../../../hooks/useSyncStatus', () => ({
  useSyncStatus: () => mockUseSyncStatus(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string | number>) => {
      const translations: Record<string, string> = {
        'sync.title': 'Sync',
        'sync.state.clean': 'In sync',
        'sync.state.ahead': 'Ahead',
        'sync.state.behind': 'Behind',
        'sync.state.diverged': 'Diverged',
        'sync.state.running': 'Syncing…',
        'sync.state.failed': 'Sync failed',
        'sync.state.conflict': 'Conflict',
        'sync.action.syncNow': 'Sync now',
        'sync.action.viewHistory': 'View history',
        'sync.description.clean': 'No changes pending. Everything is up to date.',
        'sync.feedback.syncRequested': 'Sync requested (mock).',
        'sync.demo.title': 'Demo states',
      };
      if (key === 'sync.conflict.title') {
        return `Resolve conflict: ${options?.file ?? ''}`;
      }
      if (key === 'sync.description.ahead') {
        return `You have ${options?.count ?? 0} local change(s) not synced yet.`;
      }
      return translations[key] ?? key;
    },
  }),
}));

describe('SyncPanel', () => {
  it('renders sync state and actions', () => {
    render(
      <MemoryRouter initialEntries={['/projects/TEST-1/sync']}>
        <Routes>
          <Route path="/projects/:projectKey/sync" element={<SyncPanel />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Sync')).toBeInTheDocument();
    expect(screen.getByText('In sync')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sync now' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View history' })).toBeInTheDocument();
  });

  it('allows switching demo states', () => {
    render(
      <MemoryRouter initialEntries={['/projects/TEST-1/sync']}>
        <Routes>
          <Route path="/projects/:projectKey/sync" element={<SyncPanel />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /Ahead/i }));
    expect(mockSetDemoState).toHaveBeenCalledWith('ahead');
  });

  it('shows conflict resolver when state is conflict', () => {
    mockUseSyncStatus.mockReturnValueOnce({
      status: { state: 'conflict', localCommits: 1, remoteCommits: 1 },
      conflicts: [
        {
          file: 'charter.md',
          localContent: 'local content',
          remoteContent: 'remote content',
        },
      ],
      events: [],
      availableStates: ['clean', 'ahead', 'behind', 'diverged', 'running', 'failed', 'conflict'],
      setDemoState: mockSetDemoState,
    });

    render(
      <MemoryRouter initialEntries={['/projects/TEST-1/sync']}>
        <Routes>
          <Route path="/projects/:projectKey/sync" element={<SyncPanel />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText(/Resolve conflict:/i)).toBeInTheDocument();
  });
});
