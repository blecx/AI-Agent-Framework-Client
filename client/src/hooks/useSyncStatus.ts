import { useMemo, useState } from 'react';
import type {
  SyncConflict,
  SyncEvent,
  SyncState,
  SyncStatus,
} from '../types/sync';

const SYNC_STATES: SyncState[] = [
  'clean',
  'ahead',
  'behind',
  'diverged',
  'running',
  'failed',
  'conflict',
];

const MOCK_BY_STATE: Record<SyncState, SyncStatus> = {
  clean: { state: 'clean', localCommits: 0, remoteCommits: 0, lastSync: new Date() },
  ahead: { state: 'ahead', localCommits: 2, remoteCommits: 0, lastSync: new Date() },
  behind: { state: 'behind', localCommits: 0, remoteCommits: 3, lastSync: new Date() },
  diverged: { state: 'diverged', localCommits: 2, remoteCommits: 1, lastSync: new Date() },
  running: { state: 'running', localCommits: 0, remoteCommits: 0, lastSync: new Date() },
  failed: {
    state: 'failed',
    localCommits: 1,
    remoteCommits: 1,
    lastSync: new Date(),
    error: 'Network timeout while syncing',
  },
  conflict: { state: 'conflict', localCommits: 1, remoteCommits: 1, lastSync: new Date() },
};

const MOCK_CONFLICTS: SyncConflict[] = [
  {
    file: 'project-charter.md',
    localContent: '## Project Charter\n\nLocal goal update\nOwner: Alice',
    remoteContent: '## Project Charter\n\nRemote scope update\nOwner: Bob',
  },
  {
    file: 'risk-register.md',
    localContent: '## Risks\n\n- Budget variance',
    remoteContent: '## Risks\n\n- Schedule delay',
  },
];

const MOCK_EVENTS: SyncEvent[] = [
  { id: '1', timestamp: new Date(Date.now() - 10 * 60 * 1000), state: 'clean', message: 'sync.history.synced' },
  { id: '2', timestamp: new Date(Date.now() - 25 * 60 * 1000), state: 'ahead', message: 'sync.history.localChanges' },
  { id: '3', timestamp: new Date(Date.now() - 40 * 60 * 1000), state: 'running', message: 'sync.history.started' },
  { id: '4', timestamp: new Date(Date.now() - 65 * 60 * 1000), state: 'failed', message: 'sync.history.failed' },
  { id: '5', timestamp: new Date(Date.now() - 95 * 60 * 1000), state: 'conflict', message: 'sync.history.conflictDetected' },
  { id: '6', timestamp: new Date(Date.now() - 140 * 60 * 1000), state: 'behind', message: 'sync.history.remoteChanges' },
  { id: '7', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), state: 'diverged', message: 'sync.history.diverged' },
];

interface UseSyncStatusResult {
  status: SyncStatus;
  conflicts: SyncConflict[];
  events: SyncEvent[];
  availableStates: SyncState[];
  setDemoState: (state: SyncState) => void;
}

export function useSyncStatus(projectKey?: string): UseSyncStatusResult {
  const [demoState, setDemoState] = useState<SyncState | null>(null);

  const seededState = useMemo<SyncState>(() => {
    if (!projectKey) {
      return 'clean';
    }

    const seed = projectKey
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return SYNC_STATES[seed % SYNC_STATES.length];
  }, [projectKey]);

  const effectiveState = demoState ?? seededState;
  const status = MOCK_BY_STATE[effectiveState];

  return {
    status,
    conflicts: effectiveState === 'conflict' ? MOCK_CONFLICTS : [],
    events: MOCK_EVENTS.slice(0, 7),
    availableStates: SYNC_STATES,
    setDemoState,
  };
}
