/**
 * Chat Message List Component
 *
 * Displays a scrollable list of chat messages with proper formatting.
 */

import type { ChatMessage } from '../../chat/types';
import { ChatMessageBubble } from './ChatMessageBubble';
import './ChatMessageList.css';

interface ChatMessageListProps {
  messages: ChatMessage[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function ChatMessageList({
  messages,
  messagesEndRef,
}: ChatMessageListProps) {
  return (
    <div className="chat-messages">
      {messages.map((message) => (
        <ChatMessageBubble key={message.id} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
