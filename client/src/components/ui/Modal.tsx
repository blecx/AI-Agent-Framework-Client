import { useEffect, useId } from 'react';
import './ui.css';

export type ModalSize = 'sm' | 'md' | 'lg';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  ariaLabel?: string;
  size?: ModalSize;
  children: React.ReactNode;
  footer?: React.ReactNode;
  closeOnOverlayClick?: boolean;
  ariaLabelledById?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  ariaLabel,
  size = 'md',
  children,
  footer,
  closeOnOverlayClick = true,
  ariaLabelledById,
}: ModalProps) {
  const autoTitleId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const titleId = ariaLabelledById || (title ? autoTitleId : undefined);

  const modalClasses = ['ui-modal', `ui-modal--${size}`].join(' ');

  return (
    <div
      className="ui-modal-overlay"
      onClick={closeOnOverlayClick ? onClose : undefined}
    >
      <div
        className={modalClasses}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-label={!titleId ? ariaLabel || title || 'Dialog' : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {title ? (
          <div className="ui-modal__header">
            <h2 id={titleId} className="ui-modal__title">
              {title}
            </h2>
            <button
              type="button"
              className="ui-modal__close"
              onClick={onClose}
              aria-label="Close dialog"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="ui-modal__header">
            <span className="ui-visually-hidden">{ariaLabel || 'Dialog'}</span>
            <button
              type="button"
              className="ui-modal__close"
              onClick={onClose}
              aria-label="Close dialog"
            >
              ✕
            </button>
          </div>
        )}

        <div className="ui-modal__body">{children}</div>

        {footer ? <div className="ui-modal__footer">{footer}</div> : null}
      </div>
    </div>
  );
}
