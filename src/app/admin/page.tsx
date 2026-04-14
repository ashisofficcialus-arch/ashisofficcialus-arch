'use client';

import { useState } from 'react';
import { 
  Activity, 
  Server, 
  Clock, 
  Download, 
  AlertTriangle, 
  CheckCircle2,
  Cpu,
  HardDrive,
  Zap
} from 'lucide-react';
import { AppLayout } from '@/components/layout/Sidebar';
import { cn } from '@/lib/utils';

const mockStats = {
  totalDownloads: 1247,
  activeDownloads: 3,
  totalSize: '45.2 GB',
  uptime: '14 days, 6 hours',
};

const mockExtractors = [
  { name: 'YouTube', status: 'healthy', requests: 543, latency: '120ms' },
  { name: 'Instagram', status: 'healthy', requests: 234, latency: '250ms' },
  { name: 'TikTok', status: 'healthy', requests: 189, latency: '180ms' },
  { name: 'Facebook', status: 'degraded', requests: 89, latency: '800ms' },
  { name: 'Twitter', status: 'healthy', requests: 67, latency: '150ms' },
  { name: 'Pinterest', status: 'healthy', requests: 45, latency: '200ms' },
];

const mockLogs = [
  { time: '07:52:30', level: 'info', message: 'New download request: YouTube video (1080p)' },
  { time: '07:52:28', level: 'info', message: 'Extraction completed: TikTok video ID: 7234567890' },
  { time: '07:52:25', level: 'warn', message: 'Rate limit approaching for Facebook extractor' },
  { time: '07:52:22', level: 'info', message: 'Format conversion started: MP4 -> MP3' },
  { time: '07:52:20', level: 'error', message: 'Failed to fetch Instagram video: Account private' },
  { time: '07:52:18', level: 'info', message: 'Download completed: YouTube video (720p)' },
];

const mockSystemInfo = {
  cpu: { usage: 34, cores: 8 },
  memory: { used: '2.4 GB', total: '8 GB', percentage: 30 },
  disk: { used: '12.5 GB', total: '100 GB', percentage: 12.5 },
  network: { upload: '1.2 Mbps', download: '8.4 Mbps' },
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'extractors' | 'logs'>('overview');

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-outfit font-bold">Admin Panel</h1>
          <p className="text-silver">Monitor system health and manage extractors</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-charcoal rounded-2xl border border-graphite">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-violet/20 flex items-center justify-center">
                <Download className="w-5 h-5 text-violet" />
              </div>
              <span className="text-sm text-zinc">Total Downloads</span>
            </div>
            <div className="text-3xl font-bold">{mockStats.totalDownloads.toLocaleString()}</div>
          </div>
          <div className="p-5 bg-charcoal rounded-2xl border border-graphite">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-cyan/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-cyan" />
              </div>
              <span className="text-sm text-zinc">Active</span>
            </div>
            <div className="text-3xl font-bold">{mockStats.activeDownloads}</div>
          </div>
          <div className="p-5 bg-charcoal rounded-2xl border border-graphite">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald/20 flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-emerald" />
              </div>
              <span className="text-sm text-zinc">Total Size</span>
            </div>
            <div className="text-3xl font-bold">{mockStats.totalSize}</div>
          </div>
          <div className="p-5 bg-charcoal rounded-2xl border border-graphite">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber" />
              </div>
              <span className="text-sm text-zinc">Uptime</span>
            </div>
            <div className="text-3xl font-bold">{mockStats.uptime}</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="p-6 bg-charcoal rounded-2xl border border-graphite">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-violet" />
              System Resources
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-silver">CPU Usage</span>
                  <span className="text-white">{mockSystemInfo.cpu.usage}%</span>
                </div>
                <div className="h-2 bg-surface rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-violet to-cyan rounded-full transition-all"
                    style={{ width: `${mockSystemInfo.cpu.usage}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-silver">Memory</span>
                  <span className="text-white">{mockSystemInfo.memory.used} / {mockSystemInfo.memory.total}</span>
                </div>
                <div className="h-2 bg-surface rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-violet to-cyan rounded-full transition-all"
                    style={{ width: `${mockSystemInfo.memory.percentage}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-silver">Disk</span>
                  <span className="text-white">{mockSystemInfo.disk.used} / {mockSystemInfo.disk.total}</span>
                </div>
                <div className="h-2 bg-surface rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-violet to-cyan rounded-full transition-all"
                    style={{ width: `${mockSystemInfo.disk.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-charcoal rounded-2xl border border-graphite">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-violet" />
              Network
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-surface rounded-xl">
                <div className="flex items-center gap-2 text-sm text-zinc mb-1">
                  <Zap className="w-4 h-4" />
                  Upload
                </div>
                <div className="text-xl font-bold text-white">{mockSystemInfo.network.upload}</div>
              </div>
              <div className="p-4 bg-surface rounded-xl">
                <div className="flex items-center gap-2 text-sm text-zinc mb-1">
                  <Zap className="w-4 h-4" />
                  Download
                </div>
                <div className="text-xl font-bold text-white">{mockSystemInfo.network.download}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-charcoal rounded-2xl border border-graphite">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-violet" />
            Platform Extractors
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-graphite">
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc">Platform</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-zinc">Requests</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-zinc">Latency</th>
                </tr>
              </thead>
              <tbody>
                {mockExtractors.map((extractor) => (
                  <tr key={extractor.name} className="border-b border-graphite/50">
                    <td className="py-3 px-4 text-white">{extractor.name}</td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium',
                        extractor.status === 'healthy' 
                          ? 'bg-emerald/20 text-emerald'
                          : 'bg-amber/20 text-amber'
                      )}>
                        {extractor.status === 'healthy' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                        {extractor.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-silver">{extractor.requests}</td>
                    <td className="py-3 px-4 text-right text-silver">{extractor.latency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-6 bg-charcoal rounded-2xl border border-graphite">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-violet" />
            System Logs
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {mockLogs.map((log, i) => (
              <div 
                key={i} 
                className="flex items-start gap-3 p-3 bg-surface rounded-lg"
              >
                <span className="text-xs text-zinc font-mono">{log.time}</span>
                <span className={cn(
                  'text-xs font-medium px-1.5 py-0.5 rounded',
                  log.level === 'error' && 'bg-rose/20 text-rose',
                  log.level === 'warn' && 'bg-amber/20 text-amber',
                  log.level === 'info' && 'bg-cyan/20 text-cyan'
                )}>
                  {log.level}
                </span>
                <span className="text-sm text-silver flex-1">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
