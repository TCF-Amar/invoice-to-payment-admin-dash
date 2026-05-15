import React from 'react';
import { cn } from '@/utils/cn';

interface LoadingSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number;
  height?: string;
  width?: string;
  circle?: boolean;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  count = 1,
  height = 'h-4',
  width = 'w-full',
  circle = false,
  className,
  ...props
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'animate-pulse rounded-lg bg-white/5',
            height,
            width,
            circle && 'rounded-full',
            i > 0 && 'mt-2',
            className
          )}
          {...props}
        />
      ))}
    </>
  );
};

export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 5 }) => (
  <div className="flex gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
    {Array.from({ length: columns }).map((_, i) => (
      <div key={i} className="flex-1">
        <LoadingSkeleton height="h-4" width="w-full" />
      </div>
    ))}
  </div>
);
