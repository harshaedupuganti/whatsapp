import React from 'react';

interface TypingIndicatorProps {
  contactName: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ contactName }) => {
  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl bg-gray-200 rounded-bl-md">
        <div className="flex items-center space-x-1">
          <span className="text-sm text-gray-600">{contactName} is typing</span>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};