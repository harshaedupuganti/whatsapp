import React from 'react';
import { Chat } from '../types/chat';
import { ChatItem } from './ChatItem';

interface ChatListProps {
  chats: Chat[];
  onProfileClick: (profileImage: string, contactName: string) => void;
  onChatClick: (chatId: string) => void;
}

export const ChatList: React.FC<ChatListProps> = ({ chats, onProfileClick, onChatClick }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="divide-y divide-gray-100">
        {chats.map((chat) => (
          <div key={chat.id} onClick={() => onChatClick(chat.id)} className="cursor-pointer">
            <ChatItem
              chat={chat}
              onProfileClick={onProfileClick}
            />
          </div>
        ))}
      </div>
      
      {/* Empty state when no chats */}
      {chats.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Chats Yet
          </h3>
          <p className="text-gray-500 text-center">
            Start a conversation to see your chats here
          </p>
        </div>
      )}
    </div>
  );
};