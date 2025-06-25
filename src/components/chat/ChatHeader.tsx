import React, { useState } from 'react';
import { ArrowLeft, MoreVertical, BellOff } from 'lucide-react';
import { Contact } from '../../types/message';
import { ContactModal } from './ContactModal';

interface ChatHeaderProps {
  contact: Contact;
  isMuted: boolean;
  onBack: () => void;
  onOptionsMenu: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  contact,
  isMuted,
  onBack,
  onOptionsMenu,
}) => {
  const [showContactModal, setShowContactModal] = useState(false);

  const formatLastSeen = (lastSeen?: Date) => {
    if (!lastSeen) return '';
    const now = new Date();
    const diff = now.getTime() - lastSeen.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'last seen just now';
    if (minutes < 60) return `last seen ${minutes}m ago`;
    if (hours < 24) return `last seen ${hours}h ago`;
    return `last seen ${days}d ago`;
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-3 z-50 safe-area-top">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center flex-1">
            <button
              onClick={onBack}
              className="p-2 -ml-2 mr-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-700" />
            </button>
            
            <div 
              className="flex items-center flex-1 min-w-0 cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
              onClick={() => setShowContactModal(true)}
            >
              <div className="relative flex-shrink-0 mr-3">
                <img
                  src={contact.profileImage}
                  alt={contact.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                {contact.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <h2 className="font-semibold text-gray-900 truncate text-lg mr-2">
                    {contact.name}
                  </h2>
                  {isMuted && (
                    <BellOff size={16} className="text-gray-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {contact.isOnline ? 'online' : formatLastSeen(contact.lastSeen)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <button
              onClick={onOptionsMenu}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <MoreVertical size={20} className="text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      <ContactModal
        isOpen={showContactModal}
        contact={contact}
        onClose={() => setShowContactModal(false)}
      />
    </>
  );
};