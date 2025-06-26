import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, AuthTokens, RateLimitInfo } from '../../types/api';
import { encryptionService } from './encryptionService';
import { authService } from './authService';

class ApiClient {
  private client: AxiosInstance;
  private rateLimitInfo: Map<string, RateLimitInfo> = new Map();

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_N8N_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Token': import.meta.env.VITE_N8N_WEBHOOK_TOKEN,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor for auth and encryption
    this.client.interceptors.request.use(
      (config) => {
        const token = authService.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request timestamp for rate limiting
        config.headers['X-Request-Time'] = Date.now().toString();

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for token refresh and rate limiting
    this.client.interceptors.response.use(
      (response) => {
        this.updateRateLimitInfo(response);
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            await authService.refreshToken();
            const newToken = authService.getAccessToken();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            authService.logout();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        // Handle rate limiting
        if (error.response?.status === 429) {
          this.updateRateLimitInfo(error.response);
          const retryAfter = error.response.headers['retry-after'];
          if (retryAfter) {
            await this.delay(parseInt(retryAfter) * 1000);
            return this.client(originalRequest);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private updateRateLimitInfo(response: AxiosResponse) {
    const endpoint = response.config.url || '';
    const remaining = parseInt(response.headers['x-ratelimit-remaining'] || '0');
    const resetTime = parseInt(response.headers['x-ratelimit-reset'] || '0');
    const limit = parseInt(response.headers['x-ratelimit-limit'] || '0');

    if (remaining !== undefined && resetTime && limit) {
      this.rateLimitInfo.set(endpoint, {
        remaining,
        resetTime: resetTime * 1000, // Convert to milliseconds
        limit,
      });
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public getRateLimitInfo(endpoint: string): RateLimitInfo | null {
    return this.rateLimitInfo.get(endpoint) || null;
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get(url, config);
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post(url, data, config);
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put(url, data, config);
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete(url, config);
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  private handleResponse<T>(response: AxiosResponse): ApiResponse<T> {
    return {
      success: true,
      data: response.data,
      timestamp: new Date().toISOString(),
    };
  }

  private handleError(error: any): ApiResponse {
    console.error('API Error:', error);
    
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    };
  }

  // Batch request utility for message operations
  public async batchRequest<T>(requests: Array<() => Promise<ApiResponse<T>>>): Promise<ApiResponse<T[]>> {
    try {
      const results = await Promise.allSettled(requests.map(req => req()));
      const data: T[] = [];
      const errors: string[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
          data.push(result.value.data);
        } else {
          const error = result.status === 'rejected' 
            ? result.reason.message 
            : result.value.error;
          errors.push(`Request ${index}: ${error}`);
        }
      });

      return {
        success: errors.length === 0,
        data,
        error: errors.length > 0 ? errors.join('; ') : undefined,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export const apiClient = new ApiClient();