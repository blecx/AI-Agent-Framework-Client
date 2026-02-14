import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ReadinessPanel from '../../../components/ReadinessPanel';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string | number>) => {
      const map: Record<string, string> = {
        'rd.state.warn': 'Warning',
        'rd.nextActions': 'Next Actions',
        'rd.summary.passed': `${options?.count} checks passed`,
        'rd.summary.warnings': `${options?.count} warnings`,
        'rd.summary.failed': `${options?.count} failed`,
        'rd.checks.items.projectCharter.name': 'Project Charter',
        'rd.checks.items.raidRegister.name': 'RAID Register',
        'rd.actions.reviewCharter': 'Review Charter',
        'rd.actions.createRaid': 'Create RAID Items',
      };
      return map[key] ?? key;
    },
  }),
}));

describe('ReadinessPanel', () => {
  it('renders status and summary', () => {
    render(
      <MemoryRouter>
        <ReadinessPanel
          readiness={{
            overallStatus: 'warn',
            checks: [],
            summary: {
              passed: 1,
              warnings: 2,
              failed: 1,
              notAssessed: 0,
              inProgress: 0,
            },
          }}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Warning')).toBeInTheDocument();
    expect(screen.getByText('1 checks passed')).toBeInTheDocument();
    expect(screen.getByText('2 warnings')).toBeInTheDocument();
    expect(screen.getByText('1 failed')).toBeInTheDocument();
  });

  it('shows next actions and navigates on CTA click', () => {
    render(
      <MemoryRouter>
        <ReadinessPanel
          readiness={{
            overallStatus: 'warn',
            checks: [
              {
                id: 'projectCharter',
                status: 'warn',
                actionKey: 'reviewCharter',
                actionUrl: '/projects/TEST/artifacts',
              },
              {
                id: 'raidRegister',
                status: 'fail',
                actionKey: 'createRaid',
                actionUrl: '/projects/TEST',
              },
            ],
            summary: {
              passed: 0,
              warnings: 1,
              failed: 1,
              notAssessed: 0,
              inProgress: 0,
            },
          }}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Next Actions')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Review Charter' }));
    expect(mockNavigate).toHaveBeenCalledWith('/projects/TEST/artifacts');
  });
});
