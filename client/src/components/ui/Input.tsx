import { forwardRef, useId } from 'react';

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
    const autoId = useId();
    const inputId = id || rest.name || autoId;
    const describedById = hint || error ? `${inputId}-desc` : undefined;

    return (
      <div className="flex flex-col space-y-1.5 w-full">
        {label ? (
          <label className="text-sm font-medium text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor={inputId}>
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={[
            'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 ring-offset-white',
            error ? 'border-red-500 focus-visible:ring-red-500' : '',
            className || ''
          ].filter(Boolean).join(' ')}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedById}
          {...rest}
        />
        {error ? (
          <div id={describedById} className="text-[0.8rem] font-medium text-red-500" role="alert">
            {error}
          </div>
        ) : hint ? (
          <div id={describedById} className="text-[0.8rem] text-gray-500">
            {hint}
          </div>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';
