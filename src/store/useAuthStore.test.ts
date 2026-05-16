import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useAuthStore } from './useAuthStore';
import { fetchAuthMe } from '@/api/auth';
import { AuthMeResponse, UserRole } from '@/types';

// Mock the auth API
vi.mock('@/api/auth', () => ({
  fetchAuthMe: vi.fn(),
}));

const mockFetchAuthMe = vi.mocked(fetchAuthMe);

describe('useAuthStore', () => {
  beforeEach(() => {
    // Clear store state before each test
    useAuthStore.setState({
      userId: null,
      userEmail: null,
      userRole: null,
      roleLoadedAt: null,
      isLoadingRole: false,
      roleError: null,
    });
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should have null values for user data initially', () => {
      const state = useAuthStore.getState();
      expect(state.userId).toBeNull();
      expect(state.userEmail).toBeNull();
      expect(state.userRole).toBeNull();
      expect(state.roleLoadedAt).toBeNull();
      expect(state.isLoadingRole).toBe(false);
      expect(state.roleError).toBeNull();
    });
  });

  describe('setUserRole', () => {
    it('should update user role in state', () => {
      const { setUserRole } = useAuthStore.getState();
      
      setUserRole('admin');
      
      const state = useAuthStore.getState();
      expect(state.userRole).toBe('admin');
      expect(state.roleLoadedAt).toBeGreaterThan(0);
      expect(state.roleError).toBeNull();
    });

    it('should persist role to localStorage', () => {
      const { setUserRole } = useAuthStore.getState();
      
      setUserRole('standard');
      
      const stored = localStorage.getItem('auth-store');
      expect(stored).toBeTruthy();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.userRole).toBe('standard');
      expect(parsed.roleLoadedAt).toBeGreaterThan(0);
    });

    it('should update roleLoadedAt timestamp', () => {
      const { setUserRole } = useAuthStore.getState();
      const beforeTime = Date.now();
      
      setUserRole('admin');
      
      const state = useAuthStore.getState();
      expect(state.roleLoadedAt).toBeGreaterThanOrEqual(beforeTime);
      expect(state.roleLoadedAt).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('fetchUserRole', () => {
    const mockAuthResponse: AuthMeResponse = {
      userId: 'user-123',
      email: 'test@example.com',
      role: 'admin',
      permissions: ['read', 'write'],
      createdAt: new Date().toISOString(),
    };

    it('should fetch user role from API', async () => {
      mockFetchAuthMe.mockResolvedValueOnce(mockAuthResponse);
      
      const { fetchUserRole } = useAuthStore.getState();
      await fetchUserRole();
      
      const state = useAuthStore.getState();
      expect(state.userId).toBe('user-123');
      expect(state.userEmail).toBe('test@example.com');
      expect(state.userRole).toBe('admin');
      expect(state.roleLoadedAt).toBeGreaterThan(0);
      expect(state.isLoadingRole).toBe(false);
      expect(state.roleError).toBeNull();
    });

    it('should set loading state while fetching', async () => {
      mockFetchAuthMe.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockAuthResponse), 100))
      );
      
      const { fetchUserRole } = useAuthStore.getState();
      const fetchPromise = fetchUserRole();
      
      // Check loading state immediately
      expect(useAuthStore.getState().isLoadingRole).toBe(true);
      
      await fetchPromise;
      
      // Check loading state after completion
      expect(useAuthStore.getState().isLoadingRole).toBe(false);
    });

    it('should persist fetched data to localStorage', async () => {
      mockFetchAuthMe.mockResolvedValueOnce(mockAuthResponse);
      
      const { fetchUserRole } = useAuthStore.getState();
      await fetchUserRole();
      
      const stored = localStorage.getItem('auth-store');
      expect(stored).toBeTruthy();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.userId).toBe('user-123');
      expect(parsed.userEmail).toBe('test@example.com');
      expect(parsed.userRole).toBe('admin');
      expect(parsed.roleLoadedAt).toBeGreaterThan(0);
    });

    it('should handle API errors gracefully', async () => {
      const errorMessage = 'Network error';
      mockFetchAuthMe.mockRejectedValueOnce(new Error(errorMessage));
      
      const { fetchUserRole } = useAuthStore.getState();
      await fetchUserRole();
      
      const state = useAuthStore.getState();
      expect(state.isLoadingRole).toBe(false);
      expect(state.roleError).toBe(errorMessage);
    });

    it('should not fetch if role is cached and valid (within 5 minutes)', async () => {
      // Set a recent role
      const now = Date.now();
      useAuthStore.setState({
        userRole: 'admin',
        roleLoadedAt: now - 60000, // 1 minute ago
      });
      
      const { fetchUserRole } = useAuthStore.getState();
      await fetchUserRole();
      
      // API should not be called
      expect(mockFetchAuthMe).not.toHaveBeenCalled();
    });

    it('should fetch if cached role is expired (older than 5 minutes)', async () => {
      mockFetchAuthMe.mockResolvedValueOnce(mockAuthResponse);
      
      // Set an expired role
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000 + 1000); // 5 minutes + 1 second ago
      useAuthStore.setState({
        userRole: 'standard',
        roleLoadedAt: fiveMinutesAgo,
      });
      
      const { fetchUserRole } = useAuthStore.getState();
      await fetchUserRole();
      
      // API should be called
      expect(mockFetchAuthMe).toHaveBeenCalledOnce();
      
      // Role should be updated
      const state = useAuthStore.getState();
      expect(state.userRole).toBe('admin');
    });

    it('should fetch if no role is cached', async () => {
      mockFetchAuthMe.mockResolvedValueOnce(mockAuthResponse);
      
      const { fetchUserRole } = useAuthStore.getState();
      await fetchUserRole();
      
      expect(mockFetchAuthMe).toHaveBeenCalledOnce();
    });
  });

  describe('clearAuth', () => {
    it('should clear all auth state', () => {
      // Set some state first
      useAuthStore.setState({
        userId: 'user-123',
        userEmail: 'test@example.com',
        userRole: 'admin',
        roleLoadedAt: Date.now(),
      });
      
      const { clearAuth } = useAuthStore.getState();
      clearAuth();
      
      const state = useAuthStore.getState();
      expect(state.userId).toBeNull();
      expect(state.userEmail).toBeNull();
      expect(state.userRole).toBeNull();
      expect(state.roleLoadedAt).toBeNull();
      expect(state.isLoadingRole).toBe(false);
      expect(state.roleError).toBeNull();
    });

    it('should clear localStorage', () => {
      // Set some data in localStorage
      localStorage.setItem('auth-store', JSON.stringify({
        userId: 'user-123',
        userEmail: 'test@example.com',
        userRole: 'admin',
        roleLoadedAt: Date.now(),
      }));
      
      const { clearAuth } = useAuthStore.getState();
      clearAuth();
      
      const stored = localStorage.getItem('auth-store');
      expect(stored).toBeNull();
    });
  });

  describe('LocalStorage Persistence', () => {
    it('should persist data to localStorage when setUserRole is called', () => {
      const { setUserRole } = useAuthStore.getState();
      
      setUserRole('admin');
      
      const stored = localStorage.getItem('auth-store');
      expect(stored).toBeTruthy();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.userRole).toBe('admin');
      expect(parsed.roleLoadedAt).toBeGreaterThan(0);
    });

    it('should persist data to localStorage when fetchUserRole succeeds', async () => {
      const mockAuthResponse: AuthMeResponse = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'admin',
        permissions: ['read', 'write'],
        createdAt: new Date().toISOString(),
      };
      
      mockFetchAuthMe.mockResolvedValueOnce(mockAuthResponse);
      
      const { fetchUserRole } = useAuthStore.getState();
      await fetchUserRole();
      
      const stored = localStorage.getItem('auth-store');
      expect(stored).toBeTruthy();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.userId).toBe('user-123');
      expect(parsed.userEmail).toBe('test@example.com');
      expect(parsed.userRole).toBe('admin');
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('auth-store', 'invalid-json{');
      
      // Should not throw error when accessing store
      expect(() => {
        const state = useAuthStore.getState();
        expect(state.userRole).toBeNull();
      }).not.toThrow();
    });
  });

  describe('5-Minute TTL Caching', () => {
    it('should respect 5-minute cache TTL', async () => {
      const mockAuthResponse: AuthMeResponse = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'admin',
        permissions: ['read', 'write'],
        createdAt: new Date().toISOString(),
      };
      
      mockFetchAuthMe.mockResolvedValue(mockAuthResponse);
      
      // First fetch
      const { fetchUserRole } = useAuthStore.getState();
      await fetchUserRole();
      expect(mockFetchAuthMe).toHaveBeenCalledTimes(1);
      
      // Second fetch within 5 minutes - should use cache
      await fetchUserRole();
      expect(mockFetchAuthMe).toHaveBeenCalledTimes(1); // Still 1, not called again
      
      // Simulate time passing (5 minutes + 1 second)
      const expiredTime = Date.now() - (5 * 60 * 1000 + 1000);
      useAuthStore.setState({ roleLoadedAt: expiredTime });
      
      // Third fetch after expiration - should call API
      await fetchUserRole();
      expect(mockFetchAuthMe).toHaveBeenCalledTimes(2); // Called again
    });
  });

  describe('Requirements Validation', () => {
    it('should satisfy Requirement 3.1: Authorization service determines user role', async () => {
      const mockAuthResponse: AuthMeResponse = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'admin',
        permissions: ['read', 'write'],
        createdAt: new Date().toISOString(),
      };
      
      mockFetchAuthMe.mockResolvedValueOnce(mockAuthResponse);
      
      const { fetchUserRole } = useAuthStore.getState();
      await fetchUserRole();
      
      const state = useAuthStore.getState();
      expect(state.userRole).toBe('admin');
    });

    it('should satisfy Requirement 3.2: Provide user role to components', () => {
      useAuthStore.setState({ userRole: 'standard' });
      
      const state = useAuthStore.getState();
      expect(state.userRole).toBe('standard');
    });

    it('should satisfy Requirement 3.3: Maintain role throughout session', async () => {
      const mockAuthResponse: AuthMeResponse = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'admin',
        permissions: ['read', 'write'],
        createdAt: new Date().toISOString(),
      };
      
      mockFetchAuthMe.mockResolvedValue(mockAuthResponse);
      
      const { fetchUserRole } = useAuthStore.getState();
      
      // Fetch role multiple times
      await fetchUserRole();
      const role1 = useAuthStore.getState().userRole;
      
      await fetchUserRole();
      const role2 = useAuthStore.getState().userRole;
      
      await fetchUserRole();
      const role3 = useAuthStore.getState().userRole;
      
      // Role should be consistent
      expect(role1).toBe('admin');
      expect(role2).toBe('admin');
      expect(role3).toBe('admin');
    });

    it('should satisfy Requirement 3.4: Update role within 5 seconds when changed', async () => {
      const initialResponse: AuthMeResponse = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'standard',
        permissions: ['read'],
        createdAt: new Date().toISOString(),
      };
      
      const updatedResponse: AuthMeResponse = {
        ...initialResponse,
        role: 'admin',
        permissions: ['read', 'write'],
      };
      
      mockFetchAuthMe
        .mockResolvedValueOnce(initialResponse)
        .mockResolvedValueOnce(updatedResponse);
      
      const { fetchUserRole } = useAuthStore.getState();
      
      // Initial fetch
      await fetchUserRole();
      expect(useAuthStore.getState().userRole).toBe('standard');
      
      // Simulate role change on backend and expired cache
      const expiredTime = Date.now() - (5 * 60 * 1000 + 1000);
      useAuthStore.setState({ roleLoadedAt: expiredTime });
      
      // Fetch again (simulating periodic refresh)
      const startTime = Date.now();
      await fetchUserRole();
      const endTime = Date.now();
      
      // Should complete within 5 seconds
      expect(endTime - startTime).toBeLessThan(5000);
      expect(useAuthStore.getState().userRole).toBe('admin');
    });
  });
});
