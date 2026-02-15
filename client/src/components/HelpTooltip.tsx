import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './HelpTooltip.css';

export interface HelpTooltipProps {
  titleKey: string;
  contentKey: string;
  learnMorePath?: string;
}

export default function HelpTooltip({
  titleKey,
  contentKey,
  learnMorePath,
}: HelpTooltipProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipId = useId();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onDocumentClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', onDocumentClick);
    document.addEventListener('keydown', onEscape);

    return () => {
      document.removeEventListener('mousedown', onDocumentClick);
      document.removeEventListener('keydown', onEscape);
    };
  }, [isOpen]);

  return (
    <div className="help-tooltip" ref={containerRef}>
      <button
        type="button"
        className="help-tooltip__trigger"
        aria-label={t('help.actions.show')}
        aria-expanded={isOpen}
        aria-controls={tooltipId}
        onClick={() => setIsOpen((open) => !open)}
      >
        ?
      </button>

      {isOpen && (
        <div id={tooltipId} role="tooltip" className="help-tooltip__panel">
          <div className="help-tooltip__header">
            <h4>{t(titleKey)}</h4>
            <button
              type="button"
              className="help-tooltip__close"
              onClick={() => setIsOpen(false)}
              aria-label={t('help.actions.close')}
            >
              ×
            </button>
          </div>
          <p className="help-tooltip__content">{t(contentKey)}</p>
          {learnMorePath && (
            <Link
              className="help-tooltip__link"
              to={learnMorePath}
              onClick={() => setIsOpen(false)}
            >
              {t('help.actions.learnMore')} →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
