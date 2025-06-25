import React from 'react';
import { Check, CheckCheck, Eye, FileText, Image as ImageIcon } from 'lucide-react';
import { Message } from '../../types/message';

interface MessageBubbleProps {
  message: Message;
  onImageClick?: (imageUrl: string) => void;
  onDocumentPreview?: (documentUrl: string, fileName: string) => void;
  searchQuery?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onImageClick,
  onDocumentPreview,
  searchQuery,
}) => {
  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusIcon = () => {
    if (!message.isSent) return null;
    
    switch (message.status) {
      case 'sending':
        return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />;
      case 'sent':
        return <Check size={16} className="text-white opacity-70" />;
      case 'delivered':
        return <CheckCheck size={16} className="text-white opacity-70" />;
      case 'read':
        return <CheckCheck size={16} className="text-blue-400" />;
      default:
        return null;
    }
  };

  const highlightText = (text: string, query?: string) => {
    if (!query || !query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-300 text-yellow-900 px-1 rounded">
          {part}
        </span>
      ) : part
    );
  };

  const linkifyText = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline"
          >
            {part}
          </a>
        );
      }
      return highlightText(part, searchQuery);
    });
  };

  const renderMessageContent = () => {
    switch (message.type) {
      case 'text':
        return (
          <div className="text-sm leading-relaxed">
            {linkifyText(message.content)}
          </div>
        );
      
      case 'image':
        return (
          <div className="space-y-2">
            <div
              className="relative rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => onImageClick?.(message.imageUrl!)}
            >
              <img
                src={message.imageUrl}
                alt="Shared image"
                className="w-full max-w-xs h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all flex items-center justify-center">
                <ImageIcon className="text-white opacity-0 hover:opacity-100 transition-opacity" size={24} />
              </div>
            </div>
            {message.content && (
              <div className="text-sm leading-relaxed">
                {linkifyText(message.content)}
              </div>
            )}
          </div>
        );
      
      case 'document':
        return (
          <div className="space-y-2">
            <div
              className="flex items-center p-3 bg-white bg-opacity-20 rounded-lg cursor-pointer hover:bg-opacity-30 transition-all"
              onClick={() => onDocumentPreview?.(message.documentUrl!, message.fileName!)}
            >
              <div className="flex-shrink-0 w-10 h-10 bg-white bg-opacity-30 rounded-lg flex items-center justify-center mr-3">
                <FileText size={20} className={message.isSent ? 'text-white' : 'text-gray-600'} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {message.fileName}
                </p>
                <p className="text-xs opacity-70">
                  {message.fileSize} • {message.fileType}
                </p>
              </div>
              <Eye size={16} className={`ml-2 ${message.isSent ? 'text-white' : 'text-gray-600'} opacity-70`} />
            </div>
            {message.content && (
              <div className="text-sm leading-relaxed">
                {linkifyText(message.content)}
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`flex mb-4 ${message.isSent ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
        message.isSent
          ? 'bg-blue-500 text-white rounded-br-md'
          : 'bg-gray-200 text-gray-900 rounded-bl-md'
      }`}>
        {renderMessageContent()}
        
        <div className={`flex items-center justify-end mt-2 space-x-1 ${
          message.isSent ? 'text-white' : 'text-gray-500'
        }`}>
          <span className="text-xs opacity-70">
            {formatTime(message.timestamp)}
          </span>
          {getStatusIcon()}
        </div>
      </div>
    </div>
  );
};