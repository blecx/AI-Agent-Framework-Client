/**
 * CommandPanel Component
 * Quick actions and command history for global operations
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import InputModal from './InputModal';
import ConfirmDialog from './ConfirmDialog';
import { useToast } from '../hooks/useToast';
import './CommandPanel.css';

interface CommandHistoryEntry {
  id: string;
  command: string;
  status: 'success' | 'error' | 'pending';
  result?: string;
  error?: string;
  timestamp: number;
}

export default function CommandPanel() {
  const navigate = useNavigate();
  const toast = useToast();
  const [history, setHistory] = useState<CommandHistoryEntry[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inputModal, setInputModal] = useState<{
    isOpen: boolean;
    type: 'project-name' | 'project-key' | null;
    projectName?: string;
  }>({ isOpen: false, type: null });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });

  const addToHistory = (command: string, status: 'success' | 'error' | 'pending', result?: string, error?: string) => {
    const entry: CommandHistoryEntry = {
      id: crypto.randomUUID(),
      command,
      status,
      result,
      error,
      timestamp: Date.now(),
    };
    setHistory([entry, ...history]);
  };

  const handleCreateProject = () => {
    setInputModal({ isOpen: true, type: 'project-name' });
  };

  const handleProjectNameSubmit = (name: string) => {
    setInputModal({ isOpen: true, type: 'project-key', projectName: name });
  };

  const handleProjectKeySubmit = async (key: string) => {
    const projectName = inputModal.projectName || '';
    setInputModal({ isOpen: false, type: null });

    setIsLoading(true);
    addToHistory(`Create project: ${projectName}`, 'pending');

    try {
      const projectKey = key || projectName.toLowerCase().replace(/\s+/g, '-');
      const response = await apiClient.createProject(projectKey, projectName);
      if (response.success && response.data) {
        setStatusMessage(`✓ Project "${response.data.name}" created successfully!`);
        toast.showSuccess(`Project "${response.data.name}" created successfully`);
        addToHistory(`Create project: ${projectName}`, 'success', `Project key: ${response.data.key}`);
        
        // Navigate to the new project
        setTimeout(() => {
          navigate(`/projects/${response.data!.key}`);
        }, 1000);
      } else {
        throw new Error(response.error || 'Failed to create project');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create project';
      console.error('Error creating project:', err);
      setStatusMessage(`✗ ${errorMsg}`);
      toast.showError(errorMsg);
      addToHistory(`Create project: ${projectName}`, 'error', undefined, errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleListProjects = async () => {
    setIsLoading(true);
    addToHistory('List projects', 'pending');

    try {
      const response = await apiClient.listProjects();
      if (response.success && response.data) {
        setStatusMessage(`✓ Found ${response.data.length} project(s)`);
        toast.showSuccess(`Found ${response.data.length} project(s)`);
        addToHistory('List projects', 'success', `${response.data.length} project(s) found`);
        
        // Navigate to projects list
        setTimeout(() => {
          navigate('/projects');
        }, 500);
      } else {
        throw new Error(response.error || 'Failed to list projects');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to list projects';
      console.error('Error listing projects:', err);
      setStatusMessage(`✗ ${errorMsg}`);
      toast.showError(errorMsg);
      addToHistory('List projects', 'error', undefined, errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckHealth = async () => {
    setIsLoading(true);
    addToHistory('Check API health', 'pending');

    try {
      const health = await apiClient.checkHealth();
      setStatusMessage(`✓ API is ${health.status}`);
      toast.showSuccess(`API is ${health.status}`);
      addToHistory('Check API health', 'success', `Status: ${health.status}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'API health check failed';
      console.error('Error checking health:', err);
      setStatusMessage(`✗ ${errorMsg}`);
      toast.showError(errorMsg);
      addToHistory('Check API health', 'error', undefined, errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetInfo = async () => {
    setIsLoading(true);
    addToHistory('Get API info', 'pending');

    try {
      const info = await apiClient.getInfo();
      setStatusMessage(`✓ ${info.name} v${info.version}`);
      toast.showInfo(`${info.name} v${info.version}`);
      addToHistory('Get API info', 'success', `${info.name} v${info.version}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to get API info';
      console.error('Error getting API info:', err);
      setStatusMessage(`✗ ${errorMsg}`);
      toast.showError(errorMsg);
      addToHistory('Get API info', 'error', undefined, errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    setConfirmDialog({ isOpen: true });
  };

  const handleConfirmClearHistory = () => {
    setHistory([]);
    setStatusMessage(null);
    toast.showSuccess('Command history cleared');
    setConfirmDialog({ isOpen: false });
  };

  const handleCancelClearHistory = () => {
    setConfirmDialog({ isOpen: false });
  };

  const handleCancelInput = () => {
    setInputModal({ isOpen: false, type: null });
  };

  return (
    <div className="command-panel-container">
      <div className="command-panel-header">
        <h1>Command Panel</h1>
        <p>Quick actions and command history</p>
      </div>

      {statusMessage && (
        <div className={`status-message ${statusMessage.startsWith('✓') ? 'success' : 'error'}`}>
          {statusMessage}
          <button onClick={() => setStatusMessage(null)}>×</button>
        </div>
      )}

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <button
            className="action-card"
            onClick={handleCreateProject}
            disabled={isLoading}
            aria-label="Create new project"
          >
            <span className="action-icon">➕</span>
            <span className="action-label">Create Project</span>
          </button>

          <button
            className="action-card"
            onClick={handleListProjects}
            disabled={isLoading}
            aria-label="List all projects"
          >
            <span className="action-icon">📋</span>
            <span className="action-label">List Projects</span>
          </button>

          <button
            className="action-card"
            onClick={handleCheckHealth}
            disabled={isLoading}
            aria-label="Check API health"
          >
            <span className="action-icon">🏥</span>
            <span className="action-label">Check Health</span>
          </button>

          <button
            className="action-card"
            onClick={handleGetInfo}
            disabled={isLoading}
            aria-label="Get API information"
          >
            <span className="action-icon">ℹ️</span>
            <span className="action-label">API Info</span>
          </button>
        </div>
      </div>

      <div className="command-history-section">
        <div className="history-header">
          <h2>Command History</h2>
          {history.length > 0 && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={clearHistory}
            >
              Clear History
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <p className="empty-message">No commands executed yet. Try a quick action above!</p>
        ) : (
          <div className="history-list">
            {history.map((entry) => (
              <div key={entry.id} className={`history-item status-${entry.status}`}>
                <div className="history-header-row">
                  <span className="history-command">{entry.command}</span>
                  <span className="history-timestamp">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                {entry.result && (
                  <div className="history-result">
                    <strong>Result:</strong> {entry.result}
                  </div>
                )}
                {entry.error && (
                  <div className="history-error">
                    <strong>Error:</strong> {entry.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <InputModal
        isOpen={inputModal.isOpen && inputModal.type === 'project-name'}
        onSubmit={handleProjectNameSubmit}
        onCancel={handleCancelInput}
        title="Create New Project"
        label="Project Name"
        placeholder="e.g., My Awesome Project"
        submitText="Next"
      />

      <InputModal
        isOpen={inputModal.isOpen && inputModal.type === 'project-key'}
        onSubmit={handleProjectKeySubmit}
        onCancel={handleCancelInput}
        title="Create New Project"
        label="Project Key (optional)"
        placeholder="e.g., my-project (auto-generated if empty)"
        defaultValue=""
        submitText="Create"
        required={false}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onConfirm={handleConfirmClearHistory}
        onCancel={handleCancelClearHistory}
        title="Clear History"
        message="Are you sure you want to clear all command history? This action cannot be undone."
        confirmText="Clear"
      />
    </div>
  );
}
