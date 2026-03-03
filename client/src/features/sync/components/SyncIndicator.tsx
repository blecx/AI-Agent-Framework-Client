import { useEffect, useState } from 'react';
import { SyncApiClient, type SyncState } from '../api/SyncApiClient';
import { Button } from '@/components/ui/Button';

export default function SyncIndicator() {
  const [syncState, setSyncState] = useState<SyncState | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchState = async () => {
    try {
      const state = await SyncApiClient.getSyncState();
      setSyncState(state);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !syncState) {
    return <span className="text-gray-400 text-sm">Syncing...</span>;
  }

  const handlePush = async () => {
    setLoading(true);
    try {
      await SyncApiClient.push();
      await fetchState();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  if (syncState.has_conflicts) {
    return <span className="text-red-500 font-bold flex items-center gap-2">⚠️ Conflicts</span>;
  }

  if (!syncState.is_synced && syncState.unsynced_commits > 0) {
    return (
      <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
        <span>{syncState.unsynced_commits} Unsynced</span>
        <Button size="sm" variant="outline" onClick={handlePush}>Sync Now</Button>
      </div>
    );
  }

  return <span className="text-green-600 flex items-center gap-1 text-sm font-semibold">✓ Synced</span>;
}
