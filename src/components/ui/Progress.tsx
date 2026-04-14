'use client';

import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number;
  className?: string;
  showLabel?: boolean;
}

export function Progress({ value, className, showLabel }: ProgressProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <ProgressPrimitive.Root
        value={value}
        className="relative h-2 w-full overflow-hidden rounded-full bg-surface"
      >
        <ProgressPrimitive.Indicator
          className="h-full w-full flex-1 bg-gradient-to-r from-violet to-cyan transition-all duration-300"
          style={{ transform: `translateX(-${100 - value}%)` }}
        />
      </ProgressPrimitive.Root>
      {showLabel && (
        <span className="text-xs text-silver">{Math.round(value)}%</span>
      )}
    </div>
  );
}
