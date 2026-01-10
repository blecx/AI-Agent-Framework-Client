/**
 * useToast Hook - Simplified toast notification interface
 */

import { useCallback } from 'react';
import { useToastContext } from '../components/ToastContext';

export function useToast() {
  const { showToast } = useToastContext();

  const showSuccess = useCallback(
    (message: string, duration?: number) => {
      showToast('success', message, duration);
    },
    [showToast]
  );

  const showError = useCallback(
    (message: string, duration?: number) => {
      showToast('error', message, duration);
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message: string, duration?: number) => {
      showToast('info', message, duration);
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message: string, duration?: number) => {
      showToast('warning', message, duration);
    },
    [showToast]
  );

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
}
