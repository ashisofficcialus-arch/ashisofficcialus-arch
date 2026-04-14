# VideoForge - Enterprise Video Downloader Platform

## Project Overview

- **Project Name**: VideoForge
- **Type**: Full-stack web application (Next.js + Backend Microservice)
- **Core Functionality**: Multi-platform video downloading with streaming support using yt-dlp/FFmpeg
- **Target Users**: General users needing to download videos from various social platforms

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Dashboard  │  │  Downloads  │  │     Admin Panel     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND API (Node.js)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Extractor  │  │   Queue     │  │    FFmpeg Worker    │  │
│  │   Engine    │  │  Manager    │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      EXTERNAL APIS                          │
│  ┌────────┐ ┌──────────┐ ┌────────┐ ┌───────┐ ┌─────────┐  │
│  │YouTube │ │Instagram │ │ TikTok │ │Facebook│ │ Twitter │  │
│  └────────┘ └──────────┘ └────────┘ └───────┘ └─────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## UI/UX Specification

### Color Palette

| Role | Color | Hex Code |
|------|-------|----------|
| Background Primary | Obsidian Black | `#0A0A0B` |
| Background Secondary | Charcoal | `#141416` |
| Background Tertiary | Dark Gray | `#1C1C1F` |
| Surface | Slate | `#252529` |
| Border | Graphite | `#2E2E33` |
| Primary Accent | Electric Violet | `#8B5CF6` |
| Primary Hover | Violet Light | `#A78BFA` |
| Secondary Accent | Cyan | `#22D3EE` |
| Success | Emerald | `#10B981` |
| Warning | Amber | `#F59E0B` |
| Error | Rose | `#F43F5E` |
| Text Primary | White | `#FAFAFA` |
| Text Secondary | Silver | `#A1A1AA` |
| Text Muted | Zinc | `#71717A` |

### Typography

- **Font Family**: `Outfit` (headings), `DM Sans` (body)
- **Headings**: 
  - H1: 48px/56px, weight 700
  - H2: 36px/44px, weight 600
  - H3: 24px/32px, weight 600
  - H4: 18px/24px, weight 500
- **Body**: 16px/24px, weight 400
- **Small**: 14px/20px, weight 400
- **Caption**: 12px/16px, weight 500

### Spacing System

- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96px

### Responsive Breakpoints

| Breakpoint | Width | Columns |
|------------|-------|---------|
| Mobile | < 640px | 1 |
| Tablet | 640px - 1024px | 2 |
| Desktop | 1024px - 1440px | 3 |
| Wide | > 1440px | 4 |

### Visual Effects

- **Border Radius**: 
  - Small: 6px
  - Medium: 12px
  - Large: 16px
  - XL: 24px
- **Shadows**:
  - Card: `0 4px 24px rgba(0,0,0,0.4)`
  - Elevated: `0 8px 32px rgba(0,0,0,0.5)`
  - Glow: `0 0 40px rgba(139,92,246,0.3)`
- **Animations**:
  - Shimmer: 1.5s ease-in-out infinite
  - Fade In: 300ms ease-out
  - Slide Up: 400ms cubic-bezier(0.16,1,0.3,1)
  - Scale: 200ms ease-out

---

## Components Specification

### 1. URL Input Component
- Drag-and-drop zone with dashed border
- Paste detection with visual feedback
- Platform auto-detection with icon badges
- States: idle, processing, valid, error

### 2. Preview Card
- Thumbnail with gradient overlay
- Title, author, duration display
- Platform badge (color-coded)
- Quality selector dropdown

### 3. Download Queue Item
- Progress bar with percentage
- Platform icon + title
- Status indicator (queued, processing, complete, error)
- Cancel/Retry actions

### 4. Quality Selector
- Format options: MP4, WEBM, MP3, WAV
- Resolution: 2160p, 1080p, 720p, 480p, 360p
- Audio quality: 320kbps, 256kbps, 128kbps

### 5. Shimmer Skeleton
- Animated gradient sweep
- Match content layout exactly

### 6. Real-time Preview Player
- Video thumbnail with play overlay
- Volume control
- Full-screen toggle

---

## Page Structure

### 1. Landing/Dashboard (`/`)
- Hero section with URL input
- Platform icons grid
- Recent downloads carousel
- Quick stats panel

### 2. Downloads (`/downloads`)
- Active downloads queue
- Completed downloads history
- Storage management

### 3. Admin (`/admin`)
- System health metrics
- Usage analytics
- Log viewer
- Extractor status

---

## Functionality Specification

### Core Features

1. **URL Parsing**
   - Auto-detect platform from URL
   - Validate URL format
   - Extract video ID

2. **Metadata Fetching**
   - Fetch video details via yt-dlp
   - Display thumbnail, title, duration
   - Show available formats

3. **Download Processing**
   - Queue management with priority
   - Progress tracking
   - Retry logic with exponential backoff

4. **Format Conversion**
   - FFmpeg pipeline for conversions
   - Support: MP4, WEBM, MP3, WAV, AAC

5. **Streaming Output**
   - Direct URL return to client
   - Signed URLs for security
   - Chunked transfer encoding

### Supported Platforms

- YouTube
- Instagram
- TikTok
- Pinterest
- Facebook
- Twitter/X
- Vimeo
- Reddit

---

## Acceptance Criteria

### Visual Checkpoints
- [ ] Dark theme applied consistently
- [ ] Shimmer animations smooth (60fps)
- [ ] Drag-and-drop zone responsive
- [ ] Mobile layout optimized
- [ ] Platform icons color-coded

### Functional Checkpoints
- [ ] URL validation works
- [ ] Metadata preview displays
- [ ] Quality options selectable
- [ ] Download progress tracking
- [ ] Queue management functional

### Performance
- [ ] First contentful paint < 1.5s
- [ ] Time to interactive < 3s
- [ ] Lighthouse score > 80

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: TailwindCSS, Radix UI
- **State**: Zustand
- **Backend**: Node.js, Express
- **Video Engine**: yt-dlp, FFmpeg
- **Queue**: In-memory (default), Upstash Redis (optional)
- **Auth**: Supabase (optional)
- **Deployment**: Docker, Railway/Render
