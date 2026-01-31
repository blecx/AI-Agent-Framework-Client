/**
 * Chat Message Bubble Component
 *
 * Displays a single chat message with proper styling for user/assistant roles.
 * Supports Markdown rendering for assistant messages.
 */

import type { ChatMessage } from '../../chat/types';
import './ChatMessageBubble.css';

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isUser = message.role === 'user';

  // Simple markdown rendering for assistant messages
  const renderContent = (content: string) => {
    if (isUser || !content) {
      return <span>{content}</span>;
    }

    // Split by newlines and process each line
    const lines = content.split('\n');
    return (
      <>
        {lines.map((line, idx) => {
          // Bold text: **text**
          let processed = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

          // Bullet points
          if (line.trim().startsWith('- ')) {
            processed = `• ${processed.slice(2)}`;
          }

          return (
            <span
              key={idx}
              dangerouslySetInnerHTML={{ __html: processed }}
              style={{ display: 'block' }}
            />
          );
        })}
      </>
    );
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className={`chat-message ${isUser ? 'chat-message-user' : 'chat-message-assistant'}`}
    >
      <div className="chat-message-content">
        {!isUser && <div className="chat-message-avatar">🤖</div>}
        <div className="chat-message-bubble">
          <div className="chat-message-text">
            {renderContent(message.content)}
          </div>
          <div className="chat-message-time">
            {formatTime(message.timestamp)}
          </div>
        </div>
        {isUser && <div className="chat-message-avatar">👤</div>}
      </div>
    </div>
  );
}
