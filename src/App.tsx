import React, { useState } from 'react';
import { TopBar } from './components/TopBar';
import { ChatList } from './components/ChatList';
import { SearchView } from './components/SearchView';
import { SettingsView } from './components/SettingsView';
import { BottomNavigation } from './components/BottomNavigation';
import { ProfileModal } from './components/ProfileModal';
import { ChatView } from './components/chat/ChatView';
import { ChatProvider, useChatContext } from './contexts/ChatContext';
import { SettingsProvider } from './contexts/SettingsContext';

const AppContent: React.FC = () => {
  const { state, setActiveTab, openChat, closeChat, navigateToChat } = useChatContext();
  
  const [profileModal, setProfileModal] = useState({
    isOpen: false,
    isFullScreen: false,
    profileImage: '',
    contactName: '',
  });

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

  const renderContent = () => {
    if (state.showChat && state.currentChatId) {
      return (
        <ChatView 
          contactId={state.currentChatId} 
          onBack={closeChat}
          searchQuery={state.searchQuery}
          searchMessageId={state.searchMessageId}
        />
      );
    }

    switch (state.activeTab) {
      case 'chats':
        return (
          <ChatList 
            chats={state.chats} 
            onProfileClick={handleProfileClick}
            onChatClick={openChat}
          />
        );
      case 'search':
        return <SearchView onNavigateToChat={navigateToChat} />;
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <ChatList 
            chats={state.chats} 
            onProfileClick={handleProfileClick}
            onChatClick={openChat}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto relative">
      {!state.showChat && <TopBar />}
      
      <div className={`flex-1 flex flex-col ${!state.showChat ? 'pt-16 pb-20' : ''}`}>
        {renderContent()}
      </div>
      
      {!state.showChat && (
        <BottomNavigation 
          activeTab={state.activeTab} 
          onTabChange={setActiveTab} 
        />
      )}
      
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
};

function App() {
  return (
    <SettingsProvider>
      <ChatProvider>
        <AppContent />
      </ChatProvider>
    </SettingsProvider>
  );
}

export default App;