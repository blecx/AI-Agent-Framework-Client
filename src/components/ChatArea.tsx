import React, { useEffect, useRef } from 'react';
import { PromptMessage } from '../types';
import { Message } from './Message';

interface ChatAreaProps {
  messages: PromptMessage[];
  isLoading?: boolean;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="messages-container">
        <div className="empty-state">
          <div className="empty-state-icon">💬</div>
          <div className="empty-state-title">Start a Conversation</div>
          <div className="empty-state-description">
            Send a message to begin interacting with the AI Agent
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-container">
      {messages.map(message => (
        <Message key={message.id} message={message} />
      ))}
      {isLoading && (
        <div className="message assistant">
          <div className="message-role">assistant</div>
          <div className="message-content">
            <span className="loading"></span>
            <span style={{ marginLeft: '8px' }}>Thinking...</span>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};
