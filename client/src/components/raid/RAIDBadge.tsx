import type {
  RAIDType,
  RAIDStatus,
  RAIDPriority,
} from '../../types/raid';
import './RAIDBadge.css';

interface RAIDBadgeProps {
  variant: 'type' | 'status' | 'priority';
  value: RAIDType | RAIDStatus | RAIDPriority;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function RAIDBadge({
  variant,
  value,
  size = 'md',
  className = '',
}: RAIDBadgeProps) {
  const getLabel = (): string => {
    if (variant === 'type') {
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
    if (variant === 'status') {
      return value
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    // priority
    return value.toUpperCase();
  };

  const baseClass = `raid-badge raid-badge-${variant} raid-badge-${size}`;
  const variantClass = `raid-badge-${variant}-${value}`;
  const classes = `${baseClass} ${variantClass} ${className}`.trim();

  return <span className={classes}>{getLabel()}</span>;
}

// Convenience components for specific badge types
export function TypeBadge({
  value,
  size,
  className,
}: {
  value: RAIDType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  return (
    <RAIDBadge
      variant="type"
      value={value}
      size={size}
      className={className}
    />
  );
}

export function StatusBadge({
  value,
  size,
  className,
}: {
  value: RAIDStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  return (
    <RAIDBadge
      variant="status"
      value={value}
      size={size}
      className={className}
    />
  );
}

export function PriorityBadge({
  value,
  size,
  className,
}: {
  value: RAIDPriority;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  return (
    <RAIDBadge
      variant="priority"
      value={value}
      size={size}
      className={className}
    />
  );
}
