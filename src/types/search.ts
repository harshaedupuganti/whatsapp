export type SearchFilter = 'all' | 'contacts' | 'messages' | 'files' | 'links';

export interface SearchResult {
  id: string;
  type: SearchFilter;
  title: string;
  content: string;
  timestamp: string;
  contactName?: string;
  profileImage?: string;
  fileSize?: string;
  fileType?: string;
  url?: string;
}