/**
 * ToastContainer - Renders all active toast notifications
 */

import { useToastContext } from './ToastContext';
import Toast from './Toast';

export default function ToastContainer() {
  const { toasts, removeToast } = useToastContext();

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={removeToast} />
      ))}
    </div>
  );
}
