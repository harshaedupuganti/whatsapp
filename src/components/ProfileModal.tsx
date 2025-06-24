import React from 'react';
import { X } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  isFullScreen: boolean;
  profileImage: string;
  contactName: string;
  onClose: () => void;
  onToggleFullScreen: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  isFullScreen,
  profileImage,
  contactName,
  onClose,
  onToggleFullScreen,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        isFullScreen ? 'bg-black' : 'bg-black/50 backdrop-blur-sm'
      }`}
      onClick={onClose}
    >
      <div 
        className={`relative transition-all duration-300 ${
          isFullScreen 
            ? 'w-full h-full flex items-center justify-center' 
            : 'animate-scale-in'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
        >
          <X size={24} />
        </button>
        
        <img
          src={profileImage}
          alt={contactName}
          className={`transition-all duration-300 cursor-pointer ${
            isFullScreen
              ? 'max-w-full max-h-full object-contain'
              : 'w-80 h-80 rounded-2xl shadow-2xl object-cover'
          }`}
          onClick={onToggleFullScreen}
        />
        
        {!isFullScreen && (
          <div className="absolute bottom-4 left-4 right-4 text-center">
            <h3 className="text-white text-xl font-semibold drop-shadow-lg">
              {contactName}
            </h3>
          </div>
        )}
      </div>
    </div>
  );
};