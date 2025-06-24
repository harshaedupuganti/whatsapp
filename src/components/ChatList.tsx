import React from 'react';
import { Chat } from '../types/chat';
import { ChatItem } from './ChatItem';

interface ChatListProps {
  chats: Chat[];
  onProfileClick: (profileImage: string, contactName: string) => void;
}

export const ChatList: React.FC<ChatListProps> = ({ chats, onProfileClick }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="divide-y divide-gray-100">
        {chats.map((chat) => (
          <ChatItem
            key={chat.id}
            chat={chat}
            onProfileClick={onProfileClick}
          />
        ))}
      </div>
    </div>
  );
};