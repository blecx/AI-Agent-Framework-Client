import { useParams } from 'react-router-dom';
import { useProject } from '../contexts/ProjectContext';

export function WorkflowView() {
  const { key } = useParams<{ key: string }>();
  const { currentProjectKey } = useProject();

  return (
    <div className="workflow-view-page">
      <h1>Workflow Management</h1>
      <h2>Project: {key || currentProjectKey}</h2>
      <p>Workflow management placeholder</p>
      <div className="workflow-content">
        {/* TODO: Implement workflow management in future issues */}
        <p>Workflow management will be implemented here</p>
      </div>
    </div>
  );
}
