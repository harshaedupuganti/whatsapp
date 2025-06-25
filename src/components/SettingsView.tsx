import React, { useState } from 'react';
import { User, Bell, HelpCircle, Shield, ChevronRight } from 'lucide-react';
import { ProfileSection } from './settings/ProfileSection';
import { NotificationSettings } from './settings/NotificationSettings';
import { HelpSupport } from './settings/HelpSupport';
import { AuthenticationControls } from './settings/AuthenticationControls';

type SettingsTab = 'profile' | 'notifications' | 'support' | 'authentication';

export const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab | null>(null);

  const tabs = [
    {
      id: 'profile' as SettingsTab,
      title: 'Profile',
      description: 'Manage your display name, photo, and status',
      icon: User,
      color: 'blue'
    },
    {
      id: 'notifications' as SettingsTab,
      title: 'Notifications',
      description: 'Configure alerts, sounds, and preferences',
      icon: Bell,
      color: 'green'
    },
    {
      id: 'support' as SettingsTab,
      title: 'Support',
      description: 'Get help, contact support, and view policies',
      icon: HelpCircle,
      color: 'purple'
    },
    {
      id: 'authentication' as SettingsTab,
      title: 'Authentication',
      description: 'Manage your login and account security',
      icon: Shield,
      color: 'red'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-100',
        icon: 'text-blue-600',
        iconBg: 'bg-blue-100',
        hover: 'hover:bg-blue-100'
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-100',
        icon: 'text-green-600',
        iconBg: 'bg-green-100',
        hover: 'hover:bg-green-100'
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-100',
        icon: 'text-purple-600',
        iconBg: 'bg-purple-100',
        hover: 'hover:bg-purple-100'
      },
      red: {
        bg: 'bg-red-50',
        border: 'border-red-100',
        icon: 'text-red-600',
        iconBg: 'bg-red-100',
        hover: 'hover:bg-red-100'
      }
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSection />;
      case 'notifications':
        return <NotificationSettings />;
      case 'support':
        return <HelpSupport />;
      case 'authentication':
        return <AuthenticationControls />;
      default:
        return null;
    }
  };

  // If a tab is active, show the content with back navigation
  if (activeTab) {
    return (
      <div className="flex-1 bg-gray-50 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          {/* Back Navigation */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
            <button
              onClick={() => setActiveTab(null)}
              className="flex items-center text-primary-600 hover:text-primary-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="font-medium">Back to Settings</span>
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="p-4">
            {renderTabContent()}
          </div>
        </div>
      </div>
    );
  }

  // Main settings menu with tabs
  return (
    <div className="flex-1 bg-gray-50 overflow-y-auto">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account, notifications, and preferences</p>
        </div>

        {/* Settings Tabs */}
        <div className="space-y-3">
          {tabs.map((tab) => {
            const colors = getColorClasses(tab.color);
            const Icon = tab.icon;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full p-4 rounded-xl border transition-all duration-200 text-left ${colors.bg} ${colors.border} ${colors.hover} hover:shadow-sm active:scale-[0.98]`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${colors.iconBg}`}>
                      <Icon className={colors.icon} size={20} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">{tab.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{tab.description}</p>
                    </div>
                  </div>
                  
                  <ChevronRight className="text-gray-400 ml-4 flex-shrink-0" size={20} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 p-4 bg-white rounded-xl border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setActiveTab('profile')}
              className="p-3 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors text-center"
            >
              <User className="text-blue-600 mx-auto mb-1" size={18} />
              <span className="text-sm font-medium text-blue-900">Edit Profile</span>
            </button>
            
            <button
              onClick={() => setActiveTab('notifications')}
              className="p-3 bg-green-50 rounded-lg border border-green-100 hover:bg-green-100 transition-colors text-center"
            >
              <Bell className="text-green-600 mx-auto mb-1" size={18} />
              <span className="text-sm font-medium text-green-900">Notifications</span>
            </button>
          </div>
        </div>

        {/* App Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">Quiddity ChatApp v1.0.0</p>
          <p className="text-xs text-gray-400 mt-1">Made with ❤️ for seamless communication</p>
        </div>
      </div>
    </div>
  );
};