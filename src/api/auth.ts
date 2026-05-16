import api from './client';
import { AuthMeResponse } from '@/types';

/**
 * Fetch current user's authentication information including role
 * @returns Promise resolving to user auth data
 * @throws Error if unauthorized (401) or other API errors occur
 */
export const fetchAuthMe = async (): Promise<AuthMeResponse> => {
  try {
    // Get auth token from localStorage
    const token = localStorage.getItem('auth_token') || '';
    
    // Make API request with Authorization header
    const response = await api.get<AuthMeResponse>('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    return response;
  } catch (error: any) {
    // Handle 401 Unauthorized - clear token and throw specific error
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      throw new Error('Unauthorized: Please log in again');
    }
    
    // Re-throw other errors as-is
    throw error;
  }
};
