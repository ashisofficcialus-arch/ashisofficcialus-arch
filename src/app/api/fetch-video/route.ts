'use server';

import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:5000';

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

async function fetchYouTubeMetadata(url: string) {
  try {
    const response = await fetch(`${PYTHON_API_URL}/video_info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch video info');
    }

    const data = await response.json();
    
    return {
      id: data.id,
      url,
      title: data.title,
      description: data.description,
      thumbnail: data.thumbnail_url,
      duration: data.length || 0,
      author: data.author,
      authorUrl: data.channel_url,
      platform: 'youtube',
      viewCount: data.views,
      uploadDate: data.publish_date,
    };
  } catch (error) {
    console.error('YouTube fetch error:', error);
    const videoId = url.match(/(?:v=|be\/)([^&\n?#]+)/)?.[1] || '';
    return {
      id: videoId,
      url,
      title: `YouTube Video`,
      description: 'Video from YouTube',
      thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '',
      duration: 0,
      author: 'Unknown',
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
      { formatId: '4', extension: 'mp4', resolution: '480p', quality: 'SD', filesize: 250000000, hasVideo: true, hasAudio: true },
      { formatId: '5', extension: 'mp3', quality: '320kbps', filesize: 8500000, hasAudio: true, hasVideo: false },
      { formatId: '6', extension: 'mp3', quality: '128kbps', filesize: 3400000, hasAudio: true, hasVideo: false },
    ];

    return NextResponse.json({ metadata, formats });
  } catch (error) {
    console.error('Fetch video error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}