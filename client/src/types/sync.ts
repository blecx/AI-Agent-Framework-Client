export type SyncState =
  | 'clean'
  | 'ahead'
  | 'behind'
  | 'diverged'
  | 'running'
  | 'failed'
  | 'conflict';

export interface SyncStatus {
  state: SyncState;
  localCommits: number;
  remoteCommits: number;
  lastSync?: Date;
  error?: string;
}

export interface SyncConflict {
  file: string;
  localContent: string;
  remoteContent: string;
}

export interface SyncEvent {
  id: string;
  timestamp: Date;
  state: SyncState;
  message: string;
}

export type ConflictResolution = 'mine' | 'theirs' | 'ai' | 'manual';
