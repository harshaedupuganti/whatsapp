import React, { useState } from 'react';
import { LogIn, LogOut, Shield, User, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';

export const AuthenticationControls: React.FC = () => {
  const { state, login, logout } = useSettings();
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate authentication process
    setTimeout(() => {
      const mockUser = {
        id: 'user-' + Date.now(),
        displayName: loginData.email.split('@')[0],
        profileImage: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
        status: 'Hey there! I am using Quiddity ChatApp.',
        email: loginData.email,
        phoneNumber: '+1 (555) 123-4567'
      };

      login(mockUser);
      setShowLoginForm(false);
      setLoginData({ email: '', password: '' });
      setIsLoading(false);
    }, 1500);
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout? You will need to login again to access your chats.')) {
      logout();
    }
  };

  if (!state.auth.isAuthenticated) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
              <Shield className="text-red-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Authentication</h2>
              <p className="text-sm text-gray-500">Secure access to your account</p>
            </div>
          </div>

          {!showLoginForm ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="text-gray-400" size={28} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Not Logged In</h3>
              <p className="text-gray-500 mb-8 leading-relaxed">Please login to access your account and sync your data across devices</p>
              
              <button
                onClick={() => setShowLoginForm(true)}
                className="inline-flex items-center px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium shadow-sm"
              >
                <LogIn className="mr-2" size={18} />
                Login to Account
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Email Address
                </label>
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <LogIn className="mr-2" size={18} />
                  )}
                  {isLoading ? 'Logging in...' : 'Login'}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginForm(false);
                    setLoginData({ email: '', password: '' });
                  }}
                  className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors font-medium border border-gray-200"
                >
                  Cancel
                </button>
              </div>

              <div className="text-center pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Demo: Use any email and password to login
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
            <Shield className="text-green-600" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Authentication</h2>
            <p className="text-sm text-gray-500">Your account security status</p>
          </div>
        </div>

        {/* User Status */}
        <div className="p-4 bg-green-50 rounded-xl border border-green-100 mb-6">
          <div className="flex items-center">
            <img
              src={state.auth.user?.profileImage}
              alt="Profile"
              className="w-14 h-14 rounded-full object-cover mr-4 border-2 border-green-200"
            />
            <div className="flex-1">
              <div className="flex items-center mb-1">
                <h3 className="font-semibold text-green-900 mr-2">{state.auth.user?.displayName}</h3>
                <CheckCircle className="text-green-600" size={16} />
              </div>
              <p className="text-sm text-green-600 mb-1">{state.auth.user?.email}</p>
              {state.auth.lastLoginTime && (
                <p className="text-xs text-green-500">
                  Last login: {new Date(state.auth.lastLoginTime).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Security Info */}
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 mb-6">
          <div className="flex items-center mb-3">
            <Lock className="text-blue-600 mr-3" size={18} />
            <h3 className="font-semibold text-blue-900">Account Security</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-blue-600">Encryption</span>
              <span className="text-blue-900 font-medium">End-to-End</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-600">Authentication</span>
              <span className="text-blue-900 font-medium">Secure</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-600">Data Protection</span>
              <span className="text-blue-900 font-medium">Active</span>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-6 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium border border-red-200"
        >
          <LogOut className="mr-2" size={18} />
          Logout from Account
        </button>
      </div>
    </div>
  );
};