import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { UserProfile, NotificationSettings, AppSettings, AuthState, SettingsState } from '../types/settings';

type SettingsAction =
  | { type: 'UPDATE_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'UPDATE_NOTIFICATIONS'; payload: Partial<NotificationSettings> }
  | { type: 'UPDATE_APP_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'SET_AUTH_STATE'; payload: AuthState }
  | { type: 'LOGIN'; payload: UserProfile }
  | { type: 'LOGOUT' }
  | { type: 'LOAD_SETTINGS'; payload: SettingsState };

const defaultProfile: UserProfile = {
  id: 'user-1',
  displayName: 'John Doe',
  profileImage: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  status: 'Hey there! I am using Quiddity ChatApp.',
  email: 'john.doe@example.com',
  phoneNumber: '+1 (555) 123-4567'
};

const defaultNotifications: NotificationSettings = {
  messageAlerts: true,
  notificationSound: 'default',
  vibration: true,
  showPreview: true
};

const defaultAppSettings: AppSettings = {
  theme: 'light',
  language: 'en',
  fontSize: 'medium'
};

const defaultAuthState: AuthState = {
  isAuthenticated: true,
  user: defaultProfile,
  lastLoginTime: new Date().toISOString()
};

const initialState: SettingsState = {
  profile: defaultProfile,
  notifications: defaultNotifications,
  app: defaultAppSettings,
  auth: defaultAuthState
};

const settingsReducer = (state: SettingsState, action: SettingsAction): SettingsState => {
  switch (action.type) {
    case 'UPDATE_PROFILE':
      const updatedProfile = { ...state.profile, ...action.payload };
      return {
        ...state,
        profile: updatedProfile,
        auth: {
          ...state.auth,
          user: state.auth.user ? { ...state.auth.user, ...action.payload } : null
        }
      };
    
    case 'UPDATE_NOTIFICATIONS':
      return {
        ...state,
        notifications: { ...state.notifications, ...action.payload }
      };
    
    case 'UPDATE_APP_SETTINGS':
      return {
        ...state,
        app: { ...state.app, ...action.payload }
      };
    
    case 'SET_AUTH_STATE':
      return {
        ...state,
        auth: action.payload
      };
    
    case 'LOGIN':
      return {
        ...state,
        profile: action.payload,
        auth: {
          isAuthenticated: true,
          user: action.payload,
          lastLoginTime: new Date().toISOString()
        }
      };
    
    case 'LOGOUT':
      return {
        ...state,
        auth: {
          isAuthenticated: false,
          user: null,
          lastLoginTime: undefined
        }
      };
    
    case 'LOAD_SETTINGS':
      return action.payload;
    
    default:
      return state;
  }
};

interface SettingsContextType {
  state: SettingsState;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateNotifications: (updates: Partial<NotificationSettings>) => void;
  updateAppSettings: (updates: Partial<AppSettings>) => void;
  login: (user: UserProfile) => void;
  logout: () => void;
  saveSettings: () => void;
  loadSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(settingsReducer, initialState);

  // Load settings from localStorage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Auto-save settings when state changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveSettings();
    }, 500); // Debounce saves

    return () => clearTimeout(timeoutId);
  }, [state]);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: updates });
  }, []);

  const updateNotifications = useCallback((updates: Partial<NotificationSettings>) => {
    dispatch({ type: 'UPDATE_NOTIFICATIONS', payload: updates });
  }, []);

  const updateAppSettings = useCallback((updates: Partial<AppSettings>) => {
    dispatch({ type: 'UPDATE_APP_SETTINGS', payload: updates });
  }, []);

  const login = useCallback((user: UserProfile) => {
    dispatch({ type: 'LOGIN', payload: user });
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
    // Clear sensitive data from localStorage
    localStorage.removeItem('quiddity_auth_token');
  }, []);

  const saveSettings = useCallback(() => {
    try {
      localStorage.setItem('quiddity_settings', JSON.stringify(state));
      if (state.auth.isAuthenticated && state.auth.user) {
        localStorage.setItem('quiddity_auth_token', 'authenticated');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [state]);

  const loadSettings = useCallback(() => {
    try {
      const saved = localStorage.getItem('quiddity_settings');
      const authToken = localStorage.getItem('quiddity_auth_token');
      
      if (saved) {
        const parsedSettings = JSON.parse(saved);
        // Verify auth token matches
        if (authToken === 'authenticated' && parsedSettings.auth.isAuthenticated) {
          dispatch({ type: 'LOAD_SETTINGS', payload: parsedSettings });
        } else {
          // Auth mismatch, force logout
          dispatch({ type: 'LOGOUT' });
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, []);

  const contextValue: SettingsContextType = {
    state,
    updateProfile,
    updateNotifications,
    updateAppSettings,
    login,
    logout,
    saveSettings,
    loadSettings
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};