export type Platform = 
  | 'youtube'
  | 'instagram'
  | 'tiktok'
  | 'pinterest'
  | 'facebook'
  | 'twitter'
  | 'vimeo'
  | 'reddit'
  | 'unknown';

export interface VideoMetadata {
  id: string;
  url: string;
  title: string;
  description?: string;
  thumbnail: string;
  duration: number;
  author: string;
  authorUrl?: string;
  platform: Platform;
  viewCount?: number;
  uploadDate?: string;
}

export interface VideoFormat {
  formatId: string;
  extension: string;
  resolution?: string;
  quality: string;
  filesize?: number;
  bitrate?: number;
  codec?: string;
  hasVideo: boolean;
  hasAudio: boolean;
}

export type DownloadStatus = 
  | 'queued'
  | 'processing'
  | 'converting'
  | 'completed'
  | 'error'
  | 'cancelled';

export interface DownloadItem {
  id: string;
  metadata: VideoMetadata;
  format: VideoFormat;
  status: DownloadStatus;
  progress: number;
  outputUrl?: string;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface QueueState {
  items: DownloadItem[];
  addItem: (item: Omit<DownloadItem, 'id' | 'createdAt' | 'status' | 'progress'>) => void;
  updateItem: (id: string, updates: Partial<DownloadItem>) => void;
  removeItem: (id: string) => void;
  clearCompleted: () => void;
}

export interface PlatformInfo {
  name: string;
  icon: string;
  color: string;
  patterns: RegExp[];
}

export const PLATFORMS: Record<Platform, PlatformInfo> = {
  youtube: {
    name: 'YouTube',
    icon: 'youtube',
    color: '#FF0000',
    patterns: [/youtube\.com|youtu\.be|youtube\.io/],
  },
  instagram: {
    name: 'Instagram',
    icon: 'instagram',
    color: '#E4405F',
    patterns: [/instagram\.com/],
  },
  tiktok: {
    name: 'TikTok',
    icon: 'music',
    color: '#000000',
    patterns: [/tiktok\.com/],
  },
  pinterest: {
    name: 'Pinterest',
    icon: 'pin',
    color: '#BD081C',
    patterns: [/pinterest\.com/],
  },
  facebook: {
    name: 'Facebook',
    icon: 'facebook',
    color: '#1877F2',
    patterns: [/facebook\.com|fb\.watch/],
  },
  twitter: {
    name: 'Twitter/X',
    icon: 'twitter',
    color: '#1DA1F2',
    patterns: [/twitter\.com|x\.com/],
  },
  vimeo: {
    name: 'Vimeo',
    icon: 'video',
    color: '#1AB7EA',
    patterns: [/vimeo\.com/],
  },
  reddit: {
    name: 'Reddit',
    icon: 'reddit',
    color: '#FF4500',
    patterns: [/reddit\.com|redd\.it/],
  },
  unknown: {
    name: 'Unknown',
    icon: 'link',
    color: '#71717A',
    patterns: [],
  },
};

export function detectPlatform(url: string): Platform {
  for (const [platform, info] of Object.entries(PLATFORMS)) {
    if (info.patterns.some(pattern => pattern.test(url))) {
      return platform as Platform;
    }
  }
  return 'unknown';
}
