import React, { useEffect } from 'react';
import { KEYBINDINGS } from '../data/mockData';
import { X, Keyboard, Command } from 'lucide-react';

interface KeymapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeymapModal: React.FC<KeymapModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-surface-container border border-hairline-outline rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-canvas-obsidian border-b border-hairline-outline">
          <div className="flex items-center gap-2.5">
            <Keyboard className="w-4 h-4 text-secondary" />
            <h3 className="font-mono text-sm font-bold text-text-primary">
              Vim Keybindings &amp; Hotkey Cheatsheet
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of shortcuts */}
        <div className="p-5 overflow-y-auto divide-y divide-hairline-subtle font-mono text-xs">
          {KEYBINDINGS.map((item, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between hover:bg-surface-elevated/40 px-2 rounded transition-colors">
              <div className="flex items-center gap-3">
                <kbd className="px-2 py-1 bg-code-canvas border border-hairline-outline text-secondary font-bold rounded shadow-xs text-xs">
                  {item.key}
                </kbd>
                <span className="text-text-body font-sans text-sm">
                  {item.action}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-surface-elevated border border-hairline-outline text-text-muted text-[11px]">
                {item.scope}
              </span>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 bg-canvas-obsidian border-t border-hairline-outline flex items-center justify-between text-xs font-mono text-text-muted">
          <span>Configurable in ~/.config/gtm/keymap.toml</span>
          <kbd className="px-1.5 py-0.5 rounded bg-surface-elevated border border-hairline-outline text-[11px]">
            ESC to close
          </kbd>
        </div>
      </div>
    </div>
  );
};
