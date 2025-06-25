import React, { useState } from 'react';
import { HelpCircle, Phone, Shield, Mail, ChevronRight, X, MessageCircle } from 'lucide-react';

export const HelpSupport: React.FC = () => {
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);

  const supportNumber = '+1 (555) 123-HELP';
  const supportEmail = 'support@quiddity.com';

  const faqItems = [
    {
      question: 'How do I change my profile picture?',
      answer: 'Go to Settings > Profile, then click the camera icon on your profile picture to upload a new image.'
    },
    {
      question: 'Can I backup my chat history?',
      answer: 'Yes, your chat history is automatically backed up to your device\'s local storage. For cloud backup, enable sync in your account settings.'
    },
    {
      question: 'How do I mute notifications for specific chats?',
      answer: 'Open the chat, tap the contact name at the top, then select "Mute notifications" from the options menu.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, we use end-to-end encryption for all messages and follow industry-standard security practices. See our Privacy Policy for more details.'
    },
    {
      question: 'How do I delete my account?',
      answer: 'Contact our support team at support@quiddity.com to request account deletion. This action cannot be undone.'
    }
  ];

  const handleCallSupport = () => {
    window.location.href = `tel:${supportNumber}`;
  };

  const handleEmailSupport = () => {
    window.location.href = `mailto:${supportEmail}?subject=Quiddity ChatApp Support Request`;
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
              <HelpCircle className="text-purple-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Help & Support</h2>
              <p className="text-sm text-gray-500">Get assistance and find answers</p>
            </div>
          </div>

          {/* Contact Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 mb-4">Contact Our Support Team</h3>
            
            <button
              onClick={handleCallSupport}
              className="w-full flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100 hover:bg-green-100 transition-colors"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <Phone className="text-green-600" size={20} />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-green-900">Call Support</p>
                  <p className="text-sm text-green-600">{supportNumber}</p>
                  <p className="text-xs text-green-500">Available 24/7</p>
                </div>
              </div>
              <ChevronRight className="text-green-600" size={20} />
            </button>

            <button
              onClick={handleEmailSupport}
              className="w-full flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <Mail className="text-blue-600" size={20} />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-blue-900">Email Support</p>
                  <p className="text-sm text-blue-600">{supportEmail}</p>
                  <p className="text-xs text-blue-500">Response within 24 hours</p>
                </div>
              </div>
              <ChevronRight className="text-blue-600" size={20} />
            </button>
          </div>
        </div>

        {/* Resources */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Resources</h3>
          
          <div className="space-y-3">
            <button
              onClick={() => setShowFAQ(true)}
              className="w-full flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-100 hover:bg-orange-100 transition-colors"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                  <MessageCircle className="text-orange-600" size={20} />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-orange-900">Frequently Asked Questions</p>
                  <p className="text-sm text-orange-600">Find quick answers to common questions</p>
                </div>
              </div>
              <ChevronRight className="text-orange-600" size={20} />
            </button>

            <button
              onClick={() => setShowPrivacyPolicy(true)}
              className="w-full flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-100 hover:bg-purple-100 transition-colors"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <Shield className="text-purple-600" size={20} />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-purple-900">Privacy Policy</p>
                  <p className="text-sm text-purple-600">Learn how we protect your data</p>
                </div>
              </div>
              <ChevronRight className="text-purple-600" size={20} />
            </button>
          </div>
        </div>

        {/* App Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">App Information</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Version</span>
              <span className="font-medium text-gray-900">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Build</span>
              <span className="font-medium text-gray-900">2025.01.001</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Platform</span>
              <span className="font-medium text-gray-900">Web</span>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      {showPrivacyPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Privacy Policy</h2>
              <button
                onClick={() => setShowPrivacyPolicy(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="prose prose-sm max-w-none space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Collection</h3>
                  <p className="text-gray-600 leading-relaxed">We collect only the information necessary to provide our chat services, including your profile information, messages, and usage data to enhance your experience.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Security</h3>
                  <p className="text-gray-600 leading-relaxed">All messages are encrypted end-to-end using industry-standard encryption protocols. We use advanced security measures to protect your personal information from unauthorized access.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Usage</h3>
                  <p className="text-gray-600 leading-relaxed">Your data is used solely to provide and improve our chat services. We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Retention</h3>
                  <p className="text-gray-600 leading-relaxed">Messages are stored locally on your device and in our secure servers for backup purposes. You can delete your data at any time through the app settings.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Rights</h3>
                  <p className="text-gray-600 leading-relaxed">You have the right to access, modify, or delete your personal data. You can also request a copy of your data or ask us to stop processing it.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact Us</h3>
                  <p className="text-gray-600 leading-relaxed">If you have questions about this privacy policy, please contact us at privacy@quiddity.com or call our support line.</p>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">Last updated: January 2025</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Modal */}
      {showFAQ && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>
              <button
                onClick={() => setShowFAQ(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-6">
                {faqItems.map((item, index) => (
                  <div key={index} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                    <h3 className="font-semibold text-gray-900 mb-3">{item.question}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};