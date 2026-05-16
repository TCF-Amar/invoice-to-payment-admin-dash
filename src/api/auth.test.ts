/**
 * Unit tests for auth API client
 * 
 * NOTE: These tests require Vitest to be installed and configured.
 * Install with: npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom
 * 
 * To run tests: npm run test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchAuthMe } from './auth';
import api from './client';

// Mock the API client
vi.mock('./client', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('fetchAuthMe', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('successful fetch', () => {
    it('should fetch user auth information successfully', async () => {
      // Arrange
      const mockAuthResponse = {
        userId: 'user-123',
        email: 'admin@example.com',
        role: 'admin' as const,
        permissions: ['read:invoices', 'write:payments'],
        createdAt: '2024-01-01T00:00:00Z',
      };

      localStorage.setItem('auth_token', 'valid-token-123');
      (api.get as any).mockResolvedValue(mockAuthResponse);

      // Act
      const result = await fetchAuthMe();

      // Assert
      expect(api.get).toHaveBeenCalledWith('/auth/me', {
        headers: {
          Authorization: 'Bearer valid-token-123',
        },
      });
      expect(result).toEqual(mockAuthResponse);
    });

    it('should include Authorization header with token from localStorage', async () => {
      // Arrange
      const mockToken = 'test-token-456';
      localStorage.setItem('auth_token', mockToken);
      (api.get as any).mockResolvedValue({
        userId: 'user-123',
        email: 'user@example.com',
        role: 'standard',
        permissions: [],
        createdAt: '2024-01-01T00:00:00Z',
      });

      // Act
      await fetchAuthMe();

      // Assert
      expect(api.get).toHaveBeenCalledWith('/auth/me', {
        headers: {
          Authorization: `Bearer ${mockToken}`,
        },
      });
    });

    it('should handle missing auth token gracefully', async () => {
      // Arrange
      (api.get as any).mockResolvedValue({
        userId: 'user-123',
        email: 'user@example.com',
        role: 'standard',
        permissions: [],
        createdAt: '2024-01-01T00:00:00Z',
      });

      // Act
      await fetchAuthMe();

      // Assert
      expect(api.get).toHaveBeenCalledWith('/auth/me', {
        headers: {
          Authorization: 'Bearer ',
        },
      });
    });

    it('should clear auth token and throw error on 401 Unauthorized', async () => {
      // Arrange
      localStorage.setItem('auth_token', 'expired-token');
      const unauthorizedError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
      };
      (api.get as any).mockRejectedValue(unauthorizedError);

      // Act & Assert
      await expect(fetchAuthMe()).rejects.toThrow('Unauthorized: Please log in again');
      expect(localStorage.getItem('auth_token')).toBeNull();
    });

    it('should throw original error for non-401 errors', async () => {
      // Arrange
      const serverError = {
        response: {
          status: 500,
          data: { message: 'Internal Server Error' },
        },
      };
      (api.get as any).mockRejectedValue(serverError);

      // Act & Assert
      await expect(fetchAuthMe()).rejects.toEqual(serverError);
    });

    it('should handle network errors', async () => {
      // Arrange
      const networkError = new Error('Network Error');
      (api.get as any).mockRejectedValue(networkError);

      // Act & Assert
      await expect(fetchAuthMe()).rejects.toThrow('Network Error');
    });

    it('should return correct response shape matching AuthMeResponse interface', async () => {
      // Arrange
      const mockResponse = {
        userId: 'user-789',
        email: 'test@example.com',
        role: 'admin' as const,
        permissions: ['read:invoices', 'write:invoices', 'write:payments'],
        createdAt: '2024-01-15T10:30:00Z',
      };
      (api.get as any).mockResolvedValue(mockResponse);

      // Act
      const result = await fetchAuthMe();

      // Assert
      expect(result).toHaveProperty('userId');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('role');
      expect(result).toHaveProperty('permissions');
      expect(result).toHaveProperty('createdAt');
      expect(typeof result.userId).toBe('string');
      expect(typeof result.email).toBe('string');
      expect(['admin', 'standard']).toContain(result.role);
      expect(Array.isArray(result.permissions)).toBe(true);
    });
  });
});
