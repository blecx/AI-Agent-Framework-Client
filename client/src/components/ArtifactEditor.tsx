/**
 * ArtifactEditor Component
 * Template-driven form for creating/editing artifacts
 */

import React, { useEffect, useState, useMemo, useRef } from 'react';
import type { Template, JSONSchemaProperty } from '../types/template';
import { templateApiClient } from '../services/TemplateApiClient';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import { FormSkeleton } from './LoadingSkeleton';
import { useToast } from '../hooks/useToast';
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
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const toast = useToast();

  // Warn on unsaved changes
  const { isBlocked, confirmNavigation, cancelNavigation } = useUnsavedChanges({
    when: hasChanges,
  });

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
    setHasChanges(true);
    // Clear error on change
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.showError('Please fix validation errors before saving');
      return;
    }

    setIsSaving(true);
    const previousData = { ...formData };

    try {
      // Optimistic update - call onSave immediately
      await onSave?.(formData);
      setHasChanges(false);
      toast.showSuccess('Artifact saved successfully');
    } catch (err) {
      // Rollback on error
      setFormData(previousData);
      const errorMsg = err instanceof Error ? err.message : 'Failed to save artifact';
      toast.showError(errorMsg);
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Keyboard navigation handlers
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Escape to cancel
    if (e.key === 'Escape' && onCancel) {
      e.preventDefault();
      onCancel();
    }
  };

  const renderField = (fieldName: string, fieldSchema: JSONSchemaProperty, fieldId: string) => {
    const value = formData[fieldName];
    const label = fieldSchema.title || fieldName;
    const isRequired = template?.schema.required?.includes(fieldName);
    const commonProps = {
      id: fieldId,
      'aria-required': isRequired,
      'aria-invalid': !!errors[fieldName],
      'aria-describedby': errors[fieldName] ? `${fieldId}-error` : fieldSchema.description ? `${fieldId}-desc` : undefined,
    };

    // Render based on field type and format
    if (fieldSchema.enum) {
      return (
        <select
          {...commonProps}
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
          {...commonProps}
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
          {...commonProps}
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
          {...commonProps}
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
        {...commonProps}
        type="text"
        value={value as string || ''}
        onChange={(e) => handleFieldChange(fieldName, e.target.value)}
        className={errors[fieldName] ? 'error' : ''}
      />
    );
  };

  if (loading) {
    return (
      <div className="artifact-editor" aria-busy="true" aria-label="Loading template">
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
        Template not found
      </div>
    );
  }

  return (
    <div className="artifact-editor" onKeyDown={handleKeyDown}>
      {/* Unsaved changes warning dialog */}
      {isBlocked && (
        <div className="unsaved-changes-dialog" role="dialog" aria-modal="true" aria-labelledby="unsaved-dialog-title">
          <div className="dialog-content">
            <h3 id="unsaved-dialog-title">Unsaved Changes</h3>
            <p>You have unsaved changes. Are you sure you want to leave?</p>
            <div className="dialog-actions">
              <button onClick={cancelNavigation} className="btn-primary">
                Stay
              </button>
              <button onClick={confirmNavigation} className="btn-secondary">
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

      <h2>
        {template.name}
        <span className="template-type">{template.artifact_type}</span>
      </h2>
      <p className="template-description">{template.description}</p>

      <form ref={formRef} onSubmit={(e) => { e.preventDefault(); handleSave(); }} aria-label="Artifact editor form">
        {Object.entries(template.schema.properties).map(([fieldName, fieldSchema]) => {
          const isRequired = template.schema.required?.includes(fieldName);
          const label = fieldSchema.title || fieldName;
          const fieldId = `field-${fieldName}`;

          return (
            <div key={fieldName} className="form-field">
              <label htmlFor={fieldId}>
                {label}
                {isRequired && <span className="required" aria-label="required">*</span>}
              </label>
              {fieldSchema.description && (
                <p id={`${fieldId}-desc`} className="field-description">{fieldSchema.description}</p>
              )}
              {renderField(fieldName, fieldSchema, fieldId)}
              {errors[fieldName] && (
                <span id={`${fieldId}-error`} className="field-error" role="alert" aria-live="polite">
                  {errors[fieldName]}
                </span>
              )}
            </div>
          );
        })}

        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={!isFormValid || isSaving}
            aria-busy={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
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
