import { forwardRef } from 'react';
import './ui.css';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  'children'
> {
  label?: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, hint, error, id, className, options, ...rest }, ref) => {
    const selectId = id || rest.name || undefined;
    const describedById =
      hint || error ? `${selectId || 'ui-select'}-desc` : undefined;

    return (
      <div className="ui-field">
        {label ? (
          <label className="ui-field__label" htmlFor={selectId}>
            {label}
          </label>
        ) : null}
        <select
          ref={ref}
          id={selectId}
          className={['ui-select', className || ''].filter(Boolean).join(' ')}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedById}
          {...rest}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </select>
        {error ? (
          <div id={describedById} className="ui-field__error" role="alert">
            {error}
          </div>
        ) : hint ? (
          <div id={describedById} className="ui-field__hint">
            {hint}
          </div>
        ) : null}
      </div>
    );
  },
);

Select.displayName = 'Select';
