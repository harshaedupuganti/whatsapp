import { Message, Contact } from '../types/message';

// Mock contacts data for different users
export const mockContacts: { [key: string]: Contact } = {
  '1': {
    id: '1',
    name: 'Sarah Johnson',
    profileImage: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    isOnline: true,
    lastSeen: new Date(Date.now() - 300000), // 5 minutes ago
  },
  '2': {
    id: '2',
    name: 'Mike Chen',
    profileImage: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    isOnline: false,
    lastSeen: new Date(Date.now() - 900000), // 15 minutes ago
  },
  '3': {
    id: '3',
    name: 'Emma Wilson',
    profileImage: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    isOnline: false,
    lastSeen: new Date(Date.now() - 3600000), // 1 hour ago
  },
  '4': {
    id: '4',
    name: 'David Rodriguez',
    profileImage: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    isOnline: true,
    lastSeen: new Date(Date.now() - 10800000), // 3 hours ago
  },
  '5': {
    id: '5',
    name: 'Lisa Park',
    profileImage: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    isOnline: false,
    lastSeen: new Date(Date.now() - 86400000), // Yesterday
  },
  '6': {
    id: '6',
    name: 'Alex Thompson',
    profileImage: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    isOnline: false,
    lastSeen: new Date(Date.now() - 86400000), // Yesterday
  },
  '7': {
    id: '7',
    name: 'Rachel Green',
    profileImage: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    isOnline: false,
    lastSeen: new Date(Date.now() - 172800000), // 2 days ago
  },
  '8': {
    id: '8',
    name: 'James Wilson',
    profileImage: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    isOnline: false,
    lastSeen: new Date(Date.now() - 259200000), // 3 days ago
  },
};

