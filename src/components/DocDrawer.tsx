import React from 'react';
import { Search, X } from 'lucide-react';
import { DocTree } from './DocTree';

export interface DocDrawerProps {
  onClose: () => void;
  onOpenSearch: () => void;
}

/** Mobile slide-over carrying the same page index as the desktop sidebar. */
export const DocDrawer: React.FC<DocDrawerProps> = ({ onClose, onOpenSearch }) => (
  <div className="fixed inset-0 z-50 lg:hidden">
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
      onClick={onClose}
      aria-hidden="true"
    />

    <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-canvas-obsidian border-r border-hairline-outline shadow-2xl flex flex-col font-mono text-sm z-10 animate-in slide-in-from-left duration-200">
      <div className="flex items-center justify-end p-4 border-b border-hairline-outline bg-surface-container/50">
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-text-muted hover:text-text-primary rounded hover:bg-surface-elevated transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
          aria-label="Close documentation drawer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3.5 border-b border-hairline-outline bg-surface-container/30">
        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenSearch();
          }}
          className="w-full flex items-center justify-between px-3 py-2 bg-code-canvas border border-hairline-outline hover:border-secondary/50 rounded text-text-muted text-sm transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-secondary" />
            <span>Search</span>
          </div>
          <kbd className="px-1.5 py-0.5 bg-surface-elevated border border-hairline-outline rounded text-xs text-text-muted">
            /
          </kbd>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <DocTree onNavigate={onClose} />
      </div>
    </div>
  </div>
);
