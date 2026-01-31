/**
 * Chat Interface Component
 *
 * Main chat interface that orchestrates conversation flow:
 * - Displays chat messages
 * - Handles user input
 * - Manages conversation state
 * - Executes commands when conversation is complete
 */

import { useState, useEffect, useRef } from 'react';
import { parseCommand } from '../../chat/commandParser';
import {
  processConversationResponse,
  startConversation,
  getConversationProgress,
} from '../../chat/conversationManager';
import { executeCommand, canExecuteCommand } from '../../chat/chatApi';
import type { ChatMessage, ConversationState } from '../../chat/types';
import { ChatMessageList } from './ChatMessageList';
import { ChatInput } from './ChatInput';
import './ChatInterface.css';

interface ChatInterfaceProps {
  projectKey: string;
  onClose?: () => void;
}

export function ChatInterface({ projectKey, onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationState, setConversationState] =
    useState<ConversationState | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (
      messagesEndRef.current &&
      typeof messagesEndRef.current.scrollIntoView === 'function'
    ) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Add initial greeting message
  useEffect(() => {
    const greeting: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: `👋 Hello! I can help you manage RAID items for project **${projectKey}**.\n\nYou can:\n- Create a new RAID item: "Create a risk about..."\n- Edit an existing item: "Update RISK-001 status to closed"\n- List items: "Show all risks"\n\nWhat would you like to do?`,
      timestamp: new Date(),
    };
    setMessages([greeting]);
  }, [projectKey]);

  const addMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  const handleUserInput = async (input: string) => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    addMessage(userMessage);

    setIsProcessing(true);

    try {
      // If no active conversation, parse as new command
      if (!conversationState) {
        const intent = parseCommand(input);

        if (intent.type === 'UNKNOWN' || intent.confidence < 0.5) {
          // Not a recognized command
          const response: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content:
              "I didn't quite understand that. Try commands like:\n- Create a risk about data security\n- Update RISK-001 status to closed\n- Show all assumptions",
            timestamp: new Date(),
          };
          addMessage(response);
          setIsProcessing(false);
          return;
        }

        // Start conversation based on intent
        const result = startConversation(intent, projectKey);
        if (!result) {
          const response: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: 'Sorry, I cannot handle that type of command yet.',
            timestamp: new Date(),
          };
          addMessage(response);
          setIsProcessing(false);
          return;
        }

        const { state: newState, initialPrompt } = result;
        setConversationState(newState);

        // Show first question
        const response: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: initialPrompt,
          timestamp: new Date(),
        };
        addMessage(response);
      } else {
        // Continue existing conversation
        const result = processConversationResponse(conversationState, input);

        if (result.error) {
          // Validation error
          const response: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: `❌ ${result.error}\n\nPlease try again.`,
            timestamp: new Date(),
          };
          addMessage(response);
          setIsProcessing(false);
          return;
        }

        setConversationState(result.state);

        // Check if conversation is complete
        if (canExecuteCommand(result.state)) {
          // Execute the command
          const executeResult = await executeCommand(result.state);
          addMessage(executeResult.message);

          // Reset conversation
          setConversationState(null);
        } else if (result.state) {
          // Ask next question
          const currentStep = result.state.steps[result.state.currentStep];
          if (currentStep) {
            const progress = getConversationProgress(result.state);
            const progressText =
              progress.totalSteps > 0
                ? ` (${progress.currentStep}/${progress.totalSteps})`
                : '';
            const response: ChatMessage = {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: `${currentStep.prompt}${progressText}`,
              timestamp: new Date(),
            };
            addMessage(response);
          }
        }
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
      addMessage(errorMessage);
      setConversationState(null);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h2>💬 Chat Assistant</h2>
        <span className="chat-project-badge">{projectKey}</span>
        {onClose && (
          <button
            className="chat-close-btn"
            onClick={onClose}
            aria-label="Close chat"
          >
            ✕
          </button>
        )}
      </div>

      <ChatMessageList messages={messages} messagesEndRef={messagesEndRef} />

      <ChatInput
        onSend={handleUserInput}
        disabled={isProcessing}
        placeholder={
          conversationState
            ? 'Type your answer...'
            : 'Type a command or ask a question...'
        }
      />

      {conversationState && (
        <div className="chat-status">
          <span className="chat-status-text">
            In conversation: {conversationState.intent}
          </span>
          <button
            className="chat-cancel-btn"
            onClick={() => {
              setConversationState(null);
              const cancelMsg: ChatMessage = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: 'Conversation cancelled. How can I help you?',
                timestamp: new Date(),
              };
              addMessage(cancelMsg);
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
