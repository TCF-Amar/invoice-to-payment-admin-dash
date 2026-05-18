import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ErrorMessageProps {
  message: string | null;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Displays an authentication error message in a visually distinct, accessible
 * banner. Renders nothing when `message` is null.
 *
 * - Uses `role="alert"` and `aria-live="polite"` so screen readers announce
 *   errors when they appear.
 * - When `onDismiss` is provided, renders an accessible dismiss button.
 *
 * Validates: Requirements 10.6, 12.3, 12.4
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onDismiss,
  className,
}) => {
  if (!message) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'flex items-start justify-between gap-3 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-200',
        className
      )}
    >
      <span className="flex-1 leading-snug">{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss error"
          className="-mr-1 -mt-1 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-rose-200 transition-colors hover:bg-rose-500/20 hover:text-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 focus:ring-offset-surface"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

ErrorMessage.displayName = 'ErrorMessage';

export default ErrorMessage;
