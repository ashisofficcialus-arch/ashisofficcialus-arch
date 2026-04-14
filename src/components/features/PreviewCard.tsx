'use client';

import { X, Play, Clock, User, Download, Film, Music } from 'lucide-react';
import { cn, formatDuration } from '@/lib/utils';
import type { VideoMetadata, VideoFormat } from '@/types';
import { PLATFORMS } from '@/types';

interface PreviewCardProps {
  metadata: VideoMetadata;
  formats: VideoFormat[];
  selectedFormat: VideoFormat | null;
  onSelectFormat: (format: VideoFormat) => void;
  onDownload: () => void;
  onClose: () => void;
}

const extensionIcons: Record<string, React.ReactNode> = {
  mp4: <Film className="w-4 h-4" />,
  webm: <Film className="w-4 h-4" />,
  mp3: <Music className="w-4 h-4" />,
  wav: <Music className="w-4 h-4" />,
  aac: <Music className="w-4 h-4" />,
};

export function PreviewCard({
  metadata,
  formats,
  selectedFormat,
  onSelectFormat,
  onDownload,
  onClose,
}: PreviewCardProps) {
  const platform = PLATFORMS[metadata.platform];

  return (
    <div className="w-full max-w-3xl mx-auto animate-slide-up">
      <div className="relative bg-charcoal rounded-2xl border border-graphite overflow-hidden shadow-card">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative aspect-video bg-charcoal-dark">
          <img
            src={metadata.thumbnail}
            alt={metadata.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 mb-2">
              <span 
                className="px-2 py-0.5 rounded-md text-xs font-medium"
                style={{ backgroundColor: platform.color + '20', color: platform.color }}
              >
                {platform.name}
              </span>
              {metadata.duration > 0 && (
                <span className="flex items-center gap-1 text-xs text-silver">
                  <Clock className="w-3 h-3" />
                  {formatDuration(metadata.duration)}
                </span>
              )}
            </div>
            <h3 className="text-xl font-semibold text-white line-clamp-2">
              {metadata.title}
            </h3>
          </div>

          <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-violet/90 hover:bg-violet flex items-center justify-center transition-all hover:scale-110 shadow-glow">
            <Play className="w-7 h-7 text-white ml-1" fill="currentColor" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {metadata.author && (
            <div className="flex items-center gap-2 text-silver">
              <User className="w-4 h-4" />
              <span className="text-sm">{metadata.author}</span>
            </div>
          )}

          {metadata.description && (
            <p className="text-sm text-zinc line-clamp-2">
              {metadata.description}
            </p>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-silver">Select Format</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {formats.slice(0, 8).map((format) => (
                <button
                  key={format.formatId}
                  onClick={() => onSelectFormat(format)}
                  className={cn(
                    'flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                    'border',
                    selectedFormat?.formatId === format.formatId
                      ? 'bg-violet/20 border-violet text-violet-light'
                      : 'bg-surface border-graphite text-silver hover:border-violet/50'
                  )}
                >
                  {extensionIcons[format.extension] || <Film className="w-4 h-4" />}
                  <span className="uppercase">{format.extension}</span>
                  {format.resolution && (
                    <span className="text-xs opacity-60">{format.resolution}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={onDownload}
            disabled={!selectedFormat}
            className={cn(
              'w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all',
              'bg-violet hover:bg-violet-light disabled:bg-surface disabled:text-zinc',
              'shadow-glow hover:shadow-lg'
            )}
          >
            <Download className="w-5 h-5" />
            {selectedFormat ? `Download ${selectedFormat.extension.toUpperCase()}` : 'Select Format'}
          </button>
        </div>
      </div>
    </div>
  );
}
