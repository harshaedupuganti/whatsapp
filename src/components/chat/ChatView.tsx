import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatHeader } from './ChatHeader';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { MessageInput } from './MessageInput';
import { SearchOverlay } from './SearchOverlay';
import { ImageViewer } from './ImageViewer';
import { DocumentViewer } from './DocumentViewer';
import { OptionsMenu } from './OptionsMenu';
import { getContactById, getMessagesByContactId } from '../../data/mockMessages';
import { Message, ChatState } from '../../types/message';
import { useChatContext } from '../../contexts/ChatContext';
import { 
  saveMessagesToStorage, 
  loadMessagesFromStorage, 
  isChatCleared, 
  markChatAsCleared,
  shouldOpenDocumentExternally,
  openDocumentExternally,
  updateMessageStatusInStorage,
  updateLastSeenTime,
  getLastSeenTime,
  updateChatMetadata,
  getChatMetadata
} from '../../utils/chatStorage';

interface ChatViewProps {
  contactId: string;
  onBack: () => void;
  searchQuery?: string;
  searchMessageId?: string;
}

export const ChatView: React.FC<ChatViewProps> = ({ 
  contactId, 
  onBack, 
  searchQuery = '', 
  searchMessageId = ''
}) => {
  const { updateChatPreviews } = useChatContext();
  const contact = getContactById(contactId);
  const initialMessages = getMessagesByContactId(contactId);
  
  // Load messages from storage or use initial data
  const getInitialMessages = () => {
    if (isChatCleared(contactId)) {
      return [];
    }
    
    const storedMessages = loadMessagesFromStorage(contactId);
    return storedMessages.length > 0 ? storedMessages : initialMessages;
  };
  
  const [chatState, setChatState] = useState<ChatState>({
    messages: getInitialMessages(),
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
      // Add highlight animation
      messageElement.classList.add('bg-yellow-200', 'animate-pulse');
      setTimeout(() => {
        messageElement.classList.remove('bg-yellow-200', 'animate-pulse');
      }, 2000);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages, scrollToBottom]);

  // Save messages to storage whenever they change and notify parent
  useEffect(() => {
    if (chatState.messages.length > 0) {
      saveMessagesToStorage(contactId, chatState.messages);
      // Notify parent component to update chat list (WhatsApp-like sorting)
      updateChatPreviews();
    }
  }, [chatState.messages, contactId, updateChatPreviews]);

  // Update contact data when contactId changes
  useEffect(() => {
    const newContact = getContactById(contactId);
    
    if (newContact) {
      const newMessages = getInitialMessages();
      
      // Update last seen time from storage if available
      const lastSeenFromStorage = getLastSeenTime(contactId);
      const updatedContact = lastSeenFromStorage 
        ? { ...newContact, lastSeen: lastSeenFromStorage }
        : newContact;
      
      setChatState(prev => ({
        ...prev,
        contact: updatedContact,
        messages: newMessages,
        isTyping: false,
        searchQuery: '',
        searchResults: [],
        currentSearchIndex: 0,
      }));
    }
  }, [contactId]);

  // Handle search from global search
  useEffect(() => {
    if (searchQuery && searchMessageId) {
      setShowSearch(true);
      setChatState(prev => ({ ...prev, searchQuery }));
      
      // Find and scroll to the specific message
      setTimeout(() => {
        scrollToMessageById(searchMessageId);
      }, 100);
    }
  }, [searchQuery, searchMessageId, scrollToMessageById]);

  const handleSendMessage = useCallback((content: string, type: 'text') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      isSent: true,
      status: 'sending',
    };

    // Immediately add message to state for instant UI update
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));

    // Update chat metadata to move to top of list (WhatsApp behavior)
    const metadata = getChatMetadata(contactId);
    updateChatMetadata(contactId, {
      ...metadata,
      lastUpdatedAt: new Date().toISOString(),
      isCleared: false
    });

    // Simulate message status updates with proper storage sync
    setTimeout(() => {
      setChatState(prev => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
        ),
      }));
      updateMessageStatusInStorage(contactId, newMessage.id, 'sent');
    }, 1000);

    setTimeout(() => {
      setChatState(prev => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
        ),
      }));
      updateMessageStatusInStorage(contactId, newMessage.id, 'delivered');
    }, 2000);

    setTimeout(() => {
      setChatState(prev => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.id === newMessage.id ? { ...msg, status: 'read' } : msg
        ),
      }));
      updateMessageStatusInStorage(contactId, newMessage.id, 'read');
    }, 4000);

    // Simulate typing indicator and response
    setTimeout(() => {
      setChatState(prev => ({ ...prev, isTyping: true }));
    }, 3000);

    setTimeout(() => {
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'text',
        content: 'Thanks for your message! I\'ll get back to you soon.',
        timestamp: new Date(),
        isSent: false,
        status: 'read',
      };

      setChatState(prev => ({
        ...prev,
        isTyping: false,
        messages: [
          ...prev.messages.map(msg =>
            msg.id === newMessage.id ? { ...msg, status: 'read' } : msg
          ),
          responseMessage,
        ],
        // Update contact's last seen time when receiving a reply
        contact: {
          ...prev.contact,
          lastSeen: new Date(),
        },
      }));

      // Update last seen time in storage for real-time tracking
      updateLastSeenTime(contactId);
    }, 5000);
  }, [contactId]);

  const handleSendImage = useCallback((file: File, caption?: string) => {
    const imageUrl = URL.createObjectURL(file);
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'image',
      content: caption || '',
      imageUrl,
      timestamp: new Date(),
      isSent: true,
      status: 'sending',
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));

    // Update chat metadata for WhatsApp-like sorting
    const metadata = getChatMetadata(contactId);
    updateChatMetadata(contactId, {
      ...metadata,
      lastUpdatedAt: new Date().toISOString(),
      isCleared: false
    });

    // Simulate status updates with storage sync
    setTimeout(() => {
      setChatState(prev => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
        ),
      }));
      updateMessageStatusInStorage(contactId, newMessage.id, 'sent');
    }, 1000);

    setTimeout(() => {
      setChatState(prev => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
        ),
      }));
      updateMessageStatusInStorage(contactId, newMessage.id, 'delivered');
    }, 2000);

    setTimeout(() => {
      setChatState(prev => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.id === newMessage.id ? { ...msg, status: 'read' } : msg
        ),
      }));
      updateMessageStatusInStorage(contactId, newMessage.id, 'read');
    }, 4000);
  }, [contactId]);

  const handleSendDocument = useCallback((file: File, caption?: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'document',
      content: caption || '',
      fileName: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      fileType: file.name.split('.').pop()?.toUpperCase() || 'FILE',
      documentUrl: '#',
      timestamp: new Date(),
      isSent: true,
      status: 'sending',
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));

    // Update chat metadata for WhatsApp-like sorting
    const metadata = getChatMetadata(contactId);
    updateChatMetadata(contactId, {
      ...metadata,
      lastUpdatedAt: new Date().toISOString(),
      isCleared: false
    });

    // Simulate status updates with storage sync
    setTimeout(() => {
      setChatState(prev => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
        ),
      }));
      updateMessageStatusInStorage(contactId, newMessage.id, 'sent');
    }, 1000);

    setTimeout(() => {
      setChatState(prev => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
        ),
      }));
      updateMessageStatusInStorage(contactId, newMessage.id, 'delivered');
    }, 2000);

    setTimeout(() => {
      setChatState(prev => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.id === newMessage.id ? { ...msg, status: 'read' } : msg
        ),
      }));
      updateMessageStatusInStorage(contactId, newMessage.id, 'read');
    }, 4000);
  }, [contactId]);

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
    // Check if document should open externally
    if (shouldOpenDocumentExternally(documentUrl)) {
      openDocumentExternally(documentUrl);
    } else {
      // Open in internal modal viewer
      setCurrentDocument({ url: documentUrl, fileName });
      setShowDocumentViewer(true);
    }
  }, []);

  const handleToggleMute = useCallback(() => {
    setChatState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  }, []);

  const handleClearChat = useCallback(() => {
    if (confirm('Are you sure you want to clear this chat? This action cannot be undone.')) {
      // Find the original position of this chat in the chat list
      const chatIndex = chatState.messages.length > 0 ? 0 : 999; // Use 0 for active chats, high number for inactive
      
      setChatState(prev => ({ ...prev, messages: [] }));
      
      // Mark chat as cleared with position tracking
      markChatAsCleared(contactId, chatIndex);
      
      // Notify parent to update chat list
      updateChatPreviews();
    }
  }, [contactId, updateChatPreviews, chatState.messages.length]);

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