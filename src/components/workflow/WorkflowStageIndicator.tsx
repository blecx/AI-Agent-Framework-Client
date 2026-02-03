/**
 * Workflow Stage Indicator Component
 * Displays ISO 21500 workflow state progression
 */

import React from 'react';
import { WorkflowStateEnum } from '../../types/api';

interface WorkflowStageIndicatorProps {
  currentState: WorkflowStateEnum;
  allowedTransitions?: WorkflowStateEnum[];
  onStageClick?: (stage: WorkflowStateEnum) => void;
}

interface StageInfo {
  state: WorkflowStateEnum;
  label: string;
  description: string;
}

const WORKFLOW_STAGES: StageInfo[] = [
  {
    state: WorkflowStateEnum.INITIATING,
    label: 'Initiating',
    description: 'Project initialization and charter creation',
  },
  {
    state: WorkflowStateEnum.PLANNING,
    label: 'Planning',
    description: 'Detailed planning and resource allocation',
  },
  {
    state: WorkflowStateEnum.EXECUTING,
    label: 'Executing',
    description: 'Active project work and deliverable creation',
  },
  {
    state: WorkflowStateEnum.MONITORING,
    label: 'Monitoring',
    description: 'Progress tracking and performance measurement',
  },
  {
    state: WorkflowStateEnum.CLOSING,
    label: 'Closing',
    description: 'Project closure activities and documentation',
  },
  {
    state: WorkflowStateEnum.CLOSED,
    label: 'Closed',
    description: 'Project completed and archived',
  },
];

export const WorkflowStageIndicator: React.FC<WorkflowStageIndicatorProps> = ({
  currentState,
  allowedTransitions = [],
  onStageClick,
}) => {
  const currentIndex = WORKFLOW_STAGES.findIndex(
    (stage) => stage.state === currentState,
  );

  // Calculate completion percentage based on current stage
  const completionPercentage = currentIndex >= 0 
    ? Math.round(((currentIndex + 1) / WORKFLOW_STAGES.length) * 100)
    : 0;

  const getStageStatus = (
    stage: StageInfo,
    index: number,
  ): 'completed' | 'current' | 'available' | 'locked' => {
    if (stage.state === currentState) return 'current';
    if (index < currentIndex) return 'completed';
    if (allowedTransitions.includes(stage.state)) return 'available';
    return 'locked';
  };

  const getStageClassName = (status: string): string => {
    const baseClasses =
      'flex-1 relative px-4 py-3 text-center transition-all duration-200';
    const statusClasses = {
      completed:
        'bg-green-100 text-green-800 cursor-pointer hover:bg-green-200',
      current: 'bg-blue-600 text-white font-semibold shadow-lg',
      available:
        'bg-gray-100 text-gray-700 cursor-pointer hover:bg-blue-50 hover:text-blue-600',
      locked: 'bg-gray-50 text-gray-400 cursor-not-allowed opacity-60',
    };
    return `${baseClasses} ${statusClasses[status as keyof typeof statusClasses] || ''}`;
  };

  const handleStageClick = (stage: StageInfo, status: string) => {
    if (onStageClick && (status === 'available' || status === 'current')) {
      onStageClick(stage.state);
    }
  };

  return (
    <div className="workflow-stage-indicator bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-gray-700">
          Project Workflow
        </h3>
        <div className="text-sm font-semibold text-blue-600">
          {completionPercentage}% Complete
        </div>
      </div>
      <div className="flex items-center gap-2">
        {WORKFLOW_STAGES.map((stage, index) => {
          const status = getStageStatus(stage, index);
          const isClickable = status === 'available' || status === 'current';

          return (
            <React.Fragment key={stage.state}>
              <div
                className={getStageClassName(status)}
                onClick={() => handleStageClick(stage, status)}
                title={`${stage.label}: ${stage.description}${
                  status === 'locked' ? ' (Not yet available)' : ''
                }`}
                role={isClickable ? 'button' : 'status'}
                tabIndex={isClickable ? 0 : -1}
                onKeyDown={(e) => {
                  if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    handleStageClick(stage, status);
                  }
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  {status === 'completed' && (
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  <span className="text-sm">{stage.label}</span>
                </div>
              </div>
              {index < WORKFLOW_STAGES.length - 1 && (
                <svg
                  className="w-4 h-4 text-gray-400 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
