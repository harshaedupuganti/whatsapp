import { apiClient } from './apiClient';
import { ContactSyncResponse, ApiResponse } from '../../types/api';
import { Contact } from '../../types/message';

class ContactService {
  private contactCache: Map<string, Contact> = new Map();
  private lastSyncTime: number = 0;
  private syncInterval: NodeJS.Timeout | null = null;

  public async syncContacts(): Promise<ApiResponse<Contact[]>> {
    try {
      const response = await apiClient.get<ContactSyncResponse>('/webhook/contacts/sync');
      
      if (response.success && response.data) {
        const contacts = response.data.contacts.map(this.convertToContact);
        
        // Update cache
        contacts.forEach(contact => {
          this.contactCache.set(contact.id, contact);
        });
        
        this.lastSyncTime = Date.now();
        
        return {
          success: true,
          data: contacts,
          timestamp: new Date().toISOString(),
        };
      }
      
      return response as ApiResponse<Contact[]>;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sync contacts',
        timestamp: new Date().toISOString(),
      };
    }
  }

  public async getContact(contactId: string): Promise<Contact | null> {
    // Check cache first
    const cachedContact = this.contactCache.get(contactId);
    if (cachedContact) {
      return cachedContact;
    }

    // Fetch from server
    try {
      const response = await apiClient.get<Contact>(`/webhook/contacts/${contactId}`);
      
      if (response.success && response.data) {
        const contact = this.convertToContact(response.data);
        this.contactCache.set(contactId, contact);
        return contact;
      }
    } catch (error) {
      console.error('Failed to fetch contact:', error);
    }

    return null;
  }

  public async updateContactStatus(contactId: string, isOnline: boolean, lastSeen?: Date): Promise<ApiResponse<void>> {
    const response = await apiClient.put(`/webhook/contacts/${contactId}/status`, {
      isOnline,
      lastSeen: lastSeen?.toISOString(),
    });

    // Update cache
    const cachedContact = this.contactCache.get(contactId);
    if (cachedContact) {
      this.contactCache.set(contactId, {
        ...cachedContact,
        isOnline,
        lastSeen,
      });
    }

    return response;
  }

  public async searchContacts(query: string): Promise<ApiResponse<Contact[]>> {
    try {
      const response = await apiClient.get<ContactSyncResponse>('/webhook/contacts/search', {
        params: { q: query, limit: 20 }
      });

      if (response.success && response.data) {
        const contacts = response.data.contacts.map(this.convertToContact);
        return {
          success: true,
          data: contacts,
          timestamp: new Date().toISOString(),
        };
      }

      return response as ApiResponse<Contact[]>;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search contacts',
        timestamp: new Date().toISOString(),
      };
    }
  }

  public startAutoSync(intervalMs: number = 300000) { // 5 minutes default
    this.stopAutoSync();
    
    this.syncInterval = setInterval(async () => {
      await this.syncContacts();
    }, intervalMs);
  }

  public stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  public getCachedContact(contactId: string): Contact | null {
    return this.contactCache.get(contactId) || null;
  }

  public getAllCachedContacts(): Contact[] {
    return Array.from(this.contactCache.values());
  }

  public shouldSync(): boolean {
    const fiveMinutes = 5 * 60 * 1000;
    return Date.now() - this.lastSyncTime > fiveMinutes;
  }

  private convertToContact(apiContact: any): Contact {
    return {
      id: apiContact.id,
      name: apiContact.name,
      profileImage: apiContact.profileImage,
      isOnline: apiContact.isOnline,
      lastSeen: apiContact.lastSeen ? new Date(apiContact.lastSeen) : undefined,
    };
  }

  // Presence management
  public async updateMyPresence(isOnline: boolean): Promise<ApiResponse<void>> {
    return apiClient.put('/webhook/contacts/my-presence', { isOnline });
  }

  public async getContactPresence(contactId: string): Promise<ApiResponse<{ isOnline: boolean; lastSeen?: string }>> {
    return apiClient.get(`/webhook/contacts/${contactId}/presence`);
  }
}

export const contactService = new ContactService();