// Chat storage utilities for persistent message handling
export interface StoredMessage {
  id: string;
  type: 'text' | 'image' | 'document';
  content: string;
  timestamp: string; // ISO string for serialization
  isSent: boolean;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  imageUrl?: string;
  documentUrl?: string;
}

export interface StoredChatData {
  messages: StoredMessage[];
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  messageStatus: 'sending' | 'sent' | 'delivered' | 'read';
}

export interface ChatPreview {
  lastMessage: string;
  timestamp: string;
  messageStatus: 'sending' | 'sent' | 'delivered' | 'read';
  unreadCount: number;
  isCleared?: boolean;
}

export interface ChatMetadata {
  isCleared: boolean;
  clearedAt?: string;
  originalPosition?: number;
}

// Storage keys
const getChatStorageKey = (contactId: string) => `chat_messages_${contactId}`;
const getChatClearedKey = (contactId: string) => `chat_${contactId}_cleared`;
const getChatPreviewKey = (contactId: string) => `chat_preview_${contactId}`;
const getChatMetadataKey = (contactId: string) => `chat_metadata_${contactId}`;

// Format timestamp consistently across the app
export const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Save messages to localStorage with proper preview sync
export const saveMessagesToStorage = (contactId: string, messages: any[]) => {
  try {
    const storedMessages: StoredMessage[] = messages.map(msg => ({
      ...msg,
      timestamp: msg.timestamp.toISOString(),
    }));
    
    const lastMessage = messages[messages.length - 1];
    const lastMessagePreview = getLastMessagePreview(messages);
    const messageStatus = lastMessage?.isSent ? lastMessage.status : 'read';
    
    const chatData: StoredChatData = {
      messages: storedMessages,
      lastMessage: lastMessagePreview,
      timestamp: messages.length > 0 ? messages[messages.length - 1].timestamp.toISOString() : new Date().toISOString(),
      unreadCount: 0,
      messageStatus,
    };
    
    localStorage.setItem(getChatStorageKey(contactId), JSON.stringify(chatData));
    
    // Update preview separately for chat list sync
    const preview: ChatPreview = {
      lastMessage: chatData.lastMessage,
      timestamp: chatData.timestamp,
      messageStatus: chatData.messageStatus,
      unreadCount: chatData.unreadCount,
      isCleared: false,
    };
    
    localStorage.setItem(getChatPreviewKey(contactId), JSON.stringify(preview));
    
    // Clear the cleared flag if messages are being saved
    const metadata = getChatMetadata(contactId);
    if (metadata.isCleared) {
      updateChatMetadata(contactId, { ...metadata, isCleared: false });
    }
    
    // Update last seen for the contact when new messages are added
    updateLastSeenTime(contactId);
  } catch (error) {
    console.error('Failed to save messages to storage:', error);
  }
};

// Load messages from localStorage
export const loadMessagesFromStorage = (contactId: string): any[] => {
  try {
    // Don't load if chat is cleared
    if (isChatCleared(contactId)) {
      return [];
    }
    
    const stored = localStorage.getItem(getChatStorageKey(contactId));
    if (!stored) return [];
    
    const chatData: StoredChatData = JSON.parse(stored);
    return chatData.messages.map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }));
  } catch (error) {
    console.error('Failed to load messages from storage:', error);
    return [];
  }
};

// Load all messages from all chats for global search (excluding cleared chats)
export const loadAllMessagesFromStorage = (): { [contactId: string]: StoredMessage[] } => {
  const allMessages: { [contactId: string]: StoredMessage[] } = {};
  
  try {
    // Get all localStorage keys that match our chat pattern
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('chat_messages_')) {
        const contactId = key.replace('chat_messages_', '');
        
        // Skip cleared chats - they should not appear in global search
        if (isChatCleared(contactId)) {
          continue;
        }
        
        const stored = localStorage.getItem(key);
        
        if (stored) {
          const chatData: StoredChatData = JSON.parse(stored);
          // Only include chats that have actual messages
          if (chatData.messages && chatData.messages.length > 0) {
            allMessages[contactId] = chatData.messages;
          }
        }
      }
    }
  } catch (error) {
    console.error('Failed to load all messages from storage:', error);
  }
  
  return allMessages;
};

// Get or create chat metadata
export const getChatMetadata = (contactId: string): ChatMetadata => {
  try {
    const stored = localStorage.getItem(getChatMetadataKey(contactId));
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load chat metadata:', error);
  }
  
  return { isCleared: false };
};

// Update chat metadata
export const updateChatMetadata = (contactId: string, metadata: ChatMetadata) => {
  try {
    localStorage.setItem(getChatMetadataKey(contactId), JSON.stringify(metadata));
  } catch (error) {
    console.error('Failed to update chat metadata:', error);
  }
};

