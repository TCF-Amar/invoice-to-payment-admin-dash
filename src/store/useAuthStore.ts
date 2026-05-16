import { create } from 'zustand';
import { AuthState, UserRole } from '@/types';
import { fetchAuthMe } from '@/api/auth';

// Constants
const ROLE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
const STORAGE_KEY = 'auth-store';

// LocalStorage helper functions
interface StoredAuthData {
  userId: string | null;
  userEmail: string | null;
  userRole: UserRole | null;
  roleLoadedAt: number | null;
}

const loadFromStorage = (): Partial<AuthState> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};

    const data: StoredAuthData = JSON.parse(stored);
    
    // Check if cached role is still valid (within 5-minute TTL)
    if (data.roleLoadedAt && Date.now() - data.roleLoadedAt > ROLE_CACHE_TTL) {
      // Cache expired, clear role data
      return {
        userId: data.userId,
        userEmail: data.userEmail,
        userRole: null,
        roleLoadedAt: null,
      };
    }

    return {
      userId: data.userId,
      userEmail: data.userEmail,
      userRole: data.userRole,
      roleLoadedAt: data.roleLoadedAt,
    };
  } catch (error) {
    console.error('Failed to load auth data from localStorage:', error);
    return {};
  }
};

const saveToStorage = (data: StoredAuthData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save auth data to localStorage:', error);
  }
};

const clearStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear auth data from localStorage:', error);
  }
};

// Create the Zustand store
export const useAuthStore = create<AuthState>((set, get) => {
  // Load initial state from localStorage
  const initialState = loadFromStorage();

  return {
    // Initial state
    userId: initialState.userId ?? null,
    userEmail: initialState.userEmail ?? null,
    userRole: initialState.userRole ?? null,
    roleLoadedAt: initialState.roleLoadedAt ?? null,
    isLoadingRole: false,
    roleError: null,

    // Actions
    setUserRole: (role: UserRole) => {
      const now = Date.now();
      const state = get();
      
      set({
        userRole: role,
        roleLoadedAt: now,
        roleError: null,
      });

      // Persist to localStorage
      saveToStorage({
        userId: state.userId,
        userEmail: state.userEmail,
        userRole: role,
        roleLoadedAt: now,
      });
    },

    fetchUserRole: async () => {
      const state = get();

      // Check if we have a valid cached role
      if (
        state.userRole &&
        state.roleLoadedAt &&
        Date.now() - state.roleLoadedAt < ROLE_CACHE_TTL
      ) {
        // Role is still valid, no need to fetch
        return;
      }

      // Set loading state
      set({ isLoadingRole: true, roleError: null });

      try {
        const authData = await fetchAuthMe();

        const now = Date.now();
        set({
          userId: authData.userId,
          userEmail: authData.email,
          userRole: authData.role,
          roleLoadedAt: now,
          isLoadingRole: false,
          roleError: null,
        });

        // Persist to localStorage
        saveToStorage({
          userId: authData.userId,
          userEmail: authData.email,
          userRole: authData.role,
          roleLoadedAt: now,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to fetch user role';

        set({
          isLoadingRole: false,
          roleError: errorMessage,
        });

        // Don't clear existing role on error, just mark as error state
        console.error('Failed to fetch user role:', error);
      }
    },

    clearAuth: () => {
      set({
        userId: null,
        userEmail: null,
        userRole: null,
        roleLoadedAt: null,
        isLoadingRole: false,
        roleError: null,
      });

      // Clear localStorage
      clearStorage();
    },
  };
});
