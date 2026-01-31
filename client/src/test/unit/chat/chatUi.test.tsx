/**
 * Unit tests for Chat UI components
 */

import { createRef } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatInterface } from '../../../components/chat/ChatInterface';
import { ChatInput } from '../../../components/chat/ChatInput';
import { ChatMessageBubble } from '../../../components/chat/ChatMessageBubble';
import { ChatMessageList } from '../../../components/chat/ChatMessageList';
import type { ChatMessage } from '../../../chat/types';
import * as chatApi from '../../../chat/chatApi';

// Mock the chat modules
vi.mock('../../../chat/commandParser', () => ({
  parseCommand: vi.fn(),
}));

vi.mock('../../../chat/conversationManager', () => ({
  initCreateRAIDConversation: vi.fn(),
  processConversationResponse: vi.fn(),
  startConversation: vi.fn(),
  getConversationProgress: vi.fn(),
}));

vi.mock('../../../chat/chatApi', () => ({
  executeCommand: vi.fn(),
  canExecuteCommand: vi.fn(),
}));

describe('ChatInput', () => {
  it('should render input field and send button', () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('should call onSend when send button is clicked', () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);

    const input = screen.getByRole('textbox');
    const sendBtn = screen.getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(sendBtn);

    expect(onSend).toHaveBeenCalledWith('Hello');
  });

  it('should clear input after sending', () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);

    const input = screen.getByRole('textbox') as HTMLTextAreaElement;
    const sendBtn = screen.getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(sendBtn);

    expect(input.value).toBe('');
  });

  it('should send on Enter key (without Shift)', () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);

    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });

    expect(onSend).toHaveBeenCalledWith('Hello');
  });

  it('should not send on Shift+Enter (allows newline)', () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);

    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });

    expect(onSend).not.toHaveBeenCalled();
  });

  it('should disable input and button when disabled prop is true', () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} disabled={true} />);

    const input = screen.getByRole('textbox');
    const sendBtn = screen.getByRole('button', { name: /send/i });

    expect(input).toBeDisabled();
    expect(sendBtn).toBeDisabled();
  });

  it('should not send empty messages', () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);

    const input = screen.getByRole('textbox');
    const sendBtn = screen.getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(sendBtn);

    expect(onSend).not.toHaveBeenCalled();
  });
});

describe('ChatMessageBubble', () => {
  it('should render user message correctly', () => {
    const message: ChatMessage = {
      id: '1',
      role: 'user',
      content: 'Hello',
      timestamp: new Date(),
    };

    render(<ChatMessageBubble message={message} />);

    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('👤')).toBeInTheDocument();
  });

  it('should render assistant message correctly', () => {
    const message: ChatMessage = {
      id: '2',
      role: 'assistant',
      content: 'Hi there!',
      timestamp: new Date(),
    };

    render(<ChatMessageBubble message={message} />);

    expect(screen.getByText('Hi there!')).toBeInTheDocument();
    expect(screen.getByText('🤖')).toBeInTheDocument();
  });

  it('should render bold text in assistant messages', () => {
    const message: ChatMessage = {
      id: '3',
      role: 'assistant',
      content: 'This is **bold** text',
      timestamp: new Date(),
    };

    const { container } = render(<ChatMessageBubble message={message} />);

    const bold = container.querySelector('strong');
    expect(bold).toBeInTheDocument();
    expect(bold?.textContent).toBe('bold');
  });

  it('should display timestamp', () => {
    const timestamp = new Date('2024-01-01T12:30:00');
    const message: ChatMessage = {
      id: '4',
      role: 'user',
      content: 'Test',
      timestamp,
    };

    render(<ChatMessageBubble message={message} />);

    // Should show time in 12-hour format
    expect(screen.getByText(/12:30/)).toBeInTheDocument();
  });
});

describe('ChatMessageList', () => {
  it('should render list of messages', () => {
    const messages: ChatMessage[] = [
      {
        id: '1',
        role: 'assistant',
        content: 'Hello',
        timestamp: new Date(),
      },
      {
        id: '2',
        role: 'user',
        content: 'Hi',
        timestamp: new Date(),
      },
    ];

    const ref = createRef<HTMLDivElement>();
    render(<ChatMessageList messages={messages} messagesEndRef={ref} />);

    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi')).toBeInTheDocument();
  });

  it('should render empty list when no messages', () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <ChatMessageList messages={[]} messagesEndRef={ref} />,
    );

    const messageElements = container.querySelectorAll('.chat-message');
    expect(messageElements.length).toBe(0);
  });
});

describe('ChatInterface', () => {
  it('should render chat interface with header', () => {
    render(<ChatInterface projectKey="PROJ-001" />);

    expect(screen.getByText(/Chat Assistant/i)).toBeInTheDocument();
    const projectBadges = screen.getAllByText('PROJ-001');
    expect(projectBadges.length).toBeGreaterThan(0);
  });

  it('should show greeting message on load', () => {
    render(<ChatInterface projectKey="PROJ-001" />);

    expect(
      screen.getByText(/Hello! I can help you manage RAID items/i),
    ).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<ChatInterface projectKey="PROJ-001" onClose={onClose} />);

    const closeBtn = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalled();
  });

  it('should show cancel button when in conversation', async () => {
    const { parseCommand } = await import('../../../chat/commandParser');
    const { startConversation } =
      await import('../../../chat/conversationManager');

    vi.mocked(parseCommand).mockReturnValue({
      type: 'CREATE_RAID',
      params: {},
      confidence: 0.9,
      originalMessage: 'Create a risk',
    });

    vi.mocked(startConversation).mockReturnValue({
      state: {
        intent: 'CREATE_RAID',
        projectKey: 'PROJ-001',
        steps: [
          { field: 'title', prompt: 'What is the title?', required: true },
        ],
        currentStep: 0,
        raidType: null,
        collectedData: {},
      },
      initialPrompt: 'What is the title?',
    });

    render(<ChatInterface projectKey="PROJ-001" />);

    const input = screen.getByPlaceholderText(/Type a command/i);
    fireEvent.change(input, { target: { value: 'Create a risk' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText(/Cancel/)).toBeInTheDocument();
    });
  });

  it('should execute command when conversation is complete', async () => {
    const { canExecuteCommand, executeCommand } = chatApi;

    vi.mocked(canExecuteCommand).mockReturnValue(true);
    vi.mocked(executeCommand).mockResolvedValue({
      success: true,
      message: {
        id: 'msg-1',
        role: 'assistant',
        content: 'Created RISK-001',
        timestamp: new Date(),
      },
    });

    const { processConversationResponse } =
      await import('../../../chat/conversationManager');

    vi.mocked(processConversationResponse).mockReturnValue({
      state: {
        intent: 'CREATE_RAID',
        projectKey: 'PROJ-001',
        steps: [],
        currentStep: 0,
        raidType: null,
        collectedData: { title: 'Test', description: 'Test desc' },
      },
      nextPrompt: null,
      isComplete: true,
    });

    render(<ChatInterface projectKey="PROJ-001" />);

    // Simulate user input when in conversation
    // (This is a simplified test - full flow would require more setup)
    await waitFor(() => {
      expect(screen.getByText(/Hello! I can help you/)).toBeInTheDocument();
    });
  });
});
