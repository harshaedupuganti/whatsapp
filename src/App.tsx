import React, { useState, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { ChatList } from './components/ChatList';
import { SearchView } from './components/SearchView';
import { SettingsView } from './components/SettingsView';
import { BottomNavigation } from './components/BottomNavigation';
import { ProfileModal } from './components/ProfileModal';
import { N8nChatView } from './components/chat/N8nChatView';
import { AuthenticationView } from './components/AuthenticationView';
import { N8nChatProvider, useN8nChatContext } from './contexts/N8nChatContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { useN8nAuth } from './hooks/useN8nAuth';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useN8nAuth();
  const { state, setActiveTab, openChat, closeChat, navigateToChat } = useN8nChatContext();
  
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

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center max-w-md mx-auto">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Checking authentication status</p>
        </div>
      </div>
    );
  }

  // Show authentication view if not authenticated
  if (!isAuthenticated) {
    return <AuthenticationView />;
  }

  const renderContent = () => {
    if (state.showChat && state.currentChatId) {
      return (
        <N8nChatView 
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
      <N8nChatProvider>
        <AppContent />
      </N8nChatProvider>
    </SettingsProvider>
  );
}

export default App;