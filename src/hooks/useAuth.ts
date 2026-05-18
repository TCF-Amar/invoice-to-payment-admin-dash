import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import * as authApi from '@/api/auth';
import { UserRole } from '@/types';

/**
 * Return shape of the {@link useAuth} hook.
 *
 * Mirrors the `UseAuthReturn` interface defined in the auth system design
 * doc. Consumers (LoginForm, ProtectedRoute, TopBar, etc.) read state and
 * trigger actions through this hook so they don't have to know about the
 * underlying Zustand store or `auth.ts` API client.
 */
export interface UseAuthReturn {
  // State
  isAuthenticated: boolean;
  user: {
    userId: string | null;
    email: string | null;
    role: UserRole | null;
  };
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

/**
 * `useAuth` - convenience hook around the Zustand auth store and the
 * `auth.ts` API client.
 *
 * Responsibilities:
 * - Surfaces auth state (`isAuthenticated`, `user`, `isLoading`, `error`)
 *   derived from `useAuthStore` plus local login state.
 * - `login`: posts credentials, then fetches user role/profile.
 * - `logout`: clears store state, removes the persisted token, and
 *   navigates to `/login`.
 * - `checkAuth`: validates the current token by calling `/auth/me` when
 *   one is present; returns whether the session is still valid.
 *
 * Error precedence: a local login error (most recent user action) takes
 * priority over `roleError`, so the UI surfaces the freshest feedback.
 */
export function useAuth(): UseAuthReturn {
  const userId = useAuthStore((s) => s.userId);
  const userEmail = useAuthStore((s) => s.userEmail);
  const userRole = useAuthStore((s) => s.userRole);
  const isLoadingRole = useAuthStore((s) => s.isLoadingRole);
  const roleError = useAuthStore((s) => s.roleError);
  const fetchUserRole = useAuthStore((s) => s.fetchUserRole);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const navigate = useNavigate();

  // Local state owned by the hook (not the store) so that login-specific
  // loading/error UX doesn't leak into role-fetch state.
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      setIsLoggingIn(true);
      setLoginError(null);

      try {
        // `authApi.login` already maps API/network errors to friendly
        // messages and persists the token to localStorage on success.
        await authApi.login(email, password);

        // With the token stored, populate userId/email/role from /auth/me.
        await fetchUserRole();
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Login failed';
        setLoginError(message);
        // Rethrow so the caller (LoginForm) can react if needed.
        throw error;
      } finally {
        setIsLoggingIn(false);
      }
    },
    [fetchUserRole]
  );

  const logout = useCallback((): void => {
    // Order matters: clear the store first so any subscribers see the
    // logged-out state immediately, then drop the persisted token, then
    // navigate. `authApi.logout` is a pure helper that just removes
    // `auth_token` from localStorage.
    clearAuth();
    authApi.logout();
    setLoginError(null);
    navigate('/login');
  }, [clearAuth, navigate]);

  const checkAuth = useCallback(async (): Promise<boolean> => {
    const token = localStorage.getItem('auth_token');
    if (!token) return false;

    try {
      await fetchUserRole();
      // `fetchUserRole` swallows errors into `roleError`, so re-check the
      // store after the call to determine whether the session is valid.
      const state = useAuthStore.getState();
      return !!state.userId && !!state.userRole && !state.roleError;
    } catch {
      return false;
    }
  }, [fetchUserRole]);

  return {
    isAuthenticated: !!userId && !!userRole,
    user: {
      userId,
      email: userEmail,
      role: userRole,
    },
    isLoading: isLoadingRole || isLoggingIn,
    // Prefer the most recent login error; fall back to role-fetch error.
    error: loginError ?? roleError,
    login,
    logout,
    checkAuth,
  };
}
