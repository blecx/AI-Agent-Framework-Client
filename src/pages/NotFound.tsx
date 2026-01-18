import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="not-found-page">
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/" className="button">
        Go Home
      </Link>
    </div>
  );
}
