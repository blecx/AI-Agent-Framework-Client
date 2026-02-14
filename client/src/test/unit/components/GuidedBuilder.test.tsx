import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import GuidedBuilder from '../../../components/GuidedBuilder';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string | number>) => {
      const translations: Record<string, string> = {
        'gb.welcome.title': 'Welcome to Guided Builder',
        'gb.welcome.description': 'Create a project step-by-step with AI assistance and best-practice defaults.',
        'gb.welcome.feature1': 'Set up project essentials quickly',
        'gb.welcome.feature2': 'Select artifacts to generate',
        'gb.welcome.feature3': 'Review before finalizing',
        'gb.welcome.cta': 'Get Started',
        'gb.step.projectSetup': 'Project Setup',
        'gb.step.artifacts': 'Artifacts',
        'gb.step.review': 'Review',
        'gb.projectSetup.description': 'Define your project basics before artifact generation.',
        'gb.projectSetup.fields.name': 'Project name',
        'gb.projectSetup.fields.key': 'Project key',
        'gb.projectSetup.fields.description': 'Description',
        'gb.projectSetup.fields.standard': 'Standard',
        'gb.projectSetup.placeholders.name': 'e.g. Apollo Modernization',
        'gb.projectSetup.placeholders.key': 'e.g. APOLLO-01',
        'gb.projectSetup.placeholders.description': 'Describe project goals and context',
        'gb.nav.next': 'Next',
        'gb.nav.back': 'Back',
        'gb.nav.skip': 'Skip',
        'gb.review.description': 'Review your setup and continue to project workspace.',
        'gb.review.artifacts': 'Selected artifacts',
        'gb.review.none': 'None selected',
        'gb.review.openProject': 'Open Project',
      };

      if (key === 'gb.progress') {
        return `Step ${options?.current} of ${options?.total}`;
      }

      return translations[key] ?? key;
    },
  }),
}));

beforeEach(() => {
  sessionStorage.clear();
});

describe('GuidedBuilder', () => {
  it('starts at welcome step and progresses to project setup', () => {
    render(
      <MemoryRouter initialEntries={['/guided-builder/welcome']}>
        <Routes>
          <Route path="/guided-builder/:step" element={<GuidedBuilder />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText(/Welcome to Guided Builder/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Get Started/i }));

    expect(screen.getByText(/Project Setup/i)).toBeInTheDocument();
    expect(screen.getByText(/Step 2 of 4/i)).toBeInTheDocument();
  });

  it('persists project setup state when navigating back and forth', () => {
    render(
      <MemoryRouter initialEntries={['/guided-builder/project-setup']}>
        <Routes>
          <Route path="/guided-builder/:step" element={<GuidedBuilder />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/Project name/i), {
      target: { value: 'Apollo' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    expect(screen.getByRole('heading', { name: 'Artifacts' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Back/i }));
    expect(screen.getByLabelText(/Project name/i)).toHaveValue('Apollo');
  });

  it('can skip to review and keeps session state for resume', () => {
    render(
      <MemoryRouter initialEntries={['/guided-builder/project-setup']}>
        <Routes>
          <Route path="/guided-builder/:step" element={<GuidedBuilder />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /Skip/i }));
    expect(screen.getByRole('heading', { name: 'Review' })).toBeInTheDocument();

    const stored = sessionStorage.getItem('guided-builder-state');
    expect(stored).toContain('"currentStep":"review"');
  });
});
