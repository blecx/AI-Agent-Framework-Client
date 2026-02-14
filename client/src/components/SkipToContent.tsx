import { useTranslation } from 'react-i18next';
import './SkipToContent.css';

export default function SkipToContent() {
  const { t } = useTranslation();

  const handleSkip = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    mainContent.focus();
    if (typeof mainContent.scrollIntoView === 'function') {
      mainContent.scrollIntoView({ block: 'start' });
    }
  };

  return (
    <a href="#main-content" className="skip-to-content" onClick={handleSkip}>
      {t('a11y.skipToContent')}
    </a>
  );
}
