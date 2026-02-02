/**
 * LoadingSkeleton Component
 * Displays skeleton loaders during data fetching
 */

import React from 'react';
import './LoadingSkeleton.css';

export interface LoadingSkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  count?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'text',
  width,
  height,
  count = 1,
  className = '',
}) => {
  const skeletonClass = `skeleton skeleton-${variant} ${className}`.trim();
  
  const style: React.CSSProperties = {
    ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
    ...(height && { height: typeof height === 'number' ? `${height}px` : height }),
  };

  const items = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={skeletonClass}
      style={style}
      role="status"
      aria-label="Loading..."
      aria-busy="true"
    />
  ));

  return <>{items}</>;
};

// Preset skeleton layouts for common use cases
export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="skeleton-list">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="skeleton-list-item">
        <LoadingSkeleton variant="circular" width={40} height={40} />
        <div className="skeleton-list-content">
          <LoadingSkeleton variant="text" width="60%" />
          <LoadingSkeleton variant="text" width="40%" />
        </div>
      </div>
    ))}
  </div>
);

export const CardSkeleton: React.FC = () => (
  <div className="skeleton-card">
    <LoadingSkeleton variant="rectangular" height={200} />
    <div className="skeleton-card-content">
      <LoadingSkeleton variant="text" width="80%" />
      <LoadingSkeleton variant="text" width="60%" />
    </div>
  </div>
);

export const FormSkeleton: React.FC<{ fields?: number }> = ({ fields = 4 }) => (
  <div className="skeleton-form">
    {Array.from({ length: fields }, (_, i) => (
      <div key={i} className="skeleton-form-field">
        <LoadingSkeleton variant="text" width="30%" height={20} />
        <LoadingSkeleton variant="rectangular" height={40} />
      </div>
    ))}
  </div>
);
