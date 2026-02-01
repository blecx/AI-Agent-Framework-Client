/**
 * Audit Viewer Component
 * Displays audit results with severity filtering and artifact links
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  AuditApiClient,
  type AuditResult,
  type AuditIssue,
} from '../services/AuditApiClient';
import './AuditViewer.css';

interface AuditViewerProps {
  projectKey: string;
}

type SeverityFilter = 'all' | 'error' | 'warning' | 'info';

export const AuditViewer: React.FC<AuditViewerProps> = ({ projectKey }) => {
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [filter, setFilter] = useState<SeverityFilter>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<string | null>(null);

  const loadAuditResults = useCallback(async () => {
    const apiClient = new AuditApiClient();
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.getAuditResults(projectKey);
      setAuditResult(result);
      setLastRun(result.timestamp);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to load audit results';
      setError(errorMsg);
      setAuditResult(null);
    } finally {
      setLoading(false);
    }
  }, [projectKey]);

  useEffect(() => {
    loadAuditResults();
  }, [loadAuditResults]);

  const handleRunAudit = async () => {
    const apiClient = new AuditApiClient();
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.runAudit(projectKey);
      setAuditResult(result);
      setLastRun(result.timestamp);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to run audit';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const filteredIssues =
    auditResult?.issues.filter(
      (issue) => filter === 'all' || issue.severity === filter,
    ) || [];

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60)
      return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  };

  const getSeverityBadgeClass = (severity: string) => {
    return `severity-badge severity-${severity}`;
  };

  return (
    <div className="audit-viewer">
      <div className="audit-header">
        <h2>Audit Results</h2>
        <div className="audit-actions">
          {lastRun && (
            <span className="last-run">
              Last audit: {formatTimestamp(lastRun)}
            </span>
          )}
          <button
            onClick={handleRunAudit}
            disabled={loading}
            className="btn-run-audit"
          >
            {loading ? 'Running...' : 'Run Audit'}
          </button>
        </div>
      </div>

      {error && <div className="audit-error">{error}</div>}

      {auditResult && (
        <>
          <div className="severity-summary">
            <div className="summary-item error">
              <span className="count">{auditResult.summary.errors}</span>
              <span className="label">Errors</span>
            </div>
            <div className="summary-item warning">
              <span className="count">{auditResult.summary.warnings}</span>
              <span className="label">Warnings</span>
            </div>
            <div className="summary-item info">
              <span className="count">{auditResult.summary.info}</span>
              <span className="label">Info</span>
            </div>
          </div>

          <div className="filter-bar">
            <button
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'active' : ''}
            >
              All ({auditResult.issues.length})
            </button>
            <button
              onClick={() => setFilter('error')}
              className={filter === 'error' ? 'active' : ''}
            >
              Errors ({auditResult.summary.errors})
            </button>
            <button
              onClick={() => setFilter('warning')}
              className={filter === 'warning' ? 'active' : ''}
            >
              Warnings ({auditResult.summary.warnings})
            </button>
            <button
              onClick={() => setFilter('info')}
              className={filter === 'info' ? 'active' : ''}
            >
              Info ({auditResult.summary.info})
            </button>
          </div>

          {filteredIssues.length === 0 ? (
            <div className="empty-state">
              {filter === 'all'
                ? 'No issues found. Great work!'
                : `No ${filter} issues found.`}
            </div>
          ) : (
            <div className="issues-list">
              {filteredIssues.map((issue: AuditIssue) => (
                <div key={issue.id} className="issue-item">
                  <span className={getSeverityBadgeClass(issue.severity)}>
                    {issue.severity}
                  </span>
                  <div className="issue-details">
                    <span className="artifact-name">{issue.artifact}</span>
                    <span className="separator">→</span>
                    <span className="field-name">{issue.field}</span>
                    <span className="separator">:</span>
                    <span className="message">{issue.message}</span>
                  </div>
                  <a
                    href={`/projects/${projectKey}/artifacts/${issue.artifact}?field=${issue.field}`}
                    className="fix-link"
                  >
                    Fix
                  </a>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!auditResult && !loading && !error && (
        <div className="empty-state">
          No audit results available. Click "Run Audit" to start.
        </div>
      )}
    </div>
  );
};
