import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

/**
 * 5-minute role cache TTL, mirroring the constant in `useAuthStore`.
 *
 * Kept in sync with the store so the component can short-circuit
 * validation on a cache hit without re-importing internals.
 */
const ROLE_CACHE_TTL = 5 * 60 * 1000;

export interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Optional element to render while the route is validating the session.
   * Defaults to a centered `LoadingSkeleton`-based spinner.
   */
  fallback?: React.ReactNode;
}

/**
 * Default fallback shown while the route is verifying the session.
 *
 * Uses `role="status"` and a screen-reader label so assistive tech can
 * announce the in-progress check (Requirement 9.4, 9.5, 12.x).
 */
const DefaultFallback: React.FC = () => (
  <div
    role="status"
    aria-live="polite"
    aria-busy="true"
    className="flex min-h-screen w-full items-center justify-center bg-surface px-6"
  >
    <span className="sr-only">Verifying your session...</span>
    <div className="w-full max-w-sm space-y-3">
      <LoadingSkeleton height="h-3" width="w-1/2" />
      <LoadingSkeleton height="h-3" width="w-3/4" />
      <LoadingSkeleton height="h-3" width="w-2/3" />
    </div>
  </div>
);

/**
 * `ProtectedRoute` - guards a subtree of routes by ensuring the user has a
 * valid session before rendering children.
 *
 * Behavior on mount:
 * 1. Reads `auth_token` from `localStorage`.
 *    - Missing token → redirects to `/login` with `state.from` set to the
 *      current pathname so the login flow can return the user to where
 *      they were trying to go (Requirement 4.1, 4.4, 4.5).
 * 2. If a token is present, checks the auth store for fresh cached role
 *    data (`userId`, `userRole`, and `roleLoadedAt` within the 5-minute
 *    TTL). On a cache hit, children render immediately - no API call is
 *    made (Requirements 6.5, 11.4).
 * 3. Otherwise calls `fetchUserRole()` to validate the token via
 *    `/auth/me`. Note: the store's `fetchUserRole` swallows failures into
 *    `roleError` rather than throwing, so success is determined by
 *    inspecting the store state after the await. Validation failure
 *    redirects to `/login`, preserving `from` (Requirement 7.3).
 *
 * While `isChecking` (initial mount) or `isLoadingRole` (store-level
 * fetch in flight) is true, the component renders the optional `fallback`
 * (Requirement 9.4, 9.5).
 *
 * Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 6.1, 6.2, 6.3, 6.5,
 * 7.1, 7.2, 7.3, 7.4, 7.5, 9.4, 9.5, 11.4
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback,
}) => {
  const location = useLocation();

  // Subscribe to relevant slices so the component re-renders when the
  // store updates (e.g. `fetchUserRole` finishes and populates state).
  const userId = useAuthStore((s) => s.userId);
  const userRole = useAuthStore((s) => s.userRole);
  const isLoadingRole = useAuthStore((s) => s.isLoadingRole);
  const fetchUserRole = useAuthStore((s) => s.fetchUserRole);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  // `isChecking` covers the brief period after mount before we've decided
  // whether the user is authenticated, the token is missing, or
  // validation has resolved.
  const [isChecking, setIsChecking] = useState(true);

  // Outcome tracking. We capture the redirect decision in state so the
  // render path is straightforward and a one-time mount validation isn't
  // re-run on subsequent renders.
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const token = localStorage.getItem('auth_token');

    if (!token) {
      // No token means unauthenticated - redirect to login.
      setShouldRedirect(true);
      setIsChecking(false);
      return;
    }

    // Cache hit: if the store already has a fresh role within the TTL,
    // skip the API validation entirely. This makes navigations between
    // protected routes instant after the first load.
    const state = useAuthStore.getState();
    const cacheFresh =
      !!state.userId &&
      !!state.userRole &&
      !!state.roleLoadedAt &&
      Date.now() - state.roleLoadedAt < ROLE_CACHE_TTL;

    if (cacheFresh) {
      setIsChecking(false);
      return;
    }

    // Otherwise validate the token via `/auth/me`. `fetchUserRole`
    // resolves either way (it stores errors in `roleError`), so we
    // inspect the store state after the await to determine success.
    void (async () => {
      await fetchUserRole();
      if (cancelled) return;

      const post = useAuthStore.getState();
      const ok = !!post.userId && !!post.userRole && !post.roleError;
      if (!ok) {
        // Validation failed (e.g. 401). Per Requirement 10.4 the
        // redirect must be silent, so clear any session state -
        // including `roleError` - before navigating to /login. Without
        // this the stale error would surface as a banner on the login
        // page via `useAuth().error -> roleError`.
        clearAuth();
        setShouldRedirect(true);
      }
      setIsChecking(false);
    })();

    return () => {
      cancelled = true;
    };
    // We intentionally run this validation effect once on mount. The
    // store's TTL plus the store-level cache short-circuit handle
    // staleness on remount/navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // While initial validation is in progress, or the store is actively
  // fetching the role, show the loading fallback.
  if (isChecking || isLoadingRole) {
    return <>{fallback ?? <DefaultFallback />}</>;
  }

  // Validation failed (no token or `/auth/me` rejected): redirect to
  // login while preserving the originally requested path.
  if (shouldRedirect || !userId || !userRole) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // Authenticated - render the protected subtree.
  return <>{children}</>;
};

ProtectedRoute.displayName = 'ProtectedRoute';

export default ProtectedRoute;
