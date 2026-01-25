import { forwardRef } from 'react';
import './ui.css';

export interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'size'
> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, id, className, ...rest }, ref) => {
    const inputId = id || rest.name || undefined;
    const describedById =
      hint || error ? `${inputId || 'ui-input'}-desc` : undefined;

    return (
      <div className="ui-field">
        {label ? (
          <label className="ui-field__label" htmlFor={inputId}>
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={['ui-input', className || ''].filter(Boolean).join(' ')}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedById}
          {...rest}
        />
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

Input.displayName = 'Input';
