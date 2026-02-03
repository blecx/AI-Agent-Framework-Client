/**
 * ProjectDashboard Component
 * Landing page showing project overview, workflow state, RAID summary, and recent activity
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../../contexts/ProjectContext';
import { ProjectsService } from '../../services/api/projects';
import { RAIDService } from '../../services/api/raid';
import { WorkflowService } from '../../services/api/workflow';
import { AuditService } from '../../services/api/audit';
import { ApiClient } from '../../services/api/client';
import {
  ProjectInfo,
  RAIDType,
  RAIDStatus,
  WorkflowState,
  AuditEvent,
} from '../../types/api';
import { CommandPanel } from '../commands/CommandPanel';
import { ProposalModal } from '../proposals/ProposalModal';
import './ProjectDashboard.css';

interface RAIDSummary {
  total: number;
  byType: Record<RAIDType, number>;
  byStatus: Record<RAIDStatus, number>;
}

export const ProjectDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentProjectKey } = useProject();

  const [projectsService] = useState(
    () =>
      new ProjectsService(
        new ApiClient({
          baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
        }),
      ),
  );
  const [raidService] = useState(
    () =>
      new RAIDService(
        new ApiClient({
          baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
        }),
      ),
  );
  const [workflowService] = useState(
    () =>
      new WorkflowService(
        new ApiClient({
          baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
        }),
      ),
  );
  const [auditService] = useState(
    () =>
      new AuditService(
        new ApiClient({
          baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
        }),
      ),
  );

  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [workflowState, setWorkflowState] = useState<WorkflowState | null>(
    null,
  );
  const [raidSummary, setRaidSummary] = useState<RAIDSummary | null>(null);
  const [recentEvents, setRecentEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Command and Proposal state
  const [showProposal, setShowProposal] = useState(false);
  const [currentProposalId, setCurrentProposalId] = useState<string | null>(null);
  const [currentProposalData, setCurrentProposalData] = useState<any>(null);

  useEffect(() => {
    if (currentProjectKey) {
      loadDashboardData();
    } else {
      // No project selected, redirect to project list
      navigate('/projects');
    }
  }, [currentProjectKey]);

  const loadDashboardData = async () => {
    if (!currentProjectKey) return;

    setLoading(true);
    setError(null);

    try {
      // Load all dashboard data in parallel
      const [projectData, workflowData, raidData, auditData] =
        await Promise.all([
          projectsService.getProject(currentProjectKey),
          workflowService.getWorkflowState(currentProjectKey).catch(() => null),
          raidService.listRAIDItems(currentProjectKey).catch(() => null),
          auditService
            .getAuditEvents(currentProjectKey, { limit: 10 })
            .catch(() => null),
        ]);

      setProject(projectData);
      setWorkflowState(workflowData);
      setRecentEvents(auditData?.events || []);

      // Calculate RAID summary
      if (raidData && raidData.items && raidData.total > 0) {
        const summary: RAIDSummary = {
          total: raidData.total,
          byType: {
            [RAIDType.RISK]: 0,
            [RAIDType.ASSUMPTION]: 0,
            [RAIDType.ISSUE]: 0,
            [RAIDType.DEPENDENCY]: 0,
          },
          byStatus: {
            [RAIDStatus.OPEN]: 0,
            [RAIDStatus.IN_PROGRESS]: 0,
            [RAIDStatus.CLOSED]: 0,
            [RAIDStatus.RESOLVED]: 0,
            [RAIDStatus.MONITORED]: 0,
          },
        };

        raidData.items.forEach((item) => {
          summary.byType[item.type]++;
          summary.byStatus[item.status]++;
        });

        setRaidSummary(summary);
      }

      setLoading(false);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getWorkflowStateClass = (state: string): string => {
    const stateMap: Record<string, string> = {
      Initiating: 'state-initiating',
      Planning: 'state-planning',
      Executing: 'state-executing',
      Monitoring: 'state-monitoring',
      Closing: 'state-closing',
      Closed: 'state-closed',
    };
    return stateMap[state] || 'state-default';
  };

  const handleCommandProposed = (proposalId: string, proposalData: any) => {
    setCurrentProposalId(proposalId);
    setCurrentProposalData(proposalData);
    setShowProposal(true);
  };

  const handleProposalApplied = () => {
    setShowProposal(false);
    setCurrentProposalId(null);
    setCurrentProposalData(null);
    // Reload dashboard to show updated data
    loadDashboardData();
  };

  const handleProposalClosed = () => {
    setShowProposal(false);
    setCurrentProposalId(null);
    setCurrentProposalData(null);
  };

  if (!currentProjectKey) {
    return null;
  }

  if (loading) {
    return (
      <div className="project-dashboard-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="project-dashboard-container">
        <div className="error-state">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={loadDashboardData} className="btn-retry">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="project-dashboard-container">
      <div className="dashboard-header">
        <div className="project-info">
          <h1>{project.name}</h1>
          <div className="project-key-badge">{project.key}</div>
        </div>
        {project.description && (
          <p className="project-description">{project.description}</p>
        )}
      </div>

      {/* Command Panel Section */}
      <div className="dashboard-section command-section">
        <CommandPanel
          projectKey={currentProjectKey}
          onCommandProposed={handleCommandProposed}
        />
      </div>

      {/* Workflow State Section */}
      <div className="dashboard-section workflow-section">
        <h2>Current Workflow State</h2>
        {workflowState ? (
          <div className="workflow-state-card">
            <div
              className={`workflow-badge ${getWorkflowStateClass(workflowState.current_state)}`}
            >
              {workflowState.current_state}
            </div>
            <div className="workflow-info">
              <p>Last updated: {formatDate(workflowState.updated_at)}</p>
              {workflowState.allowed_transitions &&
                workflowState.allowed_transitions.length > 0 && (
                  <p>
                    Allowed transitions:{' '}
                    {workflowState.allowed_transitions.join(', ')}
                  </p>
                )}
            </div>
            <button
              onClick={() =>
                navigate(`/projects/${currentProjectKey}/workflow`)
              }
              className="btn-action"
            >
              Transition State
            </button>
          </div>
        ) : (
          <div className="empty-state">
            <p>No workflow state available</p>
          </div>
        )}
      </div>

      {/* RAID Summary Section */}
      <div className="dashboard-section raid-section">
        <h2>RAID Summary</h2>
        {raidSummary ? (
          <div className="raid-summary">
            <div className="raid-total">
              <div className="stat-number">{raidSummary.total}</div>
              <div className="stat-label">Total Items</div>
            </div>
            <div className="raid-by-type">
              <h3>By Type</h3>
              <div className="stat-grid">
                {Object.entries(raidSummary.byType).map(([type, count]) => (
                  <div key={type} className="stat-item">
                    <div className={`stat-icon type-${type.toLowerCase()}`}>
                      {type.charAt(0)}
                    </div>
                    <div className="stat-value">{count}</div>
                    <div className="stat-label">{type}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="raid-by-status">
              <h3>By Status</h3>
              <div className="status-bars">
                {Object.entries(raidSummary.byStatus)
                  .filter(([_, count]) => count > 0)
                  .map(([status, count]) => (
                    <div key={status} className="status-bar">
                      <div className="status-label">{status}</div>
                      <div className="status-progress">
                        <div
                          className={`status-fill status-${status.toLowerCase().replace(' ', '-')}`}
                          style={{
                            width: `${(count / raidSummary.total) * 100}%`,
                          }}
                        >
                          {count}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            <button
              onClick={() => navigate(`/projects/${currentProjectKey}/raid`)}
              className="btn-action"
            >
              View All RAID Items
            </button>
          </div>
        ) : (
          <div className="empty-state">
            <p>No RAID items yet</p>
            <button
              onClick={() => navigate(`/projects/${currentProjectKey}/raid`)}
              className="btn-action"
            >
              Add RAID Item
            </button>
          </div>
        )}
      </div>

      {/* Recent Activity Section */}
      <div className="dashboard-section activity-section">
        <h2>Recent Activity</h2>
        {recentEvents.length > 0 ? (
          <div className="activity-list">
            {recentEvents.map((event) => (
              <div key={event.event_id} className="activity-item">
                <div className="activity-icon">
                  <span className="event-type-badge">
                    {event.event_type.charAt(0)}
                  </span>
                </div>
                <div className="activity-content">
                  <div className="activity-header">
                    <span className="event-type">{event.event_type}</span>
                    <span className="event-time">
                      {formatDate(event.timestamp)}
                    </span>
                  </div>
                  <div className="activity-details">
                    <span className="actor">{event.actor}</span>
                    <span className="payload">{event.payload_summary}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No recent activity</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="dashboard-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button
            onClick={() => navigate(`/projects/${currentProjectKey}/raid`)}
            className="btn-quick-action"
          >
            <span className="action-icon">+</span>
            Add RAID Item
          </button>
          <button
            onClick={() => navigate(`/projects/${currentProjectKey}/workflow`)}
            className="btn-quick-action"
          >
            <span className="action-icon">→</span>
            Transition Workflow
          </button>
          <button
            onClick={() => navigate(`/projects/${currentProjectKey}/audit`)}
            className="btn-quick-action"
          >
            <span className="action-icon">📋</span>
            View Audit Log
          </button>
        </div>
      </div>

      {/* Proposal Modal */}
      {showProposal && currentProposalId && currentProposalData && (
        <ProposalModal
          projectKey={currentProjectKey}
          proposalId={currentProposalId}
          proposalData={currentProposalData}
          onClose={handleProposalClosed}
          onApplied={handleProposalApplied}
        />
      )}
    </div>
  );
};
