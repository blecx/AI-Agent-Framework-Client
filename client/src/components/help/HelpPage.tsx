import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HELP_TOPICS, type HelpCategory } from '../../content/helpTopics';
import './HelpPage.css';

const CATEGORY_ORDER: HelpCategory[] = [
  'getting-started',
  'workflows',
  'concepts',
  'reference',
];

export default function HelpPage() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const normalizedQuery = query.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      HELP_TOPICS.filter((topic) => {
        const title = t(topic.titleKey).toLowerCase();
        const summary = t(topic.summaryKey).toLowerCase();
        return (
          normalizedQuery.length === 0
          || title.includes(normalizedQuery)
          || summary.includes(normalizedQuery)
        );
      }),
    [normalizedQuery, t],
  );

  return (
    <div className="help-page">
      <header className="help-page__header">
        <h1>{t('help.title')}</h1>
        <p>{t('help.subtitle')}</p>
      </header>

      <label className="help-page__search" htmlFor="help-search-input">
        <span>{t('help.search.label')}</span>
        <input
          id="help-search-input"
          type="search"
          placeholder={t('help.search.placeholder')}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      {CATEGORY_ORDER.map((category) => {
        const topics = filtered.filter((topic) => topic.category === category);
        if (topics.length === 0) {
          return null;
        }

        return (
          <section key={category} className="help-page__category">
            <h2>{t(`help.categories.${category}`)}</h2>
            <ul>
              {topics.map((topic) => (
                <li key={topic.id}>
                  <Link to={`/help/${topic.id}`}>
                    <strong>{t(topic.titleKey)}</strong>
                    <span>{t(topic.summaryKey)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
