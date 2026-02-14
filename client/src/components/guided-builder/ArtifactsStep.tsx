import { useTranslation } from 'react-i18next';

interface ArtifactsStepProps {
  selectedArtifacts: string[];
  onChange: (artifacts: string[]) => void;
}

const ALL_ARTIFACTS = ['charter', 'wbs', 'raid', 'schedule'];

export default function ArtifactsStep({ selectedArtifacts, onChange }: ArtifactsStepProps) {
  const { t } = useTranslation();

  const toggleArtifact = (artifact: string) => {
    if (selectedArtifacts.includes(artifact)) {
      onChange(selectedArtifacts.filter((item) => item !== artifact));
      return;
    }

    onChange([...selectedArtifacts, artifact]);
  };

  return (
    <section className="guided-step">
      <h2>{t('gb.step.artifacts')}</h2>
      <p>{t('gb.artifacts.description')}</p>

      <div className="guided-checkbox-grid">
        {ALL_ARTIFACTS.map((artifact) => (
          <label key={artifact}>
            <input
              type="checkbox"
              checked={selectedArtifacts.includes(artifact)}
              onChange={() => toggleArtifact(artifact)}
            />
            {t(`gb.artifacts.options.${artifact}`)}
          </label>
        ))}
      </div>
    </section>
  );
}
