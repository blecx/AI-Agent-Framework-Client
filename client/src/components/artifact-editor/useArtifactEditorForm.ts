import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Template } from "../../types/template";
import {
  isArtifactFormValid,
  validateArtifactField,
} from "./formValidation";

interface UseArtifactEditorFormOptions {
  template: Template | null;
  initialData: Record<string, unknown>;
}

export const useArtifactEditorForm = ({
  template,
  initialData,
}: UseArtifactEditorFormOptions) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Record<string, unknown>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  const isFormValid = useMemo(
    () => isArtifactFormValid(template, formData),
    [template, formData],
  );

  const validateForm = (): boolean => {
    if (!template) return false;

    const newErrors: Record<string, string> = {};
    Object.entries(template.schema.properties).forEach(
      ([fieldName, fieldSchema]) => {
        const error = validateArtifactField(
          fieldName,
          formData[fieldName],
          fieldSchema,
          template,
          t,
        );

        if (error) {
          newErrors[fieldName] = error;
        }
      },
    );

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (fieldName: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    setHasChanges(true);
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const markSaved = () => setHasChanges(false);

  return {
    formData,
    errors,
    hasChanges,
    isFormValid,
    validateForm,
    handleFieldChange,
    markSaved,
  };
};
