/**
 * ArtifactEditor Component
 * Template-driven form for creating/editing artifacts
 */

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { Template, JSONSchemaProperty } from '../types/template';
import type { ArtifactState } from '../types/artifact';
import { templateApiClient } from '../services/TemplateApiClient';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import { FormSkeleton } from './LoadingSkeleton';
import { useToast } from '../hooks/useToast';
import ArtifactStateBadge from './ArtifactStateBadge';
import './ArtifactEditor.css';

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
  artifactState = 'draft',
  initialData = {},
  onSave,
  onProposeForReview,
  onProposeChange,
  onExport,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [template, setTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>(initialData);
  const [currentState, setCurrentState] = useState<ArtifactState>(artifactState);
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

  const canEdit = currentState === 'draft' || currentState === 'needsAttention';
  const canProposeForReview = currentState === 'draft';
  const canProposeChange = currentState === 'applied' || currentState === 'complete';

  useEffect(() => {
    setCurrentState(artifactState);
  }, [artifactState]);

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
      setError(err instanceof Error ? err.message : t('artifactEditor.errors.failedToLoadTemplate'));
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
      return t('artifactEditor.validation.required', { field: schema.title || fieldName });
    }

    // Type validation
    if (value) {
      if (schema.type === 'string' && typeof value !== 'string') {
        return t('artifactEditor.validation.mustBeString');
      }
      if (schema.type === 'number' && typeof value !== 'number') {
        return t('artifactEditor.validation.mustBeNumber');
      }

      // String length validation
      if (typeof value === 'string') {
        if (schema.minLength && value.length < schema.minLength) {
          return t('artifactEditor.validation.minLength', { min: schema.minLength });
        }
        if (schema.maxLength && value.length > schema.maxLength) {
          return t('artifactEditor.validation.maxLength', { max: schema.maxLength });
        }
        if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
          return t('artifactEditor.validation.invalidFormat');
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
    if (!canEdit) {
      toast.showError(t('art.messages.readOnly'));
      return;
    }

    if (!validateForm()) {
      toast.showError(t('artifactEditor.messages.fixValidationErrors'));
      return;
    }

    setIsSaving(true);
    const previousData = { ...formData };

    try {
      // Optimistic update - call onSave immediately
      await onSave?.(formData);
      setHasChanges(false);
      toast.showSuccess(t('artifactEditor.messages.savedSuccessfully'));
    } catch (err) {
      // Rollback on error
      setFormData(previousData);
      const errorMsg = err instanceof Error ? err.message : t('artifactEditor.errors.failedToSaveArtifact');
      toast.showError(errorMsg);
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleProposeForReview = async () => {
    if (!validateForm()) {
      toast.showError(t('artifactEditor.messages.fixValidationErrors'));
      return;
    }

    await onProposeForReview?.(formData);
    setCurrentState('inReview');
    toast.showInfo(t('art.messages.sentForReview'));
  };

  const handleProposeChange = async () => {
    await onProposeChange?.(formData);
    setCurrentState('inReview');
    toast.showInfo(t('art.messages.changeProposed'));
  };

  const handleExport = () => {
    onExport?.(formData);
    toast.showInfo(t('art.messages.exportTriggered'));
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
      disabled: !canEdit,
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
          <option value="">{t('artifactEditor.form.selectField', { field: label })}</option>
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
      <div className="artifact-editor" aria-busy="true" aria-label={t('artifactEditor.aria.loadingTemplate')}>
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
        {t('artifactEditor.errors.templateNotFound')}
      </div>
    );
  }

  return (
    <div className="artifact-editor" onKeyDown={handleKeyDown}>
      {/* Unsaved changes warning dialog */}
      {isBlocked && (
        <div className="unsaved-changes-dialog" role="dialog" aria-modal="true" aria-labelledby="unsaved-dialog-title">
          <div className="dialog-content">
            <h3 id="unsaved-dialog-title">{t('artifactEditor.unsaved.title')}</h3>
            <p>{t('artifactEditor.unsaved.message')}</p>
            <div className="dialog-actions">
              <button onClick={cancelNavigation} className="btn-primary">
                {t('artifactEditor.unsaved.stay')}
              </button>
              <button onClick={confirmNavigation} className="btn-secondary">
                {t('artifactEditor.unsaved.leave')}
              </button>
            </div>
          </div>
        </div>
      )}

      <h2>
        {template.name}
        <span className="template-type">{t('artifactEditor.labels.templateType', { type: template.artifact_type })}</span>
        <ArtifactStateBadge state={currentState} />
      </h2>
      <p className="template-description">{template.description}</p>

      <form ref={formRef} onSubmit={(e) => { e.preventDefault(); handleSave(); }} aria-label={t('artifactEditor.aria.editorForm')}>
        {Object.entries(template.schema.properties).map(([fieldName, fieldSchema]) => {
          const isRequired = template.schema.required?.includes(fieldName);
          const label = fieldSchema.title || fieldName;
          const fieldId = `field-${fieldName}`;

          return (
            <div key={fieldName} className="form-field">
              <label htmlFor={fieldId}>
                {label}
                {isRequired && <span className="required" aria-label={t('artifactEditor.aria.required')}>*</span>}
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
          {canEdit && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                const artifactType = template.artifact_type || 'charter';
                window.location.assign(
                  `/projects/${_projectKey}/assisted-creation?artifactType=${artifactType}`,
                );
              }}
            >
              {t('art.action.improveWithAI')}
            </button>
          )}
          {canEdit && (
            <button
              type="submit"
              className="btn-primary"
              disabled={!isFormValid || isSaving || !canEdit}
              aria-busy={isSaving}
            >
              {isSaving ? t('artifactEditor.actions.saving') : t('artifactEditor.actions.save')}
            </button>
          )}
          {canProposeForReview && (
            <button type="button" className="btn-primary" onClick={handleProposeForReview}>
              {t('art.action.propose')}
            </button>
          )}
          {canProposeChange && (
            <button type="button" className="btn-primary" onClick={handleProposeChange}>
              {t('art.action.proposeChange')}
            </button>
          )}
          <button type="button" className="btn-secondary" onClick={handleExport}>
            {t('art.action.export')}
          </button>
          {onCancel && (
            <button type="button" className="btn-secondary" onClick={onCancel}>
              {t('artifactEditor.actions.cancel')}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
