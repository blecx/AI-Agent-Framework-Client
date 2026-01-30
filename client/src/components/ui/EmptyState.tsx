import type { ReactNode } from 'react';
import './EmptyState.css';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
}

export default function EmptyState({
  icon = '📭',
  title,
  description,
  action,
  children,
}: EmptyStateProps) {
  return (
    <div className="empty-state" role="status" aria-live="polite">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-description">{description}</p>}
      {action && (
        <button
          className="ui-button ui-button--primary empty-state-action"
          onClick={action.onClick}
        >
          {action.label}
        </button>
      )}
      {children}
    </div>
  );
}
