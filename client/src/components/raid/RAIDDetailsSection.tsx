import type { RAIDItemCreate } from '../../types/raid';

interface RAIDDetailsSectionProps {
  formData: RAIDItemCreate;
  errors: Record<string, string>;
  onChange: (field: keyof RAIDItemCreate, value: any) => void;
}

export function RAIDDetailsSection({
  formData,
  errors,
  onChange,
}: RAIDDetailsSectionProps) {
  return (
    <>
      <div className="form-group">
        <label htmlFor="title">
          Title <span className="required">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => onChange('title', e.target.value)}
          className={errors.title ? 'error' : ''}
          required
        />
        {errors.title && <span className="error-message">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description">
          Description <span className="required">*</span>
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
          className={errors.description ? 'error' : ''}
          rows={4}
          required
        />
        {errors.description && (
          <span className="error-message">{errors.description}</span>
        )}
      </div>
    </>
  );
}
