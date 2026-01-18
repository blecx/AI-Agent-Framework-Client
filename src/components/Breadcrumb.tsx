import { Link, useLocation } from 'react-router-dom';
import './Breadcrumb.css';

export function Breadcrumb() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  // Map path segments to readable labels
  const getLabel = (segment: string): string => {
    // If it looks like a project key (uppercase + numbers), keep as-is
    if (/^[A-Z0-9-]+$/.test(segment)) {
      return segment;
    }
    // Capitalize first letter
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  return (
    <nav aria-label="Breadcrumb" className="breadcrumb">
      <ol>
        <li>
          <Link to="/">Home</Link>
        </li>
        {pathSegments.map((segment, index) => {
          const path = '/' + pathSegments.slice(0, index + 1).join('/');
          const isLast = index === pathSegments.length - 1;
          const label = getLabel(segment);

          return (
            <li key={path}>
              <span className="separator">/</span>
              {isLast ? (
                <span className="current">{label}</span>
              ) : (
                <Link to={path}>{label}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
