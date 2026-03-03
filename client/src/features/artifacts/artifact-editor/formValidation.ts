import type { JSONSchemaProperty, Template } from "@/types/template";

export const validateArtifactField = (
  fieldName: string,
  value: unknown,
  schema: JSONSchemaProperty,
  template: Template | null,
  t: (key: string, options?: Record<string, unknown>) => string,
): string | null => {
  if (template?.schema.required?.includes(fieldName) && !value) {
    return t("artifactEditor.validation.required", {
      field: schema.title || fieldName,
    });
  }

  if (value) {
    if (schema.type === "string" && typeof value !== "string") {
      return t("artifactEditor.validation.mustBeString");
    }
    if (schema.type === "number" && typeof value !== "number") {
      return t("artifactEditor.validation.mustBeNumber");
    }

    if (typeof value === "string") {
      if (schema.minLength && value.length < schema.minLength) {
        return t("artifactEditor.validation.minLength", {
          min: schema.minLength,
        });
      }
      if (schema.maxLength && value.length > schema.maxLength) {
        return t("artifactEditor.validation.maxLength", {
          max: schema.maxLength,
        });
      }
      if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
        return t("artifactEditor.validation.invalidFormat");
      }
    }
  }

  return null;
};

export const isArtifactFormValid = (
  template: Template | null,
  formData: Record<string, unknown>,
): boolean => {
  if (!template) return false;

  const schema = template.schema;
  for (const [fieldName, fieldSchema] of Object.entries(schema.properties)) {
    const isRequired = schema.required?.includes(fieldName);
    const value = formData[fieldName];

    if (isRequired && !value) {
      return false;
    }

    if (value) {
      if (fieldSchema.type === "string" && typeof value !== "string") {
        return false;
      }
      if (typeof value === "string") {
        if (fieldSchema.minLength && value.length < fieldSchema.minLength) {
          return false;
        }
        if (fieldSchema.maxLength && value.length > fieldSchema.maxLength) {
          return false;
        }
      }
    }
  }

  return true;
};

/**
 * Validate every field in a template form and return all errors at once.
 *
 * Field order is deterministic: follows the declaration order of
 * `template.schema.properties` keys (as defined in the template schema).
 *
 * @param template  The template whose schema defines the required fields.
 * @param formData  The current form values keyed by field name.
 * @param t         Translation function, same signature as useArtifactEditorForm.
 * @returns         An object mapping fieldName → error message for each invalid
 *                  field. An empty object means the form is valid.
 */
export const validateArtifactForm = (
  template: Template | null,
  formData: Record<string, unknown>,
  t: (key: string, options?: Record<string, unknown>) => string,
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!template) {
    return errors;
  }

  for (const [fieldName, fieldSchema] of Object.entries(
    template.schema.properties,
  )) {
    const value = formData[fieldName];
    const error = validateArtifactField(fieldName, value, fieldSchema, template, t);
    if (error !== null) {
      errors[fieldName] = error;
    }
  }

  return errors;
};
