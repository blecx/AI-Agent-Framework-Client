import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/apiClient';
import type { Command } from '../types';
import './ProjectCommandPanel.css';

interface ProjectCommandPanelProps {
  projectKey: string;
}

export default function ProjectCommandPanel({ projectKey }: ProjectCommandPanelProps) {
  const queryClient = useQueryClient();
  const [commandInput, setCommandInput] = useState('');
  const [argsInput, setArgsInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch command history
  const { data: historyResponse, isLoading } = useQuery({
    queryKey: ['commands', projectKey],
    queryFn: async () => {
      const response = await apiClient.getCommandHistory(projectKey);
      if (!response.success) {
        throw new Error(response.error || 'Failed to load command history');
      }
      return response.data || [];
    },
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });

  // Execute command mutation
  const executeMutation = useMutation({
    mutationFn: async ({ command, args }: { command: string; args?: string[] }) => {
      const response = await apiClient.executeCommand(command, projectKey, args);
      if (!response.success) {
        throw new Error(response.error || 'Failed to execute command');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commands', projectKey] });
      setCommandInput('');
      setArgsInput('');
      setError(null);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) {
      setError('Command is required');
      return;
    }

    const args = argsInput
      .split(' ')
      .map(arg => arg.trim())
      .filter(arg => arg.length > 0);

    executeMutation.mutate({
      command: commandInput.trim(),
      args: args.length > 0 ? args : undefined,
    });
  };

  const getStatusIcon = (status: Command['status']) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'failed':
        return '✗';
      case 'running':
        return '⏳';
      case 'pending':
        return '⏸';
      default:
        return '?';
    }
  };

  const getStatusClass = (status: Command['status']) => {
    return `status-${status}`;
  };

  if (isLoading) {
    return (
      <div className="command-panel">
        <div className="loading">Loading command history...</div>
      </div>
    );
  }

  const commands = historyResponse || [];

  return (
    <div className="command-panel">
      <h2>Command Execution</h2>
      <p className="description">
        Execute commands on this project. Commands are executed in the project's context
        and their output is captured for review.
      </p>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleExecute} className="command-form">
        <div className="form-row">
          <div className="form-group flex-grow">
            <label htmlFor="commandInput">Command *</label>
            <input
              id="commandInput"
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="e.g., npm install, git status, build"
              required
            />
          </div>
          <div className="form-group flex-grow">
            <label htmlFor="argsInput">Arguments (optional)</label>
            <input
              id="argsInput"
              type="text"
              value={argsInput}
              onChange={(e) => setArgsInput(e.target.value)}
              placeholder="e.g., --production --verbose"
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={executeMutation.isPending}
        >
          {executeMutation.isPending ? 'Executing...' : 'Execute Command'}
        </button>
      </form>

      <div className="command-history">
        <h3>Command History ({commands.length})</h3>
        {commands.length === 0 ? (
          <div className="empty-state">No commands executed yet</div>
        ) : (
          <div className="commands-list">
            {commands.map((command: Command) => (
              <div key={command.id} className={`command-item ${getStatusClass(command.status)}`}>
                <div className="command-header">
                  <div className="command-info">
                    <span className="status-icon">{getStatusIcon(command.status)}</span>
                    <span className="command-text">
                      {command.command}
                      {command.args && command.args.length > 0 && (
                        <span className="command-args"> {command.args.join(' ')}</span>
                      )}
                    </span>
                  </div>
                  <span className={`status-badge ${getStatusClass(command.status)}`}>
                    {command.status}
                  </span>
                </div>

                {command.startedAt && (
                  <div className="command-meta">
                    <span>Started: {new Date(command.startedAt).toLocaleString()}</span>
                    {command.completedAt && (
                      <span>
                        Completed: {new Date(command.completedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                )}

                {command.output && (
                  <details className="command-output">
                    <summary>Output</summary>
                    <pre>{command.output}</pre>
                  </details>
                )}

                {command.error && (
                  <div className="command-error">
                    <strong>Error:</strong>
                    <pre>{command.error}</pre>
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
