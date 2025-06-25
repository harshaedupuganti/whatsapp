import React, { useState, useRef } from 'react';
import { User, Camera, Edit3, Save, X, ArrowLeft } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';

export const ProfileSection: React.FC = () => {
  const { state, updateProfile } = useSettings();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    displayName: state.profile.displayName,
    status: state.profile.status
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    updateProfile({
      displayName: editData.displayName,
      status: editData.status,
      ...(previewImage && { profileImage: previewImage })
    });
    setIsEditing(false);
    setPreviewImage(null);
  };

  const handleCancel = () => {
    setEditData({
      displayName: state.profile.displayName,
      status: state.profile.status
    });
    setPreviewImage(null);
    setIsEditing(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const currentImage = previewImage || state.profile.profileImage;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <User className="text-blue-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
              <p className="text-sm text-gray-500">Manage your personal information</p>
            </div>
          </div>
          
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
            >
              <Edit3 size={16} className="mr-2" />
              Edit
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Save size={16} className="mr-2" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
              >
                <X size={16} className="mr-2" />
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Profile Picture Section */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
          <div className="relative">
            <img
              src={currentImage}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 shadow-sm"
            />
            {isEditing && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg border-2 border-white"
              >
                <Camera size={16} />
              </button>
            )}
          </div>
          
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-semibold text-gray-900 mb-2">Profile Picture</h3>
            <p className="text-sm text-gray-500 mb-3">
              {isEditing ? 'Click the camera icon to upload a new photo' : 'Your profile photo visible to other users'}
            </p>
            {previewImage && (
              <div className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                New image selected
              </div>
            )}
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Display Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editData.displayName}
                onChange={(e) => setEditData(prev => ({ ...prev, displayName: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter your display name"
                maxLength={50}
              />
            ) : (
              <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium">
                {state.profile.displayName}
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Status Message
            </label>
            {isEditing ? (
              <div>
                <textarea
                  value={editData.status}
                  onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="What's on your mind?"
                  rows={3}
                  maxLength={100}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">Share what you're up to with your contacts</p>
                  <span className={`text-xs font-medium ${editData.status.length > 90 ? 'text-red-500' : 'text-gray-400'}`}>
                    {editData.status.length}/100
                  </span>
                </div>
              </div>
            ) : (
              <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-700">
                {state.profile.status}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-600 flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
              {state.profile.email || 'Not provided'}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-600 flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {state.profile.phoneNumber || 'Not provided'}
            </div>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />
    </div>
  );
};