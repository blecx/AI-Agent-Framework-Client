import { Conversation, PromptMessage } from '../types';

const STORAGE_KEY = 'ai_agent_conversations';

export class HistoryService {
  /**
   * Get all conversations from localStorage
   */
  static getConversations(): Conversation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading conversations:', error);
      return [];
    }
  }

  /**
   * Get a specific conversation by ID
   */
  static getConversation(id: string): Conversation | null {
    const conversations = this.getConversations();
    return conversations.find(c => c.id === id) || null;
  }

  /**
   * Save a conversation (create or update)
   */
  static saveConversation(conversation: Conversation): void {
    try {
      const conversations = this.getConversations();
      const index = conversations.findIndex(c => c.id === conversation.id);
      
      if (index >= 0) {
        conversations[index] = {
          ...conversation,
          updatedAt: Date.now()
        };
      } else {
        conversations.push(conversation);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (error) {
      console.error('Error saving conversation:', error);
      throw error;
    }
  }

  /**
   * Add a message to a conversation
   */
  static addMessage(conversationId: string, message: PromptMessage): void {
    const conversation = this.getConversation(conversationId);
    if (conversation) {
      conversation.messages.push(message);
      conversation.updatedAt = Date.now();
      this.saveConversation(conversation);
    }
  }

  /**
   * Create a new conversation
   */
  static createConversation(title?: string): Conversation {
    const conversation: Conversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      title: title || 'New Conversation',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    this.saveConversation(conversation);
    return conversation;
  }

  /**
   * Delete a conversation
   */
  static deleteConversation(id: string): void {
    try {
      const conversations = this.getConversations();
      const filtered = conversations.filter(c => c.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }

  /**
   * Clear all conversations
   */
  static clearAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing conversations:', error);
      throw error;
    }
  }
}
