'use server';

import { NextRequest, NextResponse } from 'next/server';

function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function extractYouTubeShort(url: string): string | null {
  const match = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

async function getYouTubeDownloadUrl(url: string, extension: string): Promise<string | null> {
  const videoId = extractYouTubeVideoId(url) || extractYouTubeShort(url);
  if (!videoId) return null;

  if (extension === 'mp3') {
    return `https://www.y2mate.com/youtube-mp3/${videoId}`;
  }

  return `https://www.y2mate.com/youtube/${videoId}`;
}

async function getGenericDownloadUrl(url: string, extension: string, platform: string): Promise<string> {
  switch (platform) {
    case 'youtube':
      const ytUrl = await getYouTubeDownloadUrl(url, extension);
      return ytUrl || `https://www.y2mate.com`;
    case 'instagram':
      return 'https://www.y2mate.com';
    case 'tiktok':
      return 'https://www.y2mate.com';
    default:
      return 'https://www.y2mate.com';
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url, format, platform } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const extension = format?.extension || 'mp4';

    if (platform === 'youtube') {
      const videoId = extractYouTubeVideoId(url) || extractYouTubeShort(url);
      
      if (extension === 'mp3') {
        return NextResponse.json({
          directUrl: `https://www.y2mate.com/youtube-mp3/${videoId}`,
          message: 'Opening Y2Mate for audio extraction',
        });
      }

      return NextResponse.json({
        directUrl: `https://www.y2mate.com/youtube/${videoId}`,
        message: 'Opening Y2Mate for video download',
      });
    }

    const downloadUrl = await getGenericDownloadUrl(url, extension, platform);

    return NextResponse.json({
      downloadUrl,
      message: `Download from ${platform}`,
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Failed to process download' }, { status: 500 });
  }
}