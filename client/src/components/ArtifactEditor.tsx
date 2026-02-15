/**
 * ArtifactEditor Component
 * Template-driven form for creating/editing artifacts
 */

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Template } from "../types/template";
import type { ArtifactState } from "../types/artifact";
import { templateApiClient } from "../services/TemplateApiClient";
import { useUnsavedChanges } from "../hooks/useUnsavedChanges";
import { FormSkeleton } from "./LoadingSkeleton";
import { useToast } from "../hooks/useToast";
import ArtifactStateBadge from "./ArtifactStateBadge";
import { ArtifactEditorField } from "./artifact-editor/ArtifactEditorField";
import { ArtifactEditorActions } from "./artifact-editor/ArtifactEditorActions";
import { useArtifactEditorForm } from "./artifact-editor/useArtifactEditorForm";
import "./ArtifactEditor.css";

export interface ArtifactEditorProps {
  templateId: string;
  projectKey: string;
  artifactState?: ArtifactState;
  initialData?: Record<string, unknown>;
  onSave?: (data: Record<string, unknown>) => void;
  onProposeForReview?: (data: Record<string, unknown>) => void;
  onProposeChange?: (data: Record<string, unknown>) => void;
  onExport?: (data: Record<string, unknown>) => void;
  onCancel?: () => void;
}

export const ArtifactEditor: React.FC<ArtifactEditorProps> = ({
  templateId,
  projectKey: _projectKey, // Reserved for future use (artifact generation API)
  artifactState = "draft",
  initialData = {},
  onSave,
  onProposeForReview,
  onProposeChange,
  onExport,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [template, setTemplate] = useState<Template | null>(null);
  const [currentState, setCurrentState] =
    useState<ArtifactState>(artifactState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  const {
    formData,
    errors,
    hasChanges,
    isFormValid,
    validateForm,
    handleFieldChange,
    markSaved,
  } = useArtifactEditorForm({
    template,
    initialData,
  });

  // Warn on unsaved changes
  const { isBlocked, confirmNavigation, cancelNavigation } = useUnsavedChanges({
    when: hasChanges,
  });

  const canEdit = currentState === "draft" || currentState === "needsAttention";
  const canProposeForReview = currentState === "draft";
  const canProposeChange =
    currentState === "applied" || currentState === "complete";

  useEffect(() => {
    setCurrentState(artifactState);
  }, [artifactState]);

  useEffect(() => {
    loadTemplate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId]);

  const loadTemplate = async () => {
    try {
      setLoading(true);
      setError(null);
      const tmpl = await templateApiClient.getTemplate(templateId);
      setTemplate(tmpl);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("artifactEditor.errors.failedToLoadTemplate"),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!canEdit) {
      toast.showError(t("art.messages.readOnly"));
      return;
    }

    if (!validateForm()) {
      toast.showError(t("artifactEditor.messages.fixValidationErrors"));
      return;
    }

    setIsSaving(true);
    try {
      // Optimistic update - call onSave immediately
      await onSave?.(formData);
      markSaved();
      toast.showSuccess(t("artifactEditor.messages.savedSuccessfully"));
    } catch (err) {
      // Rollback on error
      const errorMsg =
        err instanceof Error
          ? err.message
          : t("artifactEditor.errors.failedToSaveArtifact");
      toast.showError(errorMsg);
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleProposeForReview = async () => {
    if (!validateForm()) {
      toast.showError(t("artifactEditor.messages.fixValidationErrors"));
      return;
    }

    await onProposeForReview?.(formData);
    setCurrentState("inReview");
    toast.showInfo(t("art.messages.sentForReview"));
  };

  const handleProposeChange = async () => {
    await onProposeChange?.(formData);
    setCurrentState("inReview");
    toast.showInfo(t("art.messages.changeProposed"));
  };

  const handleExport = () => {
    onExport?.(formData);
    toast.showInfo(t("art.messages.exportTriggered"));
  };

  // Keyboard navigation handlers
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Escape to cancel
    if (e.key === "Escape" && onCancel) {
      e.preventDefault();
      onCancel();
    }
  };

  const getFieldHelpKeys = (fieldName: string) => {
    const keyMap: Record<
      string,
      { titleKey: string; contentKey: string; learnMorePath: string }
    > = {
      name: {
        titleKey: "help.formFields.name.title",
        contentKey: "help.formFields.name.content",
        learnMorePath: "/help/projects",
      },
      description: {
        titleKey: "help.formFields.description.title",
        contentKey: "help.formFields.description.content",
        learnMorePath: "/help/iso21500",
      },
      artifactType: {
        titleKey: "help.formFields.artifactType.title",
        contentKey: "help.formFields.artifactType.content",
        learnMorePath: "/help/artifacts",
      },
      type: {
        titleKey: "help.formFields.artifactType.title",
        contentKey: "help.formFields.artifactType.content",
        learnMorePath: "/help/artifacts",
      },
    };

    return keyMap[fieldName];
  };

  if (loading) {
    return (
      <div
        className="artifact-editor"
        aria-busy="true"
        aria-label={t("artifactEditor.aria.loadingTemplate")}
      >
        <FormSkeleton fields={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="artifact-editor error" role="alert" aria-live="assertive">
        {error}
      </div>
    );
  }

  if (!template) {
    return (
      <div className="artifact-editor error" role="alert">
        {t("artifactEditor.errors.templateNotFound")}
      </div>
    );
  }

  return (
    <div className="artifact-editor" onKeyDown={handleKeyDown}>
      {/* Unsaved changes warning dialog */}
      {isBlocked && (
        <div
          className="unsaved-changes-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="unsaved-dialog-title"
        >
          <div className="dialog-content">
            <h3 id="unsaved-dialog-title">
              {t("artifactEditor.unsaved.title")}
            </h3>
            <p>{t("artifactEditor.unsaved.message")}</p>
            <div className="dialog-actions">
              <button onClick={cancelNavigation} className="btn-primary">
                {t("artifactEditor.unsaved.stay")}
              </button>
              <button onClick={confirmNavigation} className="btn-secondary">
                {t("artifactEditor.unsaved.leave")}
              </button>
            </div>
          </div>
        </div>
      )}

      <h2>
        {template.name}
        <span className="template-type">
          {t("artifactEditor.labels.templateType", {
            type: template.artifact_type,
          })}
        </span>
        <ArtifactStateBadge state={currentState} />
      </h2>
      <p className="template-description">{template.description}</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        aria-label={t("artifactEditor.aria.editorForm")}
      >
        {Object.entries(template.schema.properties).map(
          ([fieldName, fieldSchema]) => {
            const helpKeys = getFieldHelpKeys(fieldName);

            return (
              <ArtifactEditorField
                key={fieldName}
                fieldName={fieldName}
                fieldSchema={fieldSchema}
                template={template}
                value={formData[fieldName]}
                error={errors[fieldName]}
                canEdit={canEdit}
                t={t}
                helpKeys={helpKeys}
                onChange={handleFieldChange}
              />
            );
          },
        )}

        <ArtifactEditorActions
          canEdit={canEdit}
          canProposeForReview={canProposeForReview}
          canProposeChange={canProposeChange}
          isFormValid={isFormValid}
          isSaving={isSaving}
          onProposeForReview={handleProposeForReview}
          onProposeChange={handleProposeChange}
          onExport={handleExport}
          onCancel={onCancel}
          projectKey={_projectKey}
          artifactType={template.artifact_type || "charter"}
          t={t}
        />
      </form>
    </div>
  );
};
