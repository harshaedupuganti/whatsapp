// Enhanced search engine for WhatsApp-like functionality
import { mockContacts } from '../data/mockMessages';
import { mockSearchData } from '../data/mockSearchData';
import { loadAllMessagesFromStorage, chatHasRealMessages, getChatMetadata } from './chatStorage';

export interface SearchResult {
  id: string;
  type: 'contacts' | 'messages' | 'files' | 'links';
  title: string;
  content: string;
  timestamp: string;
  contactName?: string;
  contactId?: string;
  messageId?: string;
  profileImage?: string;
  fileSize?: string;
  fileType?: string;
  url?: string;
  relevanceScore: number;
}

export interface SearchIndex {
  contacts: Array<{
    id: string;
    name: string;
    profileImage: string;
    searchableText: string;
  }>;
  messages: Array<{
    id: string;
    contactId: string;
    contactName: string;
    content: string;
    timestamp: string;
    type: string;
    searchableText: string;
  }>;
  files: Array<{
    id: string;
    contactId: string;
    contactName: string;
    fileName: string;
    fileType: string;
    fileSize: string;
    timestamp: string;
    searchableText: string;
  }>;
  links: Array<{
    id: string;
    contactId: string;
    contactName: string;
    url: string;
    title: string;
    timestamp: string;
    searchableText: string;
  }>;
}

class SearchEngine {
  private searchIndex: SearchIndex = {
    contacts: [],
    messages: [],
    files: [],
    links: []
  };

  constructor() {
    this.buildSearchIndex();
  }

  // Build comprehensive search index
  private buildSearchIndex() {
    this.indexContacts();
    this.indexMessages();
    this.indexFilesAndLinks();
  }

  // Index all contacts (even without active chats)
  private indexContacts() {
    this.searchIndex.contacts = Object.values(mockContacts).map(contact => ({
      id: contact.id,
      name: contact.name,
      profileImage: contact.profileImage,
      searchableText: contact.name.toLowerCase()
    }));
  }

  // Index all non-deleted messages from active chats
  private indexMessages() {
    const allMessages = loadAllMessagesFromStorage();
    this.searchIndex.messages = [];

    Object.entries(allMessages).forEach(([contactId, messages]) => {
      // Skip deleted/cleared chats completely
      if (!chatHasRealMessages(contactId)) return;

      const contact = mockContacts[contactId];
      if (!contact) return;

      messages.forEach(message => {
        if (message.type === 'text' && message.content.trim()) {
          this.searchIndex.messages.push({
            id: message.id,
            contactId,
            contactName: contact.name,
            content: message.content,
            timestamp: message.timestamp,
            type: message.type,
            searchableText: message.content.toLowerCase()
          });
        }
      });
    });
  }

  // Index files and links from mock data (excluding deleted chats)
  private indexFilesAndLinks() {
    this.searchIndex.files = [];
    this.searchIndex.links = [];

    mockSearchData.forEach(item => {
      // Skip items from deleted chats
      if (item.contactId && !chatHasRealMessages(item.contactId)) {
        return;
      }

      if (item.type === 'files') {
        this.searchIndex.files.push({
          id: item.id,
          contactId: item.contactId || '',
          contactName: item.contactName || '',
          fileName: item.title,
          fileType: item.fileType || 'FILE',
          fileSize: item.fileSize || '0 MB',
          timestamp: item.timestamp,
          searchableText: item.title.toLowerCase()
        });
      } else if (item.type === 'links') {
        this.searchIndex.links.push({
          id: item.id,
          contactId: item.contactId || '',
          contactName: item.contactName || '',
          url: item.url || item.content,
          title: item.title,
          timestamp: item.timestamp,
          searchableText: `${item.title} ${item.content}`.toLowerCase()
        });
      }
    });
  }

  // Calculate relevance score based on match quality and recency
  private calculateRelevanceScore(searchableText: string, query: string, timestamp?: string): number {
    const lowerQuery = query.toLowerCase();
    const lowerText = searchableText.toLowerCase();
    
    let score = 0;
    
    // Exact match gets highest score
    if (lowerText === lowerQuery) {
      score += 100;
    }
    // Starts with query gets high score
    else if (lowerText.startsWith(lowerQuery)) {
      score += 80;
    }
    // Contains query as whole word gets medium score
    else if (new RegExp(`\\b${lowerQuery}\\b`).test(lowerText)) {
      score += 60;
    }
    // Contains query anywhere gets lower score
    else if (lowerText.includes(lowerQuery)) {
      score += 40;
    }
    
    // Add recency bonus for messages
    if (timestamp) {
      const messageTime = new Date(timestamp).getTime();
      const now = Date.now();
      const daysDiff = (now - messageTime) / (1000 * 60 * 60 * 24);
      
      // More recent messages get higher scores
      if (daysDiff < 1) score += 20;
      else if (daysDiff < 7) score += 10;
      else if (daysDiff < 30) score += 5;
    }
    
    return score;
  }

