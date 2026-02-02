/**
 * AuditViewer Component
 * Displays audit results with severity filtering and artifact linking
 */

import React, { useEffect, useState } from 'react';
import { AuditResult, AuditIssue, AuditSeverity } from '../types/api';
import { ApiClient } from '../services/api/client';
import { AuditService } from '../services/api/audit';
import './AuditViewer.css';

interface AuditViewerProps {
  projectKey: string;
}

type FilterType = 'all' | AuditSeverity;

export const AuditViewer: React.FC<AuditViewerProps> = ({ projectKey }) => {
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiClient = new ApiClient();
  const auditService = new AuditService(apiClient);

  // Load latest audit results on mount
  useEffect(() => {
    loadAuditResults();
  }, [projectKey]);

  const loadAuditResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const results = await auditService.getAuditResults(projectKey, 1);
      if (results.length > 0) {
        setAuditResult(results[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit results');
    } finally {
      setLoading(false);
    }
  };

  const handleRunAudit = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await auditService.runAudit(projectKey);
      setAuditResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run audit');
    } finally {
      setLoading(false);
    }
  };

  const filteredIssues =
    filter === 'all'
      ? auditResult?.issues || []
      : (auditResult?.issues || []).filter((issue) => issue.severity === filter);

  const getSeverityCount = (severity: AuditSeverity): number => {
    return (auditResult?.issues || []).filter((i) => i.severity === severity).length;
  };

  const getSeverityClass = (severity: string): string => {
    switch (severity) {
      case 'error':
        return 'severity-error';
      case 'warning':
        return 'severity-warning';
      case 'info':
        return 'severity-info';
      default:
        return '';
    }
  };

  const getArtifactLink = (issue: AuditIssue): string => {
    // Link to artifact with optional field focus
    const base = `/projects/${projectKey}/artifacts/${issue.artifact}`;
    return issue.field ? `${base}?field=${issue.field}` : base;
  };

  if (loading && !auditResult) {
    return <div className="audit-viewer loading">Loading audit results...</div>;
  }

  return (
    <div className="audit-viewer">
      <div className="audit-header">
        <h2>Audit Results</h2>
        <button
          onClick={handleRunAudit}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Running...' : 'Run Audit'}
        </button>
      </div>

      {error && <div className="audit-error">{error}</div>}

      {auditResult && (
        <>
          <div className="audit-summary">
            <div className="summary-item">
              <span className="label">Total Issues:</span>
              <span className="value">{auditResult.total_issues}</span>
            </div>
            <div className="summary-item">
              <span className="label">Completeness:</span>
              <span className="value">
                {(auditResult.completeness_score * 100).toFixed(1)}%
              </span>
            </div>
            {auditResult.timestamp && (
              <div className="summary-item">
                <span className="label">Last Run:</span>
                <span className="value">
                  {new Date(auditResult.timestamp).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          <div className="severity-filters">
            <button
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'active' : ''}
            >
              All ({auditResult.total_issues})
            </button>
            <button
              onClick={() => setFilter(AuditSeverity.ERROR)}
              className={filter === AuditSeverity.ERROR ? 'active severity-error' : 'severity-error'}
            >
              Errors ({getSeverityCount(AuditSeverity.ERROR)})
            </button>
            <button
              onClick={() => setFilter(AuditSeverity.WARNING)}
              className={filter === AuditSeverity.WARNING ? 'active severity-warning' : 'severity-warning'}
            >
              Warnings ({getSeverityCount(AuditSeverity.WARNING)})
            </button>
            <button
              onClick={() => setFilter(AuditSeverity.INFO)}
              className={filter === AuditSeverity.INFO ? 'active severity-info' : 'severity-info'}
            >
              Info ({getSeverityCount(AuditSeverity.INFO)})
            </button>
          </div>

          {filteredIssues.length === 0 ? (
            <div className="no-issues">
              {filter === 'all'
                ? '✓ No issues found. Project is compliant!'
                : `No ${filter} issues found.`}
            </div>
          ) : (
            <ul className="issues-list">
              {filteredIssues.map((issue, index) => (
                <li key={index} className={`issue-item ${getSeverityClass(issue.severity)}`}>
                  <span className={`severity-badge ${getSeverityClass(issue.severity)}`}>
                    {issue.severity}
                  </span>
                  <div className="issue-content">
                    <div className="issue-path">
                      {issue.artifact}
                      {issue.item_id && ` → ${issue.item_id}`}
                      {issue.field && ` → ${issue.field}`}
                    </div>
                    <div className="issue-message">{issue.message}</div>
                    <div className="issue-rule">Rule: {issue.rule}</div>
                  </div>
                  <a
                    href={getArtifactLink(issue)}
                    className="fix-link"
                  >
                    Fix →
                  </a>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};
