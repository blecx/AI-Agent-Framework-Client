import { useState, useEffect } from 'react';
import { Conversation, PromptMessage, ApiConfig, Workflow } from '../types';
import { HistoryService } from '../services/historyService';
import { ApiService } from '../services/apiService';
import { WorkflowService } from '../services/workflowService';
import { Sidebar } from '../components/Sidebar';
import { ChatArea } from '../components/ChatArea';
import { ChatInput } from '../components/ChatInput';
import { WorkflowPanel } from '../components/WorkflowPanel';

export function Chat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(null);
  const [apiConfig] = useState<ApiConfig>({
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    apiKey: import.meta.env.VITE_API_KEY || '',
  });

  const apiService = new ApiService(apiConfig);
  const workflowService = new WorkflowService(apiService);

  // Load conversations from localStorage on mount
  useEffect(() => {
    const loadedConversations = HistoryService.getConversations();
    setConversations(loadedConversations);

    // If there are conversations, select the most recent one
    if (loadedConversations.length > 0) {
      const mostRecent = loadedConversations.reduce((prev, current) =>
        current.updatedAt > prev.updatedAt ? current : prev,
      );
      setCurrentConversationId(mostRecent.id);
    }
  }, []);

  const currentConversation =
    conversations.find((c) => c.id === currentConversationId) || null;

  const handleNewConversation = () => {
    const newConv = HistoryService.createConversation();
    setConversations([newConv, ...conversations]);
    setCurrentConversationId(newConv.id);
    setError(null);
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
    setError(null);
  };

  const handleSendMessage = async (content: string) => {
    // Create a new conversation if none exists
    if (!currentConversationId) {
      const newConv = HistoryService.createConversation();
      setConversations([newConv, ...conversations]);
      setCurrentConversationId(newConv.id);
      setError(null);

      // Use the new conversation ID for the message
      setTimeout(() => {
        // Trigger the message send with the new conversation
        handleSendMessageToConversation(newConv.id, content);
      }, 0);
      return;
    }

    await handleSendMessageToConversation(currentConversationId, content);
  };

  const handleSendMessageToConversation = async (
    conversationId: string,
    content: string,
  ) => {
    setIsLoading(true);
    setError(null);

    // Add user message
    const userMessage: PromptMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    try {
      // Save user message to history
      HistoryService.addMessage(conversationId, userMessage);

      // Update the conversation title if this is the first message
      const conversation = HistoryService.getConversation(conversationId);
      if (conversation && conversation.messages.length === 1) {
        conversation.title =
          content.substring(0, 50) + (content.length > 50 ? '...' : '');
        HistoryService.saveConversation(conversation);
      }

      // Reload conversations to reflect the change
      setConversations(HistoryService.getConversations());

      // Check if this is a workflow command
      const workflowCommand = workflowService.parseWorkflowCommand(content);
      if (workflowCommand) {
        // Create and execute workflow
        const workflow = workflowService.createWorkflow(
          workflowCommand.name,
          workflowCommand.steps.map((step) => ({ name: step })),
        );
        setCurrentWorkflow(workflow);

        // Add system message about workflow
        const workflowMessage: PromptMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          role: 'system',
          content: `Started workflow "${workflowCommand.name}" with ${workflowCommand.steps.length} steps. Executing...`,
          timestamp: Date.now(),
        };
        HistoryService.addMessage(conversationId, workflowMessage);
        setConversations(HistoryService.getConversations());

        // Execute workflow
        try {
          await workflowService.executeAllSteps(workflow, (updatedWorkflow) => {
            setCurrentWorkflow({ ...updatedWorkflow });
          });

          // Add completion message
          const completionMessage: PromptMessage = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            role: 'assistant',
            content: `Workflow "${workflowCommand.name}" completed successfully!`,
            timestamp: Date.now(),
          };
          HistoryService.addMessage(conversationId, completionMessage);
          setConversations(HistoryService.getConversations());
        } catch (workflowError) {
          const errorMsg: PromptMessage = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            role: 'system',
            content: `Workflow failed: ${workflowError instanceof Error ? workflowError.message : 'Unknown error'}`,
            timestamp: Date.now(),
          };
          HistoryService.addMessage(conversationId, errorMsg);
          setConversations(HistoryService.getConversations());
        }
      } else {
        // Regular message - send to API
        const historyForApi =
          conversation?.messages.map((m) => ({
            role: m.role,
            content: m.content,
          })) || [];

        const response = await apiService.sendPrompt(content, historyForApi);

        // Add assistant response
        const assistantMessage: PromptMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          role: 'assistant',
          content: response,
          timestamp: Date.now(),
        };

        HistoryService.addMessage(conversationId, assistantMessage);
        setConversations(HistoryService.getConversations());
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to send message. Please check your API configuration.',
      );

      // Add error message to chat
      const errorMessage: PromptMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        role: 'system',
        content: `Error: ${err instanceof Error ? err.message : 'Failed to send message'}. This is a demo mode - the API connection failed. Please configure your API endpoint in .env file.`,
        timestamp: Date.now(),
      };

      HistoryService.addMessage(conversationId, errorMessage);
      setConversations(HistoryService.getConversations());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
      />
      <div className="main-content">
        <div className="chat-header">
          <h2>{currentConversation?.title || 'AI Agent Framework Client'}</h2>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            API: {apiConfig.baseUrl}
          </div>
        </div>
        {error && <div className="error-message">{error}</div>}
        <ChatArea
          messages={currentConversation?.messages || []}
          isLoading={isLoading}
        />
        {currentWorkflow && <WorkflowPanel workflow={currentWorkflow} />}
        <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}
