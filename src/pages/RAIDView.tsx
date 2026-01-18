import { useParams } from 'react-router-dom';
import { useProject } from '../contexts/ProjectContext';

export function RAIDView() {
  const { key } = useParams<{ key: string }>();
  const { currentProjectKey } = useProject();

  return (
    <div className="raid-view-page">
      <h1>RAID Register</h1>
      <h2>Project: {key || currentProjectKey}</h2>
      <p>RAID (Risks, Assumptions, Issues, Dependencies) view placeholder</p>
      <div className="raid-content">
        {/* TODO: Implement RAID register in future issues */}
        <p>RAID register will be implemented here</p>
      </div>
    </div>
  );
}
