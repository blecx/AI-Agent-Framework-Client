import { useCallback } from 'react';
import { useToastContext } from '../components/ToastContext';

export function useNotification() {
  const { showToast } = useToastContext();

  const success = useCallback(
    (message: string, duration?: number) => showToast('success', message, duration),
    [showToast],
  );

  const error = useCallback(
    (message: string, duration?: number) => showToast('error', message, duration),
    [showToast],
  );

  const info = useCallback(
    (message: string, duration?: number) => showToast('info', message, duration),
    [showToast],
  );

  const warning = useCallback(
    (message: string, duration?: number) => showToast('warning', message, duration),
    [showToast],
  );

  return { success, error, info, warning };
}
