import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConflictResolver from '../../../components/ConflictResolver';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string>) => {
      const translations: Record<string, string> = {
        'sync.conflict.resolutionOptions': 'Resolution options',
        'sync.conflict.keepMine': 'Keep mine',
        'sync.conflict.useTheirs': 'Use theirs',
        'sync.conflict.aiSuggestion': 'AI suggestion',
        'sync.conflict.manual': 'Manual edit',
        'sync.conflict.cancel': 'Cancel',
        'sync.conflict.apply': 'Apply resolution',
      };
      if (key === 'sync.conflict.title') {
        return `Resolve conflict: ${options?.file ?? ''}`;
      }
      return translations[key] ?? key;
    },
  }),
}));

describe('ConflictResolver', () => {
  const conflict = {
    file: 'project-charter.md',
    localContent: 'local version',
    remoteContent: 'remote version',
  };

  it('renders conflict file and options', () => {
    render(
      <ConflictResolver
        conflict={conflict}
        onResolve={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByText('Resolve conflict: project-charter.md')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Keep mine' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Use theirs' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'AI suggestion' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Manual edit' })).toBeInTheDocument();
  });

  it('calls onResolve with selected resolution', () => {
    const onResolve = vi.fn();

    render(
      <ConflictResolver
        conflict={conflict}
        onResolve={onResolve}
        onCancel={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('radio', { name: 'Use theirs' }));
    fireEvent.click(screen.getByRole('button', { name: 'Apply resolution' }));

    expect(onResolve).toHaveBeenCalledWith('theirs');
  });
});
