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
    </div>
  );
};