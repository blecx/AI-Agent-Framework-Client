import React from 'react';
import { PromptMessage } from '../types';

interface MessageProps {
  message: PromptMessage;
}

export const Message: React.FC<MessageProps> = ({ message }) => {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`message ${message.role}`}>
      <div className="message-role">{message.role}</div>
      <div className="message-content">{message.content}</div>
      <div className="message-timestamp">{formatTime(message.timestamp)}</div>
    </div>
  );
};
