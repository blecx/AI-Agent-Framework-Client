import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

vi.mock('../hooks/useConnection', () => ({
  useConnection: () => ({
    state: 'online',
    retryConnection: () => {},
  }),
}));

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/nav\.brand/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /a11y\.skipToContent/i })).toBeInTheDocument();
  });
});
