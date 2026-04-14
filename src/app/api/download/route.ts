'use server';

import { NextRequest, NextResponse } from 'next/server';
import ytdl from 'ytdl-core';

function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1].length === 11) return match[1];
  }
  return null;
}

const formatMap: Record<string, { itag: number; ext: string; quality: string }[]> = {
  mp4: [
    { itag: 137, ext: 'mp4', quality: '1080p' },
    { itag: 136, ext: 'mp4', quality: '720p' },
    { itag: 135, ext: 'mp4', quality: '480p' },
    { itag: 134, ext: 'mp4', quality: '360p' },
  ],
  webm: [
    { itag: 248, ext: 'webm', quality: '1080p' },
    { itag: 247, ext: 'webm', quality: '720p' },
  ],
  mp3: [
    { itag: 140, ext: 'mp4', quality: '128kbps' },
  ],
};

export async function POST(request: NextRequest) {
  try {
    const { url, format } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    const videoInfo = await ytdl.getInfo(videoId, {
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      },
    });

    const videoDetails = videoInfo.videoDetails;
    const title = videoDetails.title.replace(/[<>:"/\\|?*]/g, '');
    const extension = format?.extension || 'mp4';

    const formats = ytdl.filterFormats(videoInfo.formats, 'videoandaudio');
    let bestFormat = formats.find(f => f.container === extension);
    
    if (!bestFormat) {
      bestFormat = formats.find(f => f.container === 'mp4');
    }
    
    if (!bestFormat && extension === 'mp3') {
      const audioFormats = ytdl.filterFormats(videoInfo.formats, 'audioonly');
      bestFormat = audioFormats.find(f => f.container === 'mp4');
    }

    if (!bestFormat) {
      return NextResponse.json({ 
        error: 'No suitable format found. Try a different quality or format.' 
      }, { status: 400 });
    }

    const stream = ytdl.downloadFromInfo(videoInfo, { format: bestFormat });

    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${title}.${bestFormat.container}"`);
    headers.set('Content-Type', 'video/mp4');

    return new NextResponse(stream as any, {
      headers,
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Download failed' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const format = searchParams.get('format') || 'mp4';
  const quality = searchParams.get('quality') || 'highest';

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
  }

  try {
    const videoInfo = await ytdl.getInfo(videoId);
    const videoDetails = videoInfo.videoDetails;
    const title = videoDetails.title.replace(/[<>:"/\\|?*]/g, '');

    const formats = ytdl.filterFormats(videoInfo.formats, 'videoandaudio');
    let selectedFormat = formats.find(f => f.container === format);

    if (!selectedFormat) {
      selectedFormat = formats[0];
    }

    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${title}.${selectedFormat.container}"`);
    headers.set('Content-Type', 'video/mp4');

    const stream = ytdl.downloadFromInfo(videoInfo, { format: selectedFormat });

    return new NextResponse(stream as any, {
      headers,
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}