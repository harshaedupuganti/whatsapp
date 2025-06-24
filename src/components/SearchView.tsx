import React, { useState } from 'react';
import { Search } from 'lucide-react';

export const SearchView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex-1 bg-white p-6">
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search chats, contacts, messages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
        />
      </div>
      
      <div className="text-center py-12">
        <Search className="mx-auto mb-4 text-gray-300" size={48} />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Search Messages</h3>
        <p className="text-gray-500">
          Find conversations, contacts, and messages quickly
        </p>
      </div>
    </div>
  );
};