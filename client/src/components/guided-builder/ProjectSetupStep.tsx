import { useTranslation } from 'react-i18next';
import type { GuidedBuilderProjectData } from '../../types/guidedBuilder';

interface ProjectSetupStepProps {
  data: GuidedBuilderProjectData;
  onChange: (data: GuidedBuilderProjectData) => void;
}

export default function ProjectSetupStep({ data, onChange }: ProjectSetupStepProps) {
  const { t } = useTranslation();

  return (
    <section className="guided-step">
      <h2>{t('gb.step.projectSetup')}</h2>
      <p>{t('gb.projectSetup.description')}</p>

      <div className="guided-form-grid">
        <label>
          {t('gb.projectSetup.fields.name')}
          <input
            value={data.name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            placeholder={t('gb.projectSetup.placeholders.name')}
          />
        </label>

        <label>
          {t('gb.projectSetup.fields.key')}
          <input
            value={data.key}
            onChange={(e) => onChange({ ...data, key: e.target.value })}
            placeholder={t('gb.projectSetup.placeholders.key')}
          />
        </label>

        <label className="guided-form-full">
          {t('gb.projectSetup.fields.description')}
          <textarea
            rows={4}
            value={data.description}
            onChange={(e) => onChange({ ...data, description: e.target.value })}
            placeholder={t('gb.projectSetup.placeholders.description')}
          />
        </label>

        <label>
          {t('gb.projectSetup.fields.standard')}
          <input
            value={data.standard}
            onChange={(e) => onChange({ ...data, standard: e.target.value })}
          />
        </label>
      </div>
    </section>
  );
}
