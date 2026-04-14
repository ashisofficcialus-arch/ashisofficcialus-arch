import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'image' | 'button';
}

export function Skeleton({ className, variant = 'text' }: SkeletonProps) {
  const baseClasses = 'shimmer rounded';
  
  const variantClasses = {
    text: 'h-4 w-full',
    card: 'h-48 w-full rounded-2xl',
    image: 'h-64 w-full rounded-2xl',
    button: 'h-12 w-24 rounded-xl',
  };

  return (
    <div className={cn(baseClasses, variantClasses[variant], className)} />
  );
}

export function PreviewCardSkeleton() {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-charcoal rounded-2xl border border-graphite overflow-hidden">
        <div className="relative aspect-video">
          <Skeleton variant="image" className="absolute inset-0" />
        </div>
        <div className="p-5 space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-md" />
            <Skeleton className="h-6 w-20 rounded-md" />
          </div>
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
          <div className="grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-10 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function QueueItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 bg-charcoal rounded-xl border border-graphite">
      <Skeleton className="w-20 h-14 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </div>
      <Skeleton className="h-8 w-20 rounded-lg" />
    </div>
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="p-6 bg-charcoal rounded-2xl border border-graphite">
      <Skeleton className="h-4 w-24 mb-4" />
      <Skeleton className="h-10 w-16" />
    </div>
  );
}
