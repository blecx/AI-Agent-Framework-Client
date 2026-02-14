import './LoadingSpinner.css';

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  fullScreen?: boolean;
  ariaLabel?: string;
}

export default function LoadingSpinner({
  size = 'medium',
  message,
  fullScreen = false,
  ariaLabel,
}: LoadingSpinnerProps) {
  const containerClass = fullScreen
    ? 'loading-spinner-container fullscreen'
    : 'loading-spinner-container';

  const announceLabel = ariaLabel || message || 'Loading...';

  return (
    <div className={containerClass} role="status" aria-live="polite" aria-label={announceLabel}>
      <div className={`loading-spinner ${size}`} aria-hidden="true">
        <div className="spinner-circle"></div>
      </div>
      {message && <p className="loading-message">{message}</p>}
      <span className="sr-only">{announceLabel}</span>
    </div>
  );
}
