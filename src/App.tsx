import React, { useState, useCallback, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { ChatList } from './components/ChatList';
import { SearchView } from './components/SearchView';
import { SettingsView } from './components/SettingsView';
import { BottomNavigation } from './components/BottomNavigation';
import { ProfileModal } from './components/ProfileModal';
import { ChatView } from './components/chat/ChatView';
import { mockChats } from './data/mockChats';
import { TabType, Chat } from './types/chat';
import { getChatPreview, getAllChatPreviews, formatTimestamp } from './utils/chatStorage';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('chats');
  const [showChat, setShowChat] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchMessageId, setSearchMessageId] = useState<string>('');
  const [chats, setChats] = useState<Chat[]>(mockChats);
  const [profileModal, setProfileModal] = useState({
    isOpen: false,
    isFullScreen: false,
    profileImage: '',
    contactName: '',
  });

  // Update chat previews and sort by timestamp
  const updateChatPreviews = useCallback(() => {
    const allPreviews = getAllChatPreviews();
    
    const updatedChats = mockChats.map(chat => {
      const preview = getChatPreview(chat.id);
      if (preview) {
        return {
          ...chat,
          lastMessage: preview.lastMessage,
          timestamp: formatTimestamp(new Date(preview.timestamp)),
          messageStatus: { type: preview.messageStatus },
          unreadCount: preview.unreadCount,
          // Store raw timestamp for sorting
          _rawTimestamp: new Date(preview.timestamp),
        };
      }
      return {
        ...chat,
        lastMessage: '', // Clear preview for cleared chats
        _rawTimestamp: new Date(0), // Very old date for chats without messages
      };
    });
    
    // Separate chats with messages from those without
    const chatsWithMessages = updatedChats.filter(chat => {
      const preview = getChatPreview(chat.id);
      return preview && preview.lastMessage && preview.lastMessage.trim() !== '';
    });
    
    const chatsWithoutMessages = updatedChats.filter(chat => {
      const preview = getChatPreview(chat.id);
      return !preview || !preview.lastMessage || preview.lastMessage.trim() === '';
    });
    
    // Sort chats with messages by timestamp (most recent first)
    const sortedChatsWithMessages = chatsWithMessages.sort((a, b) => {
      const timeA = (a as any)._rawTimestamp?.getTime() || 0;
      const timeB = (b as any)._rawTimestamp?.getTime() || 0;
      return timeB - timeA;
    });
    
    // Sort chats without messages alphabetically
    const sortedChatsWithoutMessages = chatsWithoutMessages.sort((a, b) => {
      return a.contactName.localeCompare(b.contactName);
    });
    
    // Combine: active chats first, then inactive chats
    const sortedChats = [...sortedChatsWithMessages, ...sortedChatsWithoutMessages];
    
    // Remove the temporary _rawTimestamp property
    const cleanedChats = sortedChats.map(({ _rawTimestamp, ...chat }) => chat);
    
    setChats(cleanedChats);
  }, []);

  useEffect(() => {
    updateChatPreviews();
  }, [updateChatPreviews]);

  // Refresh chat list when returning from chat or when storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      updateChatPreviews();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [updateChatPreviews]);

  const handleProfileClick = (profileImage: string, contactName: string) => {
    if (profileModal.isOpen && profileModal.profileImage === profileImage) {
      setProfileModal(prev => ({ ...prev, isFullScreen: !prev.isFullScreen }));
    } else {
      setProfileModal({
        isOpen: true,
        isFullScreen: false,
        profileImage,
        contactName,
      });
    }
  };

  const handleCloseProfile = () => {
    setProfileModal({
      isOpen: false,
      isFullScreen: false,
      profileImage: '',
      contactName: '',
    });
  };

  const handleToggleFullScreen = () => {
    setProfileModal(prev => ({ ...prev, isFullScreen: !prev.isFullScreen }));
  };

  const handleChatClick = useCallback((chatId: string) => {
    setCurrentChatId(chatId);
    setShowChat(true);
    setSearchQuery('');
    setSearchMessageId('');
    
    // Clear unread count for the opened chat
    setChats(prevChats => 
      prevChats.map(chat => 
        chat.id === chatId 
          ? { ...chat, unreadCount: 0 }
          : chat
      )
    );
  }, []);

  const handleBackFromChat = useCallback(() => {
    setShowChat(false);
    setCurrentChatId('');
    setSearchQuery('');
    setSearchMessageId('');
    
    // Refresh chat previews when returning from chat
    setTimeout(() => {
      updateChatPreviews();
    }, 100);
  }, [updateChatPreviews]);

  const handleNavigateToChat = useCallback((contactId: string, searchQuery: string, messageId: string) => {
    setCurrentChatId(contactId);
    setSearchQuery(searchQuery);
    setSearchMessageId(messageId);
    setShowChat(true);
    setActiveTab('chats');
    
    // Clear unread count for the opened chat
    setChats(prevChats => 
      prevChats.map(chat => 
        chat.id === contactId 
          ? { ...chat, unreadCount: 0 }
          : chat
      )
    );
  }, []);

  const renderContent = () => {
    if (showChat && currentChatId) {
      return (
        <ChatView 
          contactId={currentChatId} 
          onBack={handleBackFromChat}
          searchQuery={searchQuery}
          searchMessageId={searchMessageId}
          onChatUpdate={updateChatPreviews}
        />
      );
    }

    switch (activeTab) {
      case 'chats':
        return (
          <ChatList 
            chats={chats} 
            onProfileClick={handleProfileClick}
            onChatClick={handleChatClick}
          />
        );
      case 'search':
        return <SearchView onNavigateToChat={handleNavigateToChat} />;
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <ChatList 
            chats={chats} 
            onProfileClick={handleProfileClick}
            onChatClick={handleChatClick}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto relative">
      {!showChat && <TopBar />}
      
      <div className={`flex-1 flex flex-col ${!showChat ? 'pt-16 pb-20' : ''}`}>
        {renderContent()}
      </div>
      
      {!showChat && <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />}
      
      <ProfileModal
        isOpen={profileModal.isOpen}
        isFullScreen={profileModal.isFullScreen}
        profileImage={profileModal.profileImage}
        contactName={profileModal.contactName}
        onClose={handleCloseProfile}
        onToggleFullScreen={handleToggleFullScreen}
      />
    </div>
  );
}

export default App;