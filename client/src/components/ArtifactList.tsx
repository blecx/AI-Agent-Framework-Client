/**
 * ArtifactList Component
 * Displays project artifacts with navigation to editor
 */

import React, { useEffect, useState, useMemo } from 'react';
import { ArtifactApiClient, type Artifact } from '../services/ArtifactApiClient';
import { AuditApiClient } from '../services/AuditApiClient';
import './ArtifactList.css';

interface ArtifactListProps {
  projectKey: string;
  onCreateNew?: () => void;
  onSelectArtifact?: (artifact: Artifact) => void;
}

type SortField = 'name' | 'date';
type SortDirection = 'asc' | 'desc';

export const ArtifactList: React.FC<ArtifactListProps> = ({
  projectKey,
  onCreateNew,
  onSelectArtifact,
}) => {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [auditIssuesMap, setAuditIssuesMap] = useState<Record<string, { hasErrors: boolean; hasWarnings: boolean }>>({});

  const apiClient = useMemo(() => new ArtifactApiClient(), []);
  const auditClient = useMemo(() => new AuditApiClient(), []);

  useEffect(() => {
    const fetchArtifacts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.listArtifacts(projectKey);
        setArtifacts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load artifacts');
      } finally {
        setLoading(false);
      }
    };

    if (projectKey) {
      fetchArtifacts();
    }
  }, [projectKey, apiClient]);

  useEffect(() => {
    const fetchAuditData = async () => {
      try {
        const auditResult = await auditClient.getAuditResults(projectKey);
        const issuesMap: Record<string, { hasErrors: boolean; hasWarnings: boolean }> = {};
        
        auditResult.issues.forEach((issue) => {
          if (!issuesMap[issue.artifact]) {
            issuesMap[issue.artifact] = { hasErrors: false, hasWarnings: false };
          }
          if (issue.severity === 'error') {
            issuesMap[issue.artifact].hasErrors = true;
          } else if (issue.severity === 'warning') {
            issuesMap[issue.artifact].hasWarnings = true;
          }
        });
        
        setAuditIssuesMap(issuesMap);
      } catch {
        // Audit data is optional - don't show error
        setAuditIssuesMap({});
      }
    };

    if (projectKey) {
      fetchAuditData();
    }
  }, [projectKey, auditClient]);

  const sortedArtifacts = useMemo(() => {
    const sorted = [...artifacts];
    sorted.sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'date') {
        const dateA = a.versions?.[0]?.date || '';
        const dateB = b.versions?.[0]?.date || '';
        comparison = dateA.localeCompare(dateB);
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [artifacts, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleArtifactClick = (artifact: Artifact) => {
    if (onSelectArtifact) {
      onSelectArtifact(artifact);
    }
  };

  if (loading) {
    return <div className="artifact-list-loading">Loading artifacts...</div>;
  }

  if (error) {
    return <div className="artifact-list-error">Error: {error}</div>;
  }

  return (
    <div className="artifact-list">
      <div className="artifact-list-header">
        <h2>Artifacts</h2>
        <button
          className="btn-create-artifact"
          onClick={onCreateNew}
          aria-label="Create new artifact"
        >
          Create New Artifact
        </button>
      </div>

      {sortedArtifacts.length === 0 ? (
        <div className="artifact-list-empty">
          <p>No artifacts yet. Create your first artifact to get started.</p>
        </div>
      ) : (
        <table className="artifact-list-table">
          <thead>
            <tr>
              <th className="artifact-status-col" title="Audit Status">
                Status
              </th>
              <th onClick={() => handleSort('name')} className="sortable">
                Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th>Type</th>
              <th onClick={() => handleSort('date')} className="sortable">
                Last Modified {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedArtifacts.map((artifact) => {
              const auditStatus = auditIssuesMap[artifact.name] || { hasErrors: false, hasWarnings: false };
              const statusIcon = auditStatus.hasErrors ? '✗' : auditStatus.hasWarnings ? '⚠' : '✓';
              const statusClass = auditStatus.hasErrors ? 'error' : auditStatus.hasWarnings ? 'warning' : 'success';
              const statusTitle = auditStatus.hasErrors
                ? 'Has errors'
                : auditStatus.hasWarnings
                ? 'Has warnings'
                : 'Complete';

              return (
                <tr
                  key={artifact.path}
                  onClick={() => handleArtifactClick(artifact)}
                  className="artifact-row"
                >
                  <td className={`artifact-status artifact-status--${statusClass}`} title={statusTitle}>
                    {statusIcon}
                  </td>
                  <td className="artifact-name">{artifact.name}</td>
                  <td>{artifact.type}</td>
                  <td>{artifact.versions?.[0]?.date || 'N/A'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};
