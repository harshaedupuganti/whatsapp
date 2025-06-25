import React from 'react';
import { Bell, Volume2, Vibrate, Eye, TestTube } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';

export const NotificationSettings: React.FC = () => {
  const { state, updateNotifications } = useSettings();

  const soundOptions = [
    { value: 'default', label: 'Default', description: 'System default notification sound' },
    { value: 'silent', label: 'Silent', description: 'No sound for notifications' },
    { value: 'custom', label: 'Custom', description: 'Use custom notification sound' }
  ];

  const handleToggle = (key: keyof typeof state.notifications) => {
    updateNotifications({
      [key]: !state.notifications[key]
    });
  };

  const handleSoundChange = (sound: 'default' | 'silent' | 'custom') => {
    updateNotifications({ notificationSound: sound });
  };

  const testNotification = () => {
    if (state.notifications.messageAlerts && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Quiddity ChatApp', {
          body: 'This is a test notification! 🔔',
          icon: '/vite.svg'
        });
      } else {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('Quiddity ChatApp', {
              body: 'This is a test notification! 🔔',
              icon: '/vite.svg'
            });
          }
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
            <Bell className="text-green-600" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Notification Settings</h2>
            <p className="text-sm text-gray-500">Configure how you receive notifications</p>
          </div>
        </div>

        {/* Message Alerts */}
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <Bell className="text-green-600" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-green-900">Message Alerts</h3>
                <p className="text-sm text-green-600">Get notified when you receive new messages</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('messageAlerts')}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                state.notifications.messageAlerts ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${
                  state.notifications.messageAlerts ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Vibration */}
          <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                <Vibrate className="text-purple-600" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-purple-900">Vibration</h3>
                <p className="text-sm text-purple-600">Vibrate device when receiving notifications</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('vibration')}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                state.notifications.vibration ? 'bg-purple-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${
                  state.notifications.vibration ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Show Preview */}
          <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                <Eye className="text-orange-600" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-orange-900">Show Preview</h3>
                <p className="text-sm text-orange-600">Display message content in notifications</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('showPreview')}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                state.notifications.showPreview ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${
                  state.notifications.showPreview ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Sound Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <Volume2 className="text-blue-600" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Sound Settings</h3>
            <p className="text-sm text-gray-500">Choose your notification sound</p>
          </div>
        </div>
        
        <div className="space-y-3">
          {soundOptions.map((option) => (
            <label 
              key={option.value} 
              className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                state.notifications.notificationSound === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="notificationSound"
                value={option.value}
                checked={state.notifications.notificationSound === option.value}
                onChange={() => handleSoundChange(option.value as any)}
                className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <div className="ml-4">
                <span className="font-medium text-gray-900">{option.label}</span>
                <p className="text-sm text-gray-500">{option.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Test Notification */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TestTube className="text-blue-600" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Test Your Settings</h3>
          <p className="text-gray-500 mb-6">Send a test notification to see how your settings work</p>
          
          <button
            onClick={testNotification}
            disabled={!state.notifications.messageAlerts}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send Test Notification
          </button>
          
          {!state.notifications.messageAlerts && (
            <p className="text-sm text-gray-400 mt-2">Enable message alerts to test notifications</p>
          )}
        </div>
      </div>
    </div>
  );
};