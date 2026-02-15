import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { findHelpTopic } from '../../content/helpTopics';
import './HelpPage.css';

export default function HelpTopicPage() {
  const { t } = useTranslation();
  const { topicId } = useParams<{ topicId: string }>();
  const topic = findHelpTopic(topicId);

  if (!topic) {
    return (
      <div className="help-page help-topic-page">
        <h1>{t('help.notFound.title')}</h1>
        <p>{t('help.notFound.description')}</p>
        <Link to="/help">← {t('help.actions.backToIndex')}</Link>
      </div>
    );
  }

  const steps = t(`help.docs.${topic.id}.steps`, { returnObjects: true }) as unknown;
  const details = t(`help.docs.${topic.id}.details`, { defaultValue: '' });

  return (
    <article className="help-page help-topic-page">
      <Link className="help-topic-page__back" to="/help">
        ← {t('help.actions.backToIndex')}
      </Link>

      <h1>{t(topic.titleKey)}</h1>
      <p>{t(topic.contentKey)}</p>

      {Array.isArray(steps) && steps.length > 0 && (
        <section>
          <h2>{t('help.docs.gettingStarted')}</h2>
          <ol>
            {steps.map((step) => (
              <li key={String(step)}>{String(step)}</li>
            ))}
          </ol>
        </section>
      )}

      {details && (
        <section>
          <h2>{t('help.docs.keyConcepts')}</h2>
          <p>{details}</p>
        </section>
      )}
    </article>
  );
}
