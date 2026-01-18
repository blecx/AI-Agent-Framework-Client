import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div className="home-page">
      <h1>AI Agent Framework</h1>
      <p>Welcome to the AI Agent Framework Client</p>
      <div className="quick-links">
        <Link to="/projects" className="button">
          View Projects
        </Link>
      </div>
    </div>
  );
}
