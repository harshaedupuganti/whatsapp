import React, { useState } from 'react';
import { X, Search, UserPlus, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { contactService } from '../services/n8n/contactService';
import { useN8nChatContext } from '../contexts/N8nChatContext';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchedUser {
  id: string;
  displayName: string;
  email: string;
  profileImage: string;
  isOnline: boolean;
}

export const AddContactModal: React.FC<AddContactModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { refreshChats } = useN8nChatContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchedUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await contactService.searchUsers(searchQuery);
      
      if (response.success && response.data) {
        setSearchResults(response.data);
      } else {
        setError(response.error || 'Failed to search users');
        setSearchResults([]);
      }
    } catch (err) {
      setError('Failed to search users');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddContact = async (user: SearchedUser) => {
    setIsAdding(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await contactService.addContact(user.id, user.displayName);
      
      if (response.success) {
        setSuccess(`${user.displayName} has been added to your contacts!`);
        setSearchResults([]);
        setSearchQuery('');
        
        // Refresh the chat list to show the new contact
        await refreshChats();
        
        // Close modal after a short delay
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(response.error || 'Failed to add contact');
      }
    } catch (err) {
      setError('Failed to add contact');
    } finally {
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setError(null);
    setSuccess(null);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <UserPlus className="text-blue-600" size={20} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Add Contact</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Search Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Search by email or display name
            </label>
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter email or name..."
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
              <button
                onClick={handleSearch}
                disabled={!searchQuery.trim() || isSearching}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSearching ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Search size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 rounded-xl border border-red-200">
              <div className="flex items-center">
                <AlertCircle className="text-red-600 mr-3" size={20} />
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center">
                <CheckCircle className="text-green-600 mr-3" size={20} />
                <p className="text-green-700 font-medium">{success}</p>
              </div>
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              <h3 className="font-medium text-gray-900 mb-3">Search Results</h3>
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center flex-1">
                    <div className="relative mr-3">
                      <img
                        src={user.profileImage}
                        alt={user.displayName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {user.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{user.displayName}</h4>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleAddContact(user)}
                    disabled={isAdding}
                    className="ml-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isAdding ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <>
                        <UserPlus size={16} className="mr-1" />
                        Add
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {searchQuery && !isSearching && searchResults.length === 0 && !error && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-gray-400" size={24} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-500">
                No users found matching "{searchQuery}". Try a different search term.
              </p>
            </div>
          )}

          {/* Instructions */}
          {!searchQuery && searchResults.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="text-blue-600" size={24} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Find New Contacts</h3>
              <p className="text-gray-500 leading-relaxed">
                Search for users by their email address or display name to add them to your contacts.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};