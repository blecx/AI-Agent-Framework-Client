import { useCallback, useEffect, useState } from 'react';
import apiClient from '../services/apiClient';
import type { ConnectionState } from '../types/connection';

interface UseConnectionResult {
  state: ConnectionState;
  retryConnection: () => void;
}

export function useConnection(): UseConnectionResult {
  const [state, setState] = useState<ConnectionState>(() => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return 'offline';
    }

    return 'online';
  });

  const runHealthCheck = useCallback(
    async (reason: 'initial' | 'online' | 'interval' | 'retry') => {
      if (!navigator.onLine) {
        setState('offline');
        return;
      }

      if (reason === 'online' || reason === 'retry') {
        setState('reconnecting');
      }

      try {
        await apiClient.checkHealth();
        setState('online');
      } catch {
        setState('degraded');
      }
    },
    [],
  );

  const retryConnection = useCallback(() => {
    void runHealthCheck('retry');
  }, [runHealthCheck]);

  useEffect(() => {
    const handleOnline = () => {
      void runHealthCheck('online');
    };

    const handleOffline = () => {
      setState('offline');
    };

    if (navigator.onLine) {
      const timeoutId = window.setTimeout(() => {
        void runHealthCheck('initial');
      }, 0);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      const healthCheckInterval = parseInt(
        import.meta.env.VITE_HEALTH_CHECK_INTERVAL || '30000',
        10,
      );

      const intervalId = window.setInterval(() => {
        if (navigator.onLine) {
          void runHealthCheck('interval');
        }
      }, healthCheckInterval);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        window.clearInterval(intervalId);
        window.clearTimeout(timeoutId);
      };
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [runHealthCheck]);

  return {
    state,
    retryConnection,
  };
}
