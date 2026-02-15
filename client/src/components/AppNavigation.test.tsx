import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppNavigation from './AppNavigation';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) =>
      ({
        'nav.brand': 'AI Agent Framework',
        'nav.primaryAria': 'Main navigation',
        'nav.openMenu': 'Open navigation menu',
        'nav.closeMenu': 'Close navigation menu',
        'nav.guidedBuilder': 'Guided Builder',
        'nav.projects': 'Projects',
        'nav.sections.projects': 'Projects',
        'nav.sections.create': 'Create',
        'nav.sections.manage': 'Manage',
        'nav.commands': 'Commands',
        'nav.apiTester': 'API Tester',
        'nav.uiLibrary': 'UI Library',
        'nav.helpAvailable': 'Help is available for this feature',
      })[key] ?? key,
  }),
}));

vi.mock('./ConnectionStatus', () => ({
  default: () => <div>ConnectionStatus</div>,
}));

vi.mock('./LanguageSwitcher', () => ({
  default: () => <div>LanguageSwitcher</div>,
}));

describe('AppNavigation', () => {
  it('renders guided builder as primary nav item and main sections', () => {
    render(
      <MemoryRouter initialEntries={['/projects']}>
        <AppNavigation connectionState="online" />
      </MemoryRouter>,
    );

    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Guided Builder' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Help is available for this feature: Guided Builder/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Projects/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create/i })).toBeInTheDocument();
  });

  it('highlights the active route', () => {
    render(
      <MemoryRouter initialEntries={['/guided-builder']}>
        <AppNavigation connectionState="online" />
      </MemoryRouter>,
    );

    const guidedBuilderLink = screen.getByRole('link', { name: 'Guided Builder' });
    expect(guidedBuilderLink.className).toContain('app-nav__item--active');
  });

  it('toggles mobile navigation and collapses sections', () => {
    render(
      <MemoryRouter initialEntries={['/projects']}>
        <AppNavigation connectionState="online" />
      </MemoryRouter>,
    );

    const menuToggle = screen.getByRole('button', { name: /Open navigation menu/i });
    fireEvent.click(menuToggle);

    expect(menuToggle).toHaveAttribute('aria-label', 'Close navigation menu');
    expect(menuToggle).toHaveAttribute('aria-expanded', 'true');

    const createSectionButton = screen.getByRole('button', { name: /Create/i });
    expect(createSectionButton).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(createSectionButton);
    expect(createSectionButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('does not expose duplicate project-scoped shortcuts in global navigation', () => {
    render(
      <MemoryRouter initialEntries={['/projects']}>
        <AppNavigation connectionState="online" />
      </MemoryRouter>,
    );

    expect(screen.queryByRole('link', { name: /Assisted Creation/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Readiness Builder/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/Open a project to start/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Open a project to assess readiness/i)).not.toBeInTheDocument();
  });
});
