import { forwardRef } from 'react';
import './ui.css';

export interface TextareaProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'children'
> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, id, className, ...rest }, ref) => {
    const textareaId = id || rest.name || undefined;
    const describedById =
      hint || error ? `${textareaId || 'ui-textarea'}-desc` : undefined;

    return (
      <div className="ui-field">
        {label ? (
          <label className="ui-field__label" htmlFor={textareaId}>
            {label}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={textareaId}
          className={['ui-textarea', className || ''].filter(Boolean).join(' ')}
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

Textarea.displayName = 'Textarea';
