import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { ReadinessCheck, ReadinessState } from '../types/readiness';
import './ReadinessChecks.css';

interface ReadinessChecksProps {
  checks: ReadinessCheck[];
}

const ICONS: Record<ReadinessState, string> = {
  pass: '✓',
  warn: '⚠',
  fail: '✗',
  notAssessed: '○',
  inProgress: '⟳',
};

export default function ReadinessChecks({ checks }: ReadinessChecksProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="readiness-checks">
      <h2>{t('rd.checks.title')}</h2>
      <div className="readiness-checks-list">
        {checks.map((check) => (
          <article key={check.id} className={`readiness-check readiness-check--${check.status}`}>
            <div className="readiness-check-header">
              <span className="readiness-check-icon" aria-hidden="true">
                {ICONS[check.status]}
              </span>
              <h3>{t(`rd.checks.items.${check.id}.name`)}</h3>
              <span className="readiness-check-status">{t(`rd.state.${check.status}`)}</span>
            </div>
            <p className="readiness-check-description">{t(`rd.checks.items.${check.id}.description`)}</p>
            <p className="readiness-check-message">{t(`rd.checks.items.${check.id}.message`)}</p>

            {check.actionKey && check.actionUrl && (
              <button
                type="button"
                className="readiness-check-action"
                onClick={() => navigate(check.actionUrl || '/')}
              >
                {t(`rd.actions.${check.actionKey}`)}
              </button>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
