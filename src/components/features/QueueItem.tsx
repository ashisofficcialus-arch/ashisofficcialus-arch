'use client';

import { X, RefreshCw, CheckCircle2, AlertCircle, Clock, Loader2, Film } from 'lucide-react';
import { cn, formatDuration } from '@/lib/utils';
import type { DownloadItem } from '@/types';
import { PLATFORMS } from '@/types';
import { Progress } from '@/components/ui/Progress';

interface QueueItemProps {
  item: DownloadItem;
  onCancel: (id: string) => void;
  onRetry: (id: string) => void;
  onRemove: (id: string) => void;
}

const statusConfig = {
  queued: {
    icon: Clock,
    label: 'Queued',
    color: 'text-silver',
    bgColor: 'bg-surface',
  },
  processing: {
    icon: Loader2,
    label: 'Processing',
    color: 'text-cyan',
    bgColor: 'bg-cyan/10',
  },
  converting: {
    icon: Loader2,
    label: 'Converting',
    color: 'text-amber',
    bgColor: 'bg-amber/10',
  },
  completed: {
    icon: CheckCircle2,
    label: 'Completed',
    color: 'text-emerald',
    bgColor: 'bg-emerald/10',
  },
  error: {
    icon: AlertCircle,
    label: 'Error',
    color: 'text-rose',
    bgColor: 'bg-rose/10',
  },
  cancelled: {
    icon: X,
    label: 'Cancelled',
    color: 'text-zinc',
    bgColor: 'bg-surface',
  },
};

export function QueueItem({ item, onCancel, onRetry, onRemove }: QueueItemProps) {
  const platform = PLATFORMS[item.metadata.platform];
  const status = statusConfig[item.status];
  const StatusIcon = status.icon;

  return (
    <div className={cn(
      'flex items-center gap-4 p-4 bg-charcoal rounded-xl border border-graphite',
      'transition-all hover:border-violet/30'
    )}>
      <div className="relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0">
        <img
          src={item.metadata.thumbnail}
          alt={item.metadata.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <Film className="w-5 h-5 text-white" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span 
            className="text-xs font-medium px-1.5 py-0.5 rounded"
            style={{ backgroundColor: platform.color + '20', color: platform.color }}
          >
            {platform.name}
          </span>
          <span className={cn('flex items-center gap-1 text-xs', status.color)}>
            <StatusIcon className={cn('w-3 h-3', item.status === 'processing' || item.status === 'converting' ? 'animate-spin' : '')} />
            {status.label}
          </span>
        </div>
        <h4 className="text-sm font-medium text-white truncate">
          {item.metadata.title}
        </h4>
        <div className="flex items-center gap-2 text-xs text-zinc">
          <span className="uppercase">{item.format.extension}</span>
          {item.format.resolution && <span>{item.format.resolution}</span>}
          {item.format.filesize && <span>• {Math.round(item.format.filesize / 1024 / 1024)} MB</span>}
        </div>
      </div>

      {(item.status === 'processing' || item.status === 'converting') && (
        <div className="w-24">
          <Progress value={item.progress} showLabel />
        </div>
      )}

      <div className="flex items-center gap-2">
        {item.status === 'error' && (
          <button
            onClick={() => onRetry(item.id)}
            className="w-8 h-8 rounded-lg bg-surface hover:bg-violet/20 flex items-center justify-center transition-colors"
            title="Retry"
          >
            <RefreshCw className="w-4 h-4 text-silver hover:text-violet" />
          </button>
        )}
        {(item.status === 'queued' || item.status === 'processing' || item.status === 'converting') && (
          <button
            onClick={() => onCancel(item.id)}
            className="w-8 h-8 rounded-lg bg-surface hover:bg-rose/20 flex items-center justify-center transition-colors"
            title="Cancel"
          >
            <X className="w-4 h-4 text-silver hover:text-rose" />
          </button>
        )}
        {(item.status === 'completed' || item.status === 'error' || item.status === 'cancelled') && (
          <button
            onClick={() => onRemove(item.id)}
            className="w-8 h-8 rounded-lg bg-surface hover:bg-surface flex items-center justify-center transition-colors"
            title="Remove"
          >
            <X className="w-4 h-4 text-zinc" />
          </button>
        )}
        {item.status === 'completed' && item.outputUrl && (
          <a
            href={item.outputUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-emerald/20 text-emerald text-sm font-medium hover:bg-emerald/30 transition-colors"
          >
            Download
          </a>
        )}
      </div>
    </div>
  );
}
