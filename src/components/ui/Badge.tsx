import React from 'react';
import { cn } from '@/utils/cn';
import { getStatusBgColor, getStatusTextColor, getStatusLabel } from '@/utils/statusColors';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: string;
  variant?: 'default' | 'outline';
  children?: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, status, variant = 'default', children, ...props }, ref) => {
    const bgColor = status ? getStatusBgColor(status) : 'bg-slate-500/10';
    const textColor = status ? getStatusTextColor(status) : 'text-slate-400';
    const label = status ? getStatusLabel(status) : children;

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
          variant === 'outline' ? 'border border-current' : bgColor,
          textColor,
          className
        )}
        {...props}
      >
        {label}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
