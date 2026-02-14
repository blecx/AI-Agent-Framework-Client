import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import './EmptyState.css';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaAction?: () => void;
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
  ctaLabel,
  ctaAction,
  action,
  children,
}: EmptyStateProps) {
  const { t } = useTranslation();
  const translate = (text: string) => t(text, { defaultValue: text });

  const resolvedCtaLabel = ctaLabel ?? action?.label;
  const resolvedCtaAction = ctaAction ?? action?.onClick;

  return (
    <div className="empty-state" data-testid="empty-state" role="status" aria-live="polite">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{translate(title)}</h3>
      {description && <p className="empty-state-description">{translate(description)}</p>}
      {resolvedCtaLabel && resolvedCtaAction && (
        <button
          className="ui-button ui-button--primary empty-state-action"
          onClick={resolvedCtaAction}
        >
          {translate(resolvedCtaLabel)}
        </button>
      )}
      {children}
    </div>
  );
}
