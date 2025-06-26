// API types for n8n backend integration
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
  phoneNumber?: string;
}

export interface SendMessageRequest {
  contactId: string;
  type: 'text' | 'image' | 'document';
  content: string;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  imageUrl?: string;
  documentUrl?: string;
  encryptedPayload: string;
}

export interface MessageResponse {
  id: string;
  type: 'text' | 'image' | 'document';
  content: string;
  timestamp: string;
  senderId: string;
  receiverId: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  imageUrl?: string;
  documentUrl?: string;
  encryptedPayload: string;
}

export interface TypingIndicatorRequest {
  contactId: string;
  isTyping: boolean;
}

export interface ReadReceiptRequest {
  messageIds: string[];
  contactId: string;
}

export interface ContactSyncResponse {
  contacts: Array<{
    id: string;
    name: string;
    email: string;
    profileImage: string;
    isOnline: boolean;
    lastSeen?: string;
  }>;
}

export interface PollMessagesRequest {
  lastMessageId?: string;
  contactId?: string;
  limit?: number;
}

export interface RateLimitInfo {
  remaining: number;
  resetTime: number;
  limit: number;
}