import { useState, useEffect, useCallback, useRef } from 'react';
import { messageService } from '../services/n8n/messageService';
import { contactService } from '../services/n8n/contactService';
import { authService } from '../services/n8n/authService';
import { Message, Contact } from '../types/message';

interface UseN8nChatOptions {
  contactId: string;
  onMessageReceived?: (message: Message) => void;
  onTypingIndicator?: (isTyping: boolean, contactName: string) => void;
  onContactStatusChange?: (contact: Contact) => void;
}

export const useN8nChat = ({
  contactId,
  onMessageReceived,
  onTypingIndicator,
  onContactStatusChange,
}: UseN8nChatOptions) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const isActiveRef = useRef(true);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      if (!authService.isAuthenticated()) {
        setError('Not authenticated');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Load contact info
        const contactData = await contactService.getContact(contactId);
        if (contactData) {
          setContact(contactData);
          onContactStatusChange?.(contactData);
        }

        // Load message history
        const historyResponse = await messageService.getMessageHistory(contactId, 50);
        if (historyResponse.success && historyResponse.data) {
          const historicalMessages = historyResponse.data.map(msg => ({
            id: msg.id,
            type: msg.type,
            content: msg.content,
            timestamp: new Date(msg.timestamp),
            isSent: msg.senderId === getCurrentUserId(),
            status: msg.status,
            fileName: msg.fileName,
            fileSize: msg.fileSize,
            fileType: msg.fileType,
            imageUrl: msg.imageUrl,
            documentUrl: msg.documentUrl,
          }));
          setMessages(historicalMessages);
        }

        // Start polling for new messages
        messageService.startPolling(contactId, handleNewMessages, true);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load chat data');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();

    return () => {
      messageService.stopPolling(contactId);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [contactId]);

  // Handle visibility change for polling optimization
  useEffect(() => {
    const handleVisibilityChange = () => {
      isActiveRef.current = !document.hidden;
      
      if (isActiveRef.current) {
        // Resume active polling when tab becomes visible
        messageService.stopPolling(contactId);
        messageService.startPolling(contactId, handleNewMessages, true);
      } else {
        // Switch to background polling when tab is hidden
        messageService.stopPolling(contactId);
        messageService.startPolling(contactId, handleNewMessages, false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [contactId]);

  const handleNewMessages = useCallback((newMessages: Message[]) => {
    if (newMessages.length > 0) {
      setMessages(prevMessages => {
        const existingIds = new Set(prevMessages.map(m => m.id));
        const uniqueNewMessages = newMessages.filter(m => !existingIds.has(m.id));
        
        if (uniqueNewMessages.length > 0) {
          uniqueNewMessages.forEach(msg => onMessageReceived?.(msg));
          return [...prevMessages, ...uniqueNewMessages].sort(
            (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
          );
        }
        
        return prevMessages;
      });
    }
  }, [onMessageReceived]);

  const sendMessage = useCallback(async (
    content: string,
    type: 'text' | 'image' | 'document' = 'text',
    additionalData?: {
      fileName?: string;
      fileSize?: string;
      fileType?: string;
      imageUrl?: string;
      documentUrl?: string;
    }
  ): Promise<Message | null> => {
    if (!authService.isAuthenticated()) {
      setError('Not authenticated');
      return null;
    }

    try {
      setIsSending(true);
      setError(null);

      const response = await messageService.sendMessage({
        contactId,
        type,
        content,
        ...additionalData,
      });

      if (response.success && response.data) {
        const newMessage: Message = {
          id: response.data.id,
          type: response.data.type,
          content: response.data.content,
          timestamp: new Date(response.data.timestamp),
          isSent: true,
          status: response.data.status,
          fileName: response.data.fileName,
          fileSize: response.data.fileSize,
          fileType: response.data.fileType,
          imageUrl: response.data.imageUrl,
          documentUrl: response.data.documentUrl,
        };

        setMessages(prev => [...prev, newMessage]);
        return newMessage;
      } else {
        setError(response.error || 'Failed to send message');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      return null;
    } finally {
      setIsSending(false);
    }
  }, [contactId]);

  const sendTypingIndicator = useCallback(async (isTypingNow: boolean) => {
    if (!authService.isAuthenticated()) return;

    try {
      await messageService.sendTypingIndicator(contactId, isTypingNow);
      
      if (isTypingNow) {
        // Clear existing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        // Set timeout to stop typing indicator
        typingTimeoutRef.current = setTimeout(() => {
          messageService.sendTypingIndicator(contactId, false);
        }, parseInt(import.meta.env.VITE_TYPING_INDICATOR_TIMEOUT || '3000'));
      }
    } catch (err) {
      console.error('Failed to send typing indicator:', err);
    }
  }, [contactId]);

  const markMessagesAsRead = useCallback(async (messageIds: string[]) => {
    if (!authService.isAuthenticated() || messageIds.length === 0) return;

    try {
      await messageService.markMessagesAsRead(messageIds, contactId);
      
      // Update local message status
      setMessages(prev => prev.map(msg => 
        messageIds.includes(msg.id) ? { ...msg, status: 'read' } : msg
      ));
    } catch (err) {
      console.error('Failed to mark messages as read:', err);
    }
  }, [contactId]);

  const refreshContact = useCallback(async () => {
    try {
      const contactData = await contactService.getContact(contactId);
      if (contactData) {
        setContact(contactData);
        onContactStatusChange?.(contactData);
      }
    } catch (err) {
      console.error('Failed to refresh contact:', err);
    }
  }, [contactId, onContactStatusChange]);

  const getCurrentUserId = (): string => {
    // This should be implemented based on your auth system
    return 'current-user-id';
  };

  return {
    messages,
    contact,
    isLoading,
    error,
    isTyping,
    isSending,
    sendMessage,
    sendTypingIndicator,
    markMessagesAsRead,
    refreshContact,
    clearError: () => setError(null),
  };
};