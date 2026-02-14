import { useEffect, useId, useRef } from 'react';
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
  closeButtonLabel?: string;
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
  closeButtonLabel = 'Close dialog',
}: ModalProps) {
  const autoTitleId = useId();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const getFocusableElements = () => {
    if (!modalRef.current) return [] as HTMLElement[];

    return Array.from(
      modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => !el.hasAttribute('disabled'));
  };

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => {
      const firstFocusable = getFocusableElements()[0];
      if (firstFocusable) {
        firstFocusable.focus();
      } else {
        modalRef.current?.focus();
      }
    });

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }

      if (e.key === 'Tab') {
        const focusables = getFocusableElements();
        if (!focusables.length) {
          e.preventDefault();
          return;
        }

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleEscape);
      previousFocusRef.current?.focus();
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
        ref={modalRef}
        className={modalClasses}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-label={!titleId ? ariaLabel || title || 'Dialog' : undefined}
        tabIndex={-1}
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
              aria-label={closeButtonLabel}
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
              aria-label={closeButtonLabel}
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
