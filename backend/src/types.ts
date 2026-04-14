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

export interface DownloadJob {
  id: string;
  url: string;
  platform: Platform;
  format: VideoFormat;
  status: DownloadStatus;
  progress: number;
  outputUrl?: string;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
  metadata?: VideoMetadata;
}

export interface Extractor {
  name: string;
  platform: Platform;
  patterns: RegExp[];
  fetchMetadata(url: string): Promise<VideoMetadata>;
  getFormats(url: string): Promise<VideoFormat[]>;
  getDownloadUrl(url: string, format: VideoFormat): Promise<string>;
}
