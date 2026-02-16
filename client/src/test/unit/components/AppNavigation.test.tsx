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
        'nav.sections.create': 'Create',
        'nav.sections.manage': 'Manage',
        'nav.guidedBuilder': 'Guided Builder',
        'nav.projects': 'Projects',
        'nav.commands': 'Commands',
        'nav.apiTester': 'API Tester',
        'nav.uiLibrary': 'UI Library',
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
});
