import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { ErrorMessage } from '@/components/auth/ErrorMessage';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

/**
 * Zod schema for the login form.
 *
 * Password validation is intentionally chained so that an empty value
 * surfaces "Password is required" (Requirement 2.2) while a non-empty but
 * too-short value surfaces "Password must be at least 8 characters"
 * (Requirement 2.4). Zod reports the first failing rule, so order matters.
 *
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4
 */
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export interface LoginFormProps {
  /**
   * Called after a successful login. The optional `redirectTo` value is
   * forwarded so that callers (e.g. `LoginPage`) can route the user back
   * to their originally requested URL.
   */
  onSuccess?: (redirectTo?: string) => void;
  /**
   * Optional path the caller wants to navigate to after login. Passed
   * through to `onSuccess` unchanged.
   */
  redirectTo?: string;
}

/**
 * `LoginForm` - email/password authentication form.
 *
 * Behavior:
 * - Uses react-hook-form + Zod for client-side validation with inline
 *   field errors wired via `aria-describedby` / `aria-invalid` for screen
 *   readers (Requirement 12.3).
 * - On submit, calls `useAuth().login`. On success, invokes `onSuccess`
 *   with the optional `redirectTo`. On failure, the mapped API error from
 *   `useAuth().error` is rendered via `ErrorMessage`.
 * - Disables inputs and the submit button during submission and shows a
 *   loading spinner on the submit button (Requirement 9.1, 9.2, 9.3).
 * - Clears the API error banner as soon as the user starts editing any
 *   field again (Requirement 10.7).
 *
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4,
 * 2.5, 2.6, 3.1, 3.4, 9.1, 9.2, 9.3, 10.1, 10.2, 10.3, 10.6, 10.7, 12.1,
 * 12.2, 12.3, 12.4, 12.5
 */
export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  redirectTo,
}) => {
  const { login, error, isLoading } = useAuth();

  // Tracks whether the most recent API error banner should be visible.
  // `useAuth().error` itself sticks around until the next login call, so
  // we hide it locally as soon as the user resumes editing a field
  // (Requirement 10.7).
  const [apiErrorDismissed, setApiErrorDismissed] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: { email: '', password: '' },
  });

  // Hide the API error as soon as the user edits any field. We piggy-back
  // on the input's onChange so RHF's own change pipeline keeps working.
  const handleFieldChange = useCallback(() => {
    setApiErrorDismissed(true);
  }, []);

  const emailRegister = register('email', { onChange: handleFieldChange });
  const passwordRegister = register('password', { onChange: handleFieldChange });

  const onSubmit = handleSubmit(async (data) => {
    // Reset the dismissal flag so any new error from this submit shows.
    setApiErrorDismissed(false);
    try {
      await login(data.email, data.password);
      onSuccess?.(redirectTo);
    } catch {
      // useAuth surfaces the error message via `error`; nothing to do
      // here. Swallowing keeps RHF's submit promise from rejecting and
      // logging an unhandled error.
    }
  });

  const submitting = isSubmitting || isLoading;
  const showApiError = !!error && !apiErrorDismissed;

  const emailErrorId = 'login-email-error';
  const passwordErrorId = 'login-password-error';

  const inputBaseClasses =
    'w-full rounded-lg border bg-white/5 px-4 py-2 text-slate-100 placeholder-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60';

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {/*
        ErrorMessage already provides role="alert" + aria-live="polite",
        so screen readers announce the API error without needing
        aria-describedby plumbing on the form itself.
      */}
      {showApiError && <ErrorMessage message={error} />}

      <div>
        <label
          htmlFor="login-email"
          className="mb-2 block text-sm font-medium text-slate-100"
        >
          Email
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          aria-label="Email"
          aria-required="true"
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? emailErrorId : undefined}
          disabled={submitting}
          placeholder="you@example.com"
          className={cn(
            inputBaseClasses,
            errors.email
              ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500'
              : 'border-white/10 focus:border-indigo-500'
          )}
          {...emailRegister}
        />
        {errors.email && (
          <p
            id={emailErrorId}
            role="alert"
            className="mt-1 text-sm text-rose-400"
          >
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="login-password"
          className="mb-2 block text-sm font-medium text-slate-100"
        >
          Password
        </label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          aria-label="Password"
          aria-required="true"
          aria-invalid={errors.password ? 'true' : 'false'}
          aria-describedby={errors.password ? passwordErrorId : undefined}
          disabled={submitting}
          placeholder="••••••••"
          className={cn(
            inputBaseClasses,
            errors.password
              ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500'
              : 'border-white/10 focus:border-indigo-500'
          )}
          {...passwordRegister}
        />
        {errors.password && (
          <p
            id={passwordErrorId}
            role="alert"
            className="mt-1 text-sm text-rose-400"
          >
            {errors.password.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        size="md"
        isLoading={submitting}
        disabled={submitting}
        aria-busy={submitting}
        className="w-full"
      >
        {submitting ? 'Signing In…' : 'Sign In'}
      </Button>
    </form>
  );
};

LoginForm.displayName = 'LoginForm';

export default LoginForm;
