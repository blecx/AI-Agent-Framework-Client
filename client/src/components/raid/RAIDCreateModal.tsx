import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/apiClient';
import type { RAIDItemCreate } from '../../types/raid';
import {
  RAIDType,
  RAIDStatus,
  RAIDPriority,
  RAIDImpactLevel,
  RAIDLikelihood,
} from '../../types/raid';
import { showToast } from '../../utils/toast';
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

  const isRisk = formData.type === RAIDType.RISK;

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
            <div className="form-group">
              <label htmlFor="type">
                Type <span className="required">*</span>
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as RAIDType })
                }
                required
              >
                <option value={RAIDType.RISK}>Risk</option>
                <option value={RAIDType.ASSUMPTION}>Assumption</option>
                <option value={RAIDType.ISSUE}>Issue</option>
                <option value={RAIDType.DEPENDENCY}>Dependency</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="title">
                Title <span className="required">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className={errors.title ? 'error' : ''}
                required
              />
              {errors.title && (
                <span className="error-message">{errors.title}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="description">
                Description <span className="required">*</span>
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className={errors.description ? 'error' : ''}
                rows={4}
                required
              />
              {errors.description && (
                <span className="error-message">{errors.description}</span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as RAIDStatus,
                    })
                  }
                >
                  <option value={RAIDStatus.OPEN}>Open</option>
                  <option value={RAIDStatus.IN_PROGRESS}>In Progress</option>
                  <option value={RAIDStatus.MITIGATED}>Mitigated</option>
                  <option value={RAIDStatus.CLOSED}>Closed</option>
                  <option value={RAIDStatus.ACCEPTED}>Accepted</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: e.target.value as RAIDPriority,
                    })
                  }
                >
                  <option value={RAIDPriority.LOW}>Low</option>
                  <option value={RAIDPriority.MEDIUM}>Medium</option>
                  <option value={RAIDPriority.HIGH}>High</option>
                  <option value={RAIDPriority.CRITICAL}>Critical</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="owner">
                Owner <span className="required">*</span>
              </label>
              <input
                id="owner"
                type="text"
                value={formData.owner}
                onChange={(e) =>
                  setFormData({ ...formData, owner: e.target.value })
                }
                className={errors.owner ? 'error' : ''}
                required
              />
              {errors.owner && (
                <span className="error-message">{errors.owner}</span>
              )}
            </div>

            {isRisk && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="impact">
                      Impact <span className="required">*</span>
                    </label>
                    <select
                      id="impact"
                      value={formData.impact || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          impact: e.target.value as RAIDImpactLevel,
                        })
                      }
                      className={errors.impact ? 'error' : ''}
                      required
                    >
                      <option value="">Select Impact</option>
                      <option value={RAIDImpactLevel.LOW}>Low</option>
                      <option value={RAIDImpactLevel.MEDIUM}>Medium</option>
                      <option value={RAIDImpactLevel.HIGH}>High</option>
                      <option value={RAIDImpactLevel.VERY_HIGH}>
                        Very High
                      </option>
                    </select>
                    {errors.impact && (
                      <span className="error-message">{errors.impact}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="likelihood">
                      Likelihood <span className="required">*</span>
                    </label>
                    <select
                      id="likelihood"
                      value={formData.likelihood || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          likelihood: e.target.value as RAIDLikelihood,
                        })
                      }
                      className={errors.likelihood ? 'error' : ''}
                      required
                    >
                      <option value="">Select Likelihood</option>
                      <option value={RAIDLikelihood.VERY_UNLIKELY}>
                        Very Unlikely
                      </option>
                      <option value={RAIDLikelihood.UNLIKELY}>Unlikely</option>
                      <option value={RAIDLikelihood.POSSIBLE}>Possible</option>
                      <option value={RAIDLikelihood.LIKELY}>Likely</option>
                      <option value={RAIDLikelihood.VERY_LIKELY}>
                        Very Likely
                      </option>
                    </select>
                    {errors.likelihood && (
                      <span className="error-message">{errors.likelihood}</span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="mitigation_plan">Mitigation Plan</label>
                  <textarea
                    id="mitigation_plan"
                    value={formData.mitigation_plan || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mitigation_plan: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="target_resolution_date">
                Target Resolution Date
              </label>
              <input
                id="target_resolution_date"
                type="date"
                value={formData.target_resolution_date || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    target_resolution_date: e.target.value || null,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>Next Actions</label>
              {(formData.next_actions || []).map((action, index) => (
                <div key={index} className="next-action-row">
                  <input
                    type="text"
                    value={action}
                    onChange={(e) =>
                      handleNextActionChange(index, e.target.value)
                    }
                    placeholder="Enter action..."
                  />
                  <button
                    type="button"
                    onClick={() => removeNextAction(index)}
                    className="remove-action-btn"
                    aria-label="Remove action"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addNextAction}
                className="add-action-btn"
              >
                + Add Action
              </button>
            </div>
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
