import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Breadcrumb } from '../components/Breadcrumb';

// Mock useLocation for different paths
const renderBreadcrumbAt = (pathname: string) => {
  // Create a wrapper that sets the location
  window.history.pushState({}, '', pathname);

  render(
    <BrowserRouter>
      <Breadcrumb />
    </BrowserRouter>,
  );
};

describe('Breadcrumb Component', () => {
  it('renders Home link at root', () => {
    renderBreadcrumbAt('/');
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('renders breadcrumb for /projects', () => {
    renderBreadcrumbAt('/projects');

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
  });

  it('renders breadcrumb for /projects/TEST123', () => {
    renderBreadcrumbAt('/projects/TEST123');

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('TEST123')).toBeInTheDocument();
  });

  it('renders breadcrumb for /projects/TEST123/raid', () => {
    renderBreadcrumbAt('/projects/TEST123/raid');

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('TEST123')).toBeInTheDocument();
    expect(screen.getByText('Raid')).toBeInTheDocument();
  });

  it('capitalizes regular segments', () => {
    renderBreadcrumbAt('/projects/workflow');

    expect(screen.getByText('Workflow')).toBeInTheDocument();
  });

  it('keeps project keys uppercase', () => {
    renderBreadcrumbAt('/projects/ABC123');

    expect(screen.getByText('ABC123')).toBeInTheDocument();
  });
});
