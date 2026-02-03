import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/apiClient';
import type { RAIDItemCreate } from '../../types/raid';
import { RAIDType, RAIDStatus, RAIDPriority } from '../../types/raid';
import { showToast } from '../../utils/toast';
import { RAIDTypeSection } from './RAIDTypeSection';
import { RAIDDetailsSection } from './RAIDDetailsSection';
import { RAIDMetadataSection } from './RAIDMetadataSection';
import { RAIDDatesSection } from './RAIDDatesSection';
import './RAIDCreateModal.css';

interface RAIDCreateModalProps {
  projectKey: string;
  onClose: () => void;
}

export function RAIDCreateModal({ projectKey, onClose }: RAIDCreateModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<RAIDItemCreate>({
    type: RAIDType.RISK,
    title: '',
    description: '',
    status: RAIDStatus.OPEN,
    owner: '',
    priority: RAIDPriority.MEDIUM,
    impact: null,
    likelihood: null,
    mitigation_plan: '',
    next_actions: [''],
    target_resolution_date: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (field: keyof RAIDItemCreate, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const createMutation = useMutation({
    mutationFn: async (data: RAIDItemCreate) => {
      const response = await apiClient.createRAIDItem(projectKey, data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create RAID item');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['raid', projectKey] });
      showToast('RAID item created successfully', 'success');
      onClose();
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to create RAID item', 'error');
    },
  });

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.owner.trim()) {
      newErrors.owner = 'Owner is required';
    }

    // Risk-specific validation
    if (formData.type === RAIDType.RISK) {
      if (!formData.impact) {
        newErrors.impact = 'Impact is required for risks';
      }
      if (!formData.likelihood) {
        newErrors.likelihood = 'Likelihood is required for risks';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Clean up the data
    const cleanedData: RAIDItemCreate = {
      ...formData,
      next_actions: formData.next_actions?.filter((a) => a.trim()) || [],
      mitigation_plan: formData.mitigation_plan?.trim() || undefined,
      target_resolution_date: formData.target_resolution_date || undefined,
    };

    // Remove risk-specific fields if not a risk
    if (formData.type !== RAIDType.RISK) {
      cleanedData.impact = undefined;
      cleanedData.likelihood = undefined;
      cleanedData.mitigation_plan = undefined;
    }

    createMutation.mutate(cleanedData);
  };

  const handleNextActionChange = (index: number, value: string) => {
    const newActions = [...(formData.next_actions || [])];
    newActions[index] = value;
    setFormData({ ...formData, next_actions: newActions });
  };

  const addNextAction = () => {
    setFormData({
      ...formData,
      next_actions: [...(formData.next_actions || []), ''],
    });
  };

  const removeNextAction = (index: number) => {
    const newActions = (formData.next_actions || []).filter(
      (_, i) => i !== index,
    );
    setFormData({ ...formData, next_actions: newActions });
  };

  return (
    <div className="raid-create-overlay" onClick={onClose}>
      <div
        className="raid-create-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="modal-title"
      >
        <div className="raid-create-header">
          <h2 id="modal-title">Add RAID Item</h2>
          <p className="raid-create-subtitle">
            Optional - Chat is primary for complex RAID creation
          </p>
          <button
            className="raid-create-close"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            ×
          </button>
        </div>

        <form className="raid-create-form" onSubmit={handleSubmit} noValidate>
          <div className="raid-create-content">
            <RAIDTypeSection formData={formData} onChange={handleFieldChange} />
            <RAIDDetailsSection
              formData={formData}
              errors={errors}
              onChange={handleFieldChange}
            />
            <RAIDMetadataSection
              formData={formData}
              errors={errors}
              onChange={handleFieldChange}
            />
            <RAIDDatesSection
              formData={formData}
              onChange={handleFieldChange}
              onNextActionChange={handleNextActionChange}
              onAddNextAction={addNextAction}
              onRemoveNextAction={removeNextAction}
            />
          </div>

          <div className="raid-create-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={createMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create RAID Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
