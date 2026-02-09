import './LoadingSpinner.css';

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  size = 'medium',
  message,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const containerClass = fullScreen
    ? 'loading-spinner-container fullscreen'
    : 'loading-spinner-container';

  return (
    <div className={containerClass} role="status" aria-live="polite">
      <div className={`loading-spinner ${size}`} aria-hidden="true">
        <div className="spinner-circle"></div>
      </div>
      {message && <p className="loading-message">{message}</p>}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
