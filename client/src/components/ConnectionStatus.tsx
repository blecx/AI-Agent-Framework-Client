import { useTranslation } from 'react-i18next';
import type { ConnectionState } from '../types/connection';
import './ConnectionStatus.css';

interface ConnectionStatusProps {
  state: ConnectionState;
}

const STATE_ICON: Record<ConnectionState, string> = {
  online: '●',
  offline: '●',
  reconnecting: '⟳',
  degraded: '●',
};

export default function ConnectionStatus({ state }: ConnectionStatusProps) {
  const { t } = useTranslation();

  return (
    <div className={`connection-status connection-status--${state}`} role="status" aria-live="polite">
      <span className="connection-status__icon" aria-hidden="true">
        {STATE_ICON[state]}
      </span>
      <span className="connection-status__label">{t(`conn.state.${state}`)}</span>
    </div>
  );
}
