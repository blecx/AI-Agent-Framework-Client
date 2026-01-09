import React from 'react';
import { Workflow, WorkflowStep } from '../types';

interface WorkflowPanelProps {
  workflow: Workflow | null;
  onStartWorkflow?: (workflowName: string) => void;
}

export const WorkflowPanel: React.FC<WorkflowPanelProps> = ({ workflow }) => {
  const getStepStatusColor = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'in-progress': return '#2196F3';
      case 'failed': return '#f44336';
      default: return '#ddd';
    }
  };

  const getStatusIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed': return '✓';
      case 'in-progress': return '⟳';
      case 'failed': return '✗';
      default: return '○';
    }
  };

  if (!workflow) {
    return (
      <div className="workflow-panel">
        <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>Workflows</h3>
        <div style={{ color: '#666', fontSize: '14px' }}>
          No active workflow. You can trigger workflows through chat commands.
        </div>
      </div>
    );
  }

  return (
    <div className="workflow-panel">
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>{workflow.name}</h3>
        <div style={{ fontSize: '12px', color: '#666' }}>
          Status: <span style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>{workflow.status}</span>
        </div>
      </div>
      
      <div>
        {workflow.steps.map((step, index) => (
          <div 
            key={step.id}
            className={`workflow-step ${step.status}`}
            style={{ borderLeftColor: getStepStatusColor(step.status) }}
          >
            <div className="workflow-step-name">
              <span style={{ marginRight: '8px' }}>{getStatusIcon(step.status)}</span>
              Step {index + 1}: {step.name}
            </div>
            {step.description && (
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px', marginLeft: '24px' }}>
                {step.description}
              </div>
            )}
            {step.result && (
              <div style={{ fontSize: '12px', color: '#333', marginTop: '6px', marginLeft: '24px', 
                          padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                {step.result}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