// Mock messages data for different users
export const mockMessagesData: { [key: string]: Message[] } = {
  '1': [
    {
      id: '1',
      type: 'text',
      content: 'Hey! How are you doing today?',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      isSent: false,
      status: 'read',
    },
    {
      id: '2',
      type: 'text',
      content: 'I\'m doing great! Just finished the project presentation. How did your meeting go?',
      timestamp: new Date(Date.now() - 3540000), // 59 minutes ago
      isSent: true,
      status: 'read',
    },
    {
      id: '3',
      type: 'image',
      content: 'Check out this amazing sunset from my office!',
      imageUrl: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      timestamp: new Date(Date.now() - 3480000), // 58 minutes ago
      isSent: false,
      status: 'read',
    },
    {
      id: '4',
      type: 'text',
      content: 'Wow, that\'s beautiful! 😍 The colors are incredible.',
      timestamp: new Date(Date.now() - 3420000), // 57 minutes ago
      isSent: true,
      status: 'read',
    },
    {
      id: '5',
      type: 'document',
      content: 'Here\'s the report we discussed. Let me know what you think!',
      fileName: 'Q4_Financial_Report.pdf',
      fileSize: '2.4 MB',
      fileType: 'PDF',
      documentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      timestamp: new Date(Date.now() - 3360000), // 56 minutes ago
      isSent: false,
      status: 'read',
    },
    {
      id: '6',
      type: 'text',
      content: 'Thanks! I\'ll review it this afternoon and get back to you with feedback.',
      timestamp: new Date(Date.now() - 3300000), // 55 minutes ago
      isSent: true,
      status: 'read',
    },
    {
      id: '7',
      type: 'text',
      content: 'Perfect! Also, don\'t forget about the team lunch tomorrow at 12:30 PM. The restaurant is https://example-restaurant.com/menu',
      timestamp: new Date(Date.now() - 3240000), // 54 minutes ago
      isSent: false,
      status: 'read',
    },
    {
      id: '8',
      type: 'text',
      content: 'Already marked it in my calendar! Looking forward to it 🍽️',
      timestamp: new Date(Date.now() - 3180000), // 53 minutes ago
      isSent: true,
      status: 'read',
    },
    {
      id: '9',
      type: 'text',
      content: 'Great! See you tomorrow then. Have a wonderful evening! ✨',
      timestamp: new Date(Date.now() - 3120000), // 52 minutes ago
      isSent: false,
      status: 'read',
    },
    {
      id: '10',
      type: 'text',
      content: 'You too! Thanks for everything today 😊',
      timestamp: new Date(Date.now() - 3060000), // 51 minutes ago
      isSent: true,
      status: 'delivered',
    },
  ],
  '2': [
    {
      id: '1',
      type: 'text',
      content: 'Thanks for the help with the project!',
      timestamp: new Date(Date.now() - 900000), // 15 minutes ago
      isSent: false,
      status: 'read',
    },
    {
      id: '2',
      type: 'text',
      content: 'No problem! Happy to help anytime.',
      timestamp: new Date(Date.now() - 840000), // 14 minutes ago
      isSent: true,
      status: 'delivered',
    },
    {
      id: '3',
      type: 'document',
      content: 'Here are the updated specs',
      fileName: 'Project_Specifications_v3.docx',
      fileSize: '1.2 MB',
      fileType: 'DOCX',
      documentUrl: '#',
      timestamp: new Date(Date.now() - 780000), // 13 minutes ago
      isSent: false,
      status: 'read',
    },
  ],
  '3': [
    {
      id: '1',
      type: 'text',
      content: 'Can you send me the presentation slides?',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      isSent: false,
      status: 'read',
    },
    {
      id: '2',
      type: 'text',
      content: 'Sure! I\'ll send them over in a few minutes.',
      timestamp: new Date(Date.now() - 3540000), // 59 minutes ago
      isSent: true,
      status: 'sent',
    },
  ],
  '4': [
    {
      id: '1',
      type: 'text',
      content: 'Great meeting today! Let\'s follow up next week.',
      timestamp: new Date(Date.now() - 10800000), // 3 hours ago
      isSent: false,
      status: 'read',
    },
    {
      id: '2',
      type: 'text',
      content: 'Absolutely! I\'ll send you a calendar invite.',
      timestamp: new Date(Date.now() - 10740000), // 2 hours 59 minutes ago
      isSent: true,
      status: 'read',
    },
  ],
  '5': [
    {
      id: '1',
      type: 'text',
      content: 'Happy birthday! Hope you have a wonderful day 🎉',
      timestamp: new Date(Date.now() - 86400000), // Yesterday
      isSent: false,
      status: 'read',
    },
    {
      id: '2',
      type: 'text',
      content: 'Thank you so much! That means a lot 😊',
      timestamp: new Date(Date.now() - 86340000), // Yesterday
      isSent: true,
      status: 'delivered',
    },
  ],
  '6': [
    {
      id: '1',
      type: 'text',
      content: 'The new design looks amazing! 👏',
      timestamp: new Date(Date.now() - 86400000), // Yesterday
      isSent: false,
      status: 'read',
    },
    {
      id: '2',
      type: 'text',
      content: 'Thanks! I put a lot of work into it.',
      timestamp: new Date(Date.now() - 86340000), // Yesterday
      isSent: true,
      status: 'sent',
    },
    {
      id: '3',
      type: 'image',
      content: 'Here\'s the final mockup',
      imageUrl: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      timestamp: new Date(Date.now() - 86280000), // Yesterday
      isSent: true,
      status: 'delivered',
    },
  ],
  '7': [
    {
      id: '1',
      type: 'text',
      content: 'See you at the conference next month!',
      timestamp: new Date(Date.now() - 172800000), // 2 days ago
      isSent: false,
      status: 'read',
    },
    {
      id: '2',
      type: 'text',
      content: 'Looking forward to it! Should be great.',
      timestamp: new Date(Date.now() - 172740000), // 2 days ago
      isSent: true,
      status: 'delivered',
    },
  ],
  '8': [
    {
      id: '1',
      type: 'text',
      content: 'Could you review the code changes?',
      timestamp: new Date(Date.now() - 259200000), // 3 days ago
      isSent: false,
      status: 'read',
    },
    {
      id: '2',
      type: 'text',
      content: 'I\'ll take a look this afternoon.',
      timestamp: new Date(Date.now() - 259140000), // 3 days ago
      isSent: true,
      status: 'sent',
    },
  ],
};

// Helper functions to get data for a specific contact
export const getContactById = (contactId: string): Contact | null => {
  return mockContacts[contactId] || null;
};

export const getMessagesByContactId = (contactId: string): Message[] => {
  return mockMessagesData[contactId] || [];
};

// Legacy exports for backward compatibility
export const mockContact = mockContacts['1'];
export const mockMessages = mockMessagesData['1'];