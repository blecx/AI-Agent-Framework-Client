import './Skeleton.css';

interface SkeletonProps {
  width?: string;
  height?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  className?: string;
}

export default function Skeleton({
  width = '100%',
  height = '20px',
  variant = 'text',
  className = '',
}: SkeletonProps) {
  return (
    <div
      className={`skeleton skeleton-${variant} ${className}`}
      style={{ width, height }}
      aria-busy="true"
      aria-live="polite"
    />
  );
}

export function SkeletonProjectCard() {
  return (
    <div className="skeleton-project-card" aria-busy="true">
      <Skeleton
        variant="rectangular"
        height="24px"
        width="60%"
        className="skeleton-title"
      />
      <Skeleton
        variant="text"
        height="16px"
        width="40%"
        className="skeleton-subtitle"
      />
      <Skeleton variant="text" height="14px" width="80%" />
      <Skeleton variant="text" height="14px" width="90%" />
      <div className="skeleton-meta">
        <Skeleton variant="text" height="12px" width="30%" />
        <Skeleton variant="text" height="12px" width="25%" />
      </div>
    </div>
  );
}

export function SkeletonTableRow() {
  return (
    <tr className="skeleton-row" aria-busy="true">
      <td>
        <Skeleton height="16px" />
      </td>
      <td>
        <Skeleton height="16px" />
      </td>
      <td>
        <Skeleton height="16px" />
      </td>
      <td>
        <Skeleton height="16px" />
      </td>
    </tr>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="skeleton-list" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-list-item">
          <Skeleton
            variant="rectangular"
            height="16px"
            width="24px"
            className="skeleton-icon"
          />
          <div className="skeleton-list-content">
            <Skeleton height="16px" width="70%" />
            <Skeleton height="14px" width="50%" />
          </div>
        </div>
      ))}
    </div>
  );
}
