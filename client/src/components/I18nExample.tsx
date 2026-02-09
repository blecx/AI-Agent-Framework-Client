/**
 * Example component demonstrating i18n usage
 * 
 * Shows how to use the useTranslation hook in React components.
 */

import { useTranslation } from 'react-i18next';

export default function I18nExample() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div data-testid="i18n-example">
      <h2>{t('nav.projects')}</h2>
      <p>Current language: {i18n.language}</p>
      <div>
        <button onClick={() => changeLanguage('en')}>English</button>
        <button onClick={() => changeLanguage('de')}>Deutsch</button>
      </div>
      <ul>
        <li>{t('nav.guidedBuilder')}</li>
        <li>{t('nav.artifactBuilder')}</li>
        <li>{t('conn.state.online')}</li>
      </ul>
    </div>
  );
}
