export type PageTab = 'home' | 'docs' | 'install' | 'bench';
export type Theme = 'dark' | 'light';

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
