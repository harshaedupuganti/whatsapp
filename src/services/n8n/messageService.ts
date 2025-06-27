import { apiClient } from './apiClient';
import { encryptionService } from './encryptionService';
import { 
  SendMessageRequest, 
  MessageResponse, 
  PollMessagesRequest, 
  TypingIndicatorRequest,
  ReadReceiptRequest,
  ApiResponse 
} from '../../types/api';
import { Message } from '../../types/message';

class MessageService {
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();
  private lastMessageIds: Map<string, string> = new Map();
  private messageCallbacks: Map<string, (messages: Message[]) => void> = new Map();
  private typingCallbacks: Map<string, (isTyping: boolean, contactName: string) => void> = new Map();

  public async sendMessage(message: Omit<SendMessageRequest, 'encryptedPayload'>): Promise<ApiResponse<MessageResponse>> {
    try {
      // Encrypt the message payload
      const payload = {
        type: message.type,
        content: message.content,
        fileName: message.fileName,
        fileSize: message.fileSize,
        fileType: message.fileType,
        imageUrl: message.imageUrl,
        documentUrl: message.documentUrl,
      };

      const encryptedPayload = encryptionService.encryptPayload(payload);

      const requestData: SendMessageRequest = {
        ...message,
        encryptedPayload,
      };

      const response = await apiClient.post<MessageResponse>('/webhook/messages/send', requestData);

      if (response.success && response.data) {
        // Decrypt the response for local use
        const decryptedMessage = this.decryptMessageResponse(response.data);
        response.data = decryptedMessage;
      }

      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send message',
        timestamp: new Date().toISOString(),
      };
    }
  }

  public async pollMessages(request: PollMessagesRequest = {}): Promise<ApiResponse<MessageResponse[]>> {
    try {
      const response = await apiClient.post<MessageResponse[]>('/webhook/messages/poll', {
        ...request,
        lastMessageId: request.lastMessageId || this.lastMessageIds.get(request.contactId || 'global'),
      });

      if (response.success && response.data) {
        // Decrypt all messages
        const decryptedMessages = response.data.map(msg => this.decryptMessageResponse(msg));
        response.data = decryptedMessages;

        // Update last message ID for next poll
        if (decryptedMessages.length > 0) {
          const lastMessage = decryptedMessages[decryptedMessages.length - 1];
          this.lastMessageIds.set(request.contactId || 'global', lastMessage.id);
        }
      }

      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to poll messages',
        timestamp: new Date().toISOString(),
      };
    }
  }

  public startPolling(contactId: string, callback: (messages: Message[]) => void, isActive: boolean = true) {
    // Clear existing polling for this contact
    this.stopPolling(contactId);

    const interval = isActive 
      ? parseInt(import.meta.env.VITE_ACTIVE_CHAT_POLL_INTERVAL || '5000')
      : parseInt(import.meta.env.VITE_BACKGROUND_POLL_INTERVAL || '30000');

    this.messageCallbacks.set(contactId, callback);

    const pollInterval = setInterval(async () => {
      const response = await this.pollMessages({ contactId, limit: 50 });
      
      if (response.success && response.data) {
        const messages = response.data.map(this.convertToMessage);
        callback(messages);
      }
    }, interval);

    this.pollingIntervals.set(contactId, pollInterval);
  }

  public stopPolling(contactId: string) {
    const interval = this.pollingIntervals.get(contactId);
    if (interval) {
      clearInterval(interval);
      this.pollingIntervals.delete(contactId);
    }
    this.messageCallbacks.delete(contactId);
  }

  public stopAllPolling() {
    this.pollingIntervals.forEach((interval) => clearInterval(interval));
    this.pollingIntervals.clear();
    this.messageCallbacks.clear();
  }

  public async sendTypingIndicator(contactId: string, isTyping: boolean): Promise<ApiResponse<void>> {
    const request: TypingIndicatorRequest = { contactId, isTyping };
    return apiClient.post('/webhook/messages/typing', request);
  }

  public async markMessagesAsRead(messageIds: string[], contactId: string): Promise<ApiResponse<void>> {
    const request: ReadReceiptRequest = { messageIds, contactId };
    return apiClient.post('/webhook/messages/read-receipt', request);
  }

  public async getMessageHistory(contactId: string, limit: number = 50, offset: number = 0): Promise<ApiResponse<MessageResponse[]>> {
    try {
      const response = await apiClient.get<MessageResponse[]>(`/webhook/messages/history/${contactId}`, {
        params: { limit, offset }
      });

      if (response.success && response.data) {
        const decryptedMessages = response.data.map(msg => this.decryptMessageResponse(msg));
        response.data = decryptedMessages;
      }

      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get message history',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // New method for searching messages
  public async searchMessages(query: string, contactId?: string): Promise<ApiResponse<Array<{
    id: string;
    content: string;
    timestamp: string;
    contactId: string;
    contactName: string;
  }>>> {
    try {
      const response = await apiClient.get('/webhook/messages/search', {
        params: { 
          q: query, 
          contactId,
          limit: 50 
        }
      });

      if (response.success && response.data) {
        // Decrypt search results
        const decryptedResults = response.data.map((result: any) => ({
          ...result,
          content: this.decryptContent(result.encryptedPayload)
        }));
        
        return {
          success: true,
          data: decryptedResults,
          timestamp: new Date().toISOString(),
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search messages',
        timestamp: new Date().toISOString(),
      };
    }
  }

  private decryptContent(encryptedPayload: string): string {
    try {
      const decrypted = encryptionService.decryptPayload(encryptedPayload);
      return decrypted.content || '';
    } catch (error) {
      console.error('Failed to decrypt message content:', error);
      return '[Encrypted Message]';
    }
  }

  private decryptMessageResponse(messageResponse: MessageResponse): MessageResponse {
    try {
      const decryptedPayload = encryptionService.decryptPayload(messageResponse.encryptedPayload);
      return {
        ...messageResponse,
        ...decryptedPayload,
      };
    } catch (error) {
      console.error('Failed to decrypt message:', error);
      return messageResponse;
    }
  }

  private convertToMessage(messageResponse: MessageResponse): Message {
    return {
      id: messageResponse.id,
      type: messageResponse.type,
      content: messageResponse.content,
      timestamp: new Date(messageResponse.timestamp),
      isSent: messageResponse.senderId === this.getCurrentUserId(),
      status: messageResponse.status,
      fileName: messageResponse.fileName,
      fileSize: messageResponse.fileSize,
      fileType: messageResponse.fileType,
      imageUrl: messageResponse.imageUrl,
      documentUrl: messageResponse.documentUrl,
    };
  }

  private getCurrentUserId(): string {
    // This should be implemented based on your auth system
    // For now, return a placeholder
    return 'current-user-id';
  }

  // Batch operations for performance
  public async sendBatchMessages(messages: Array<Omit<SendMessageRequest, 'encryptedPayload'>>): Promise<ApiResponse<MessageResponse[]>> {
    const requests = messages.map(msg => () => this.sendMessage(msg));
    return apiClient.batchRequest(requests);
  }

  public async markBatchMessagesAsRead(batches: Array<{ messageIds: string[], contactId: string }>): Promise<ApiResponse<void[]>> {
    const requests = batches.map(batch => () => this.markMessagesAsRead(batch.messageIds, batch.contactId));
    return apiClient.batchRequest(requests);
  }
}

export const messageService = new MessageService();