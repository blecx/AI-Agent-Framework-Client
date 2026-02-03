import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProject } from '../contexts/ProjectContext';
import { ProjectDashboard } from '../components/projects/ProjectDashboard';

export function ProjectDetail() {
  const { key } = useParams<{ key: string }>();
  const { setCurrentProjectKey } = useProject();

  useEffect(() => {
    setCurrentProjectKey(key || null);
  }, [key, setCurrentProjectKey]);

  return (
    <div className="project-detail-page">
      <ProjectDashboard />
    </div>
  );
}
