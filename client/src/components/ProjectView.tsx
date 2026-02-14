import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import apiClient from '../services/apiClient';
import ProposePanel from './ProposePanel';
import ApplyPanel from './ApplyPanel';
import CommandPanel from './ProjectCommandPanel';
import { ArtifactList } from './ArtifactList';
import { AuditViewer } from './AuditViewer';
import { AuditBadge } from './AuditBadge';
import { AuditApiClient } from '../services/AuditApiClient';
import Skeleton from './ui/Skeleton';
import './ProjectView.css';

type TabType = 'overview' | 'propose' | 'apply' | 'commands' | 'artifacts' | 'audit';

export default function ProjectView() {
  const { t } = useTranslation();
  const params = useParams<{ projectKey?: string; key?: string }>();
  const projectKey = params.projectKey ?? params.key;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Fetch project data
  const {
    data: projectResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['project', projectKey],
    queryFn: async () => {
      if (!projectKey) throw new Error(t('projectView.errors.projectKeyRequired'));
      const response = await apiClient.getProject(projectKey);
      if (!response.success) {
        throw new Error(response.error || t('projectView.errors.failedToLoadProject'));
      }
      return response.data;
    },
    enabled: !!projectKey,
  });

  // Fetch audit data for badge
  const { data: auditData } = useQuery({
    queryKey: ['audit', projectKey],
    queryFn: async () => {
      if (!projectKey) throw new Error(t('projectView.errors.projectKeyRequired'));
      const client = new AuditApiClient();
      return await client.getAuditResults(projectKey);
    },
    enabled: !!projectKey,
    retry: false,
    // Don't throw on error - audit might not exist yet
    throwOnError: false,
  });

  if (isLoading) {
    return (
      <div className="project-view-container">
        <header className="project-header">
          <div className="header-left">
            <button className="btn-back" onClick={() => navigate('/')}>
              {t('projectView.actions.backToProjects')}
            </button>
            <div>
              <Skeleton width="200px" height="32px" />
              <Skeleton width="150px" height="16px" />
            </div>
          </div>
        </header>
        <nav className="project-tabs">
          <Skeleton variant="rectangular" width="100px" height="40px" />
          <Skeleton variant="rectangular" width="150px" height="40px" />
          <Skeleton variant="rectangular" width="140px" height="40px" />
          <Skeleton variant="rectangular" width="120px" height="40px" />
        </nav>
        <div className="project-content">
          <div className="project-section">
            <Skeleton width="180px" height="24px" />
            <Skeleton width="100%" height="20px" />
            <Skeleton width="90%" height="20px" />
            <Skeleton width="80%" height="20px" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !projectResponse) {
    return (
      <div className="project-view-container">
        <div className="error">
          {t('projectView.errors.loadingWithMessage', {
            message: (error as Error)?.message || t('projectView.errors.unknownError'),
          })}
        </div>
        <button className="btn-secondary" onClick={() => navigate('/')}>
          {t('projectView.actions.backToProjectsText')}
        </button>
      </div>
    );
  }

  const project = projectResponse;

  return (
    <div className="project-view-container">
      <header className="project-header">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate('/')}>
            {t('projectView.actions.backToProjects')}
          </button>
          <div>
            <h1>{project.name}</h1>
            <p className="project-key">{t('projectView.labels.key')}: {project.key}</p>
          </div>
        </div>
        <div className="header-right">
          {auditData && (
            <AuditBadge
              errorCount={auditData.summary.errors}
              warningCount={auditData.summary.warnings}
              infoCount={auditData.summary.info}
              onClick={() => setActiveTab('audit')}
            />
          )}
        </div>
      </header>

      <nav className="project-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          {t('projectView.tabs.overview')}
        </button>
        <button
          className={`tab ${activeTab === 'propose' ? 'active' : ''}`}
          onClick={() => setActiveTab('propose')}
        >
          {t('projectView.tabs.proposeChanges')}
        </button>
        <button
          className={`tab ${activeTab === 'apply' ? 'active' : ''}`}
          onClick={() => setActiveTab('apply')}
        >
          {t('projectView.tabs.applyProposals')}
        </button>
        <button
          className={`tab ${activeTab === 'commands' ? 'active' : ''}`}
          onClick={() => setActiveTab('commands')}
        >
          {t('projectView.tabs.commands')}
        </button>
        <button
          className={`tab ${activeTab === 'artifacts' ? 'active' : ''}`}
          onClick={() => setActiveTab('artifacts')}
        >
          {t('projectView.tabs.artifacts')}
        </button>
        <button
          className={`tab ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          {t('projectView.tabs.audit')}
        </button>
      </nav>

      <div className="project-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <section className="project-section">
              <h2>{t('projectView.sections.projectDetails')}</h2>
              {project.description && <p>{project.description}</p>}
              <div className="detail-row">
                <span className="label">{t('projectView.labels.created')}:</span>
                <span>{new Date(project.createdAt).toLocaleString()}</span>
              </div>
              <div className="detail-row">
                <span className="label">{t('projectView.labels.lastUpdated')}:</span>
                <span>{new Date(project.updatedAt).toLocaleString()}</span>
              </div>
            </section>

            {project.gitRepo && (
              <section className="project-section">
                <h2>{t('projectView.sections.gitRepository')}</h2>
                <div className="detail-row">
                  <span className="label">{t('projectView.labels.url')}:</span>
                  <span className="monospace">{project.gitRepo.url}</span>
                </div>
                <div className="detail-row">
                  <span className="label">{t('projectView.labels.branch')}:</span>
                  <span className="monospace">{project.gitRepo.branch}</span>
                </div>
                {project.gitRepo.lastCommit && (
                  <div className="detail-row">
                    <span className="label">{t('projectView.labels.lastCommit')}:</span>
                    <span className="monospace">
                      {project.gitRepo.lastCommit}
                    </span>
                  </div>
                )}
                {project.gitRepo.status && (
                  <div className="detail-row">
                    <span className="label">{t('projectView.labels.status')}:</span>
                    <span
                      className={`status-badge status-${project.gitRepo.status}`}
                    >
                      {project.gitRepo.status}
                    </span>
                  </div>
                )}
              </section>
            )}

            {project.documents && project.documents.length > 0 && (
              <section className="project-section">
                <h2>{t('projectView.sections.documents', { count: project.documents.length })}</h2>
                <div className="documents-list">
                  {project.documents.map((doc) => (
                    <div key={doc.id} className="document-item">
                      <div className="document-name">{doc.name}</div>
                      <div className="document-path">{doc.path}</div>
                      <div className="document-meta">
                        {t('projectView.labels.lastModified')}{' '}
                        {new Date(doc.lastModified).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {activeTab === 'propose' && projectKey && <ProposePanel projectKey={projectKey} />}
        {activeTab === 'apply' && projectKey && <ApplyPanel projectKey={projectKey} />}
        {activeTab === 'commands' && projectKey && <CommandPanel projectKey={projectKey} />}
        {activeTab === 'artifacts' && projectKey && (
          <ArtifactList
            projectKey={projectKey}
            onCreateNew={() => {
              // TODO: Open template selector modal
              console.log('Create new artifact');
            }}
            onSelectArtifact={(artifact) => {
              // TODO: Open ArtifactEditor modal/view
              console.log('Selected artifact:', artifact);
            }}
          />
        )}
        {activeTab === 'audit' && projectKey && <AuditViewer projectKey={projectKey} />}
      </div>
    </div>
  );
}
