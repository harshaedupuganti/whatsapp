import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { AddContactModal } from './AddContactModal';

export const TopBar: React.FC = () => {
  const [showAddContact, setShowAddContact] = useState(false);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-6 py-4 z-40 safe-area-top">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Quiddty ChatApp
          </h1>
          
          <button
            onClick={() => setShowAddContact(true)}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
            title="Add Contact"
          >
            <UserPlus size={18} className="mr-2" />
            <span className="hidden sm:inline">Add Contact</span>
          </button>
        </div>
      </div>

      <AddContactModal
        isOpen={showAddContact}
        onClose={() => setShowAddContact(false)}
      />
    </>
  );
};