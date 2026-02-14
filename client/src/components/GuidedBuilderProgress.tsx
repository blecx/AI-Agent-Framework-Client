import { useTranslation } from 'react-i18next';
import './GuidedBuilderProgress.css';

interface GuidedBuilderProgressProps {
  current: number;
  total: number;
}

export default function GuidedBuilderProgress({
  current,
  total,
}: GuidedBuilderProgressProps) {
  const { t } = useTranslation();
  const percentage = (current / total) * 100;

  return (
    <div className="guided-builder-progress" aria-label={t('gb.progress', { current, total })}>
      <p>{t('gb.progress', { current, total })}</p>
      <div className="guided-builder-progress-bar" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={current}>
        <div
          className="guided-builder-progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
