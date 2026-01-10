/**
 * InputModal Component
 * Reusable input dialog that replaces window.prompt
 */

import { useState, useEffect } from 'react';
import './InputModal.css';

interface InputModalProps {
  title: string;
  message: string;
  placeholder?: string;
  defaultValue?: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
  submitText?: string;
  cancelText?: string;
}

export default function InputModal({
  title,
  message,
  placeholder = '',
  defaultValue = '',
  onSubmit,
  onCancel,
  submitText = 'Submit',
  cancelText = 'Cancel'
}: InputModalProps) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onCancel]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick} role="dialog" aria-labelledby="input-modal-title" aria-modal="true">
      <div className="modal-content input-modal">
        <div className="modal-header">
          <h2 id="input-modal-title">{title}</h2>
          <button
            type="button"
            className="btn-close"
            onClick={onCancel}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p>{message}</p>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              autoFocus
              required
              className="input-modal-field"
            />
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
            >
              {cancelText}
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!value.trim()}
            >
              {submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
