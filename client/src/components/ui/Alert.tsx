import type { ReactNode } from 'react';
import './Alert.css';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  variant: AlertVariant;
  title?: string;
  message: string | ReactNode;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function Alert({
  variant,
  title,
  message,
  onDismiss,
  action,
}: AlertProps) {
  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  };

  return (
    <div
      className={`alert alert-${variant}`}
      role="alert"
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
    >
      <div className="alert-icon" aria-hidden="true">
        {icons[variant]}
      </div>
      <div className="alert-content">
        {title && <h4 className="alert-title">{title}</h4>}
        <div className="alert-message">{message}</div>
        {action && (
          <button
            className="alert-action"
            onClick={action.onClick}
            type="button"
          >
            {action.label}
          </button>
        )}
      </div>
      {onDismiss && (
        <button
          className="alert-dismiss"
          onClick={onDismiss}
          type="button"
          aria-label="Dismiss alert"
        >
          ✕
        </button>
      )}
    </div>
  );
}
