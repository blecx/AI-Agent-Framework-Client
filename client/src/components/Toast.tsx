/**
 * Toast Component - Individual toast notification
 */

import { useEffect } from 'react';
import type { Toast as ToastType } from './ToastContext';
import './Toast.css';

interface ToastProps extends ToastType {
  onClose: (id: string) => void;
}

export default function Toast({ id, type, message, onClose }: ToastProps) {
  useEffect(() => {
    // Slide-in animation is handled by CSS
  }, []);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '';
    }
  };

  return (
    <div className={`toast toast-${type}`} role="alert" aria-live="polite">
      <span className="toast-icon">{getIcon()}</span>
      <span className="toast-message">{message}</span>
      <button
        className="toast-close"
        onClick={() => onClose(id)}
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
}
