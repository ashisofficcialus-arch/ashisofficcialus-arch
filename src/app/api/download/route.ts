'use server';

import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:5000';

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
    const { url, format, platform } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    if (platform === 'youtube' || platform === undefined) {
      const resolution = format?.resolution || '1080p';
      const resolutionMap: Record<string, string> = {
        '4K': '2160p',
        '2160p': '2160p',
        '1080p': '1080p',
        'HD': '1080p',
        '720p': '720p',
        '480p': '480p',
        '360p': '360p',
      };
      
      const targetRes = resolutionMap[resolution] || '1080p';
      
      const pythonResponse = await fetch(`${PYTHON_API_URL}/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, resolution: targetRes }),
      });

      if (!pythonResponse.ok) {
        const error = await pythonResponse.json();
        return NextResponse.json({ error: error.error || 'Download failed' }, { status: pythonResponse.status });
      }

      const headers = new Headers();
      headers.set('Content-Type', 'video/mp4');
      headers.set('Content-Disposition', 'attachment');
      
      return new NextResponse(pythonResponse.body, {
        headers,
      });
    }

    return NextResponse.json({ error: 'Only YouTube is supported for now' }, { status: 400 });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Download failed' 
    }, { status: 500 });
  }
}