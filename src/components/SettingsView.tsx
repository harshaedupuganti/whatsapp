import React from 'react';
import { User, Bell, Shield, Palette, HelpCircle, LogOut } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const settingsItems = [
    { icon: User, label: 'Profile', description: 'Update your profile information' },
    { icon: Bell, label: 'Notifications', description: 'Manage notification preferences' },
    { icon: Shield, label: 'Privacy & Security', description: 'Control your privacy settings' },
    { icon: Palette, label: 'Appearance', description: 'Customize app theme and colors' },
    { icon: HelpCircle, label: 'Help & Support', description: 'Get help and contact support' },
  ];

  return (
    <div className="flex-1 bg-white">
      <div className="p-6">
        <div className="space-y-1">
          {settingsItems.map(({ icon: Icon, label, description }) => (
            <button
              key={label}
              className="w-full flex items-center p-4 rounded-xl hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                <Icon className="text-primary-600" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{label}</h3>
                <p className="text-sm text-gray-500">{description}</p>
              </div>
            </button>
          ))}
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button className="w-full flex items-center p-4 rounded-xl hover:bg-red-50 transition-colors text-left">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
              <LogOut className="text-red-600" size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-red-600">Sign Out</h3>
              <p className="text-sm text-red-400">Sign out of your account</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};