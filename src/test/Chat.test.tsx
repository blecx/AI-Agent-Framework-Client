import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Chat } from '../pages/Chat';

describe('Chat Component', () => {
  it('renders chat interface', () => {
    render(
      <BrowserRouter>
        <Chat />
      </BrowserRouter>,
    );

    // Chat should render the main interface elements
    expect(screen.getByText('AI Agent Framework Client')).toBeInTheDocument();
  });

  it('displays API configuration', () => {
    render(
      <BrowserRouter>
        <Chat />
      </BrowserRouter>,
    );

    // Should show API URL
    expect(screen.getByText(/API:/)).toBeInTheDocument();
  });
});
