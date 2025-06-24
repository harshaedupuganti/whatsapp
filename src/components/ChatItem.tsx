import React from 'react';
import { Chat } from '../types/chat';
import { MessageStatusIcon } from './MessageStatusIcon';

interface ChatItemProps {
  chat: Chat;
  onProfileClick: (profileImage: string, contactName: string) => void;
}

export const ChatItem: React.FC<ChatItemProps> = ({ chat, onProfileClick }) => {
  return (
    <div className="flex items-center p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0">
      <div className="relative flex-shrink-0 mr-3">
        <img
          src={chat.profileImage}
          alt={chat.contactName}
          className="w-12 h-12 rounded-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onProfileClick(chat.profileImage, chat.contactName);
          }}
        />
        {chat.isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className={`font-medium text-gray-900 truncate ${
            chat.unreadCount > 0 ? 'font-semibold' : ''
          }`}>
            {chat.contactName}
          </h3>
          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
            {chat.timestamp}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center min-w-0 flex-1">
            <div className="mr-2 flex-shrink-0">
              <MessageStatusIcon status={chat.messageStatus} />
            </div>
            <p className={`text-sm truncate ${
              chat.unreadCount > 0 
                ? 'text-gray-900 font-medium' 
                : 'text-gray-600'
            }`}>
              {chat.lastMessage}
            </p>
          </div>
          
          {chat.unreadCount > 0 && (
            <div className="ml-2 flex-shrink-0">
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-primary-500 rounded-full">
                {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};