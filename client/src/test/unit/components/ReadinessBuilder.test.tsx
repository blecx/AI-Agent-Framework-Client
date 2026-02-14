import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ReadinessBuilder from '../../../components/ReadinessBuilder';

vi.mock('../../../services/mockReadinessService', () => ({
  mockReadinessService: {
    getProjectReadiness: vi.fn(async () => ({
      overallStatus: 'warn',
      checks: [
        { id: 'projectBasics', status: 'pass' },
        {
          id: 'projectCharter',
          status: 'warn',
          actionKey: 'reviewCharter',
          actionUrl: '/projects/TEST/artifacts',
        },
      ],
      summary: {
        passed: 1,
        warnings: 1,
        failed: 0,
        notAssessed: 0,
        inProgress: 0,
      },
    })),
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string | number>) => {
      const map: Record<string, string> = {
        'rd.title': 'Readiness Builder',
        'rd.loading': 'Loading readiness...',
        'rd.state.warn': 'Warning',
        'rd.state.pass': 'Pass',
        'rd.summary.passed': `${options?.count} checks passed`,
        'rd.summary.warnings': `${options?.count} warnings`,
        'rd.summary.failed': `${options?.count} failed`,
        'rd.nextActions': 'Next Actions',
        'rd.checks.title': 'Readiness Checks',
        'rd.checks.items.projectBasics.name': 'Project Basics',
        'rd.checks.items.projectBasics.description': 'Project has name, key, and description',
        'rd.checks.items.projectBasics.message': 'Project basics are complete',
        'rd.checks.items.projectCharter.name': 'Project Charter',
        'rd.checks.items.projectCharter.description': 'Project charter exists and is complete',
        'rd.checks.items.projectCharter.message': 'Charter exists but is not reviewed',
        'rd.actions.reviewCharter': 'Review Charter',
        'rd.errors.missingProjectKey': 'Project key is required',
        'rd.errors.loadFailed': 'Error loading readiness data',
      };
      return map[key] ?? key;
    },
  }),
}));

describe('ReadinessBuilder', () => {
  it('renders readiness dashboard from route project key', async () => {
    render(
      <MemoryRouter initialEntries={['/projects/TEST/readiness']}>
        <Routes>
          <Route path="/projects/:projectKey/readiness" element={<ReadinessBuilder />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Readiness Builder')).toBeInTheDocument();
    });

    expect(screen.getAllByText('Warning').length).toBeGreaterThan(0);
    expect(screen.getByText('Readiness Checks')).toBeInTheDocument();
    expect(screen.getAllByText('Project Charter').length).toBeGreaterThan(0);
  });

  it('shows error when no project key is provided', async () => {
    render(
      <MemoryRouter>
        <ReadinessBuilder />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Project key is required')).toBeInTheDocument();
    });
  });
});
