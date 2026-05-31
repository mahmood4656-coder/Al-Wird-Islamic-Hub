export type ItemCategory = 'wird' | 'dua' | 'quran' | 'darood' | 'janazah' | 'kalma' | 'children';

export interface AudioItem {
  id: string;
  title: string;
  arabicTitle: string;
  category: ItemCategory;
  arabicText?: string;
  translationText: string;
  translationUrdu?: string;
  audioUrl: string; // Direct link to stable Islamic/Quranic audio
  duration: string;
  benefits?: string;
}

export interface TasbihState {
  id: string;
  name: string;
  arabic: string;
  count: number;
  goal: number;
  completedCycles: number;
}

export type DownloadStatus = 'idle' | 'downloading' | 'downloaded';

export interface DownloadProgress {
  itemId: string;
  status: DownloadStatus;
  progress: number; // 0 to 100
}
