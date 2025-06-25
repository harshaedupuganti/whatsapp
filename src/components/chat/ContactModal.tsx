import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Contact } from '../../types/message';

interface ContactModalProps {
  isOpen: boolean;
  contact: Contact;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  contact,
  onClose,
}) => {
  const [isImageFullScreen, setIsImageFullScreen] = useState(false);

  if (!isOpen) return null;

  const formatLastSeen = (lastSeen?: Date) => {
    if (!lastSeen) return 'Never';
    const now = new Date();
    const diff = now.getTime() - lastSeen.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  return (
    <>
      {/* Modal Overlay */}
      <div 
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          isImageFullScreen ? 'bg-black' : 'bg-black/50 backdrop-blur-sm'
        }`}
        onClick={isImageFullScreen ? () => setIsImageFullScreen(false) : onClose}
      >
        {isImageFullScreen ? (
          // Full screen image view
          <div className="w-full h-full flex items-center justify-center p-4">
            <button
              onClick={() => setIsImageFullScreen(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
            >
              <X size={24} />
            </button>
            <img
              src={contact.profileImage}
              alt={contact.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        ) : (
          // Contact info modal
          <div className="flex items-center justify-center min-h-screen p-4">
            <div 
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative p-6 pb-4">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
                
                <div className="text-center">
                  <div className="relative inline-block mb-4">
                    <img
                      src={contact.profileImage}
                      alt={contact.name}
                      className="w-24 h-24 rounded-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setIsImageFullScreen(true)}
                    />
                    {contact.isOnline && (
                      <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white"></div>
                    )}
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {contact.name}
                  </h2>
                  
                  <p className="text-gray-500">
                    {contact.isOnline ? 'Online' : `Last seen ${formatLastSeen(contact.lastSeen)}`}
                  </p>
                </div>
              </div>
              
              {/* Contact Details */}
              <div className="px-6 pb-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      This is a placeholder description for {contact.name}. In a real application, 
                      this would contain the user's bio or status message.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Status</h3>
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        contact.isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                      <span className="text-sm text-gray-600">
                        {contact.isOnline ? 'Currently online' : `Last active ${formatLastSeen(contact.lastSeen)}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};