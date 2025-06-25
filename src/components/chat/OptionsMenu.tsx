import React from 'react';
import { Search, Bell, BellOff, Trash2 } from 'lucide-react';

interface OptionsMenuProps {
  isOpen: boolean;
  isMuted: boolean;
  onClose: () => void;
  onSearch: () => void;
  onToggleMute: () => void;
  onClearChat: () => void;
}

export const OptionsMenu: React.FC<OptionsMenuProps> = ({
  isOpen,
  isMuted,
  onClose,
  onSearch,
  onToggleMute,
  onClearChat,
}) => {
  if (!isOpen) return null;

  const menuItems = [
    {
      icon: Search,
      label: 'Search',
      onClick: () => {
        onSearch();
        onClose();
      },
    },
    {
      icon: isMuted ? Bell : BellOff,
      label: isMuted ? 'Unmute' : 'Mute',
      onClick: () => {
        onToggleMute();
        onClose();
      },
    },
    {
      icon: Trash2,
      label: 'Clear Chat',
      onClick: () => {
        onClearChat();
        onClose();
      },
      destructive: true,
    },
  ];

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <div className="fixed top-16 right-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2 min-w-48">
        {menuItems.map(({ icon: Icon, label, onClick, destructive }) => (
          <button
            key={label}
            onClick={onClick}
            className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
              destructive ? 'text-red-600' : 'text-gray-700'
            }`}
          >
            <Icon size={18} className="mr-3" />
            <span className="font-medium">{label}</span>
          </button>
        ))}
      </div>
    </>
  );
};