import React from 'react';
import { Search } from 'lucide-react';
import { DocTree } from './DocTree';

export interface DocNavProps {
  onOpenSearch: () => void;
}

/** Fixed left-hand page index, shown from the `lg` breakpoint up. */
export const DocNav: React.FC<DocNavProps> = ({ onOpenSearch }) => (
  <aside className="w-72 shrink-0 border-r border-hairline-outline bg-canvas-obsidian px-4 pt-6 pb-6 hidden lg:block sticky top-14 self-start max-h-[calc(100vh-56px)] overflow-y-auto font-mono text-sm">
    <div className="relative mb-5">
      <button
        onClick={onOpenSearch}
        className="w-full flex items-center justify-between pl-8 pr-3 py-2 bg-code-canvas border border-hairline-outline hover:border-primary-container rounded text-text-muted text-sm transition-colors cursor-pointer text-left"
      >
        <Search className="w-3.5 h-3.5 absolute left-2.5 text-secondary" />
        <span>Search</span>
        <kbd className="px-1.5 py-0.5 bg-surface-elevated border border-hairline-outline rounded text-xs text-text-muted">
          /
        </kbd>
      </button>
    </div>

    <div className="space-y-6">
      <DocTree compact />
    </div>
  </aside>
);
