'use client';

import { useState } from 'react';
import { Download, Trash2, Play, Pause, Filter, Clock } from 'lucide-react';
import { AppLayout } from '@/components/layout/Sidebar';
import { QueueItem } from '@/components/features/QueueItem';
import { useQueueStore } from '@/lib/store';
import type { DownloadStatus } from '@/types';
import { QueueItemSkeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'active' | 'completed' | 'error';

export default function DownloadsPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [isPaused, setIsPaused] = useState(false);
  const { items, updateItem, removeItem, clearCompleted } = useQueueStore();

  const filteredItems = items.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['queued', 'processing', 'converting'].includes(item.status);
    if (filter === 'completed') return item.status === 'completed';
    if (filter === 'error') return item.status === 'error';
    return true;
  });

  const activeCount = items.filter((i) => ['queued', 'processing', 'converting'].includes(i.status)).length;
  const completedCount = items.filter((i) => i.status === 'completed').length;
  const errorCount = items.filter((i) => i.status === 'error').length;

  const handleCancel = (id: string) => {
    updateItem(id, { status: 'cancelled' });
  };

  const handleRetry = (id: string) => {
    updateItem(id, { status: 'queued', progress: 0, error: undefined });
  };

  const handleRemove = (id: string) => {
    removeItem(id);
  };

  const handleClearCompleted = () => {
    clearCompleted();
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-outfit font-bold">Downloads</h1>
            <p className="text-silver">Manage your download queue</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={cn(
                'px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors',
                isPaused ? 'bg-amber/20 text-amber' : 'bg-surface text-silver hover:text-white'
              )}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            {completedCount > 0 && (
              <button
                onClick={handleClearCompleted}
                className="px-4 py-2 rounded-xl font-medium flex items-center gap-2 bg-surface text-silver hover:text-rose transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-charcoal rounded-xl border border-graphite">
            <div className="flex items-center gap-2 text-sm text-zinc mb-1">
              <Clock className="w-4 h-4" />
              Active
            </div>
            <div className="text-2xl font-bold text-white">{activeCount}</div>
          </div>
          <div className="p-4 bg-charcoal rounded-xl border border-graphite">
            <div className="flex items-center gap-2 text-sm text-zinc mb-1">
              <Download className="w-4 h-4" />
              Completed
            </div>
            <div className="text-2xl font-bold text-emerald">{completedCount}</div>
          </div>
          <div className="p-4 bg-charcoal rounded-xl border border-graphite">
            <div className="flex items-center gap-2 text-sm text-zinc mb-1">
              <Filter className="w-4 h-4" />
              Error
            </div>
            <div className="text-2xl font-bold text-rose">{errorCount}</div>
          </div>
          <div className="p-4 bg-charcoal rounded-xl border border-graphite">
            <div className="flex items-center gap-2 text-sm text-zinc mb-1">
              Total
            </div>
            <div className="text-2xl font-bold text-white">{items.length}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-1 bg-charcoal rounded-xl border border-graphite w-fit">
          {(['all', 'active', 'completed', 'error'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors',
                filter === f
                  ? 'bg-violet text-white'
                  : 'text-silver hover:text-white'
              )}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-surface mx-auto mb-4 flex items-center justify-center">
                <Download className="w-8 h-8 text-zinc" />
              </div>
              <h3 className="text-lg font-medium text-white mb-1">No downloads yet</h3>
              <p className="text-silver">Add a video URL to start downloading</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <QueueItem
                key={item.id}
                item={item}
                onCancel={handleCancel}
                onRetry={handleRetry}
                onRemove={handleRemove}
              />
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
