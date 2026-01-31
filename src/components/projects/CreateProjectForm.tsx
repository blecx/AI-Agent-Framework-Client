/**
 * CreateProjectForm Component
 * Quick-add form for creating simple projects without AI chat guidance
 * Note: AI chat (Step 2) is the primary method with governance guidance
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../../contexts/ProjectContext';
import { ProjectsService } from '../../services/api/projects';
import { ApiClient } from '../../services/api/client';
import './CreateProjectForm.css';

interface FormData {
  key: string;
  name: string;
  description: string;
}

interface FormErrors {
  key?: string;
  name?: string;
  description?: string;
  submit?: string;
}

type FormStep = 'basic' | 'settings' | 'confirmation';

export const CreateProjectForm: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentProjectKey } = useProject();
  
  const [projectsService] = useState(() => 
    new ProjectsService(
      new ApiClient({ baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000' })
    )
  );
  const [currentStep, setCurrentStep] = useState<FormStep>('basic');
  const [formData, setFormData] = useState<FormData>({
    key: '',
    name: '',
    description: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  // Validate project key format (uppercase letters, numbers, hyphens)
  const validateKey = (key: string): boolean => {
    const keyRegex = /^[A-Z][A-Z0-9-]*$/;
    return keyRegex.test(key);
  };

  // Validate current step fields
  const validateStep = (step: FormStep): boolean => {
    const newErrors: FormErrors = {};

    if (step === 'basic') {
      if (!formData.key.trim()) {
        newErrors.key = 'Project key is required';
      } else if (!validateKey(formData.key)) {
        newErrors.key = 'Key must start with uppercase letter, contain only uppercase letters, numbers, and hyphens';
      }

      if (!formData.name.trim()) {
        newErrors.name = 'Project name is required';
      } else if (formData.name.trim().length < 3) {
        newErrors.name = 'Project name must be at least 3 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle field changes
  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  // Navigate to next step
  const handleNext = () => {
    if (!validateStep(currentStep)) {
      return;
    }

    if (currentStep === 'basic') {
      setCurrentStep('settings');
    } else if (currentStep === 'settings') {
      setCurrentStep('confirmation');
    }
  };

  // Navigate to previous step
  const handleBack = () => {
    if (currentStep === 'settings') {
      setCurrentStep('basic');
    } else if (currentStep === 'confirmation') {
      setCurrentStep('settings');
    }
  };

  // Submit form to create project
  const handleSubmit = async () => {
    setLoading(true);
    setErrors({});

    try {
      const projectData = {
        key: formData.key.trim(),
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      };

      const createdProject = await projectsService.createProject(projectData);
      
      // Set as current project
      setCurrentProjectKey(createdProject.key);
      
      // Navigate to project dashboard (Issue #45 - when implemented)
      // For now, navigate to project list
      navigate('/projects');
    } catch (error: any) {
      console.error('Failed to create project:', error);
      setErrors({
        submit: error.message || 'Failed to create project. Please try again.',
      });
      setLoading(false);
    }
  };

  // Cancel and return to project list
  const handleCancel = () => {
    navigate('/projects');
  };

  // Render step indicator
  const renderStepIndicator = () => {
    const steps: { id: FormStep; label: string }[] = [
      { id: 'basic', label: 'Basic Info' },
      { id: 'settings', label: 'Settings' },
      { id: 'confirmation', label: 'Confirmation' },
    ];

    return (
      <div className="step-indicator">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`step ${currentStep === step.id ? 'active' : ''} ${
              steps.findIndex(s => s.id === currentStep) > index ? 'completed' : ''
            }`}
          >
            <div className="step-number">{index + 1}</div>
            <div className="step-label">{step.label}</div>
          </div>
        ))}
      </div>
    );
  };

  // Render basic info step
  const renderBasicStep = () => (
    <div className="form-step">
      <h3>Basic Information</h3>
      <p className="step-description">
        Enter the basic details for your project.
      </p>

      <div className="form-group">
        <label htmlFor="project-key">
          Project Key <span className="required">*</span>
        </label>
        <input
          id="project-key"
          type="text"
          value={formData.key}
          onChange={e => handleChange('key', e.target.value.toUpperCase())}
          placeholder="e.g., PROJ1"
          className={errors.key ? 'error' : ''}
          maxLength={20}
          aria-invalid={!!errors.key}
          aria-describedby={errors.key ? 'key-error' : undefined}
        />
        {errors.key && (
          <div id="key-error" className="error-message" role="alert">
            {errors.key}
          </div>
        )}
        <div className="field-hint">
          Unique identifier (uppercase, letters, numbers, hyphens)
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="project-name">
          Project Name <span className="required">*</span>
        </label>
        <input
          id="project-name"
          type="text"
          value={formData.name}
          onChange={e => handleChange('name', e.target.value)}
          placeholder="e.g., My Project"
          className={errors.name ? 'error' : ''}
          maxLength={100}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <div id="name-error" className="error-message" role="alert">
            {errors.name}
          </div>
        )}
        <div className="field-hint">Display name for your project</div>
      </div>

      <div className="form-actions">
        <button type="button" onClick={handleCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="button" onClick={handleNext} className="btn-primary">
          Next
        </button>
      </div>
    </div>
  );

  // Render settings step
  const renderSettingsStep = () => (
    <div className="form-step">
      <h3>Project Settings</h3>
      <p className="step-description">
        Add optional details about your project.
      </p>

      <div className="form-group">
        <label htmlFor="project-description">Description</label>
        <textarea
          id="project-description"
          value={formData.description}
          onChange={e => handleChange('description', e.target.value)}
          placeholder="Brief description of your project (optional)"
          rows={4}
          maxLength={500}
        />
        <div className="field-hint">
          {formData.description.length}/500 characters
        </div>
      </div>

      <div className="form-actions">
        <button type="button" onClick={handleBack} className="btn-secondary">
          Back
        </button>
        <button type="button" onClick={handleNext} className="btn-primary">
          Next
        </button>
      </div>
    </div>
  );

  // Render confirmation step
  const renderConfirmationStep = () => (
    <div className="form-step">
      <h3>Review & Confirm</h3>
      <p className="step-description">
        Please review your project details before creating.
      </p>

      <div className="confirmation-details">
        <div className="detail-row">
          <div className="detail-label">Project Key:</div>
          <div className="detail-value">{formData.key}</div>
        </div>
        <div className="detail-row">
          <div className="detail-label">Project Name:</div>
          <div className="detail-value">{formData.name}</div>
        </div>
        <div className="detail-row">
          <div className="detail-label">Description:</div>
          <div className="detail-value">
            {formData.description || <em>No description provided</em>}
          </div>
        </div>
      </div>

      {errors.submit && (
        <div className="error-message submit-error" role="alert">
          {errors.submit}
        </div>
      )}

      <div className="form-actions">
        <button
          type="button"
          onClick={handleBack}
          className="btn-secondary"
          disabled={loading}
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="btn-primary"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Project'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="create-project-form-container">
      <div className="form-header">
        <h2>Create New Project</h2>
        <div className="form-note">
          <strong>Note:</strong> This is a quick-add form for simple projects.
          For projects requiring ISO 21500 governance guidance, use the{' '}
          <strong>AI Chat workflow (Step 2)</strong>.
        </div>
      </div>

      {renderStepIndicator()}

      <div className="form-content">
        {currentStep === 'basic' && renderBasicStep()}
        {currentStep === 'settings' && renderSettingsStep()}
        {currentStep === 'confirmation' && renderConfirmationStep()}
      </div>
    </div>
  );
};
