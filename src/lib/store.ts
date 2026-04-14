import { create } from 'zustand';
import type { DownloadItem, QueueState, VideoMetadata, VideoFormat, DownloadStatus } from '@/types';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export const useQueueStore = create<QueueState>((set) => ({
  items: [],

  addItem: (item) =>
    set((state) => ({
      items: [
        ...state.items,
        {
          ...item,
          id: generateId(),
          status: 'queued' as DownloadStatus,
          progress: 0,
          createdAt: new Date(),
        },
      ],
    })),

  updateItem: (id, updates) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    })),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),

  clearCompleted: () =>
    set((state) => ({
      items: state.items.filter(
        (item) => item.status !== 'completed' && item.status !== 'error' && item.status !== 'cancelled'
      ),
    })),
}));

interface AppState {
  isProcessing: boolean;
  currentUrl: string;
  selectedFormat: VideoFormat | null;
  setProcessing: (processing: boolean) => void;
  setCurrentUrl: (url: string) => void;
  setSelectedFormat: (format: VideoFormat | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isProcessing: false,
  currentUrl: '',
  selectedFormat: null,
  setProcessing: (isProcessing) => set({ isProcessing }),
  setCurrentUrl: (currentUrl) => set({ currentUrl }),
  setSelectedFormat: (selectedFormat) => set({ selectedFormat }),
}));
