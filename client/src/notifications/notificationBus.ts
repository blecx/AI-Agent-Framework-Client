export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface NotificationEvent {
  type: NotificationType;
  message: string;
  duration?: number;
}

type Listener = (event: NotificationEvent) => void;

const listeners = new Set<Listener>();

export function notify(event: NotificationEvent): void {
  for (const listener of listeners) {
    listener(event);
  }
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
