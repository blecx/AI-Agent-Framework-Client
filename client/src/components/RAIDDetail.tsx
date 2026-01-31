import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';
import type {
  RAIDItem,
  RAIDItemUpdate,
} from '../types/raid';
import {
  RAIDType,
  RAIDStatus,
  RAIDPriority,
  RAIDImpactLevel,
  RAIDLikelihood,
} from '../types/raid';
import { showToast } from '../utils/toast';
import './RAIDDetail.css';

interface RAIDDetailProps {
  item: RAIDItem;
  projectKey: string;
  onClose: () => void;
}

export function RAIDDetail({ item, projectKey, onClose }: RAIDDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<RAIDItem>(item);
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (updates: RAIDItemUpdate) => {
      const response = await apiClient.updateRAIDItem(
        projectKey,
        item.id,
        updates
      );
      if (!response.success) {
        throw new Error(response.error || 'Failed to update RAID item');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['raid', projectKey] });
      showToast('RAID item updated successfully', 'success');
      setIsEditing(false);
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to update RAID item', 'error');
    },
  });

  const handleSave = () => {
    const updates: RAIDItemUpdate = {
      title: formData.title !== item.title ? formData.title : undefined,
      description:
        formData.description !== item.description
          ? formData.description
          : undefined,
      status: formData.status !== item.status ? formData.status : undefined,
      owner: formData.owner !== item.owner ? formData.owner : undefined,
      priority:
        formData.priority !== item.priority ? formData.priority : undefined,
      impact: formData.impact !== item.impact ? formData.impact : undefined,
      likelihood:
        formData.likelihood !== item.likelihood
          ? formData.likelihood
          : undefined,
      mitigation_plan:
        formData.mitigation_plan !== item.mitigation_plan
          ? formData.mitigation_plan
          : undefined,
      next_actions:
        JSON.stringify(formData.next_actions) !==
        JSON.stringify(item.next_actions)
          ? formData.next_actions
          : undefined,
      target_resolution_date:
        formData.target_resolution_date !== item.target_resolution_date
          ? formData.target_resolution_date
          : undefined,
    };

    // Only send if there are actual changes
    const hasChanges = Object.values(updates).some((v) => v !== undefined);
    if (!hasChanges) {
      showToast('No changes to save', 'info');
      setIsEditing(false);
      return;
    }

    updateMutation.mutate(updates);
  };

  const handleCancel = () => {
    setFormData(item);
    setIsEditing(false);
  };

  const getTypeLabel = (type: RAIDType): string => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getStatusLabel = (status: RAIDStatus): string => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleNextActionChange = (index: number, value: string) => {
    const newActions = [...formData.next_actions];
    newActions[index] = value;
    setFormData({ ...formData, next_actions: newActions });
  };

  const addNextAction = () => {
    setFormData({
      ...formData,
      next_actions: [...formData.next_actions, ''],
    });
  };

  const removeNextAction = (index: number) => {
    const newActions = formData.next_actions.filter((_, i) => i !== index);
    setFormData({ ...formData, next_actions: newActions });
  };

  return (
    <div className="raid-detail-overlay" onClick={onClose}>
      <div className="raid-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="raid-detail-header">
          <div className="raid-detail-title-row">
            <span className={`type-badge type-${item.type}`}>
              {getTypeLabel(item.type)}
            </span>
            <h2>{item.id}</h2>
            <button
              className="raid-detail-close"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        <div className="raid-detail-content">
          {isEditing ? (
            <form className="raid-detail-form">
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  required
                />
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
                    <option value={RAIDPriority.CRITICAL}>Critical</option>
                    <option value={RAIDPriority.HIGH}>High</option>
                    <option value={RAIDPriority.MEDIUM}>Medium</option>
                    <option value={RAIDPriority.LOW}>Low</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="owner">Owner</label>
                  <input
                    id="owner"
                    type="text"
                    value={formData.owner}
                    onChange={(e) =>
                      setFormData({ ...formData, owner: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="target_date">Target Resolution Date</label>
                  <input
                    id="target_date"
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
              </div>

              {item.type === RAIDType.RISK && (
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="impact">Impact</label>
                    <select
                      id="impact"
                      value={formData.impact || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          impact: (e.target.value ||
                            null) as RAIDImpactLevel | null,
                        })
                      }
                    >
                      <option value="">Not Set</option>
                      <option value={RAIDImpactLevel.VERY_HIGH}>
                        Very High
                      </option>
                      <option value={RAIDImpactLevel.HIGH}>High</option>
                      <option value={RAIDImpactLevel.MEDIUM}>Medium</option>
                      <option value={RAIDImpactLevel.LOW}>Low</option>
                      <option value={RAIDImpactLevel.VERY_LOW}>Very Low</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="likelihood">Likelihood</label>
                    <select
                      id="likelihood"
                      value={formData.likelihood || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          likelihood: (e.target.value ||
                            null) as RAIDLikelihood | null,
                        })
                      }
                    >
                      <option value="">Not Set</option>
                      <option value={RAIDLikelihood.VERY_LIKELY}>
                        Very Likely
                      </option>
                      <option value={RAIDLikelihood.LIKELY}>Likely</option>
                      <option value={RAIDLikelihood.POSSIBLE}>Possible</option>
                      <option value={RAIDLikelihood.UNLIKELY}>Unlikely</option>
                      <option value={RAIDLikelihood.VERY_UNLIKELY}>
                        Very Unlikely
                      </option>
                    </select>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="mitigation_plan">Mitigation Plan</label>
                <textarea
                  id="mitigation_plan"
                  value={formData.mitigation_plan}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      mitigation_plan: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Next Actions</label>
                {formData.next_actions.map((action, index) => (
                  <div key={index} className="next-action-row">
                    <input
                      type="text"
                      value={action}
                      onChange={(e) =>
                        handleNextActionChange(index, e.target.value)
                      }
                      placeholder={`Action ${index + 1}`}
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
            </form>
          ) : (
            <div className="raid-detail-view">
              <div className="detail-section">
                <h3>{item.title}</h3>
                <p className="detail-description">{item.description}</p>
              </div>

              <div className="detail-grid">
                <div className="detail-field">
                  <span className="detail-label">Status</span>
                  <span className={`status-badge status-${item.status}`}>
                    {getStatusLabel(item.status)}
                  </span>
                </div>

                <div className="detail-field">
                  <span className="detail-label">Priority</span>
                  <span className={`priority-badge priority-${item.priority}`}>
                    {item.priority.toUpperCase()}
                  </span>
                </div>

                <div className="detail-field">
                  <span className="detail-label">Owner</span>
                  <span>{item.owner}</span>
                </div>

                <div className="detail-field">
                  <span className="detail-label">Created</span>
                  <span>{formatDate(item.created_at)}</span>
                </div>

                <div className="detail-field">
                  <span className="detail-label">Updated</span>
                  <span>{formatDate(item.updated_at)}</span>
                </div>

                {item.target_resolution_date && (
                  <div className="detail-field">
                    <span className="detail-label">Target Date</span>
                    <span>{formatDate(item.target_resolution_date)}</span>
                  </div>
                )}

                {item.type === RAIDType.RISK && (
                  <>
                    {item.impact && (
                      <div className="detail-field">
                        <span className="detail-label">Impact</span>
                        <span>{item.impact.replace('_', ' ')}</span>
                      </div>
                    )}
                    {item.likelihood && (
                      <div className="detail-field">
                        <span className="detail-label">Likelihood</span>
                        <span>{item.likelihood.replace('_', ' ')}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {item.mitigation_plan && (
                <div className="detail-section">
                  <h4>Mitigation Plan</h4>
                  <p>{item.mitigation_plan}</p>
                </div>
              )}

              {item.next_actions && item.next_actions.length > 0 && (
                <div className="detail-section">
                  <h4>Next Actions</h4>
                  <ul className="next-actions-list">
                    {item.next_actions.map((action, index) => (
                      <li key={index}>{action}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="detail-metadata">
                <span>Created by: {item.created_by}</span>
                {item.updated_by && <span>Updated by: {item.updated_by}</span>}
              </div>
            </div>
          )}
        </div>

        <div className="raid-detail-footer">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="btn btn-secondary"
                disabled={updateMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn btn-primary"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <>
              <button onClick={onClose} className="btn btn-secondary">
                Close
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-primary"
              >
                Edit
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
