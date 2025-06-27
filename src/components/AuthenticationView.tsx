import React, { useState } from 'react';
import { LogIn, UserPlus, Shield, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useN8nAuth } from '../hooks/useN8nAuth';

export const AuthenticationView: React.FC = () => {
  const { login, register, isLoading, error, clearError } = useN8nAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    phoneNumber: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (isLoginMode) {
      await login({
        email: formData.email,
        password: formData.password
      });
    } else {
      await register({
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName,
        phoneNumber: formData.phoneNumber
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    clearError();
    setFormData({
      email: '',
      password: '',
      displayName: '',
      phoneNumber: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiddity ChatApp</h1>
          <p className="text-gray-600">
            {isLoginMode ? 'Welcome back! Please sign in to continue.' : 'Create your account to get started.'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              {isLoginMode ? <LogIn className="text-blue-600" size={20} /> : <UserPlus className="text-blue-600" size={20} />}
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isLoginMode ? 'Sign In' : 'Create Account'}
            </h2>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-200">
              <div className="flex items-center">
                <AlertCircle className="text-red-600 mr-3" size={20} />
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLoginMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Display Name
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your display name"
                  required={!isLoginMode}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
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
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
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

            {!isLoginMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your phone number"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : isLoginMode ? (
                <LogIn className="mr-2" size={18} />
              ) : (
                <UserPlus className="mr-2" size={18} />
              )}
              {isLoading ? 'Please wait...' : isLoginMode ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={toggleMode}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              {isLoginMode 
                ? "Don't have an account? Create one" 
                : "Already have an account? Sign in"
              }
            </button>
          </div>

          {isLoginMode && (
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-center mb-2">
                <CheckCircle className="text-blue-600 mr-2" size={16} />
                <p className="text-sm font-medium text-blue-900">Demo Mode</p>
              </div>
              <p className="text-xs text-blue-700">
                Use any email and password to login for demonstration purposes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};