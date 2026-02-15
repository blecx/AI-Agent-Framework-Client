import type { TFunction } from "i18next";
import type { JSONSchemaProperty, Template } from "../../types/template";
import HelpTooltip from "../HelpTooltip";

interface HelpKeys {
  titleKey: string;
  contentKey: string;
  learnMorePath: string;
}

interface ArtifactEditorFieldProps {
  fieldName: string;
  fieldSchema: JSONSchemaProperty;
  template: Template;
  value: unknown;
  error?: string;
  canEdit: boolean;
  t: TFunction;
  helpKeys?: HelpKeys;
  onChange: (fieldName: string, value: unknown) => void;
}

const renderInputControl = ({
  fieldName,
  fieldSchema,
  value,
  fieldId,
  error,
  canEdit,
  t,
  onChange,
  label,
  isRequired,
}: {
  fieldName: string;
  fieldSchema: JSONSchemaProperty;
  value: unknown;
  fieldId: string;
  error?: string;
  canEdit: boolean;
  t: TFunction;
  onChange: (fieldName: string, value: unknown) => void;
  label: string;
  isRequired: boolean;
}) => {
  const commonProps = {
    id: fieldId,
    disabled: !canEdit,
    "aria-required": isRequired,
    "aria-invalid": !!error,
    "aria-describedby": error
      ? `${fieldId}-error`
      : fieldSchema.description
        ? `${fieldId}-desc`
        : undefined,
  };

  if (fieldSchema.enum) {
    return (
      <select
        {...commonProps}
        value={(value as string) || ""}
        onChange={(e) => onChange(fieldName, e.target.value)}
        className={error ? "error" : ""}
      >
        <option value="">
          {t("artifactEditor.form.selectField", { field: label })}
        </option>
        {fieldSchema.enum.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  if (fieldSchema.format === "date") {
    return (
      <input
        {...commonProps}
        type="date"
        value={(value as string) || ""}
        onChange={(e) => onChange(fieldName, e.target.value)}
        className={error ? "error" : ""}
      />
    );
  }

  if (
    fieldSchema.format === "textarea" ||
    (fieldSchema.maxLength && fieldSchema.maxLength > 200)
  ) {
    return (
      <textarea
        {...commonProps}
        value={(value as string) || ""}
        onChange={(e) => onChange(fieldName, e.target.value)}
        rows={6}
        className={error ? "error" : ""}
      />
    );
  }

  if (fieldSchema.type === "number") {
    return (
      <input
        {...commonProps}
        type="number"
        value={(value as number) || ""}
        onChange={(e) => onChange(fieldName, parseFloat(e.target.value))}
        className={error ? "error" : ""}
      />
    );
  }

  return (
    <input
      {...commonProps}
      type="text"
      value={(value as string) || ""}
      onChange={(e) => onChange(fieldName, e.target.value)}
      className={error ? "error" : ""}
    />
  );
};

export const ArtifactEditorField: React.FC<ArtifactEditorFieldProps> = ({
  fieldName,
  fieldSchema,
  template,
  value,
  error,
  canEdit,
  t,
  helpKeys,
  onChange,
}) => {
  const label = fieldSchema.title || fieldName;
  const fieldId = `field-${fieldName}`;
  const isRequired = template.schema.required?.includes(fieldName) || false;

  return (
    <div className="form-field">
      <label htmlFor={fieldId}>
        {label}
        {helpKeys && (
          <HelpTooltip
            titleKey={helpKeys.titleKey}
            contentKey={helpKeys.contentKey}
            learnMorePath={helpKeys.learnMorePath}
          />
        )}
        {isRequired && (
          <span className="required" aria-label={t("artifactEditor.aria.required")}>
            *
          </span>
        )}
      </label>

      {fieldSchema.description && (
        <p id={`${fieldId}-desc`} className="field-description">
          {fieldSchema.description}
        </p>
      )}

      {renderInputControl({
        fieldName,
        fieldSchema,
        value,
        fieldId,
        error,
        canEdit,
        t,
        onChange,
        label,
        isRequired,
      })}

      {error && (
        <span
          id={`${fieldId}-error`}
          className="field-error"
          role="alert"
          aria-live="polite"
        >
          {error}
        </span>
      )}
    </div>
  );
};
