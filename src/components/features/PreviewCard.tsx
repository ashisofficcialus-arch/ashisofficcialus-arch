'use client';

import { useState } from 'react';
import { X, Play, Clock, User, Download, Film, Music, Loader2, CheckCircle2, ExternalLink } from 'lucide-react';
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

type DownloadState = 'idle' | 'preparing' | 'downloading' | 'complete' | 'error';

export function PreviewCard({
  metadata,
  formats,
  selectedFormat,
  onSelectFormat,
  onClose,
}: PreviewCardProps) {
  const platform = PLATFORMS[metadata.platform];
  const [downloadState, setDownloadState] = useState<DownloadState>('idle');
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!selectedFormat) return;
    
    setDownloadState('preparing');
    setProgress(0);
    setError(null);
    setDownloadUrl(null);

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: metadata.url,
          format: selectedFormat,
          platform: metadata.platform,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Download failed');
      }

      const data = await response.json();
      
      if (data.downloadUrl) {
        setDownloadState('complete');
        setDownloadUrl(data.downloadUrl);
        
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = `${metadata.title.replace(/[^a-zA-Z0-9]/g, '_')}.${selectedFormat.extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (data.directUrl) {
        setDownloadState('complete');
        setDownloadUrl(data.directUrl);
        
        window.open(data.directUrl, '_blank');
      }
    } catch (err) {
      setDownloadState('error');
      setError(err instanceof Error ? err.message : 'Download failed');
    }
  };

  const handleReset = () => {
    setDownloadState('idle');
    setProgress(0);
    setDownloadUrl(null);
    setError(null);
    onClose();
  };

  return (
    <div className="w-full max-w-3xl mx-auto animate-slide-up">
      <div className="relative bg-charcoal rounded-2xl border border-graphite overflow-hidden shadow-card">
        <button
          onClick={handleReset}
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

        <div className="p-4 sm:p-5 space-y-4">
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

          {downloadState === 'error' && (
            <div className="p-3 rounded-xl bg-rose/20 border border-rose/30 text-rose text-sm">
              {error}
            </div>
          )}

          {downloadState === 'complete' && downloadUrl && (
            <div className="p-3 rounded-xl bg-emerald/20 border border-emerald/30">
              <div className="flex items-center gap-2 text-emerald mb-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Download Started!</span>
              </div>
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-emerald/80 hover:text-emerald transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open download link
              </a>
            </div>
          )}

          {downloadState === 'idle' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-silver">Select Format</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {formats.slice(0, 8).map((format) => (
                    <button
                      key={format.formatId}
                      onClick={() => onSelectFormat(format)}
                      className={cn(
                        'flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all',
                        'border',
                        selectedFormat?.formatId === format.formatId
                          ? 'bg-violet/20 border-violet text-violet-light'
                          : 'bg-surface border-graphite text-silver hover:border-violet/50'
                      )}
                    >
                      {extensionIcons[format.extension] || <Film className="w-4 h-4" />}
                      <span className="uppercase">{format.extension}</span>
                      {format.resolution && (
                        <span className="text-xs opacity-60 hidden sm:inline">{format.resolution}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleDownload}
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
            </>
          )}

          {downloadState === 'preparing' && (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-3 py-4">
                <Loader2 className="w-5 h-5 text-violet animate-spin" />
                <span className="text-silver">Preparing download...</span>
              </div>
              <div className="h-2 bg-surface rounded-full overflow-hidden">
                <div 
                  className="h-full bg-violet transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {downloadState === 'complete' && (
            <button
              onClick={handleReset}
              className="w-full py-3 rounded-xl font-medium bg-surface text-silver hover:text-white transition-colors"
            >
              Download Another
            </button>
          )}

          {downloadState === 'error' && (
            <button
              onClick={handleDownload}
              className="w-full py-3 rounded-xl font-medium bg-rose/20 text-rose hover:bg-rose/30 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
