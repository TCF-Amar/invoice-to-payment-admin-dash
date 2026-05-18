import api from './client';
import { AuthMeResponse, LoginResponse, RawAuthApiUser } from '@/types';
import { mapApiErrorToMessage } from '@/utils/authErrors';

/**
 * Normalize the backend's raw user shape (`{ id, email, name, role, ... }`)
 * into the app's `AuthMeResponse` shape (`{ userId, email, role, ... }`).
 *
 * The backend uses `id` as the primary key; the rest of the app reads
 * `userId`. Centralizing the rename here keeps the store and UI
 * decoupled from the wire format.
 */
const normalizeUser = (raw: RawAuthApiUser): AuthMeResponse => ({
  userId: raw.id,
  email: raw.email,
  role: raw.role,
  name: raw.name,
  permissions: raw.permissions,
  createdAt: raw.createdAt,
});

/**
 * Login with email and password.
 *
 * Calls POST /auth/login. The shared `api` client's response interceptor
 * unwraps the `ApiResponse` envelope, so the resolved value is the inner
 * `data` object directly. The backend returns a flat shape:
 *   `{ id, email, name, role, token }`
 * We split that into `{ token, user }` and normalize `id` -> `userId`
 * so callers see a consistent `LoginResponse`.
 *
 * On success, the JWT is persisted to `localStorage` under `auth_token`.
 * On failure, errors are normalized via `mapApiErrorToMessage` so callers
 * get a consistent, user-friendly message.
 *
 * @param email - User email
 * @param password - User password
 * @returns Promise resolving to `{ token, user }` with `user.userId`
 * @throws Error with a user-friendly message if login fails
 */
export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const response = await api.post<LoginResponse>('/auth/login', {
      email,
      password,
    });

    // The interceptor unwraps `data.data`, so `response` IS the flat
    // `{ id, email, name, role, token }` payload at runtime.
    const raw = response as unknown as RawAuthApiUser;

    if (raw?.token) {
      localStorage.setItem('auth_token', raw.token);
    }

    return {
      token: raw.token ?? '',
      user: normalizeUser(raw),
    };
  } catch (error: unknown) {
    throw new Error(mapApiErrorToMessage(error));
  }
};

/**
 * Fetch the current user's authentication information including role.
 *
 * Calls GET /auth/me with the bearer token from `localStorage`. The
 * response interceptor unwraps the envelope, so the resolved value is
 * the raw `{ id, email, name, role, ... }` payload. We normalize `id`
 * to `userId` before returning.
 *
 * On a 401 response, the stored token is cleared and an `Unauthorized`
 * error is thrown so callers (e.g. `ProtectedRoute`, `useAuthStore`) can
 * react by redirecting to login.
 *
 * @returns Promise resolving to the authenticated user's data
 * @throws Error('Unauthorized: Please log in again') on 401, or the
 *   original error otherwise
 */
export const fetchAuthMe = async (): Promise<AuthMeResponse> => {
  try {
    const token = localStorage.getItem('auth_token') || '';

    const response = await api.get<AuthMeResponse>('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Interceptor has unwrapped to the raw user shape. Normalize so
    // callers can read `userId` regardless of backend naming.
    const raw = response as unknown as RawAuthApiUser;
    return normalizeUser(raw);
  } catch (error: unknown) {
    const status = (error as { response?: { status?: number } } | undefined)
      ?.response?.status;
    if (status === 401) {
      localStorage.removeItem('auth_token');
      throw new Error('Unauthorized: Please log in again');
    }

    throw error;
  }
};

/**
 * Log the current user out by clearing the persisted auth token.
 *
 * This helper is intentionally pure: it only removes `auth_token` from
 * `localStorage`. It does NOT navigate, call the auth store, or make any
 * network requests. Orchestration (clearing store state, redirecting to
 * `/login`, etc.) lives in the `useAuth` hook so the API layer stays
 * decoupled from React Router and Zustand.
 *
 * Calling this when no token is present is a no-op (`removeItem` is safe
 * to call for missing keys).
 */
export const logout = (): void => {
  localStorage.removeItem('auth_token');
};
