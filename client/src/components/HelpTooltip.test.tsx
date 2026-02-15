import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HelpTooltip from './HelpTooltip';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) =>
      ({
        'help.actions.show': 'Show help',
        'help.actions.close': 'Close help',
        'help.actions.learnMore': 'Learn more',
        'help.formFields.artifactType.title': 'Artifact Type',
        'help.formFields.artifactType.content': 'Artifact type explains structure.',
      })[key] ?? key,
  }),
}));

describe('HelpTooltip', () => {
  it('opens and closes with click and escape', () => {
    render(
      <MemoryRouter>
        <HelpTooltip
          titleKey="help.formFields.artifactType.title"
          contentKey="help.formFields.artifactType.content"
        />
      </MemoryRouter>,
    );

    const trigger = screen.getByRole('button', { name: 'Show help' });
    fireEvent.click(trigger);

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByText('Artifact type explains structure.')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('renders learn-more link when provided', () => {
    render(
      <MemoryRouter>
        <HelpTooltip
          titleKey="help.formFields.artifactType.title"
          contentKey="help.formFields.artifactType.content"
          learnMorePath="/help/artifacts"
        />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Show help' }));
    expect(screen.getByRole('link', { name: /Learn more/i })).toHaveAttribute('href', '/help/artifacts');
  });
});
