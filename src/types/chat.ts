export interface MessageStatus {
  type: 'sent' | 'delivered' | 'seen';
}

export interface Chat {
  id: string;
  contactName: string;
  profileImage: string;
  lastMessage: string;
  timestamp: string;
  messageStatus: MessageStatus;
  unreadCount: number;
  isOnline?: boolean;
}

export type TabType = 'chats' | 'search' | 'settings';