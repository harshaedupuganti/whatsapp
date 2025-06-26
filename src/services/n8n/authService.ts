import { apiClient } from './apiClient';
import { AuthTokens, LoginRequest, RegisterRequest, ApiResponse } from '../../types/api';

class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiryTime: number = 0;
  private refreshExpiryTime: number = 0;

  constructor() {
    this.loadTokensFromStorage();
    this.setupTokenRefreshTimer();
  }

  private loadTokensFromStorage() {
    try {
      const storedTokens = localStorage.getItem('quiddity_auth_tokens');
      if (storedTokens) {
        const tokens: AuthTokens = JSON.parse(storedTokens);
        this.accessToken = tokens.accessToken;
        this.refreshToken = tokens.refreshToken;
        this.tokenExpiryTime = Date.now() + (tokens.expiresIn * 1000);
        this.refreshExpiryTime = Date.now() + (tokens.refreshExpiresIn * 1000);
      }
    } catch (error) {
      console.error('Failed to load tokens from storage:', error);
      this.clearTokens();
    }
  }

  private saveTokensToStorage(tokens: AuthTokens) {
    try {
      localStorage.setItem('quiddity_auth_tokens', JSON.stringify(tokens));
      this.accessToken = tokens.accessToken;
      this.refreshToken = tokens.refreshToken;
      this.tokenExpiryTime = Date.now() + (tokens.expiresIn * 1000);
      this.refreshExpiryTime = Date.now() + (tokens.refreshExpiresIn * 1000);
    } catch (error) {
      console.error('Failed to save tokens to storage:', error);
    }
  }

  private clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiryTime = 0;
    this.refreshExpiryTime = 0;
    localStorage.removeItem('quiddity_auth_tokens');
    localStorage.removeItem('quiddity_auth_token'); // Legacy cleanup
  }

  private setupTokenRefreshTimer() {
    setInterval(() => {
      if (this.shouldRefreshToken()) {
        this.refreshToken();
      }
    }, 60000); // Check every minute
  }

  private shouldRefreshToken(): boolean {
    if (!this.accessToken || !this.refreshToken) return false;
    
    // Refresh if access token expires in the next 5 minutes
    const fiveMinutes = 5 * 60 * 1000;
    return Date.now() + fiveMinutes >= this.tokenExpiryTime;
  }

  public async login(credentials: LoginRequest): Promise<ApiResponse<AuthTokens>> {
    const response = await apiClient.post<AuthTokens>('/webhook/auth/login', credentials);
    
    if (response.success && response.data) {
      this.saveTokensToStorage(response.data);
    }
    
    return response;
  }

  public async register(userData: RegisterRequest): Promise<ApiResponse<AuthTokens>> {
    const response = await apiClient.post<AuthTokens>('/webhook/auth/register', userData);
    
    if (response.success && response.data) {
      this.saveTokensToStorage(response.data);
    }
    
    return response;
  }

  public async refreshToken(): Promise<ApiResponse<AuthTokens>> {
    if (!this.refreshToken) {
      return {
        success: false,
        error: 'No refresh token available',
        timestamp: new Date().toISOString(),
      };
    }

    if (Date.now() >= this.refreshExpiryTime) {
      this.logout();
      return {
        success: false,
        error: 'Refresh token expired',
        timestamp: new Date().toISOString(),
      };
    }

    const response = await apiClient.post<AuthTokens>('/webhook/auth/refresh', {
      refreshToken: this.refreshToken,
    });

    if (response.success && response.data) {
      this.saveTokensToStorage(response.data);
    } else {
      this.logout();
    }

    return response;
  }

  public logout() {
    this.clearTokens();
    // Optionally notify the server about logout
    if (this.accessToken) {
      apiClient.post('/webhook/auth/logout').catch(() => {
        // Ignore errors during logout
      });
    }
  }

  public getAccessToken(): string | null {
    if (Date.now() >= this.tokenExpiryTime) {
      return null;
    }
    return this.accessToken;
  }

  public isAuthenticated(): boolean {
    return this.getAccessToken() !== null;
  }

  public getTokenExpiryTime(): number {
    return this.tokenExpiryTime;
  }

  public async validateToken(): Promise<boolean> {
    if (!this.isAuthenticated()) return false;

    try {
      const response = await apiClient.get('/webhook/auth/validate');
      return response.success;
    } catch (error) {
      return false;
    }
  }
}

export const authService = new AuthService();