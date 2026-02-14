import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useSyncStatus } from '../hooks/useSyncStatus';
import type { ConflictResolution, SyncState } from '../types/sync';
import ConflictResolver from './ConflictResolver';
import SyncHistory from './SyncHistory';
import './SyncPanel.css';

const ICON_BY_STATE: Record<SyncState, string> = {
  clean: '✓',
  ahead: '↑',
  behind: '↓',
  diverged: '↕',
  running: '⟳',
  failed: '✗',
  conflict: '⚠',
};

export default function SyncPanel() {
  const { t } = useTranslation();
  const { projectKey } = useParams<{ projectKey: string }>();
  const { status, conflicts, events, availableStates, setDemoState } =
    useSyncStatus(projectKey);
  const [resolutionMessage, setResolutionMessage] = useState<string | null>(null);

  const getDescription = () => {
    switch (status.state) {
      case 'ahead':
        return t('sync.description.ahead', { count: status.localCommits });
      case 'behind':
        return t('sync.description.behind', { count: status.remoteCommits });
      case 'diverged':
        return t('sync.description.diverged', {
          local: status.localCommits,
          remote: status.remoteCommits,
        });
      case 'running':
        return t('sync.description.running');
      case 'failed':
        return t('sync.description.failed', {
          error: status.error ?? t('sync.error.unknown'),
        });
      case 'conflict':
        return t('sync.description.conflict');
      case 'clean':
      default:
        return t('sync.description.clean');
    }
  };

  const handleSyncNow = () => {
    // TODO: Replace with API call to /projects/:projectKey/sync/status
    setResolutionMessage(t('sync.feedback.syncRequested'));
  };

  const handleResolve = (resolution: ConflictResolution) => {
    // TODO: Replace with API call to /projects/:projectKey/sync/resolve
    setResolutionMessage(t('sync.feedback.resolved', { resolution: t(`sync.conflict.${resolution}`) }));
  };

  return (
    <div className="sync-page" data-testid="sync-panel">
      <section className={`sync-panel sync-panel--${status.state}`}>
        <header className="sync-panel-header">
          <span className="sync-panel-icon" aria-hidden="true">
            {ICON_BY_STATE[status.state]}
          </span>
          <div>
            <h2>{t('sync.title')}</h2>
            <p className="sync-panel-state">{t(`sync.state.${status.state}`)}</p>
          </div>
        </header>

        <p className="sync-panel-description">{getDescription()}</p>

        <div className="sync-panel-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={handleSyncNow}
            disabled={status.state === 'running'}
          >
            {t('sync.action.syncNow')}
          </button>
          <button type="button" className="btn-secondary">
            {t('sync.action.viewHistory')}
          </button>
        </div>

        <div className="sync-demo" aria-label={t('sync.demo.title')}>
          <strong>{t('sync.demo.title')}</strong>
          <div className="sync-demo-states">
            {availableStates.map((state) => (
              <button
                type="button"
                key={state}
                className={`sync-demo-chip ${state === status.state ? 'active' : ''}`}
                onClick={() => setDemoState(state)}
              >
                {ICON_BY_STATE[state]} {t(`sync.state.${state}`)}
              </button>
            ))}
          </div>
        </div>

        {resolutionMessage && <p className="sync-feedback">{resolutionMessage}</p>}
      </section>

      {status.state === 'conflict' && conflicts[0] && (
        <ConflictResolver
          conflict={conflicts[0]}
          onResolve={handleResolve}
          onCancel={() => setResolutionMessage(null)}
        />
      )}

      <SyncHistory events={events} />
    </div>
  );
}
