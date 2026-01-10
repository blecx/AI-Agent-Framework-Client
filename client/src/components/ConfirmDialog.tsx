/**
 * ConfirmDialog Component - Modern replacement for window.confirm()
 */

import { useEffect } from 'react';
import './ConfirmDialog.css';

interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}: ConfirmDialogProps) {
  useEffect(() => {
    if (isOpen) {
      // Prevent scrolling when dialog is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div
        className="dialog-container"
        role="dialog"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog-header">
          <h2 id="dialog-title">{title}</h2>
          <button
            className="dialog-close"
            onClick={onCancel}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>
        <div className="dialog-body">
          <p id="dialog-description">{message}</p>
        </div>
        <div className="dialog-footer">
          <button className="btn-secondary" onClick={onCancel}>
            {cancelText}
          </button>
          <button className="btn-primary btn-danger" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
