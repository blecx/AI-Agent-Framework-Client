import './ui.css';

export type BadgeVariant = 'neutral' | 'primary' | 'danger';

export interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({
  variant = 'neutral',
  children,
  className,
}: BadgeProps) {
  const classes = ['ui-badge', `ui-badge--${variant}`, className || '']
    .filter(Boolean)
    .join(' ');

  return <span className={classes}>{children}</span>;
}
