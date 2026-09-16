export type PageTab = 'home' | 'docs' | 'blog' | 'install';

export interface BlogPost {
  id: string;
  category: string;
  categoryColor: string;
  date: string;
  readTime: string;
  title: string;
  author?: string;
  summary: string;
  codeSnippet?: {
    filename: string;
    badge?: string;
    code: string;
  };
  metrics?: {
    rss?: string;
    bootTime?: string;
    lto?: string;
    fps?: string;
    diffOps?: string;
    bufferRewrite?: string;
    status?: string;
  };
  commandSnippet?: string;
  trackPreview?: {
    title: string;
    time: string;
    line1: string;
    line2: string;
  };
  whitepaperContent?: string;
}

export interface BenchmarkRow {
  player: string;
  version?: string;
  rss: string;
  coldBoot: string;
  accuracy: string;
  cpu: string;
  isHero?: boolean;
}

export interface KeybindingItem {
  key: string;
  action: string;
  scope: string;
}

export interface DocSection {
  id: string;
  number: string;
  title: string;
  category: string;
}
