import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppNavigation from '../../../components/AppNavigation';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string | number>) => {
      const map: Record<string, string> = {
        'nav.brand': 'AI Agent Framework',
        'nav.primaryAria': 'Main navigation',
        'nav.openMenu': 'Open navigation menu',
        'nav.closeMenu': 'Close navigation menu',
        'nav.sections.projects': 'Projects',
        'nav.sections.currentProject': 'Current project',
        'nav.sections.create': 'Create',
        'nav.sections.manage': 'Manage',
        'nav.guidedBuilder': 'Guided Builder',
        'nav.projects': 'Projects',
        'nav.artifactBuilder': 'Artifact Builder',
        'nav.readinessBuilder': 'Readiness Builder',
        'nav.raid': 'RAID',
        'nav.commands': 'Commands',
        'nav.apiTester': 'API Tester',
        'nav.uiLibrary': 'UI Library',
        'ac.title': 'Assisted Creation',
        'projectView.tabs.proposeChanges': 'Propose Changes',
        'projectView.tabs.applyProposals': 'Apply Proposals',
        'projectView.tabs.audit': 'Audit',
        'nav.header.openApiDocs': 'API Docs',
        'nav.header.refreshStatus': 'Refresh',
        'nav.header.settings': 'Settings',
        'nav.header.settingsSoon': 'Settings coming soon',
        'conn.state.online': 'Online',
        'conn.state.offline': 'Offline',
        'conn.state.reconnecting': 'Reconnecting…',
        'conn.state.degraded': 'Degraded',
      };

      if (key === 'nav.header.apiStatusLabel') {
        return `API status: ${options?.state ?? ''}`;
      }

      if (key === 'nav.header.refreshInfo') {
        return `Auto-refresh every ${options?.seconds ?? ''}s`;
      }

      return map[key] ?? key;
    },
  }),
}));

vi.mock('../../../components/ConnectionStatus', () => ({
  default: ({ state }: { state: string }) => <div>ConnectionStatus:{state}</div>,
}));

vi.mock('../../../components/LanguageSwitcher', () => ({
  default: () => <div>LanguageSwitcher</div>,
}));

describe('AppNavigation', () => {
  it('shows API status and docs shortcut in header controls', () => {
    render(
      <MemoryRouter>
        <AppNavigation connectionState="online" />
      </MemoryRouter>,
    );

    expect(screen.getByText('API status: Online')).toBeInTheDocument();
    expect(screen.getByText('Auto-refresh every 30s')).toBeInTheDocument();

    const docsLink = screen.getByRole('link', { name: 'API Docs' });
    expect(docsLink).toBeInTheDocument();
    expect(docsLink).toHaveAttribute('href', 'http://localhost:8000/docs');
  });

  it('triggers connection refresh when refresh control is clicked', () => {
    const onRetryConnection = vi.fn();

    render(
      <MemoryRouter>
        <AppNavigation
          connectionState="degraded"
          onRetryConnection={onRetryConnection}
        />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));

    expect(onRetryConnection).toHaveBeenCalledTimes(1);
  });

  it('shows current project section with workflow links on project routes', () => {
    render(
      <MemoryRouter initialEntries={['/projects/TEST-123/readiness']}>
        <AppNavigation connectionState="online" />
      </MemoryRouter>,
    );

    expect(screen.getByRole('button', { name: 'Current project' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Artifact Builder' })).toHaveAttribute(
      'href',
      '/projects/TEST-123/artifacts',
    );
    expect(screen.getByRole('link', { name: 'Assisted Creation' })).toHaveAttribute(
      'href',
      '/projects/TEST-123/assisted-creation',
    );
    expect(screen.getByRole('link', { name: 'Readiness Builder' })).toHaveAttribute(
      'href',
      '/projects/TEST-123/readiness',
    );
    expect(screen.getByRole('link', { name: 'Propose Changes' })).toHaveAttribute(
      'href',
      '/projects/TEST-123/propose',
    );
    expect(screen.getByRole('link', { name: 'Apply Proposals' })).toHaveAttribute(
      'href',
      '/projects/TEST-123/apply',
    );
    expect(screen.getByRole('link', { name: 'RAID' })).toHaveAttribute(
      'href',
      '/projects/TEST-123/raid',
    );
    expect(screen.getByRole('link', { name: 'Audit' })).toHaveAttribute(
      'href',
      '/projects/TEST-123/audit',
    );
  });

  it('does not show current project section on non-project routes', () => {
    render(
      <MemoryRouter initialEntries={['/projects']}>
        <AppNavigation connectionState="online" />
      </MemoryRouter>,
    );

    expect(screen.queryByRole('button', { name: 'Current project' })).not.toBeInTheDocument();
  });

  it('closes mobile drawer with Escape and restores focus to toggle', () => {
    render(
      <MemoryRouter>
        <AppNavigation connectionState="online" />
      </MemoryRouter>,
    );

    const toggle = screen.getByRole('button', { name: 'Open navigation menu' });
    fireEvent.click(toggle);

    expect(
      screen.getAllByRole('button', { name: 'Close navigation menu' }).length,
    ).toBeGreaterThan(0);

    fireEvent.keyDown(document, { key: 'Escape' });

    const reopenedToggle = screen.getByRole('button', { name: 'Open navigation menu' });
    expect(reopenedToggle).toBeInTheDocument();
    expect(document.activeElement).toBe(reopenedToggle);
  });

  it('keeps focus trapped inside drawer when tabbing', () => {
    render(
      <MemoryRouter initialEntries={['/projects/TEST-123/readiness']}>
        <AppNavigation connectionState="online" />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open navigation menu' }));

    const focusables = Array.from(
      document.querySelectorAll<HTMLElement>('[data-nav-focusable="true"]'),
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    last.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(first);

    first.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it('supports Home and End key navigation across nav focusables', () => {
    render(
      <MemoryRouter initialEntries={['/projects/TEST-123/readiness']}>
        <AppNavigation connectionState="online" />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open navigation menu' }));

    const focusables = Array.from(
      document.querySelectorAll<HTMLElement>('[data-nav-focusable="true"]'),
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    first.focus();
    fireEvent.keyDown(first, { key: 'End' });
    expect(document.activeElement).toBe(last);

    fireEvent.keyDown(last, { key: 'Home' });
    expect(document.activeElement).toBe(first);
  });

  it('avoids misleading tree/menu semantics for site navigation', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/projects/TEST-123/readiness']}>
        <AppNavigation connectionState="online" />
      </MemoryRouter>,
    );

    expect(screen.queryByRole('tree')).not.toBeInTheDocument();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(container.querySelector('[aria-level]')).not.toBeInTheDocument();
    expect(container.querySelector('[aria-posinset]')).not.toBeInTheDocument();
    expect(container.querySelector('[aria-setsize]')).not.toBeInTheDocument();
  });

  it('closes mobile drawer from overlay click and restores focus to toggle', () => {
    render(
      <MemoryRouter initialEntries={['/projects/TEST-123/readiness']}>
        <AppNavigation connectionState="online" />
      </MemoryRouter>,
    );

    const toggle = screen.getByRole('button', { name: 'Open navigation menu' });
    fireEvent.click(toggle);

    const overlay = document.querySelector<HTMLButtonElement>('.nav-mobile-overlay');
    expect(overlay).toBeTruthy();
    fireEvent.click(overlay as HTMLButtonElement);

    const reopenedToggle = screen.getByRole('button', { name: 'Open navigation menu' });
    expect(reopenedToggle).toBeInTheDocument();
    expect(document.activeElement).toBe(reopenedToggle);
  });
});
