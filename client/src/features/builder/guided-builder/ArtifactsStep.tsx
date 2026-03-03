import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface ArtifactsStepProps {
  projectKey: string;
  selectedArtifacts: string[];
  onChange: (artifacts: string[]) => void;
}

const ALL_ARTIFACTS = ["charter", "wbs", "raid", "schedule"];

export default function ArtifactsStep({
  projectKey,
  selectedArtifacts,
  onChange,
}: ArtifactsStepProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const toggleArtifact = (artifact: string) => {
    if (selectedArtifacts.includes(artifact)) {
      onChange(selectedArtifacts.filter((item) => item !== artifact));
      return;
    }

    onChange([...selectedArtifacts, artifact]);
  };

  return (
    <section className="guided-step">
      <h2>{t("gb.step.artifacts")}</h2>
      <p>{t("gb.artifacts.description")}</p>

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

      <button
        type="button"
        className="btn-primary"
        onClick={() =>
          navigate(
            `/projects/${projectKey || "guided-builder"}/assisted-creation?artifactType=${
              selectedArtifacts[0] || "charter"
            }`,
          )
        }
      >
        {t("ac.entry.cta.start")}
      </button>
    </section>
  );
}
