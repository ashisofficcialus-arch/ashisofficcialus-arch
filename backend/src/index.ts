import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { exec } from 'child_process';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import type { VideoMetadata, VideoFormat, DownloadJob, Platform } from './types';

const execAsync = promisify(exec);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

const platformPatterns: Record<string, RegExp[]> = {
  youtube: [/youtube\.com|youtu\.be|youtube\.io/],
  instagram: [/instagram\.com/],
  tiktok: [/tiktok\.com/],
  pinterest: [/pinterest\.com/],
  facebook: [/facebook\.com|fb\.watch/],
  twitter: [/twitter\.com|x\.com/],
  vimeo: [/vimeo\.com/],
  reddit: [/reddit\.com|redd\.it/],
};

function detectPlatform(url: string): Platform {
  for (const [platform, patterns] of Object.entries(platformPatterns)) {
    if (patterns.some(pattern => pattern.test(url))) {
      return platform as Platform;
    }
  }
  return 'unknown';
}

async function getVideoMetadata(url: string, platform: Platform): Promise<VideoMetadata> {
  const command = `yt-dlp --dump-json --no-playlist "${url}"`;
  
  try {
    const { stdout } = await execAsync(command, { maxBuffer: 10 * 1024 * 1024 });
    const data = JSON.parse(stdout);
    
    return {
      id: data.id || uuidv4(),
      url,
      title: data.title || 'Untitled',
      description: data.description,
      thumbnail: data.thumbnail || data.thumbnails?.[0]?.url || '',
      duration: data.duration || 0,
      author: data.uploader || data.creator || 'Unknown',
      authorUrl: data.uploader_url,
      platform,
      viewCount: data.view_count,
      uploadDate: data.upload_date,
    };
  } catch (error) {
    console.error('Metadata extraction error:', error);
    throw new Error('Failed to extract video metadata');
  }
}

async function getVideoFormats(url: string): Promise<VideoFormat[]> {
  const command = `yt-dlp --dump-json --no-playlist --flat-list "${url}"`;
  
  try {
    const { stdout } = await execAsync(command, { maxBuffer: 10 * 1024 * 1024 });
    const data = JSON.parse(stdout);
    
    const formats: VideoFormat[] = [];
    
    if (data.formats) {
      for (const fmt of data.formats) {
        formats.push({
          formatId: fmt.format_id,
          extension: fmt.ext || 'unknown',
          resolution: fmt.resolution || (fmt.height ? `${fmt.height}p` : undefined),
          quality: fmt.quality || fmt.height?.toString() || 'unknown',
          filesize: fmt.filesize || fmt.filesize_approx,
          bitrate: fmt.tbr,
          codec: fmt.vcodec !== 'none' ? fmt.vcodec : undefined,
          hasVideo: fmt.vcodec !== 'none',
          hasAudio: fmt.acodec !== 'none',
        });
      }
    }
    
    if (data.requested_formats) {
      for (const fmt of data.requested_formats) {
        if (!formats.find(f => f.formatId === fmt.format_id)) {
          formats.push({
            formatId: fmt.format_id,
            extension: fmt.ext || 'unknown',
            resolution: fmt.resolution || (fmt.height ? `${fmt.height}p` : undefined),
            quality: fmt.quality || fmt.height?.toString() || 'unknown',
            filesize: fmt.filesize || fmt.filesize_approx,
            bitrate: fmt.tbr,
            codec: fmt.vcodec !== 'none' ? fmt.vcodec : undefined,
            hasVideo: fmt.vcodec !== 'none',
            hasAudio: fmt.acodec !== 'none',
          });
        }
      }
    }
    
    return formats.sort((a, b) => {
      const resA = parseInt(a.resolution || '0');
      const resB = parseInt(b.resolution || '0');
      return resB - resA;
    });
  } catch (error) {
    console.error('Format extraction error:', error);
    throw new Error('Failed to extract video formats');
  }
}

async function getDownloadUrl(url: string, formatId: string): Promise<string> {
  const command = `yt-dlp -g -f "${formatId}" "${url}"`;
  
  try {
    const { stdout } = await execAsync(command);
    const urls = stdout.trim().split('\n');
    return urls[0];
  } catch (error) {
    console.error('Download URL extraction error:', error);
    throw new Error('Failed to get download URL');
  }
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/metadata', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    const platform = detectPlatform(url);
    const metadata = await getVideoMetadata(url, platform);
    const formats = await getVideoFormats(url);
    
    res.json({ metadata, formats });
  } catch (error) {
    console.error('Metadata endpoint error:', error);
    res.status(500).json({ error: 'Failed to fetch video metadata' });
  }
});

app.post('/api/download', async (req, res) => {
  try {
    const { url, formatId } = req.body;
    
    if (!url || !formatId) {
      return res.status(400).json({ error: 'URL and formatId are required' });
    }
    
    const platform = detectPlatform(url);
    const downloadUrl = await getDownloadUrl(url, formatId);
    
    res.json({ 
      downloadUrl,
      platform,
      jobId: uuidv4(),
    });
  } catch (error) {
    console.error('Download endpoint error:', error);
    res.status(500).json({ error: 'Failed to generate download URL' });
  }
});

app.get('/api/formats', async (req, res) => {
  try {
    const url = req.query.url as string;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    const formats = await getVideoFormats(url);
    res.json({ formats });
  } catch (error) {
    console.error('Formats endpoint error:', error);
    res.status(500).json({ error: 'Failed to fetch formats' });
  }
});

app.listen(PORT, () => {
  console.log(`VideoForge API running on port ${PORT}`);
});

export default app;
