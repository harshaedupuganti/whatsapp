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
}

// Storage keys
const getChatStorageKey = (contactId: string) => `chat_messages_${contactId}`;
const getChatClearedKey = (contactId: string) => `chat_${contactId}_cleared`;
const getChatPreviewKey = (contactId: string) => `chat_preview_${contactId}`;

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
    };
    
    localStorage.setItem(getChatPreviewKey(contactId), JSON.stringify(preview));
    
    // Clear the cleared flag if messages are being saved
    localStorage.removeItem(getChatClearedKey(contactId));
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

// Load all messages from all chats for global search
export const loadAllMessagesFromStorage = (): { [contactId: string]: StoredMessage[] } => {
  const allMessages: { [contactId: string]: StoredMessage[] } = {};
  
  try {
    // Get all localStorage keys that match our chat pattern
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('chat_messages_')) {
        const contactId = key.replace('chat_messages_', '');
        
        // Skip cleared chats
        if (isChatCleared(contactId)) {
          continue;
        }
        
        const stored = localStorage.getItem(key);
        
        if (stored) {
          const chatData: StoredChatData = JSON.parse(stored);
          allMessages[contactId] = chatData.messages;
        }
      }
    }
  } catch (error) {
    console.error('Failed to load all messages from storage:', error);
  }
  
  return allMessages;
};

// Check if chat is cleared
export const isChatCleared = (contactId: string): boolean => {
  return localStorage.getItem(getChatClearedKey(contactId)) === 'true';
};

// Mark chat as cleared and clean up all related data
export const markChatAsCleared = (contactId: string) => {
  localStorage.setItem(getChatClearedKey(contactId), 'true');
  localStorage.removeItem(getChatStorageKey(contactId));
  localStorage.removeItem(getChatPreviewKey(contactId));
};

// Get chat preview data with fallback - returns null for cleared chats with no new messages
export const getChatPreview = (contactId: string): ChatPreview | null => {
  try {
    // If chat is cleared and has no new messages, return null
    if (isChatCleared(contactId)) {
      return null;
    }
    
    const stored = localStorage.getItem(getChatPreviewKey(contactId));
    if (!stored) return null;
    
    const preview = JSON.parse(stored);
    
    // Return null if the preview shows no actual message content
    if (!preview.lastMessage || preview.lastMessage.trim() === '') {
      return null;
    }
    
    return preview;
  } catch (error) {
    console.error('Failed to load chat preview:', error);
    return null;
  }
};

// Get all chat previews for sorting
export const getAllChatPreviews = (): { [contactId: string]: ChatPreview } => {
  const previews: { [contactId: string]: ChatPreview } = {};
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('chat_preview_')) {
        const contactId = key.replace('chat_preview_', '');
        const preview = getChatPreview(contactId);
        if (preview) {
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