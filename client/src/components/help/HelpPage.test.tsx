import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HelpPage from './HelpPage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const dictionary: Record<string, string> = {
        'help.title': 'Help & Documentation',
        'help.subtitle': 'Find guidance for workflows and concepts.',
        'help.search.label': 'Search',
        'help.search.placeholder': 'Search help topics...',
        'help.categories.getting-started': 'Getting Started',
        'help.categories.workflows': 'Workflows',
        'help.categories.concepts': 'Concepts',
        'help.categories.reference': 'Reference',
        'help.topics.firstSteps.title': 'First Steps',
        'help.topics.firstSteps.summary': 'Start quickly',
        'help.topics.firstSteps.content': '...',
        'help.topics.iso21500.title': 'Understanding ISO 21500',
        'help.topics.iso21500.summary': 'Standard overview',
        'help.topics.iso21500.content': '...',
        'help.topics.gb.title': 'Guided Builder',
        'help.topics.gb.summary': 'Step by step',
        'help.topics.gb.content': '...',
        'help.topics.ac.title': 'Assisted Creation',
        'help.topics.ac.summary': 'AI assisted',
        'help.topics.ac.content': '...',
        'help.topics.rd.title': 'Readiness Builder',
        'help.topics.rd.summary': 'Assess readiness',
        'help.topics.rd.content': '...',
        'help.topics.workflows.title': 'Workflows',
        'help.topics.workflows.summary': 'Workflow model',
        'help.topics.workflows.content': '...',
        'help.topics.projects.title': 'Projects',
        'help.topics.projects.summary': 'Project model',
        'help.topics.projects.content': '...',
        'help.topics.artifacts.title': 'Artifacts',
        'help.topics.artifacts.summary': 'Artifacts model',
        'help.topics.artifacts.content': '...',
        'help.topics.raid.title': 'RAID',
        'help.topics.raid.summary': 'Risk tracking',
        'help.topics.raid.content': '...',
        'help.topics.guidedCoAuthoring.title': 'Guided Co-Authoring',
        'help.topics.guidedCoAuthoring.summary': 'Co-authoring concept',
        'help.topics.guidedCoAuthoring.content': '...',
      };
      return dictionary[key] ?? key;
    },
  }),
}));

describe('HelpPage', () => {
  it('renders help categories and topics', () => {
    render(
      <MemoryRouter>
        <HelpPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Help & Documentation')).toBeInTheDocument();
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Guided Builder/i })).toBeInTheDocument();
  });

  it('filters topics by search query', () => {
    render(
      <MemoryRouter>
        <HelpPage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'Guided Builder' },
    });

    expect(screen.getByRole('link', { name: /Guided Builder/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Assisted Creation/i })).not.toBeInTheDocument();
  });
});
