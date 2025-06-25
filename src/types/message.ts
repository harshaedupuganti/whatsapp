export interface Message {
  id: string;
  type: 'text' | 'image' | 'document';
  content: string;
  timestamp: Date;
  isSent: boolean;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  imageUrl?: string;
  documentUrl?: string;
}

export interface Contact {
  id: string;
  name: string;
  profileImage: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface ChatState {
  messages: Message[];
  contact: Contact;
  isTyping: boolean;
  isMuted: boolean;
  searchQuery: string;
  searchResults: number[];
  currentSearchIndex: number;
}