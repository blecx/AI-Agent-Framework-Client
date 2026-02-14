import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AssistedCreationControls from '../../../components/AssistedCreationControls';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const dict: Record<string, string> = {
        'ac.controls.pause': 'Pause',
        'ac.controls.resume': 'Resume',
        'ac.controls.saveDraft': 'Save draft',
        'ac.controls.saveSnapshot': 'Save snapshot',
        'ac.controls.exit': 'Exit',
      };
      return dict[key] ?? key;
    },
  }),
}));

describe('AssistedCreationControls', () => {
  it('shows pause control while prompting', () => {
    render(
      <AssistedCreationControls
        state="prompting"
        hasDraft={false}
        onPause={vi.fn()}
        onResume={vi.fn()}
        onSaveDraft={vi.fn()}
        onSaveSnapshot={vi.fn()}
        onExit={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /Pause/i })).toBeInTheDocument();
  });

  it('shows resume control while paused', () => {
    render(
      <AssistedCreationControls
        state="paused"
        hasDraft={false}
        onPause={vi.fn()}
        onResume={vi.fn()}
        onSaveDraft={vi.fn()}
        onSaveSnapshot={vi.fn()}
        onExit={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /Resume/i })).toBeInTheDocument();
  });

  it('disables save snapshot when no draft exists', () => {
    render(
      <AssistedCreationControls
        state="reviewing"
        hasDraft={false}
        onPause={vi.fn()}
        onResume={vi.fn()}
        onSaveDraft={vi.fn()}
        onSaveSnapshot={vi.fn()}
        onExit={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /Save snapshot/i })).toBeDisabled();
  });

  it('triggers callbacks', () => {
    const onPause = vi.fn();
    const onSaveDraft = vi.fn();
    const onExit = vi.fn();

    render(
      <AssistedCreationControls
        state="prompting"
        hasDraft={true}
        onPause={onPause}
        onResume={vi.fn()}
        onSaveDraft={onSaveDraft}
        onSaveSnapshot={vi.fn()}
        onExit={onExit}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Pause/i }));
    fireEvent.click(screen.getByRole('button', { name: /Save draft/i }));
    fireEvent.click(screen.getByRole('button', { name: /Exit/i }));

    expect(onPause).toHaveBeenCalledOnce();
    expect(onSaveDraft).toHaveBeenCalledOnce();
    expect(onExit).toHaveBeenCalledOnce();
  });
});
