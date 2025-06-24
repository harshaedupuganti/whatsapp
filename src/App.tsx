import React, { useState } from 'react';
import { TopBar } from './components/TopBar';
import { ChatList } from './components/ChatList';
import { SearchView } from './components/SearchView';
import { SettingsView } from './components/SettingsView';
import { BottomNavigation } from './components/BottomNavigation';
import { ProfileModal } from './components/ProfileModal';
import { mockChats } from './data/mockChats';
import { TabType } from './types/chat';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('chats');
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
    switch (activeTab) {
      case 'chats':
        return <ChatList chats={mockChats} onProfileClick={handleProfileClick} />;
      case 'search':
        return <SearchView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <ChatList chats={mockChats} onProfileClick={handleProfileClick} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto relative">
      <TopBar />
      
      <div className="flex-1 flex flex-col pt-16 pb-20">
        {renderContent()}
      </div>
      
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
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