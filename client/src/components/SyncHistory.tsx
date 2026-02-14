import { useTranslation } from 'react-i18next';
import type { SyncEvent } from '../types/sync';
import './SyncHistory.css';

interface SyncHistoryProps {
  events: SyncEvent[];
}

export default function SyncHistory({ events }: SyncHistoryProps) {
  const { t } = useTranslation();
  const visibleEvents = events.slice(0, 10);

  return (
    <section className="sync-history" aria-label={t('sync.history.title')}>
      <h4>{t('sync.history.title')}</h4>
      <ul className="sync-history-list">
        {visibleEvents.map((event) => (
          <li key={event.id} className="sync-history-item">
            <div className="sync-history-row">
              <span className={`sync-history-state sync-history-state--${event.state}`}>
                {t(`sync.state.${event.state}`)}
              </span>
              <time dateTime={event.timestamp.toISOString()}>
                {event.timestamp.toLocaleString()}
              </time>
            </div>
            <p>{t(event.message)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
