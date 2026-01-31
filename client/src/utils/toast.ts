/**
 * Simple toast notification utility
 */

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export function showToast(message: string, type: ToastType = 'info'): void {
  // Simple console implementation for now
  // Can be replaced with a toast library like react-hot-toast later
  const prefix = type.toUpperCase();
  console.log(`[${prefix}] ${message}`);
  
  // Optional: Show browser notification
  if (window.alert && type === 'error') {
    // Only alert on errors in production
    if (import.meta.env.PROD) {
      window.alert(`Error: ${message}`);
    }
  }
}
