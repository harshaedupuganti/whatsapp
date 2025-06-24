import React from 'react';
import { MessageCircle, Search, Settings } from 'lucide-react';
import { TabType } from '../types/chat';

interface BottomNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs = [
    { id: 'chats' as TabType, icon: MessageCircle, label: 'Chats' },
    { id: 'search' as TabType, icon: Search, label: 'Search' },
    { id: 'settings' as TabType, icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-2 safe-area-bottom">
      <div className="flex justify-center items-center space-x-12">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all duration-200 ${
              activeTab === id
                ? 'text-primary-600 bg-primary-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Icon 
              size={24} 
              className={`mb-1 ${
                activeTab === id ? 'stroke-2' : 'stroke-1.5'
              }`} 
            />
            <span className={`text-xs font-medium ${
              activeTab === id ? 'font-semibold' : ''
            }`}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};