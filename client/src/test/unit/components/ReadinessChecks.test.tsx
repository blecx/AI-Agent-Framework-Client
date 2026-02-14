import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ReadinessChecks from '../../../components/ReadinessChecks';

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
    t: (key: string) => {
      const map: Record<string, string> = {
        'rd.checks.title': 'Readiness Checks',
        'rd.state.pass': 'Pass',
        'rd.state.warn': 'Warning',
        'rd.state.fail': 'Failed',
        'rd.state.notAssessed': 'Not Assessed',
        'rd.checks.items.projectBasics.name': 'Project Basics',
        'rd.checks.items.projectBasics.description': 'Project has name, key, and description',
        'rd.checks.items.projectBasics.message': 'Project basics are complete',
        'rd.checks.items.raidRegister.name': 'RAID Register',
        'rd.checks.items.raidRegister.description': 'Risks, assumptions, issues, and dependencies are documented',
        'rd.checks.items.raidRegister.message': 'No RAID items documented',
        'rd.actions.createRaid': 'Create RAID Items',
      };
      return map[key] ?? key;
    },
  }),
}));

describe('ReadinessChecks', () => {
  it('renders checks and state labels', () => {
    render(
      <MemoryRouter>
        <ReadinessChecks
          checks={[
            { id: 'projectBasics', status: 'pass' },
            {
              id: 'raidRegister',
              status: 'fail',
              actionKey: 'createRaid',
              actionUrl: '/projects/TEST/raid',
            },
          ]}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Readiness Checks')).toBeInTheDocument();
    expect(screen.getByText('Project Basics')).toBeInTheDocument();
    expect(screen.getByText('RAID Register')).toBeInTheDocument();
    expect(screen.getByText('Pass')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('navigates when action CTA is clicked', () => {
    render(
      <MemoryRouter>
        <ReadinessChecks
          checks={[
            {
              id: 'raidRegister',
              status: 'fail',
              actionKey: 'createRaid',
              actionUrl: '/projects/TEST/raid',
            },
          ]}
        />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Create RAID Items' }));
    expect(mockNavigate).toHaveBeenCalledWith('/projects/TEST/raid');
  });
});
