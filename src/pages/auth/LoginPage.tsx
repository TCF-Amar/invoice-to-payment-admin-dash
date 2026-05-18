import React, { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';

/**
 * Shape we expect on `location.state` when the user was bounced here from
 * a protected route. `ProtectedRoute` populates `from` with the originally
 * requested pathname so we can send the user back after login.
 */
interface LoginLocationState {
  from?: string;
}

/**
 * `LoginPage` - branded container for the email/password sign-in flow.
 *
 * Behavior:
 * - Reads `location.state.from` to determine where to send the user after
 *   a successful login. Defaults to `/` (Requirement 5.1, 5.2).
 * - If `from` is the login page itself, the destination collapses back to
 *   `/` so users never land on `/login` after authenticating
 *   (Requirement 5.3).
 * - On success, navigates with `replace: true` so the login screen is
 *   removed from history and the back button doesn't return users to the
 *   form they just completed.
 *
 * Validates: Requirements 1.1, 1.5, 5.1, 5.2, 5.3, 5.4
 */
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = useMemo(() => {
    const state = (location.state ?? null) as LoginLocationState | null;
    const from = state?.from;
    if (!from || from === '/login') {
      return '/';
    }
    return from;
  }, [location.state]);

  const handleSuccess = useCallback(
    (overrideRedirect?: string) => {
      const target = overrideRedirect && overrideRedirect !== '/login'
        ? overrideRedirect
        : redirectTo;
      navigate(target, { replace: true });
    },
    [navigate, redirectTo]
  );

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand mark - mirrors the badge used in the sidebar so the login
            screen feels like part of the same product. */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600 shadow-glow">
            <span className="font-bold text-white">IP</span>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-100">
            Sign in to Invoice Portal
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Enter your credentials to access your account
          </p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-surface p-8 shadow-glow">
          <LoginForm onSuccess={handleSuccess} redirectTo={redirectTo} />
        </div>
      </div>
    </div>
  );
};

LoginPage.displayName = 'LoginPage';

export default LoginPage;
