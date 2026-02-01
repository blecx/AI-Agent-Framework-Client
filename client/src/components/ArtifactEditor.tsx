/**
 * ArtifactEditor Component
 * Template-driven form for creating/editing artifacts
 */

import React, { useEffect, useState, useMemo } from 'react';
import type { Template, JSONSchemaProperty } from '../types/template';
import { templateApiClient } from '../services/TemplateApiClient';
import './ArtifactEditor.css';

export interface ArtifactEditorProps {
  templateId: string;
  projectKey: string;
  initialData?: Record<string, unknown>;
  onSave?: (data: Record<string, unknown>) => void;
  onCancel?: () => void;
}

export const ArtifactEditor: React.FC<ArtifactEditorProps> = ({
  templateId,
  projectKey: _projectKey, // Reserved for future use (artifact generation API)
  initialData = {},
  onSave,
  onCancel,
}) => {
  const [template, setTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isFormValid = useMemo(() => {
    if (!template) return false;
    
    const schema = template.schema;
    for (const [fieldName, fieldSchema] of Object.entries(schema.properties)) {
      const isRequired = schema.required?.includes(fieldName);
      const value = formData[fieldName];
      
      if (isRequired && !value) {
        return false;
      }
      
      if (value) {
        if (fieldSchema.type === 'string' && typeof value !== 'string') {
          return false;
        }
        if (typeof value === 'string') {
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
  }, [template, formData]);

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
      setError(err instanceof Error ? err.message : 'Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  const validateField = (
    fieldName: string,
    value: unknown,
    schema: JSONSchemaProperty
  ): string | null => {
    // Required validation
    if (template?.schema.required?.includes(fieldName) && !value) {
      return `${schema.title || fieldName} is required`;
    }

    // Type validation
    if (value) {
      if (schema.type === 'string' && typeof value !== 'string') {
        return 'Must be a string';
      }
      if (schema.type === 'number' && typeof value !== 'number') {
        return 'Must be a number';
      }

      // String length validation
      if (typeof value === 'string') {
        if (schema.minLength && value.length < schema.minLength) {
          return `Minimum length is ${schema.minLength}`;
        }
        if (schema.maxLength && value.length > schema.maxLength) {
          return `Maximum length is ${schema.maxLength}`;
        }
        if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
          return `Invalid format`;
        }
      }
    }

    return null;
  };

  const validateForm = (): boolean => {
    if (!template) return false;

    const newErrors: Record<string, string> = {};
    const schema = template.schema;

    Object.entries(schema.properties).forEach(([fieldName, fieldSchema]) => {
      const error = validateField(fieldName, formData[fieldName], fieldSchema);
      if (error) {
        newErrors[fieldName] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (fieldName: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    // Clear error on change
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave?.(formData);
    }
  };

  const renderField = (fieldName: string, fieldSchema: JSONSchemaProperty, fieldId: string) => {
    const value = formData[fieldName];
    const label = fieldSchema.title || fieldName;

    // Render based on field type and format
    if (fieldSchema.enum) {
      return (
        <select
          id={fieldId}
          value={value as string || ''}
          onChange={(e) => handleFieldChange(fieldName, e.target.value)}
          className={errors[fieldName] ? 'error' : ''}
        >
          <option value="">Select {label}</option>
          {fieldSchema.enum.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    if (fieldSchema.format === 'date') {
      return (
        <input
          id={fieldId}
          type="date"
          value={value as string || ''}
          onChange={(e) => handleFieldChange(fieldName, e.target.value)}
          className={errors[fieldName] ? 'error' : ''}
        />
      );
    }

    if (fieldSchema.format === 'textarea' || fieldSchema.maxLength && fieldSchema.maxLength > 200) {
      return (
        <textarea
          id={fieldId}
          value={value as string || ''}
          onChange={(e) => handleFieldChange(fieldName, e.target.value)}
          rows={6}
          className={errors[fieldName] ? 'error' : ''}
        />
      );
    }

    if (fieldSchema.type === 'number') {
      return (
        <input
          id={fieldId}
          type="number"
          value={value as number || ''}
          onChange={(e) => handleFieldChange(fieldName, parseFloat(e.target.value))}
          className={errors[fieldName] ? 'error' : ''}
        />
      );
    }

    // Default: text input
    return (
      <input
        id={fieldId}
        type="text"
        value={value as string || ''}
        onChange={(e) => handleFieldChange(fieldName, e.target.value)}
        className={errors[fieldName] ? 'error' : ''}
      />
    );
  };

  if (loading) {
    return <div className="artifact-editor loading">Loading template...</div>;
  }

  if (error) {
    return <div className="artifact-editor error">{error}</div>;
  }

  if (!template) {
    return <div className="artifact-editor error">Template not found</div>;
  }

  return (
    <div className="artifact-editor">
      <h2>
        {template.name}
        <span className="template-type">{template.artifact_type}</span>
      </h2>
      <p className="template-description">{template.description}</p>

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        {Object.entries(template.schema.properties).map(([fieldName, fieldSchema]) => {
          const isRequired = template.schema.required?.includes(fieldName);
          const label = fieldSchema.title || fieldName;
          const fieldId = `field-${fieldName}`;

          return (
            <div key={fieldName} className="form-field">
              <label htmlFor={fieldId}>
                {label}
                {isRequired && <span className="required">*</span>}
              </label>
              {fieldSchema.description && (
                <p className="field-description">{fieldSchema.description}</p>
              )}
              {renderField(fieldName, fieldSchema, fieldId)}
              {errors[fieldName] && (
                <span className="field-error">{errors[fieldName]}</span>
              )}
            </div>
          );
        })}

        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={!isFormValid}
          >
            Save
          </button>
          {onCancel && (
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
