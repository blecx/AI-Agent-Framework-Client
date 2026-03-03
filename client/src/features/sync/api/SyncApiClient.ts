export interface SyncState {
  is_synced: boolean;
  unsynced_commits: number;
  untracked_changes: number;
  has_conflicts: boolean;
  branch: string;
  message: string;
}

export class SyncApiClient {
  private static baseUrl = 'http://localhost:8000/api/v1/sync';

  static async getSyncState(): Promise<SyncState> {
    const res = await fetch(`${this.baseUrl}/state`);
    if (!res.ok) throw new Error('Failed to fetch sync state');
    return res.json();
  }

  static async push(): Promise<{status: string, message: string}> {
    const res = await fetch(`${this.baseUrl}/push`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to push');
    return res.json();
  }

  static async pull(): Promise<{status: string, message: string}> {
    const res = await fetch(`${this.baseUrl}/pull`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to pull');
    return res.json();
  }
}
