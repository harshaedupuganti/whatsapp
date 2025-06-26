import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatHeader } from './ChatHeader';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { MessageInput } from './MessageInput';
import { SearchOverlay } from './SearchOverlay';
import { ImageViewer } from './ImageViewer';
import { DocumentViewer } from './DocumentViewer';
import { OptionsMenu } from './OptionsMenu';
import { useN8nChat } from '../../hooks/useN8nChat';
import { useN8nChatContext } from '../../contexts/N8nChatContext';
import { Message, ChatState } from '../../types/message';
import { 
  saveMessagesToStorage, 
  loadMessagesFromStorage, 
  isChatCleared, 
  markChatAsCleared,
  shouldOpenDocumentExternally,
  openDocumentExternally,
  updateChatMetadata,
  getChatMetadata
} from '../../utils/chatStorage';

interface N8nChatViewProps {
  contactId: string;
  onBack: () => void;
  searchQuery?: string;
  searchMessageId?: string;
}

export const N8nChatView: React.FC<N8nChatViewProps> = ({ 
  contactId, 
  onBack, 
  searchQuery = '', 
  searchMessageId = ''
}) => {
  const { updateChatPreviews } = useN8nChatContext();
  
  // Use the n8n chat hook for real-time functionality
  const {
    messages,
    contact,
    isLoading,
    error,
    isTyping: remoteIsTyping,
    isSending,
    sendMessage,
    sendTypingIndicator,
    markMessagesAsRead,
    refreshContact,
    clearError,
  } = useN8nChat({
    contactId,
    onMessageReceived: (message) => {
      // Handle new message received
      updateChatPreviews();
    },
    onTypingIndicator: (isTyping, contactName) => {
      setChatState(prev => ({ ...prev, isTyping }));
    },
    onContactStatusChange: (updatedContact) => {
      setChatState(prev => ({ ...prev, contact: updatedContact }));
    },
  });

  // Local state for UI components (preserving existing interface)
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    contact: contact!,
    isTyping: false,
    isMuted: false,
    searchQuery: '',
    searchResults: [],
    currentSearchIndex: 0,
  });

  const [showSearch, setShowSearch] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currentImage, setCurrentImage] = useState('');
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [currentDocument, setCurrentDocument] = useState({ url: '', fileName: '' });
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Sync n8n data with local state
  useEffect(() => {
    setChatState(prev => ({
      ...prev,
      messages,
      contact: contact || prev.contact,
      isTyping: remoteIsTyping,
    }));
  }, [messages, contact, remoteIsTyping]);

  // Handle search from global search
  useEffect(() => {
    if (searchQuery && searchMessageId) {
      setShowSearch(true);
      setChatState(prev => ({ ...prev, searchQuery }));
      
      setTimeout(() => {
        scrollToMessageById(searchMessageId);
      }, 100);
    }
  }, [searchQuery, searchMessageId]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const scrollToMessage = useCallback((messageIndex: number) => {
    const messageElements = messagesContainerRef.current?.querySelectorAll('[data-message-id]');
    if (messageElements && messageElements[messageIndex]) {
      messageElements[messageIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const scrollToMessageById = useCallback((messageId: string) => {
    const messageElement = messagesContainerRef.current?.querySelector(`[data-message-id="${messageId}"]`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      messageElement.classList.add('bg-yellow-200', 'animate-pulse');
      setTimeout(() => {
        messageElement.classList.remove('bg-yellow-200', 'animate-pulse');
      }, 2000);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages, scrollToBottom]);

  // Enhanced message sending with n8n backend
  const handleSendMessage = useCallback(async (content: string, type: 'text') => {
    const sentMessage = await sendMessage(content, type);
    
    if (sentMessage) {
      // Update chat metadata for WhatsApp-like sorting
      const metadata = getChatMetadata(contactId);
      updateChatMetadata(contactId, {
        ...metadata,
        lastUpdatedAt: new Date().toISOString(),
        isCleared: false
      });

      // Notify parent to update chat list
      updateChatPreviews();
    }
  }, [sendMessage, contactId, updateChatPreviews]);

  const handleSendImage = useCallback(async (file: File, caption?: string) => {
    // Create object URL for immediate display
    const imageUrl = URL.createObjectURL(file);
    
    const sentMessage = await sendMessage(caption || '', 'image', {
      imageUrl,
      fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      fileType: file.type.split('/')[1].toUpperCase(),
    });

    if (sentMessage) {
      const metadata = getChatMetadata(contactId);
      updateChatMetadata(contactId, {
        ...metadata,
        lastUpdatedAt: new Date().toISOString(),
        isCleared: false
      });

      updateChatPreviews();
    }
  }, [sendMessage, contactId, updateChatPreviews]);

  const handleSendDocument = useCallback(async (file: File, caption?: string) => {
    const sentMessage = await sendMessage(caption || '', 'document', {
      fileName: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      fileType: file.name.split('.').pop()?.toUpperCase() || 'FILE',
      documentUrl: '#', // Placeholder - in real implementation, upload to storage
    });

    if (sentMessage) {
      const metadata = getChatMetadata(contactId);
      updateChatMetadata(contactId, {
        ...metadata,
        lastUpdatedAt: new Date().toISOString(),
        isCleared: false
      });

      updateChatPreviews();
    }
  }, [sendMessage, contactId, updateChatPreviews]);

  const handleSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setChatState(prev => ({
        ...prev,
        searchQuery: '',
        searchResults: [],
        currentSearchIndex: 0,
      }));
      return;
    }

    const results: number[] = [];
    chatState.messages.forEach((message, index) => {
      if (message.type === 'text' && message.content.toLowerCase().includes(query.toLowerCase())) {
        results.push(index);
      }
    });

    setChatState(prev => ({
      ...prev,
      searchQuery: query,
      searchResults: results,
      currentSearchIndex: 0,
    }));

    if (results.length > 0) {
      scrollToMessage(results[0]);
    }
  }, [chatState.messages, scrollToMessage]);

  const handleNavigateSearchResult = useCallback((direction: 'prev' | 'next') => {
    const { searchResults, currentSearchIndex } = chatState;
    if (searchResults.length === 0) return;

    let newIndex;
    if (direction === 'prev') {
      newIndex = currentSearchIndex > 0 ? currentSearchIndex - 1 : searchResults.length - 1;
    } else {
      newIndex = currentSearchIndex < searchResults.length - 1 ? currentSearchIndex + 1 : 0;
    }

    setChatState(prev => ({
      ...prev,
      currentSearchIndex: newIndex,
    }));

    scrollToMessage(searchResults[newIndex]);
  }, [chatState, scrollToMessage]);

  const handleImageClick = useCallback((imageUrl: string) => {
    setCurrentImage(imageUrl);
    setShowImageViewer(true);
  }, []);

  const handleDocumentPreview = useCallback((documentUrl: string, fileName: string) => {
    if (shouldOpenDocumentExternally(documentUrl)) {
      openDocumentExternally(documentUrl);
    } else {
      setCurrentDocument({ url: documentUrl, fileName });
      setShowDocumentViewer(true);
    }
  }, []);

  const handleToggleMute = useCallback(() => {
    setChatState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  }, []);

  const handleClearChat = useCallback(() => {
    if (confirm('Are you sure you want to clear this chat? This action cannot be undone.')) {
      const chatIndex = chatState.messages.length > 0 ? 0 : 999;
      
      setChatState(prev => ({ ...prev, messages: [] }));
      markChatAsCleared(contactId, chatIndex);
      updateChatPreviews();
    }
  }, [contactId, updateChatPreviews, chatState.messages.length]);

  // Handle typing indicator with debouncing
  const handleTyping = useCallback(() => {
    sendTypingIndicator(true);
  }, [sendTypingIndicator]);

  // Mark messages as read when viewing
  useEffect(() => {
    const unreadMessages = chatState.messages
      .filter(msg => !msg.isSent && msg.status !== 'read')
      .map(msg => msg.id);
    
    if (unreadMessages.length > 0) {
      markMessagesAsRead(unreadMessages);
    }
  }, [chatState.messages, markMessagesAsRead]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Chat...</h2>
          <p className="text-gray-600">Connecting to secure messaging service</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-4">
            <button
              onClick={clearError}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={onBack}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Contact not found</h2>
          <button
            onClick={onBack}
            className="text-blue-500 hover:text-blue-600 transition-colors"
          >
            Go back to chat list
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto relative">
      <ChatHeader
        contact={chatState.contact}
        isMuted={chatState.isMuted}
        onBack={onBack}
        onOptionsMenu={() => setShowOptionsMenu(true)}
      />

      <SearchOverlay
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        onSearch={handleSearch}
        searchResults={chatState.searchResults}
        currentIndex={chatState.currentSearchIndex}
        onNavigateResult={handleNavigateSearchResult}
      />

      <div 
        ref={messagesContainerRef}
        className={`flex-1 overflow-y-auto px-4 py-4 ${showSearch ? 'pt-32' : 'pt-20'} pb-32`}
      >
        {chatState.messages.map((message, index) => (
          <div key={message.id} data-message-id={message.id} className="transition-colors duration-200 rounded-lg">
            <MessageBubble
              message={message}
              onImageClick={handleImageClick}
              onDocumentPreview={handleDocumentPreview}
              searchQuery={chatState.searchQuery}
            />
          </div>
        ))}
        
        {chatState.isTyping && (
          <TypingIndicator contactName={chatState.contact.name} />
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <MessageInput
        onSendMessage={handleSendMessage}
        onSendImage={handleSendImage}
        onSendDocument={handleSendDocument}
        disabled={isSending}
        onTyping={handleTyping}
      />

      <ImageViewer
        isOpen={showImageViewer}
        imageUrl={currentImage}
        onClose={() => setShowImageViewer(false)}
      />

      <DocumentViewer
        isOpen={showDocumentViewer}
        documentUrl={currentDocument.url}
        fileName={currentDocument.fileName}
        onClose={() => setShowDocumentViewer(false)}
      />

      <OptionsMenu
        isOpen={showOptionsMenu}
        isMuted={chatState.isMuted}
        onClose={() => setShowOptionsMenu(false)}
        onSearch={() => {
          setShowOptionsMenu(false);
          setShowSearch(true);
        }}
        onToggleMute={handleToggleMute}
        onClearChat={handleClearChat}
      />
    </div>
  );
};