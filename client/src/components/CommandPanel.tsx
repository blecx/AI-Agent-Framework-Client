import { useState, useEffect, useRef } from 'react';
import apiClient from '../services/apiClient';
import type { Message, CommandHistoryItem } from '../types';
import './CommandPanel.css';

function CommandPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<CommandHistoryItem[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load command history on mount
    loadHistory();
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadHistory = async () => {
    try {
      const data: { history?: CommandHistoryItem[] } = await apiClient.getCommandHistory();
      setHistory(data.history || []);
      
      // Add welcome message
      setMessages([
        {
          type: 'system',
          content: 'Welcome to the Command Panel. Type a command to get started.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch {
      // Use mock welcome message on error
      setMessages([
        {
          type: 'system',
          content: 'Welcome to the Command Panel. Type a command to get started.',
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;

    const userMessage: Message = {
      type: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response: { result?: string } = await apiClient.executeCommand(input);
      
      const assistantMessage: Message = {
        type: 'assistant',
        content: response.result || 'Command executed successfully',
        timestamp: new Date().toISOString(),
        status: 'success',
      };

      setMessages(prev => [...prev, assistantMessage]);
      setHistory(prev => [...prev, { command: input, result: response.result, timestamp: new Date().toISOString() }]);
    } catch (err) {
      const errorMessage: Message = {
        type: 'assistant',
        content: (err as Error).message || 'Failed to execute command',
        timestamp: new Date().toISOString(),
        status: 'error',
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const clearMessages = () => {
    setMessages([
      {
        type: 'system',
        content: 'Chat cleared. Type a command to continue.',
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  return (
    <div className="command-panel">
      <div className="command-header">
        <h1>Command Interface</h1>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={clearMessages}>
            Clear Chat
          </button>
        </div>
      </div>

      <div className="command-layout">
        <div className="messages-container">
          <div className="messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.type} ${message.status || ''}`}>
                <div className="message-header">
                  <span className="message-type">
                    {message.type === 'user' ? '👤 You' : message.type === 'assistant' ? '🤖 Assistant' : '💡 System'}
                  </span>
                  <span className="message-time">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="message-content">
                  {message.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="message assistant loading">
                <div className="message-header">
                  <span className="message-type">🤖 Assistant</span>
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="input-form">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command... (Press Enter to send, Shift+Enter for new line)"
              rows={3}
              disabled={loading}
            />
            <button type="submit" className="btn btn-primary" disabled={loading || !input.trim()}>
              Send
            </button>
          </form>
        </div>

        <div className="history-sidebar">
          <h2>Command History</h2>
          {history.length === 0 ? (
            <div className="empty-state">
              <p>No command history yet</p>
            </div>
          ) : (
            <ul className="history-list">
              {history.slice(-10).reverse().map((item, index) => (
                <li key={index} className="history-item" onClick={() => setInput(item.command)}>
                  <div className="history-command">{item.command}</div>
                  <div className="history-time">
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default CommandPanel;
