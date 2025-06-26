import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { Chat } from '../types/chat';
import { mockChats } from '../data/mockChats';
import { useN8nAuth } from '../hooks/useN8nAuth';
import { contactService } from '../services/n8n/contactService';
import { messageService } from '../services/n8n/messageService';
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
  isLoading: boolean;
  error: string | null;
}

type ChatAction =
  | { type: 'SET_ACTIVE_TAB'; payload: 'chats' | 'search' | 'settings' }
  | { type: 'SET_CURRENT_CHAT'; payload: string }
  | { type: 'SET_SHOW_CHAT'; payload: boolean }
  | { type: 'SET_SEARCH_PARAMS'; payload: { query: string; messageId: string } }
  | { type: 'UPDATE_CHAT_PREVIEWS' }
  | { type: 'CLEAR_UNREAD_COUNT'; payload: string }
  | { type: 'RESET_SEARCH' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SYNC_CONTACTS'; payload: Chat[] };

const initialState: ChatState = {
  chats: mockChats,
  activeTab: 'chats',
  currentChatId: '',
  showChat: false,
  searchQuery: '',
  searchMessageId: '',
  isLoading: false,
  error: null,
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
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SYNC_CONTACTS':
      return { ...state, chats: action.payload };
    
    case 'UPDATE_CHAT_PREVIEWS':
      // Enhanced chat preview update with n8n backend sync
      const allPreviews = getAllChatPreviews();
      
      const updatedChats = state.chats.map((chat, originalIndex) => {
        const preview = getChatPreview(chat.id);
        const metadata = getChatMetadata(chat.id);
        const hasRealMessages = chatHasRealMessages(chat.id);
        
        if (preview) {
          return {
            ...chat,
            lastMessage: preview.lastMessage || '',
            timestamp: preview.lastMessage ? formatTimestamp(new Date(preview.timestamp)) : chat.timestamp,
            messageStatus: hasRealMessages ? { type: preview.messageStatus } : { type: 'read' },
            unreadCount: hasRealMessages ? preview.unreadCount : 0,
            _sortTimestamp: getChatSortTimestamp(chat.id),
            _isCleared: metadata.isCleared,
            _originalIndex: originalIndex,
            _hasRealMessages: hasRealMessages,
          };
        }
        return {
          ...chat,
          lastMessage: '',
          messageStatus: { type: 'read' },
          unreadCount: 0,
          _sortTimestamp: new Date(0),
          _isCleared: false,
          _originalIndex: originalIndex,
          _hasRealMessages: false,
        };
      });
      
      const sortedChats = updatedChats.sort((a, b) => {
        const timeA = (a as any)._sortTimestamp?.getTime() || 0;
        const timeB = (b as any)._sortTimestamp?.getTime() || 0;
        
        if (timeA !== timeB) {
          return timeB - timeA;
        }
        
        return (a as any)._originalIndex - (b as any)._originalIndex;
      });
      
      const cleanedChats = sortedChats.map(({ _sortTimestamp, _isCleared, _originalIndex, _hasRealMessages, ...chat }) => chat);
      
      return { ...state, chats: cleanedChats };
    
    default:
      return state;
  }
};

interface N8nChatContextType {
  state: ChatState;
  setActiveTab: (tab: 'chats' | 'search' | 'settings') => void;
  openChat: (chatId: string) => void;
  closeChat: () => void;
  navigateToChat: (contactId: string, searchQuery: string, messageId: string) => void;
  updateChatPreviews: () => void;
  clearUnreadCount: (chatId: string) => void;
  resetSearch: () => void;
  syncContacts: () => Promise<void>;
  refreshChats: () => Promise<void>;
}

const N8nChatContext = createContext<N8nChatContextType | undefined>(undefined);

export const N8nChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { isAuthenticated } = useN8nAuth();

  // Initialize and sync data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      initializeChats();
      
      // Set up periodic sync
      const syncInterval = setInterval(() => {
        syncContacts();
      }, 300000); // 5 minutes

      return () => clearInterval(syncInterval);
    }
  }, [isAuthenticated]);

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

  const initializeChats = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await syncContacts();
      dispatch({ type: 'UPDATE_CHAT_PREVIEWS' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize chats' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const syncContacts = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await contactService.syncContacts();
      
      if (response.success && response.data) {
        // Convert contacts to chat format
        const syncedChats = response.data.map(contact => ({
          id: contact.id,
          contactName: contact.name,
          profileImage: contact.profileImage,
          lastMessage: '', // Will be updated by chat previews
          timestamp: formatTimestamp(contact.lastSeen || new Date()),
          messageStatus: { type: 'read' as const },
          unreadCount: 0,
          isOnline: contact.isOnline,
        }));

        // Merge with existing chats, preserving local data
        const mergedChats = mockChats.map(existingChat => {
          const syncedChat = syncedChats.find(sc => sc.id === existingChat.id);
          return syncedChat ? { ...existingChat, ...syncedChat } : existingChat;
        });

        // Add new contacts that aren't in mockChats
        const newContacts = syncedChats.filter(sc => 
          !mockChats.some(mc => mc.id === sc.id)
        );

        dispatch({ 
          type: 'SYNC_CONTACTS', 
          payload: [...mergedChats, ...newContacts] 
        });
      }
    } catch (error) {
      console.error('Failed to sync contacts:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to sync contacts' });
    }
  }, [isAuthenticated]);

  const refreshChats = useCallback(async () => {
    await syncContacts();
    dispatch({ type: 'UPDATE_CHAT_PREVIEWS' });
  }, [syncContacts]);

  const setActiveTab = useCallback((tab: 'chats' | 'search' | 'settings') => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  }, []);

  const openChat = useCallback((chatId: string) => {
    dispatch({ type: 'SET_CURRENT_CHAT', payload: chatId });
    dispatch({ type: 'SET_SHOW_CHAT', payload: true });
    dispatch({ type: 'RESET_SEARCH' });
    dispatch({ type: 'CLEAR_UNREAD_COUNT', payload: chatId });
    
    trackChatOpened(chatId);
  }, []);

  const closeChat = useCallback(() => {
    dispatch({ type: 'SET_SHOW_CHAT', payload: false });
    dispatch({ type: 'SET_CURRENT_CHAT', payload: '' });
    dispatch({ type: 'RESET_SEARCH' });
    
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

  const contextValue: N8nChatContextType = {
    state,
    setActiveTab,
    openChat,
    closeChat,
    navigateToChat,
    updateChatPreviews,
    clearUnreadCount,
    resetSearch,
    syncContacts,
    refreshChats,
  };

  return (
    <N8nChatContext.Provider value={contextValue}>
      {children}
    </N8nChatContext.Provider>
  );
};

export const useN8nChatContext = () => {
  const context = useContext(N8nChatContext);
  if (context === undefined) {
    throw new Error('useN8nChatContext must be used within an N8nChatProvider');
  }
  return context;
};