// Check if chat is cleared
export const isChatCleared = (contactId: string): boolean => {
  const metadata = getChatMetadata(contactId);
  return metadata.isCleared;
};

// Mark chat as cleared and preserve position
export const markChatAsCleared = (contactId: string, originalPosition?: number) => {
  const metadata: ChatMetadata = {
    isCleared: true,
    clearedAt: new Date().toISOString(),
    originalPosition,
  };
  
  updateChatMetadata(contactId, metadata);
  
  // Remove messages and preview but keep metadata for position tracking
  localStorage.removeItem(getChatStorageKey(contactId));
  
  // Update preview to reflect cleared state
  const clearedPreview: ChatPreview = {
    lastMessage: '',
    timestamp: new Date().toISOString(),
    messageStatus: 'read',
    unreadCount: 0,
    isCleared: true,
  };
  
  localStorage.setItem(getChatPreviewKey(contactId), JSON.stringify(clearedPreview));
};

// Get chat preview data with proper cleared chat handling
export const getChatPreview = (contactId: string): ChatPreview | null => {
  try {
    const stored = localStorage.getItem(getChatPreviewKey(contactId));
    if (!stored) return null;
    
    const preview: ChatPreview = JSON.parse(stored);
    
    // For cleared chats, return preview but with empty message content
    if (preview.isCleared) {
      return {
        ...preview,
        lastMessage: '',
        unreadCount: 0,
        messageStatus: 'read',
      };
    }
    
    // Return null if the preview shows no actual message content for non-cleared chats
    if (!preview.lastMessage || preview.lastMessage.trim() === '') {
      return null;
    }
    
    return preview;
  } catch (error) {
    console.error('Failed to load chat preview:', error);
    return null;
  }
};

// Get all chat previews for sorting with proper cleared chat handling
export const getAllChatPreviews = (): { [contactId: string]: ChatPreview } => {
  const previews: { [contactId: string]: ChatPreview } = {};
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('chat_preview_')) {
        const contactId = key.replace('chat_preview_', '');
        const preview = getChatPreview(contactId);
        
        // Include all previews, including cleared ones for position tracking
        if (preview !== null) {
          previews[contactId] = preview;
        }
      }
    }
  } catch (error) {
    console.error('Failed to load all chat previews:', error);
  }
  
  return previews;
};

// Helper to get last message preview
const getLastMessagePreview = (messages: any[]): string => {
  if (messages.length === 0) return '';
  
  const lastMessage = messages[messages.length - 1];
  switch (lastMessage.type) {
    case 'text':
      return lastMessage.content;
    case 'image':
      return lastMessage.content || '📷 Photo';
    case 'document':
      return lastMessage.content || `📄 ${lastMessage.fileName}`;
    default:
      return '';
  }
};

// Utility to determine if document should open externally
export const shouldOpenDocumentExternally = (documentUrl: string): boolean => {
  // Check if it's a valid external URL (not a blob or local file)
  try {
    const url = new URL(documentUrl);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

// Open document externally
export const openDocumentExternally = (documentUrl: string) => {
  window.open(documentUrl, '_blank', 'noopener,noreferrer');
};

// Update message status in storage
export const updateMessageStatusInStorage = (contactId: string, messageId: string, status: 'sending' | 'sent' | 'delivered' | 'read') => {
  try {
    const messages = loadMessagesFromStorage(contactId);
    const updatedMessages = messages.map(msg => 
      msg.id === messageId ? { ...msg, status } : msg
    );
    
    if (updatedMessages.length > 0) {
      saveMessagesToStorage(contactId, updatedMessages);
    }
  } catch (error) {
    console.error('Failed to update message status:', error);
  }
};

// Update last seen time for real-time interaction tracking
export const updateLastSeenTime = (contactId: string) => {
  try {
    const lastSeenKey = `contact_${contactId}_last_seen`;
    localStorage.setItem(lastSeenKey, new Date().toISOString());
  } catch (error) {
    console.error('Failed to update last seen time:', error);
  }
};

// Get last seen time for a contact
export const getLastSeenTime = (contactId: string): Date | null => {
  try {
    const lastSeenKey = `contact_${contactId}_last_seen`;
    const stored = localStorage.getItem(lastSeenKey);
    if (stored) {
      return new Date(stored);
    }
  } catch (error) {
    console.error('Failed to get last seen time:', error);
  }
  return null;
};

// Check if a chat has any real messages (not cleared)
export const chatHasRealMessages = (contactId: string): boolean => {
  const metadata = getChatMetadata(contactId);
  if (metadata.isCleared) return false;
  
  const messages = loadMessagesFromStorage(contactId);
  return messages.length > 0;
};

// Get chat position for sorting
export const getChatSortPosition = (contactId: string): number => {
  const metadata = getChatMetadata(contactId);
  return metadata.originalPosition || 999; // Default to end if no position set
};