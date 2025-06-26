import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/n8n/authService';
import { contactService } from '../services/n8n/contactService';
import { messageService } from '../services/n8n/messageService';
import { LoginRequest, RegisterRequest } from '../types/api';

export const useN8nAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setIsLoading(true);
        const authenticated = authService.isAuthenticated();
        
        if (authenticated) {
          // Validate token with server
          const isValid = await authService.validateToken();
          setIsAuthenticated(isValid);
          
          if (isValid) {
            // Start background services
            contactService.startAutoSync();
            await contactService.updateMyPresence(true);
          } else {
            authService.logout();
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();

    // Cleanup on unmount
    return () => {
      contactService.stopAutoSync();
      messageService.stopAllPolling();
    };
  }, []);

  const login = useCallback(async (credentials: LoginRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.login(credentials);
      
      if (response.success) {
        setIsAuthenticated(true);
        
        // Start background services
        contactService.startAutoSync();
        await contactService.updateMyPresence(true);
        
        return true;
      } else {
        setError(response.error || 'Login failed');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (userData: RegisterRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.register(userData);
      
      if (response.success) {
        setIsAuthenticated(true);
        
        // Start background services
        contactService.startAutoSync();
        await contactService.updateMyPresence(true);
        
        return true;
      } else {
        setError(response.error || 'Registration failed');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Update presence to offline
      await contactService.updateMyPresence(false);
      
      // Stop background services
      contactService.stopAutoSync();
      messageService.stopAllPolling();
      
      // Logout
      authService.logout();
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Logout error:', err);
      // Force logout even if server call fails
      authService.logout();
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const response = await authService.refreshToken();
      return response.success;
    } catch (err) {
      console.error('Token refresh failed:', err);
      return false;
    }
  }, []);

  return {
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshToken,
    clearError: () => setError(null),
  };
};