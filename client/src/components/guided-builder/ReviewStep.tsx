import { useTranslation } from 'react-i18next';
import type { GuidedBuilderProjectData } from '../../types/guidedBuilder';

interface ReviewStepProps {
  projectData: GuidedBuilderProjectData;
  selectedArtifacts: string[];
}

export default function ReviewStep({ projectData, selectedArtifacts }: ReviewStepProps) {
  const { t } = useTranslation();

  return (
    <section className="guided-step">
      <h2>{t('gb.step.review')}</h2>
      <p>{t('gb.review.description')}</p>

      <div className="guided-review-card">
        <p><strong>{t('gb.projectSetup.fields.name')}:</strong> {projectData.name || '—'}</p>
        <p><strong>{t('gb.projectSetup.fields.key')}:</strong> {projectData.key || '—'}</p>
        <p><strong>{t('gb.projectSetup.fields.standard')}:</strong> {projectData.standard || '—'}</p>
        <p><strong>{t('gb.review.artifacts')}:</strong> {selectedArtifacts.length ? selectedArtifacts.join(', ') : t('gb.review.none')}</p>
      </div>

      <button type="button" className="btn-primary">
        {t('gb.review.openProject')}
      </button>
    </section>
  );
}