  // Main search function - requires at least 1 character
  public search(query: string): SearchResult[] {
    // Return empty results for empty queries
    if (!query || query.trim().length === 0) {
      return [];
    }

    const trimmedQuery = query.trim();
    const results: SearchResult[] = [];

    // Search contacts
    this.searchIndex.contacts.forEach(contact => {
      if (contact.searchableText.includes(trimmedQuery.toLowerCase())) {
        const relevanceScore = this.calculateRelevanceScore(contact.searchableText, trimmedQuery);
        results.push({
          id: `contact-${contact.id}`,
          type: 'contacts',
          title: contact.name,
          content: 'Contact',
          timestamp: 'Contact',
          profileImage: contact.profileImage,
          relevanceScore
        });
      }
    });

    // Search messages
    this.searchIndex.messages.forEach(message => {
      if (message.searchableText.includes(trimmedQuery.toLowerCase())) {
        const relevanceScore = this.calculateRelevanceScore(message.searchableText, trimmedQuery, message.timestamp);
        results.push({
          id: `message-${message.contactId}-${message.id}`,
          type: 'messages',
          title: message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''),
          content: message.content,
          timestamp: new Date(message.timestamp).toLocaleString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          }),
          contactName: message.contactName,
          contactId: message.contactId,
          messageId: message.id,
          relevanceScore
        });
      }
    });

    // Search files
    this.searchIndex.files.forEach(file => {
      if (file.searchableText.includes(trimmedQuery.toLowerCase())) {
        const relevanceScore = this.calculateRelevanceScore(file.searchableText, trimmedQuery);
        results.push({
          id: `file-${file.id}`,
          type: 'files',
          title: file.fileName,
          content: `${file.fileType} Document`,
          timestamp: file.timestamp,
          contactName: file.contactName,
          contactId: file.contactId,
          fileSize: file.fileSize,
          fileType: file.fileType,
          relevanceScore
        });
      }
    });

    // Search links
    this.searchIndex.links.forEach(link => {
      if (link.searchableText.includes(trimmedQuery.toLowerCase())) {
        const relevanceScore = this.calculateRelevanceScore(link.searchableText, trimmedQuery);
        results.push({
          id: `link-${link.id}`,
          type: 'links',
          title: link.title,
          content: link.url,
          timestamp: link.timestamp,
          contactName: link.contactName,
          contactId: link.contactId,
          url: link.url,
          relevanceScore
        });
      }
    });

    // Sort by relevance score (highest first), then by recency
    return results.sort((a, b) => {
      if (a.relevanceScore !== b.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      
      // If same relevance, sort by timestamp (most recent first)
      const timeA = new Date(a.timestamp).getTime() || 0;
      const timeB = new Date(b.timestamp).getTime() || 0;
      return timeB - timeA;
    });
  }

  // Rebuild index when data changes
  public rebuildIndex() {
    this.buildSearchIndex();
  }

  // Get search suggestions for autocomplete
  public getSuggestions(query: string, limit: number = 5): string[] {
    if (!query || query.trim().length === 0) return [];

    const suggestions = new Set<string>();
    const lowerQuery = query.toLowerCase();

    // Get suggestions from contacts
    this.searchIndex.contacts.forEach(contact => {
      if (contact.name.toLowerCase().includes(lowerQuery)) {
        suggestions.add(contact.name);
      }
    });

    // Get suggestions from recent messages
    this.searchIndex.messages
      .slice(0, 50) // Only check recent messages for performance
      .forEach(message => {
        const words = message.content.toLowerCase().split(' ');
        words.forEach(word => {
          if (word.startsWith(lowerQuery) && word.length > lowerQuery.length) {
            suggestions.add(word);
          }
        });
      });

    return Array.from(suggestions).slice(0, limit);
  }
}

// Export singleton instance
export const searchEngine = new SearchEngine();

// Export utility functions
export const performSearch = (query: string): SearchResult[] => {
  return searchEngine.search(query);
};

export const rebuildSearchIndex = () => {
  searchEngine.rebuildIndex();
};

export const getSearchSuggestions = (query: string, limit?: number): string[] => {
  return searchEngine.getSuggestions(query, limit);
};