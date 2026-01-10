/**
 * CommandPanel Component
 * Quick actions and command history for project operations
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import type { ApiError } from '../services/apiClient';
import './CommandPanel.css';

interface CommandHistory {
  id: string;
  command: string;
  status: 'success' | 'error' | 'pending';
  result?: string;
  error?: string;
  timestamp: number;
}

export default function CommandPanel() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<CommandHistory[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const addToHistory = (command: string, status: 'success' | 'error' | 'pending', result?: string, error?: string) => {
    const entry: CommandHistory = {
      id: Date.now().toString(),
      command,
      status,
      result,
      error,
      timestamp: Date.now(),
    };
    setHistory([entry, ...history]);
  };

  const handleCreateProject = async () => {
    const name = prompt('Enter project name:');
    if (!name) return;

    setIsLoading(true);
    addToHistory(`Create project: ${name}`, 'pending');

    try {
      const project = await apiClient.createProject({ name });
      setStatusMessage(`✓ Project "${project.name}" created successfully!`);
      addToHistory(`Create project: ${name}`, 'success', `Project key: ${project.key}`);
      
      // Navigate to the new project
      setTimeout(() => {
        navigate(`/projects/${project.key}`);
      }, 1000);
    } catch (err) {
      const apiError = err as ApiError;
      const errorMsg = apiError.message || 'Failed to create project';
      setStatusMessage(`✗ ${errorMsg}`);
      addToHistory(`Create project: ${name}`, 'error', undefined, errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleListProjects = async () => {
    setIsLoading(true);
    addToHistory('List projects', 'pending');

    try {
      const projects = await apiClient.fetchProjects();
      setStatusMessage(`✓ Found ${projects.length} project(s)`);
      addToHistory('List projects', 'success', `${projects.length} project(s) found`);
      
      // Navigate to projects list
      setTimeout(() => {
        navigate('/projects');
      }, 500);
    } catch (err) {
      const apiError = err as ApiError;
      const errorMsg = apiError.message || 'Failed to list projects';
      setStatusMessage(`✗ ${errorMsg}`);
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
      addToHistory('Check API health', 'success', `Status: ${health.status}`);
    } catch (err) {
      const apiError = err as ApiError;
      const errorMsg = apiError.message || 'API health check failed';
      setStatusMessage(`✗ ${errorMsg}`);
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
      addToHistory('Get API info', 'success', `${info.name} v${info.version}`);
    } catch (err) {
      const apiError = err as ApiError;
      const errorMsg = apiError.message || 'Failed to get API info';
      setStatusMessage(`✗ ${errorMsg}`);
      addToHistory('Get API info', 'error', undefined, errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    if (confirm('Clear all command history?')) {
      setHistory([]);
      setStatusMessage(null);
    }
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
          >
            <span className="action-icon">➕</span>
            <span className="action-label">Create Project</span>
          </button>

          <button
            className="action-card"
            onClick={handleListProjects}
            disabled={isLoading}
          >
            <span className="action-icon">📋</span>
            <span className="action-label">List Projects</span>
          </button>

          <button
            className="action-card"
            onClick={handleCheckHealth}
            disabled={isLoading}
          >
            <span className="action-icon">🏥</span>
            <span className="action-label">Check Health</span>
          </button>

          <button
            className="action-card"
            onClick={handleGetInfo}
            disabled={isLoading}
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
    </div>
  );
}
