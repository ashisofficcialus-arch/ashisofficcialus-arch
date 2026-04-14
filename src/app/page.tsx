'use client';

import { useState, useCallback, useEffect } from 'react';
import { Zap, Youtube, Instagram, Music2, Twitter, Facebook, Pin, Video } from 'lucide-react';
import { AppLayout } from '@/components/layout/Sidebar';
import { URLInput } from '@/components/features/URLInput';
import { PreviewCard } from '@/components/features/PreviewCard';
import { PreviewCardSkeleton } from '@/components/ui/Skeleton';
import { useQueueStore, useAppStore } from '@/lib/store';
import type { VideoMetadata, VideoFormat, Platform } from '@/types';
import { detectPlatform } from '@/types';

const supportedPlatforms = [
  { name: 'YouTube', icon: Youtube, color: '#FF0000' },
  { name: 'Instagram', icon: Instagram, color: '#E4405F' },
  { name: 'TikTok', icon: Music2, color: '#000000' },
  { name: 'Twitter', icon: Twitter, color: '#1DA1F2' },
  { name: 'Facebook', icon: Facebook, color: '#1877F2' },
  { name: 'Pinterest', icon: Pin, color: '#BD081C' },
  { name: 'Vimeo', icon: Video, color: '#1AB7EA' },
];

const mockMetadata: VideoMetadata = {
  id: 'demo-1',
  url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
  title: 'Rick Astley - Never Gonna Give You Up',
  description: 'Official music video for Rick Astley\'s Never Gonna Give You Up',
  thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
  duration: 213,
  author: 'RickAstley',
  platform: 'youtube',
};

const mockFormats: VideoFormat[] = [
  { formatId: '1', extension: 'mp4', resolution: '2160p', quality: '4K', filesize: 2500000000, hasVideo: true, hasAudio: true },
  { formatId: '2', extension: 'mp4', resolution: '1080p', quality: 'HD', filesize: 850000000, hasVideo: true, hasAudio: true },
  { formatId: '3', extension: 'mp4', resolution: '720p', quality: 'SD', filesize: 450000000, hasVideo: true, hasAudio: true },
  { formatId: '4', extension: 'webm', resolution: '1080p', quality: 'HD', filesize: 650000000, hasVideo: true, hasAudio: true },
  { formatId: '5', extension: 'mp3', quality: '320kbps', filesize: 8500000, hasAudio: true, hasVideo: false },
  { formatId: '6', extension: 'mp3', quality: '128kbps', filesize: 3400000, hasAudio: true, hasVideo: false },
];

export default function Dashboard() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<{ metadata: VideoMetadata; formats: VideoFormat[] } | null>(null);
  const { addItem } = useQueueStore();
  const { selectedFormat, setSelectedFormat } = useAppStore();

  const handleSubmit = useCallback(async (url: string, platform: Platform) => {
    setIsProcessing(true);
    
    setTimeout(() => {
      setPreview({
        metadata: { ...mockMetadata, url, platform },
        formats: mockFormats,
      });
      setIsProcessing(false);
    }, 1500);
  }, []);

  const handleDownload = useCallback(() => {
    if (preview && selectedFormat) {
      addItem({
        metadata: preview.metadata,
        format: selectedFormat,
      });
      setPreview(null);
      setSelectedFormat(null);
    }
  }, [preview, selectedFormat, addItem, setSelectedFormat]);

  const handleClose = useCallback(() => {
    setPreview(null);
    setSelectedFormat(null);
  }, [setSelectedFormat]);

return (
    <AppLayout>
      <div className='max-w-5xl mx-auto space-y-6 lg:space-y-8'>
        <div className='text-center space-y-3 lg:space-y-4 pt-4 lg:pt-8 px-4'>
          <h1 className='text-3xl lg:text-5xl font-outfit font-bold'>
            <span className='text-gradient'>Download</span> Videos
          </h1>
          <p className='text-base lg:text-lg text-silver max-w-2xl mx-auto'>
            Extract videos from YouTube, Instagram, TikTok, and 20+ other platforms in high quality.
          </p>
        </div>

        <div className='px-4'>
          <URLInput onSubmit={handleSubmit} isProcessing={isProcessing} />
        </div>

        <div className='grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2 lg:gap-3 px-4'>
          {supportedPlatforms.map((platform) => (
            <div
              key={platform.name}
              className='flex items-center gap-2 p-2 lg:p-3 rounded-xl bg-charcoal border border-graphite hover:border-violet/30 transition-colors cursor-pointer'
            >
              <div
                className='w-6 h-6 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center'
                style={{ backgroundColor: platform.color + '20', color: platform.color }}
              >
                <platform.icon className='w-3 h-3 lg:w-4 lg:h-4' />
              </div>
              <span className='text-xs lg:text-sm font-medium text-silver hidden md:block'>{platform.name}</span>
            </div>
          ))}
        </div>

        <URLInput onSubmit={handleSubmit} isProcessing={isProcessing} />

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {supportedPlatforms.map((platform) => (
            <div
              key={platform.name}
              className="flex items-center gap-2 p-3 rounded-xl bg-charcoal border border-graphite hover:border-violet/30 transition-colors cursor-pointer"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: platform.color + '20', color: platform.color }}
              >
                <platform.icon className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-silver hidden sm:block">{platform.name}</span>
            </div>
          ))}
        </div>

        {isProcessing && <PreviewCardSkeleton />}

        {preview && (
          <PreviewCard
            metadata={preview.metadata}
            formats={preview.formats}
            selectedFormat={selectedFormat}
            onSelectFormat={setSelectedFormat}
            onDownload={handleDownload}
            onClose={handleClose}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4 pt-4 lg:pt-8 px-4">
          <div className="p-4 lg:p-6 bg-charcoal rounded-2xl border border-graphite">
            <div className="flex items-center gap-2 lg:gap-3 mb-1 lg:mb-2">
              <div className="w-8 lg:w-10 h-8 lg:h-10 rounded-xl bg-violet/20 flex items-center justify-center">
                <Zap className="w-4 lg:w-5 h-4 lg:h-5 text-violet" />
              </div>
              <h3 className="text-sm lg:text-base font-medium">Lightning Fast</h3>
            </div>
            <p className="text-xs lg:text-sm text-zinc">Download videos at maximum speed with our optimized extraction engine.</p>
          </div>
          <div className="p-4 lg:p-6 bg-charcoal rounded-2xl border border-graphite">
            <div className="flex items-center gap-2 lg:gap-3 mb-1 lg:mb-2">
              <div className="w-8 lg:w-10 h-8 lg:h-10 rounded-xl bg-cyan/20 flex items-center justify-center">
                <Video className="w-4 lg:w-5 h-4 lg:h-5 text-cyan" />
              </div>
              <h3 className="text-sm lg:text-base font-medium">Multi-Platform</h3>
            </div>
            <p className="text-xs lg:text-sm text-zinc">Support for YouTube, Instagram, TikTok, and 20+ other platforms.</p>
          </div>
          <div className="p-4 lg:p-6 bg-charcoal rounded-2xl border border-graphite">
            <div className="flex items-center gap-2 lg:gap-3 mb-1 lg:mb-2">
              <div className="w-8 lg:w-10 h-8 lg:h-10 rounded-xl bg-emerald/20 flex items-center justify-center">
                <Zap className="w-4 lg:w-5 h-4 lg:h-5 text-emerald" />
              </div>
              <h3 className="text-sm lg:text-base font-medium">Zero Storage</h3>
            </div>
            <p className="text-xs lg:text-sm text-zinc">Stream directly to your device without server-side file storage.</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
