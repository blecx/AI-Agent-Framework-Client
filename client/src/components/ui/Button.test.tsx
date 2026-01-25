import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole('button', { name: /click me/i }),
    ).toBeInTheDocument();
  });

  it('disables when loading', () => {
    render(<Button isLoading>Save</Button>);
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
  });
});
