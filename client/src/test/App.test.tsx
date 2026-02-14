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
    expect(screen.getByText(/AI Agent Framework/i)).toBeInTheDocument();
  });
});
