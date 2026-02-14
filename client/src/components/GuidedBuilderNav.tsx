import { useTranslation } from 'react-i18next';
import './GuidedBuilderNav.css';

interface GuidedBuilderNavProps {
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  showBack: boolean;
  showNext: boolean;
  showSkip: boolean;
}

export default function GuidedBuilderNav({
  onBack,
  onNext,
  onSkip,
  showBack,
  showNext,
  showSkip,
}: GuidedBuilderNavProps) {
  const { t } = useTranslation();

  return (
    <div className="guided-builder-nav">
      {showBack ? (
        <button type="button" className="btn-secondary" onClick={onBack}>
          ← {t('gb.nav.back')}
        </button>
      ) : (
        <span />
      )}

      <div className="guided-builder-nav-right">
        {showSkip && (
          <button type="button" className="btn-secondary" onClick={onSkip}>
            {t('gb.nav.skip')}
          </button>
        )}
        {showNext && (
          <button type="button" className="btn-primary" onClick={onNext}>
            {t('gb.nav.next')} →
          </button>
        )}
      </div>
    </div>
  );
}
