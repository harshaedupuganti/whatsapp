import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { Chat } from '../types/chat';
import { mockChats } from '../data/mockChats';
import { 
  getChatPreview, 
  getAllChatPreviews, 
  formatTimestamp, 
  getChatMetadata,
  chatHasRealMessages,
  getChatSortTimestamp,
  trackChatOpened
} from '../utils/chatStorage';

interface ChatState {
  chats: Chat[];
  activeTab: 'chats' | 'search' | 'settings';
  currentChatId: string;
  showChat: boolean;
  searchQuery: string;
  searchMessageId: string;
}

type ChatAction =
  | { type: 'SET_ACTIVE_TAB'; payload: 'chats' | 'search' | 'settings' }
  | { type: 'SET_CURRENT_CHAT'; payload: string }
  | { type: 'SET_SHOW_CHAT'; payload: boolean }
  | { type: 'SET_SEARCH_PARAMS'; payload: { query: string; messageId: string } }
  | { type: 'UPDATE_CHAT_PREVIEWS' }
  | { type: 'CLEAR_UNREAD_COUNT'; payload: string }
  | { type: 'RESET_SEARCH' };

const initialState: ChatState = {
  chats: mockChats,
  activeTab: 'chats',
  currentChatId: '',
  showChat: false,
  searchQuery: '',
  searchMessageId: '',
};

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    
    case 'SET_CURRENT_CHAT':
      return { ...state, currentChatId: action.payload };
    
    case 'SET_SHOW_CHAT':
      return { ...state, showChat: action.payload };
    
    case 'SET_SEARCH_PARAMS':
      return { 
        ...state, 
        searchQuery: action.payload.query,
        searchMessageId: action.payload.messageId
      };
    
    case 'RESET_SEARCH':
      return { 
        ...state, 
        searchQuery: '',
        searchMessageId: ''
      };
    
    case 'CLEAR_UNREAD_COUNT':
      return {
        ...state,
        chats: state.chats.map(chat =>
          chat.id === action.payload
            ? { ...chat, unreadCount: 0 }
            : chat
        )
      };
    
    case 'UPDATE_CHAT_PREVIEWS':
      // Update chat previews and sort WhatsApp-style (most recent activity first)
      const allPreviews = getAllChatPreviews();
      
      const updatedChats = mockChats.map((chat, originalIndex) => {
        const preview = getChatPreview(chat.id);
        const metadata = getChatMetadata(chat.id);
        const hasRealMessages = chatHasRealMessages(chat.id);
        
        if (preview) {
          return {
            ...chat,
            lastMessage: preview.lastMessage || '', // Empty for cleared chats
            timestamp: preview.lastMessage ? formatTimestamp(new Date(preview.timestamp)) : chat.timestamp,
            messageStatus: hasRealMessages ? { type: preview.messageStatus } : { type: 'read' }, // No status for cleared chats
            unreadCount: hasRealMessages ? preview.unreadCount : 0, // No unread count for cleared chats
            // Store metadata for sorting
            _sortTimestamp: getChatSortTimestamp(chat.id),
            _isCleared: metadata.isCleared,
            _originalIndex: originalIndex,
            _hasRealMessages: hasRealMessages,
          };
        }
        return {
          ...chat,
          lastMessage: '', // Clear preview for chats without stored data
          messageStatus: { type: 'read' }, // No status for empty chats
          unreadCount: 0, // No unread count for empty chats
          _sortTimestamp: new Date(0), // Very old date for chats without activity
          _isCleared: false,
          _originalIndex: originalIndex,
          _hasRealMessages: false,
        };
      });
      
      // WhatsApp-like sorting: Sort by last ACTIVITY timestamp (not just opening)
      // Only real message activity moves chats to the top
      const sortedChats = updatedChats.sort((a, b) => {
        const timeA = (a as any)._sortTimestamp?.getTime() || 0;
        const timeB = (b as any)._sortTimestamp?.getTime() || 0;
        
        // Most recent activity first (WhatsApp behavior)
        if (timeA !== timeB) {
          return timeB - timeA;
        }
        
        // If timestamps are equal, maintain original order
        return (a as any)._originalIndex - (b as any)._originalIndex;
      });
      
      // Remove the temporary properties
      const cleanedChats = sortedChats.map(({ _sortTimestamp, _isCleared, _originalIndex, _hasRealMessages, ...chat }) => chat);
      
      return { ...state, chats: cleanedChats };
    
    default:
      return state;
  }
};

interface ChatContextType {
  state: ChatState;
  setActiveTab: (tab: 'chats' | 'search' | 'settings') => void;
  openChat: (chatId: string) => void;
  closeChat: () => void;
  navigateToChat: (contactId: string, searchQuery: string, messageId: string) => void;
  updateChatPreviews: () => void;
  clearUnreadCount: (chatId: string) => void;
  resetSearch: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Initialize chat previews on mount
  useEffect(() => {
    dispatch({ type: 'UPDATE_CHAT_PREVIEWS' });
  }, []);

  // Listen for storage changes to update chat list
  useEffect(() => {
    const handleStorageChange = () => {
      dispatch({ type: 'UPDATE_CHAT_PREVIEWS' });
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const setActiveTab = useCallback((tab: 'chats' | 'search' | 'settings') => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  }, []);

  const openChat = useCallback((chatId: string) => {
    dispatch({ type: 'SET_CURRENT_CHAT', payload: chatId });
    dispatch({ type: 'SET_SHOW_CHAT', payload: true });
    dispatch({ type: 'RESET_SEARCH' });
    dispatch({ type: 'CLEAR_UNREAD_COUNT', payload: chatId });
    
    // Track chat opening without affecting sort order
    trackChatOpened(chatId);
  }, []);

  const closeChat = useCallback(() => {
    dispatch({ type: 'SET_SHOW_CHAT', payload: false });
    dispatch({ type: 'SET_CURRENT_CHAT', payload: '' });
    dispatch({ type: 'RESET_SEARCH' });
    
    // Refresh chat previews when returning from chat
    setTimeout(() => {
      dispatch({ type: 'UPDATE_CHAT_PREVIEWS' });
    }, 100);
  }, []);

  const navigateToChat = useCallback((contactId: string, searchQuery: string, messageId: string) => {
    dispatch({ type: 'SET_CURRENT_CHAT', payload: contactId });
    dispatch({ type: 'SET_SEARCH_PARAMS', payload: { query: searchQuery, messageId } });
    dispatch({ type: 'SET_SHOW_CHAT', payload: true });
    dispatch({ type: 'SET_ACTIVE_TAB', payload: 'chats' });
    dispatch({ type: 'CLEAR_UNREAD_COUNT', payload: contactId });
    
    // Track chat opening without affecting sort order
    trackChatOpened(contactId);
  }, []);

  const updateChatPreviews = useCallback(() => {
    dispatch({ type: 'UPDATE_CHAT_PREVIEWS' });
  }, []);

  const clearUnreadCount = useCallback((chatId: string) => {
    dispatch({ type: 'CLEAR_UNREAD_COUNT', payload: chatId });
  }, []);

  const resetSearch = useCallback(() => {
    dispatch({ type: 'RESET_SEARCH' });
  }, []);

  const contextValue: ChatContextType = {
    state,
    setActiveTab,
    openChat,
    closeChat,
    navigateToChat,
    updateChatPreviews,
    clearUnreadCount,
    resetSearch,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};