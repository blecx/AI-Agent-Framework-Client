import { RAIDType } from '../../types/raid';
import type { RAIDItemCreate } from '../../types/raid';

interface RAIDTypeSectionProps {
  formData: RAIDItemCreate;
  onChange: (field: keyof RAIDItemCreate, value: string | null) => void;
}

export function RAIDTypeSection({ formData, onChange }: RAIDTypeSectionProps) {
  return (
    <div className="form-group">
      <label htmlFor="type">
        Type <span className="required">*</span>
      </label>
      <select
        id="type"
        value={formData.type}
        onChange={(e) => onChange('type', e.target.value as RAIDType)}
        required
      >
        <option value={RAIDType.RISK}>Risk</option>
        <option value={RAIDType.ASSUMPTION}>Assumption</option>
        <option value={RAIDType.ISSUE}>Issue</option>
        <option value={RAIDType.DEPENDENCY}>Dependency</option>
      </select>
    </div>
  );
}
