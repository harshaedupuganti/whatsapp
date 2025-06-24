import React from 'react';

export const TopBar: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-6 py-4 z-40 safe-area-top">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Quiddty ChatApp
        </h1>
      </div>
    </div>
  );
};