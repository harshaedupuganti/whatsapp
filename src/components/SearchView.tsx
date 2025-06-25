import React, { useState, useMemo } from 'react';
import { Search, User, MessageSquare, File, Link, Clock } from 'lucide-react';
import { performSearch, rebuildSearchIndex, SearchResult } from '../utils/searchEngine';
import { chatHasRealMessages } from '../utils/chatStorage';

interface SearchViewProps {
  onNavigateToChat?: (contactId: string, searchQuery: string, messageId: string) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({ onNavigateToChat }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'contacts' | 'messages' | 'files' | 'links'>('all');

  const filters = [
    { id: 'all' as const, label: 'All', icon: Search },
    { id: 'contacts' as const, label: 'Contacts', icon: User },
    { id: 'messages' as const, label: 'Messages', icon: MessageSquare },
    { id: 'files' as const, label: 'Files', icon: File },
    { id: 'links' as const, label: 'Links', icon: Link },
  ];

  // Rebuild search index when component mounts to ensure fresh data
  React.useEffect(() => {
    rebuildSearchIndex();
  }, []);

  const filteredResults = useMemo(() => {
    // Allow search with just 1 character
    if (!searchQuery.trim()) return [];

    const allResults = performSearch(searchQuery);
    
    // Filter by active filter type
    if (activeFilter === 'all') {
      return allResults;
    }
    
    return allResults.filter(result => result.type === activeFilter);
  }, [searchQuery, activeFilter]);

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded">
          {part}
        </span>
      ) : part
    );
  };

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'contacts':
        return <User size={20} className="text-primary-600" />;
      case 'messages':
        return <MessageSquare size={20} className="text-green-600" />;
      case 'files':
        return <File size={20} className="text-blue-600" />;
      case 'links':
        return <Link size={20} className="text-purple-600" />;
      default:
        return <Search size={20} className="text-gray-600" />;
    }
  };

  const handleResultClick = (result: SearchResult) => {
    // Only navigate to chat for messages from active chats
    if (result.type === 'messages' && result.contactId && result.messageId && onNavigateToChat) {
      if (chatHasRealMessages(result.contactId)) {
        onNavigateToChat(result.contactId, searchQuery, result.messageId);
      }
    }
    // For other types, you could implement specific actions
    // For now, we'll just handle message navigation
  };

  const getResultPreview = (result: SearchResult) => {
    switch (result.type) {
      case 'contacts':
        return (
          <div className="flex items-center">
            <img
              src={result.profileImage}
              alt={result.title}
              className="w-10 h-10 rounded-full object-cover mr-3"
            />
            <div>
              <p className="font-medium text-gray-900">
                {highlightText(result.title, searchQuery)}
              </p>
              <p className="text-sm text-gray-500">{result.content}</p>
            </div>
          </div>
        );
      case 'messages':
        return (
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="font-medium text-gray-900 text-sm">
                {result.contactName}
              </p>
              <span className="text-xs text-gray-500">{result.timestamp}</span>
            </div>
            <p className="text-gray-700">
              {highlightText(result.content, searchQuery)}
            </p>
          </div>
        );
      case 'files':
        return (
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="font-medium text-gray-900 text-sm">
                {result.contactName}
              </p>
              <span className="text-xs text-gray-500">{result.timestamp}</span>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
                <File size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-gray-700 font-medium">
                  {highlightText(result.title, searchQuery)}
                </p>
                <p className="text-xs text-gray-500">
                  {result.fileType} • {result.fileSize}
                </p>
              </div>
            </div>
          </div>
        );
      case 'links':
        return (
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="font-medium text-gray-900 text-sm">
                {result.contactName}
              </p>
              <span className="text-xs text-gray-500">{result.timestamp}</span>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-2">
                <Link size={16} className="text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-700 font-medium">
                  {highlightText(result.title, searchQuery)}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {result.content}
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 bg-white flex flex-col">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search chats, contacts, messages, files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
          {filters.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveFilter(id)}
              className={`flex items-center px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200 ${
                activeFilter === id
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon size={16} className="mr-2" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {!searchQuery.trim() ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Search Everything
            </h3>
            <p className="text-gray-500 text-center leading-relaxed">
              Find conversations, contacts, shared files, and links across all your chats
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Start typing to search...
            </p>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Results Found
            </h3>
            <p className="text-gray-500 text-center">
              No matches found for "{searchQuery}"
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Try different keywords or check your spelling
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredResults.map((result) => (
              <div
                key={result.id}
                className={`p-4 transition-colors ${
                  result.type === 'messages' && result.contactId && chatHasRealMessages(result.contactId)
                    ? 'hover:bg-gray-50 cursor-pointer'
                    : result.type !== 'messages'
                    ? 'hover:bg-gray-50 cursor-pointer'
                    : 'opacity-50 cursor-not-allowed'
                }`}
                onClick={() => handleResultClick(result)}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3 mt-1">
                    {getResultIcon(result.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    {getResultPreview(result)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Results Count */}
      {searchQuery.trim() && filteredResults.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center text-sm text-gray-600">
            <Clock size={14} className="mr-1" />
            <span>
              {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} found
            </span>
          </div>
        </div>
      )}
    </div>
  );
};