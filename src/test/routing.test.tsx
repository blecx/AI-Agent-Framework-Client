import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProjectProvider } from '../contexts/ProjectContext';
import { Home } from '../pages/Home';
import { ProjectList } from '../pages/ProjectList';
import { NotFound } from '../pages/NotFound';

describe('Routing Components', () => {
  it('renders Home page', () => {
    render(
      <BrowserRouter>
        <ProjectProvider>
          <Home />
        </ProjectProvider>
      </BrowserRouter>,
    );

    expect(screen.getByText('AI Agent Framework')).toBeInTheDocument();
    expect(screen.getByText('View Projects')).toBeInTheDocument();
  });

  it('renders ProjectList page', () => {
    render(
      <BrowserRouter>
        <ProjectProvider>
          <ProjectList />
        </ProjectProvider>
      </BrowserRouter>,
    );

    expect(screen.getByText('Projects')).toBeInTheDocument();
  });

  it('renders NotFound page', () => {
    render(
      <BrowserRouter>
        <ProjectProvider>
          <NotFound />
        </ProjectProvider>
      </BrowserRouter>,
    );

    expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument();
    expect(screen.getByText('Go Home')).toBeInTheDocument();
  });

  it('home page has correct navigation links', () => {
    render(
      <BrowserRouter>
        <ProjectProvider>
          <Home />
        </ProjectProvider>
      </BrowserRouter>,
    );

    // Verify both navigation links exist with correct hrefs
    const projectsLink = screen.getByText('View Projects');
    expect(projectsLink).toHaveAttribute('href', '/projects');

    const chatLink = screen.getByText('Open Chat');
    expect(chatLink).toHaveAttribute('href', '/chat');
  });
});
