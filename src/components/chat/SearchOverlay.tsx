import React, { useState, useEffect } from 'react';
import { X, ChevronUp, ChevronDown } from 'lucide-react';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  searchResults: number[];
  currentIndex: number;
  onNavigateResult: (direction: 'prev' | 'next') => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  isOpen,
  onClose,
  onSearch,
  searchResults,
  currentIndex,
  onNavigateResult,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (query.trim()) {
      onSearch(query);
    } else {
      onSearch('');
    }
  }, [query, onSearch]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-3 z-50 safe-area-top">
      <div className="max-w-md mx-auto">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search messages..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              autoFocus
            />
          </div>
          
          {searchResults.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {currentIndex + 1} of {searchResults.length}
              </span>
              
              <div className="flex space-x-1">
                <button
                  onClick={() => onNavigateResult('prev')}
                  className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  disabled={searchResults.length === 0}
                >
                  <ChevronUp size={16} />
                </button>
                
                <button
                  onClick={() => onNavigateResult('next')}
                  className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  disabled={searchResults.length === 0}
                >
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>
          )}
          
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        {query && searchResults.length === 0 && (
          <div className="mt-2 text-sm text-gray-500">
            No messages found
          </div>
        )}
      </div>
    </div>
  );
};