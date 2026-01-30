import { describe, it, expect, vi } from 'vitest';
import type { AxiosError } from 'axios';
import { handleApiClientAxiosError } from '../../../services/apiClient';
import type { NotificationEvent } from '../../../notifications/notificationBus';

describe('apiClient error handling', () => {
  it('notifies and throws a user-friendly message by default', () => {
    const notifyFn = vi.fn<(event: NotificationEvent) => void>();

    const error = {
      message: 'Network error',
      request: {},
      config: {},
    } as unknown as AxiosError;

    expect(() => handleApiClientAxiosError(error, notifyFn)).toThrow(
      'No response from server. Please check if the API is running.',
    );

    expect(notifyFn).toHaveBeenCalledTimes(1);
    expect(notifyFn).toHaveBeenCalledWith({
      type: 'error',
      message: 'No response from server. Please check if the API is running.',
      duration: 5000,
    });
  });

  it('suppresses the toast when suppressErrorToast is set', () => {
    const notifyFn = vi.fn<(event: NotificationEvent) => void>();

    const error = {
      message: 'Network error',
      request: {},
      config: { suppressErrorToast: true },
    } as unknown as AxiosError;

    expect(() => handleApiClientAxiosError(error, notifyFn)).toThrow(
      'No response from server. Please check if the API is running.',
    );

    expect(notifyFn).not.toHaveBeenCalled();
  });
});
