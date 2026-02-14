import { useTranslation } from 'react-i18next';

interface WelcomeStepProps {
  onGetStarted: () => void;
}

export default function WelcomeStep({ onGetStarted }: WelcomeStepProps) {
  const { t } = useTranslation();

  return (
    <section className="guided-step">
      <h2>{t('gb.welcome.title')}</h2>
      <p>{t('gb.welcome.description')}</p>

      <ul className="guided-feature-list">
        <li>{t('gb.welcome.feature1')}</li>
        <li>{t('gb.welcome.feature2')}</li>
        <li>{t('gb.welcome.feature3')}</li>
      </ul>

      <button type="button" className="btn-primary" onClick={onGetStarted}>
        {t('gb.welcome.cta')}
      </button>
    </section>
  );
}
