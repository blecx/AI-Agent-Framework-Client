import { forwardRef } from 'react';
import './ui.css';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'disabled'
> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      disabled = false,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;

    const classes = [
      'ui-button',
      `ui-button--${variant}`,
      `ui-button--${size}`,
      fullWidth ? 'ui-button--fullWidth' : '',
      className || '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button ref={ref} className={classes} disabled={isDisabled} {...rest}>
        {isLoading && <span className="ui-spinner" aria-hidden="true" />}
        <span>{children}</span>
      </button>
    );
  },
);

Button.displayName = 'Button';
