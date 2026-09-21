import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { PageTab } from '../types';
import { KEYBINDINGS } from '../data/site';
import { ALL_DOCS } from '../data/docs';
import { Search, BookOpen, Keyboard, ArrowRight, X } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchItem {
  title: string;
  category: string;
  tab: PageTab;
  docId?: string;
  sectionId?: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Build searchable items
  const installItems: SearchItem[] = [
    { title: 'Install gtm (curl script, cargo, source, Termux)', category: 'Installation', tab: 'install' },
    { title: 'Quick Install Script (stable and nightly)', category: 'Installation // Script', tab: 'install' },
    { title: 'Cargo Install (crates.io, locked deps)', category: 'Installation // Cargo', tab: 'install' },
    { title: 'Build from Source (git clone, cargo build)', category: 'Installation // Source', tab: 'install' },
    { title: 'Termux Android Build (make termux)', category: 'Installation // Termux', tab: 'install' }
  ];

  // Dynamic docs from all live MDX content files
  const docItems: SearchItem[] = [];
  ALL_DOCS.forEach(doc => {
    // Top-level document item
    docItems.push({
      title: `${doc.title} — ${doc.description || 'Guide'}`,
      category: `Docs // ${doc.category}`,
      tab: 'docs',
      docId: doc.id
    });

    // Sub-headings inside document
    doc.headings.forEach(h => {
      docItems.push({
        title: `${doc.title} > ${h.text}`,
        category: `Docs // ${doc.title}`,
        tab: 'docs',
        docId: doc.id,
        sectionId: h.id
      });
    });
  });

  const keyItems: SearchItem[] = KEYBINDINGS.map(k => ({
    title: `${k.key}: ${k.action} (${k.scope})`,
    category: 'Keybindings',
    tab: 'docs',
    docId: 'interface',
    sectionId: 'keybindings'
  }));

  const allItems: SearchItem[] = [...installItems, ...docItems, ...keyItems];

  const filteredItems = query.trim()
    ? allItems.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      )
    : allItems.slice(0, 10);

  const handleSelect = (item: SearchItem) => {
    onClose();
    if (item.tab === 'install') {
      navigate('/install');
    } else {
      navigate(`/docs/${item.docId}${item.sectionId ? `#${item.sectionId}` : ''}`);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + (filteredItems.length || 1)) % (filteredItems.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          handleSelect(filteredItems[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-surface-container border border-primary-container/70 rounded-xl max-w-xl w-full flex flex-col shadow-[0_16px_50px_rgba(0,0,0,0.85)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 bg-code-canvas border-b border-hairline-outline gap-3">
          <Search className="w-4 h-4 text-secondary shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a topic, e.g. 'spotify', 'lyrics', 'crossfade', 'eq'..."
            className="w-full bg-transparent border-none text-text-primary text-sm font-mono focus:outline-none placeholder:text-text-disabled"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-text-muted hover:text-text-primary p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="px-1.5 py-0.5 bg-selection-surface border border-hairline-outline rounded text-[10px] font-mono text-text-muted shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-hairline-subtle font-mono text-xs">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-text-muted font-mono">
              No matching doc topics or commands found for "{query}"
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={idx}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-3 py-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-selection-surface text-secondary border border-hairline-outline'
                      : 'text-text-body hover:bg-surface-elevated/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    {item.category.includes('Keybinding') ? (
                      <Keyboard className="w-3.5 h-3.5 text-state-warning shrink-0" />
                    ) : (
                      <BookOpen className="w-3.5 h-3.5 text-secondary shrink-0" />
                    )}
                    <span className="truncate text-text-primary font-medium">
                      {item.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-[10px] text-text-muted uppercase">
                      {item.category}
                    </span>
                    {isSelected && <ArrowRight className="w-3 h-3 text-secondary" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-canvas-obsidian border-t border-hairline-outline flex items-center justify-between text-[11px] font-mono text-text-muted">
          <span>Navigate with [↑][↓], Select with [Enter]</span>
          <span className="text-secondary">{ALL_DOCS.length} live docs loaded</span>
        </div>
      </div>
    </div>
  );
};
