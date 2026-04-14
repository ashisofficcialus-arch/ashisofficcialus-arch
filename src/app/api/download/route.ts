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

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    const videoInfo = await ytdl.getInfo(videoUrl, {
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      },
    });

    const videoDetails = videoInfo.videoDetails;
    const title = videoDetails.title.replace(/[<>:"/\\|?*]/g, '');
    const extension = format?.extension || 'mp4';
    
    const targetQuality = format?.resolution || format?.quality || 'highest';
    
    let selectedFormat;
    
    if (targetQuality === '4K' || targetQuality === '2160p') {
      selectedFormat = videoInfo.formats.find(f => f.itag === 137 || f.itag === 315);
    } else if (targetQuality === '1080p' || targetQuality === 'HD') {
      selectedFormat = videoInfo.formats.find(f => f.itag === 137 || f.itag === 248);
    } else if (targetQuality === '720p') {
      selectedFormat = videoInfo.formats.find(f => f.itag === 136 || f.itag === 247);
    } else if (targetQuality === '480p') {
      selectedFormat = videoInfo.formats.find(f => f.itag === 135 || f.itag === 244);
    } else if (targetQuality === '360p') {
      selectedFormat = videoInfo.formats.find(f => f.itag === 134 || f.itag === 243);
    } else if (targetQuality === '128kbps' || extension === 'mp3') {
      selectedFormat = videoInfo.formats.find(f => f.itag === 140);
    } else {
      selectedFormat = videoInfo.formats.find(f => f.itag === 137 || f.itag === 248) || 
                    videoInfo.formats.find(f => f.itag === 136) ||
                    videoInfo.formats.find(f => f.hasVideo && f.hasAudio);
    }

    if (!selectedFormat) {
      selectedFormat = ytdl.filterFormats(videoInfo.formats, 'videoandaudio')[0];
    }

    if (!selectedFormat) {
      return NextResponse.json({ 
        error: 'No format available. Video may require different quality.' 
      }, { status: 400 });
    }

    const stream = ytdl.downloadFromInfo(videoInfo, {
      format: selectedFormat,
    });

    const chunks: Buffer[] = [];
    
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    
    const buffer = Buffer.concat(chunks);
    const filename = `${title}_${videoId}.${selectedFormat.container || 'mp4'}`;

    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    headers.set('Content-Type', 'video/mp4');
    headers.set('Content-Length', buffer.length.toString());

    return new NextResponse(buffer, { headers });

  } catch (error) {
    console.error('Download error:', error);
    
    const message = error instanceof Error ? error.message : 'Download failed';
    
    if (message.includes('410') || message.includes('Gone') || message.includes('Video unavailable')) {
      return NextResponse.json({ 
        error: 'Video is unavailable. It may have been removed or made private.' 
      }, { status: 410 });
    }
    
    return NextResponse.json({ 
      error: `Download failed: ${message}` 
    }, { status: 500 });
  }
}