import React from 'react';
import { Check, CheckCheck } from 'lucide-react';
import { MessageStatus } from '../types/chat';

interface MessageStatusIconProps {
  status: MessageStatus;
  showIcon?: boolean; // New prop to control visibility
}

export const MessageStatusIcon: React.FC<MessageStatusIconProps> = ({ status, showIcon = true }) => {
  // Don't show any icon if showIcon is false (for cleared chats)
  if (!showIcon) {
    return null;
  }

  switch (status.type) {
    case 'sent':
      return <Check size={16} className="text-gray-400" />;
    case 'delivered':
      return <CheckCheck size={16} className="text-gray-400" />;
    case 'seen':
      return <CheckCheck size={16} className="text-blue-500" />;
    default:
      return null;
  }
};