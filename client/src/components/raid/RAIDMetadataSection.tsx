import type { RAIDItemCreate } from '../../types/raid';
import {
  RAIDStatus,
  RAIDPriority,
  RAIDImpactLevel,
  RAIDLikelihood,
  RAIDType,
} from '../../types/raid';

interface RAIDMetadataSectionProps {
  formData: RAIDItemCreate;
  errors: Record<string, string>;
  onChange: (field: keyof RAIDItemCreate, value: any) => void;
}

export function RAIDMetadataSection({
  formData,
  errors,
  onChange,
}: RAIDMetadataSectionProps) {
  const isRisk = formData.type === RAIDType.RISK;

  return (
    <>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => onChange('status', e.target.value as RAIDStatus)}
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
              onChange('priority', e.target.value as RAIDPriority)
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
          onChange={(e) => onChange('owner', e.target.value)}
          className={errors.owner ? 'error' : ''}
          required
        />
        {errors.owner && <span className="error-message">{errors.owner}</span>}
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
                  onChange('impact', e.target.value as RAIDImpactLevel)
                }
                className={errors.impact ? 'error' : ''}
                required
              >
                <option value="">Select Impact</option>
                <option value={RAIDImpactLevel.LOW}>Low</option>
                <option value={RAIDImpactLevel.MEDIUM}>Medium</option>
                <option value={RAIDImpactLevel.HIGH}>High</option>
                <option value={RAIDImpactLevel.VERY_HIGH}>Very High</option>
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
                  onChange('likelihood', e.target.value as RAIDLikelihood)
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
                <option value={RAIDLikelihood.VERY_LIKELY}>Very Likely</option>
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
              onChange={(e) => onChange('mitigation_plan', e.target.value)}
              rows={3}
            />
          </div>
        </>
      )}
    </>
  );
}
