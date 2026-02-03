import type { RAIDItemCreate } from '../../types/raid';

interface RAIDDatesSectionProps {
  formData: RAIDItemCreate;
  onChange: (field: keyof RAIDItemCreate, value: any) => void;
  onNextActionChange: (index: number, value: string) => void;
  onAddNextAction: () => void;
  onRemoveNextAction: (index: number) => void;
}

export function RAIDDatesSection({
  formData,
  onChange,
  onNextActionChange,
  onAddNextAction,
  onRemoveNextAction,
}: RAIDDatesSectionProps) {
  return (
    <>
      <div className="form-group">
        <label htmlFor="target_resolution_date">Target Resolution Date</label>
        <input
          id="target_resolution_date"
          type="date"
          value={formData.target_resolution_date || ''}
          onChange={(e) =>
            onChange('target_resolution_date', e.target.value || null)
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
              onChange={(e) => onNextActionChange(index, e.target.value)}
              placeholder="Enter action..."
            />
            <button
              type="button"
              onClick={() => onRemoveNextAction(index)}
              className="remove-action-btn"
              aria-label="Remove action"
            >
              ×
            </button>
          </div>
        ))}
        <button type="button" onClick={onAddNextAction} className="add-action-btn">
          + Add Action
        </button>
      </div>
    </>
  );
}
