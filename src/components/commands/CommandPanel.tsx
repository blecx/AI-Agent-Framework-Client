/**
 * CommandPanel Component
 * Displays available commands and allows users to select and execute them
 */

import React, { useState } from 'react';
import './CommandPanel.css';

interface CommandPanelProps {
  projectKey: string;
  onCommandProposed: (proposalId: string, proposalData: any) => void;
}

interface CommandOption {
  id: string;
  name: string;
  description: string;
  params: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
}

const AVAILABLE_COMMANDS: CommandOption[] = [
  {
    id: 'assess_gaps',
    name: 'Assess Gaps',
    description: 'Analyze current project state and identify missing artifacts or gaps',
    params: [
      {
        name: 'scope',
        type: 'string',
        required: false,
        description: 'Scope of assessment (e.g., "planning", "execution")',
      },
    ],
  },
  {
    id: 'generate_artifact',
    name: 'Generate Artifact',
    description: 'Generate a new artifact based on ISO 21500 templates',
    params: [
      {
        name: 'artifact_type',
        type: 'string',
        required: true,
        description: 'Type of artifact to generate (e.g., "charter", "plan", "wbs")',
      },
      {
        name: 'context',
        type: 'string',
        required: false,
        description: 'Additional context for artifact generation',
      },
    ],
  },
  {
    id: 'generate_plan',
    name: 'Generate Plan',
    description: 'Generate comprehensive project plan with all required sections',
    params: [
      {
        name: 'include_sections',
        type: 'string',
        required: false,
        description: 'Comma-separated list of sections to include',
      },
    ],
  },
];

export const CommandPanel: React.FC<CommandPanelProps> = ({
  projectKey,
  onCommandProposed,
}) => {
  const [selectedCommand, setSelectedCommand] = useState<CommandOption | null>(
    null,
  );
  const [params, setParams] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCommandSelect = (command: CommandOption) => {
    setSelectedCommand(command);
    setParams({});
    setError(null);
  };

  const handleParamChange = (paramName: string, value: string) => {
    setParams((prev) => ({
      ...prev,
      [paramName]: value,
    }));
  };

  const handleProposeCommand = async () => {
    if (!selectedCommand) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/v1/projects/${projectKey}/commands/propose`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            command: selectedCommand.id,
            params: params,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to propose command');
      }

      const proposalData = await response.json();
      onCommandProposed(proposalData.proposal_id, proposalData);
    } catch (err: any) {
      console.error('Failed to propose command:', err);
      setError(err.message || 'Failed to propose command');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!selectedCommand) return false;

    // Check required params
    for (const param of selectedCommand.params) {
      if (param.required && !params[param.name]) {
        return false;
      }
    }

    return true;
  };

  return (
    <div className="command-panel">
      <h2>Execute Command</h2>

      {/* Command Selection */}
      <div className="command-selection">
        <label htmlFor="command-select">Select Command:</label>
        <select
          id="command-select"
          value={selectedCommand?.id || ''}
          onChange={(e) => {
            const command = AVAILABLE_COMMANDS.find((c) => c.id === e.target.value);
            if (command) handleCommandSelect(command);
          }}
          className="command-dropdown"
        >
          <option value="">-- Choose a command --</option>
          {AVAILABLE_COMMANDS.map((command) => (
            <option key={command.id} value={command.id}>
              {command.name}
            </option>
          ))}
        </select>
      </div>

      {/* Command Description */}
      {selectedCommand && (
        <div className="command-description">
          <p>{selectedCommand.description}</p>
        </div>
      )}

      {/* Command Parameters Form */}
      {selectedCommand && selectedCommand.params.length > 0 && (
        <div className="command-params-form">
          <h3>Parameters</h3>
          {selectedCommand.params.map((param) => (
            <div key={param.name} className="form-group">
              <label htmlFor={`param-${param.name}`}>
                {param.name}
                {param.required && <span className="required">*</span>}
              </label>
              <input
                id={`param-${param.name}`}
                type="text"
                value={params[param.name] || ''}
                onChange={(e) => handleParamChange(param.name, e.target.value)}
                placeholder={param.description}
                className="param-input"
              />
              <small className="param-description">{param.description}</small>
            </div>
          ))}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Action Buttons */}
      {selectedCommand && (
        <div className="command-actions">
          <button
            onClick={handleProposeCommand}
            disabled={!validateForm() || loading}
            className="btn-propose"
          >
            {loading ? 'Proposing...' : 'Propose Changes'}
          </button>
          <button
            onClick={() => {
              setSelectedCommand(null);
              setParams({});
              setError(null);
            }}
            className="btn-cancel"
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};
