/**
 * AuditBadge Component
 * Displays project-level audit status with color-coded indicator
 */

import React from 'react';
import './AuditBadge.css';

export interface AuditBadgeProps {
  errorCount: number;
  warningCount: number;
  infoCount: number;
  onClick?: () => void;
}

export const AuditBadge: React.FC<AuditBadgeProps> = ({
  errorCount,
  warningCount,
  infoCount,
  onClick,
}) => {
  const status =
    errorCount > 0 ? 'error' : warningCount > 0 ? 'warning' : 'success';

  const icon = status === 'error' ? '✗' : status === 'warning' ? '⚠' : '✓';

  const message =
    status === 'success'
      ? 'No Issues'
      : `${errorCount} error${errorCount !== 1 ? 's' : ''}, ${warningCount} warning${warningCount !== 1 ? 's' : ''}`;

  const title = `${errorCount} errors, ${warningCount} warnings, ${infoCount} info`;

  return (
    <button
      className={`audit-badge audit-badge--${status}`}
      onClick={onClick}
      title={title}
      aria-label={`Audit status: ${message}`}
    >
      <span className="audit-badge__icon">{icon}</span>
      <span className="audit-badge__text">{message}</span>
    </button>
  );
};
