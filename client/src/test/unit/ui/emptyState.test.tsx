import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EmptyState from '../../../components/ui/EmptyState';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? key,
  }),
}));

describe('EmptyState', () => {
  it('renders with title', () => {
    render(<EmptyState title="No items found" />);
    expect(screen.getByText('No items found')).toBeTruthy();
  });

  it('renders with description', () => {
    render(
      <EmptyState
        title="No items"
        description="Get started by creating your first item."
      />,
    );
    expect(
      screen.getByText('Get started by creating your first item.'),
    ).toBeTruthy();
  });

  it('renders with custom icon', () => {
    const { container } = render(<EmptyState icon="🎉" title="Success!" />);
    expect(container.textContent).toContain('🎉');
  });

  it('renders action button and calls onClick', () => {
    const handleClick = vi.fn();

    render(
      <EmptyState
        title="No projects"
        action={{
          label: 'Create Project',
          onClick: handleClick,
        }}
      />,
    );

    const button = screen.getByRole('button', { name: 'Create Project' });
    expect(button).toBeTruthy();

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('renders CTA button with cta props and calls ctaAction', () => {
    const handleClick = vi.fn();

    render(
      <EmptyState
        title="No projects"
        ctaLabel="Create Project"
        ctaAction={handleClick}
      />,
    );

    const button = screen.getByRole('button', { name: 'Create Project' });
    expect(button).toBeTruthy();

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('has proper ARIA attributes', () => {
    const { container } = render(<EmptyState title="Empty" />);
    const emptyState = container.querySelector('.empty-state');
    expect(emptyState?.getAttribute('role')).toBe('status');
    expect(emptyState?.getAttribute('aria-live')).toBe('polite');
  });
});
