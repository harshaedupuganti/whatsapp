export interface UserProfile {
  id: string;
  displayName: string;
  profileImage: string;
  status: string;
  email?: string;
  phoneNumber?: string;
}

export interface NotificationSettings {
  messageAlerts: boolean;
  notificationSound: 'default' | 'silent' | 'custom';
  vibration: boolean;
  showPreview: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  fontSize: 'small' | 'medium' | 'large';
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  lastLoginTime?: string;
}

export interface SettingsState {
  profile: UserProfile;
  notifications: NotificationSettings;
  app: AppSettings;
  auth: AuthState;
}