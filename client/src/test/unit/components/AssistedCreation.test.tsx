import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AssistedCreation from '../../../components/AssistedCreation';

vi.mock('../../../services/mockAIService', () => ({
  mockAIService: {
    startSession: vi.fn(async () => ({
      sessionId: 'session-1',
      firstQuestion: 'What is the project name?',
    })),
    submitAnswer: vi.fn(async (_answer: string, questionIndex: number) => {
      if (questionIndex === 0) {
        return { isComplete: false, nextQuestion: 'What is the project goal?' };
      }
      return { isComplete: true, draft: '# Draft output' };
    }),
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string | number>) => {
      const dict: Record<string, string> = {
        'ac.title': 'Assisted Creation',
        'ac.state.idle': 'Ready to start',
        'ac.state.prompting': 'Answering questions…',
        'ac.state.generating': 'Generating content…',
        'ac.state.reviewing': 'Review & refine',
        'ac.state.paused': 'Paused',
        'ac.state.complete': 'Complete',
        'ac.prompt.title': 'Guided Prompting',
        'ac.prompt.placeholder': 'Type your answer...',
        'ac.prompt.submit': 'Submit',
        'ac.draft.title': 'Draft Preview',
        'ac.draft.empty': 'No draft yet. Answer the prompts to generate content.',
        'ac.controls.pause': 'Pause',
        'ac.controls.resume': 'Resume',
        'ac.controls.saveDraft': 'Save draft',
        'ac.controls.saveSnapshot': 'Save snapshot',
        'ac.controls.exit': 'Exit',
      };
      if (key === 'ac.prompt.question') {
        return `Question ${options?.current} of ${options?.total}`;
      }
      return dict[key] ?? key;
    },
  }),
}));

describe('AssistedCreation', () => {
  it('starts in prompting state after session initialization', async () => {
    render(
      <MemoryRouter initialEntries={['/projects/TEST-1/assisted-creation?artifactType=charter']}>
        <Routes>
          <Route
            path="/projects/:projectKey/assisted-creation"
            element={<AssistedCreation projectKey="TEST-1" />}
          />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('What is the project name?')).toBeInTheDocument();
    });

    expect(screen.getByText('Assisted Creation: charter')).toBeInTheDocument();
  });

  it('transitions to next question and eventually draft review', async () => {
    render(
      <MemoryRouter initialEntries={['/projects/TEST-1/assisted-creation?artifactType=charter']}>
        <Routes>
          <Route
            path="/projects/:projectKey/assisted-creation"
            element={<AssistedCreation projectKey="TEST-1" />}
          />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('What is the project name?')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Type your answer...'), {
      target: { value: 'Apollo' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(screen.getByText('What is the project goal?')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Type your answer...'), {
      target: { value: 'Modernize systems' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(screen.getByText('# Draft output')).toBeInTheDocument();
      expect(screen.getByText('Review & refine')).toBeInTheDocument();
    });
  });

  it('supports pause and resume transitions', async () => {
    render(
      <MemoryRouter initialEntries={['/projects/TEST-1/assisted-creation?artifactType=charter']}>
        <Routes>
          <Route
            path="/projects/:projectKey/assisted-creation"
            element={<AssistedCreation projectKey="TEST-1" />}
          />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('What is the project name?')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Pause/i }));
    expect(screen.getByText('Paused')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Resume/i }));
    expect(screen.getByText('Answering questions…')).toBeInTheDocument();
  });
});
