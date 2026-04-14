'use server';

import { NextRequest, NextResponse } from 'next/server';

const PLATFORMS: Record<string, { name: string; color: string }> = {
  youtube: { name: 'YouTube', color: '#FF0000' },
  instagram: { name: 'Instagram', color: '#E4405F' },
  tiktok: { name: 'TikTok', color: '#000000' },
  twitter: { name: 'Twitter/X', color: '#1DA1F2' },
  facebook: { name: 'Facebook', color: '#1877F2' },
  vimeo: { name: 'Vimeo', color: '#1AB7EA' },
  pinterest: { name: 'Pinterest', color: '#BD081C' },
  reddit: { name: 'Reddit', color: '#FF4500' },
};

function detectPlatform(url: string): string {
  const normalizedUrl = url.toLowerCase();
  if (/youtube\.com|youtu\.be|youtube\.io/.test(normalizedUrl)) return 'youtube';
  if (/instagram\.com/.test(normalizedUrl)) return 'instagram';
  if (/tiktok\.com/.test(normalizedUrl)) return 'tiktok';
  if (/twitter\.com|x\.com/.test(normalizedUrl)) return 'twitter';
  if (/facebook\.com|fb\.watch/.test(normalizedUrl)) return 'facebook';
  if (/vimeo\.com/.test(normalizedUrl)) return 'vimeo';
  if (/pinterest\.com/.test(normalizedUrl)) return 'pinterest';
  if (/reddit\.com|redd\.it/.test(normalizedUrl)) return 'reddit';
  return 'unknown';
}

function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

async function fetchYouTubeMetadata(url: string) {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return null;

  try {
    const apiUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(apiUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; VideoForge/1.0)' },
    });

    if (!response.ok) {
      const thumbnailRes = await fetch(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
      if (thumbnailRes.ok) {
        return {
          id: videoId,
          url,
          title: `YouTube Video ${videoId}`,
          description: 'Video from YouTube',
          thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          duration: 0,
          author: 'YouTube Creator',
          platform: 'youtube',
        };
      }
      return null;
    }

    const data = await response.json();
    return {
      id: videoId,
      url,
      title: data.title || `YouTube Video ${videoId}`,
      description: data.author_name ? `By ${data.author_name}` : 'YouTube video',
      thumbnail: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      duration: 0,
      author: data.author_name || 'Unknown',
      authorUrl: data.author_url,
      platform: 'youtube',
    };
  } catch (error) {
    console.error('YouTube fetch error:', error);
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    return {
      id: videoId,
      url,
      title: `YouTube Video ${videoId}`,
      description: 'Video from YouTube',
      thumbnail: thumbnailUrl,
      duration: 0,
      author: 'YouTube Creator',
      platform: 'youtube',
    };
  }
}

async function fetchGenericMetadata(url: string, platform: string) {
  const videoId = url.split('/').pop()?.split('?')[0] || Date.now().toString();
  const platformInfo = PLATFORMS[platform] || { name: 'Video', color: '#71717A' };

  return {
    id: videoId,
    url,
    title: `${platformInfo.name} Video`,
    description: `Video from ${platformInfo.name}`,
    thumbnail: '',
    duration: 0,
    author: 'Unknown',
    platform,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const platform = detectPlatform(url);
    let metadata;

    if (platform === 'youtube') {
      metadata = await fetchYouTubeMetadata(url);
    } else if (platform === 'unknown') {
      return NextResponse.json({ error: 'Unsupported platform' }, { status: 400 });
    } else {
      metadata = await fetchGenericMetadata(url, platform);
    }

    if (!metadata) {
      return NextResponse.json({ error: 'Failed to fetch video info' }, { status: 500 });
    }

    const formats = [
      { formatId: '1', extension: 'mp4', resolution: '2160p', quality: '4K', filesize: 2500000000, hasVideo: true, hasAudio: true },
      { formatId: '2', extension: 'mp4', resolution: '1080p', quality: 'HD', filesize: 850000000, hasVideo: true, hasAudio: true },
      { formatId: '3', extension: 'mp4', resolution: '720p', quality: 'SD', filesize: 450000000, hasVideo: true, hasAudio: true },
      { formatId: '4', extension: 'webm', resolution: '1080p', quality: 'HD', filesize: 650000000, hasVideo: true, hasAudio: true },
      { formatId: '5', extension: 'mp3', quality: '320kbps', filesize: 8500000, hasAudio: true, hasVideo: false },
      { formatId: '6', extension: 'mp3', quality: '128kbps', filesize: 3400000, hasAudio: true, hasVideo: false },
    ];

    return NextResponse.json({ metadata, formats });
  } catch (error) {
    console.error('Fetch video error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
