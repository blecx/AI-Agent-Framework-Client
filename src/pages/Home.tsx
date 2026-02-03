import { Link, useNavigate } from 'react-router-dom';
import { useProject } from '../contexts/ProjectContext';
import { useEffect } from 'react';

export function Home() {
  const { currentProjectKey } = useProject();
  const navigate = useNavigate();

  // If user has a project selected, redirect to project dashboard
  useEffect(() => {
    if (currentProjectKey) {
      navigate(`/projects/${currentProjectKey}`);
    }
  }, [currentProjectKey, navigate]);

  return (
    <div className="home-page" style={{ padding: '2rem' }}>
      <h1>AI Agent Framework</h1>
      <p>Welcome to the AI Agent Framework Client</p>
      <p className="workflow-status">
        Get started by creating a project to manage your workflow phases
      </p>
      <div
        className="quick-links"
        style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}
      >
        <Link
          to="/chat"
          className="button"
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#0066cc',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
          }}
        >
          Open Chat
        </Link>
        <Link
          to="/projects"
          className="button"
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#5319E7',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
          }}
        >
          View Projects
        </Link>
      </div>
    </div>
  );
}
