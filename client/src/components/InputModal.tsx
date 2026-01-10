/**
 * InputModal Component - Modern replacement for window.prompt()
 */

import { useState, useEffect, useRef } from 'react';
import './InputModal.css';

interface InputModalProps {
  isOpen: boolean;
  onSubmit: (value: string) => void;
  onCancel: () => void;
  title: string;
  placeholder?: string;
  defaultValue?: string;
  label?: string;
  submitText?: string;
  cancelText?: string;
  required?: boolean;
}

export default function InputModal({
  isOpen,
  onSubmit,
  onCancel,
  title,
  placeholder = '',
  defaultValue = '',
  label,
  submitText = 'Submit',
  cancelText = 'Cancel',
  required = true,
}: InputModalProps) {
  const [value, setValue] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize value when modal opens
  if (isOpen && !isInitialized) {
    setValue(defaultValue);
    setIsInitialized(true);
  }

  // Reset when modal closes
  if (!isOpen && isInitialized) {
    setIsInitialized(false);
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus input after animation
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (required && !value.trim()) return;
    onSubmit(value);
    setValue('');
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-container"
        role="dialog"
        aria-labelledby="modal-title"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <h2 id="modal-title">{title}</h2>
            <button
              type="button"
              className="modal-close"
              onClick={onCancel}
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
          <div className="modal-body">
            {label && (
              <label htmlFor="modal-input" className="modal-label">
                {label}
              </label>
            )}
            <input
              id="modal-input"
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              className="modal-input"
              required={required}
              aria-required={required}
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onCancel}>
              {cancelText}
            </button>
            <button type="submit" className="btn-primary" disabled={required && !value.trim()}>
              {submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
