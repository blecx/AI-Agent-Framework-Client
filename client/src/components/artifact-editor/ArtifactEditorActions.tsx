import type { TFunction } from "i18next";

interface ArtifactEditorActionsProps {
  canEdit: boolean;
  canProposeForReview: boolean;
  canProposeChange: boolean;
  isFormValid: boolean;
  isSaving: boolean;
  onProposeForReview: () => void;
  onProposeChange: () => void;
  onExport: () => void;
  onCancel?: () => void;
  projectKey: string;
  artifactType: string;
  t: TFunction;
}

export const ArtifactEditorActions: React.FC<ArtifactEditorActionsProps> = ({
  canEdit,
  canProposeForReview,
  canProposeChange,
  isFormValid,
  isSaving,
  onProposeForReview,
  onProposeChange,
  onExport,
  onCancel,
  projectKey,
  artifactType,
  t,
}) => {
  return (
    <div className="form-actions">
      {canEdit && (
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            window.location.assign(
              `/projects/${projectKey}/assisted-creation?artifactType=${artifactType}`,
            );
          }}
        >
          {t("art.action.improveWithAI")}
        </button>
      )}

      {canEdit && (
        <button
          type="submit"
          className="btn-primary"
          disabled={!isFormValid || isSaving || !canEdit}
          aria-busy={isSaving}
        >
          {isSaving
            ? t("artifactEditor.actions.saving")
            : t("artifactEditor.actions.save")}
        </button>
      )}

      {canProposeForReview && (
        <button
          type="button"
          className="btn-primary"
          onClick={onProposeForReview}
        >
          {t("art.action.propose")}
        </button>
      )}

      {canProposeChange && (
        <button
          type="button"
          className="btn-primary"
          onClick={onProposeChange}
        >
          {t("art.action.proposeChange")}
        </button>
      )}

      <button type="button" className="btn-secondary" onClick={onExport}>
        {t("art.action.export")}
      </button>

      {onCancel && (
        <button type="button" className="btn-secondary" onClick={onCancel}>
          {t("artifactEditor.actions.cancel")}
        </button>
      )}
    </div>
  );
};
