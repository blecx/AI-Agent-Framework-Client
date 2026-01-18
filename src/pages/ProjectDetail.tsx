import { useEffect } from 'react';
import { useParams, Link, Outlet } from 'react-router-dom';
import { useProject } from '../contexts/ProjectContext';

export function ProjectDetail() {
  const { key } = useParams<{ key: string }>();
  const { setCurrentProjectKey } = useProject();

  useEffect(() => {
    setCurrentProjectKey(key || null);
  }, [key, setCurrentProjectKey]);

  return (
    <div className="project-detail-page">
      <h1>Project: {key}</h1>
      <nav className="project-nav">
        <Link to={`/projects/${key}/raid`}>RAID Register</Link>
        <Link to={`/projects/${key}/workflow`}>Workflow</Link>
      </nav>
      <div className="project-content">
        <Outlet />
      </div>
    </div>
  );
}
