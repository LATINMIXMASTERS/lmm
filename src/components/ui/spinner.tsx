
import React from 'react';
import { cn } from '@/lib/utils';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Spinner = ({ className, ...props }: SpinnerProps) => {
  return (
    <div
      className={cn(
        "h-6 w-6 animate-spin rounded-full border-2 border-t-transparent border-white",
        className
      )}
      {...props}
    />
  );
};
