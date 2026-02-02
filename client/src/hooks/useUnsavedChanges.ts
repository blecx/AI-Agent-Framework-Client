/**
 * useUnsavedChanges Hook
 * Warns users when they try to navigate away with unsaved changes
 */

import { useEffect, useCallback, useRef } from 'react';
import { useBeforeUnload, useBlocker, type BlockerFunction } from 'react-router-dom';

export interface UseUnsavedChangesOptions {
  when: boolean;
  message?: string;
}

export function useUnsavedChanges(options: UseUnsavedChangesOptions) {
  const { when, message = 'You have unsaved changes. Are you sure you want to leave?' } = options;
  const messageRef = useRef(message);

  useEffect(() => {
    messageRef.current = message;
  }, [message]);

  // Warn on browser navigation (refresh, close tab, etc.)
  useBeforeUnload(
    useCallback(
      (event) => {
        if (when) {
          event.preventDefault();
          // Modern browsers ignore custom message and show their own
          return messageRef.current;
        }
      },
      [when]
    ),
    { capture: true }
  );

  // Block navigation within the app (react-router)
  const blocker = useBlocker(
    useCallback<BlockerFunction>(
      ({ currentLocation, nextLocation }) => {
        return when && currentLocation.pathname !== nextLocation.pathname;
      },
      [when]
    )
  );

  // Provide a way to confirm navigation programmatically
  const confirmNavigation = useCallback(() => {
    if (blocker.state === 'blocked') {
      blocker.proceed();
    }
  }, [blocker]);

  const cancelNavigation = useCallback(() => {
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
  }, [blocker]);

  return {
    isBlocked: blocker.state === 'blocked',
    confirmNavigation,
    cancelNavigation,
  };
}
