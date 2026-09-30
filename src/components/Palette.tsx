import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { DOCS, EXTRA_PAGES, type PageItem } from '../data/content';
import { Search, BookOpen, ArrowRight, X } from 'lucide-react';

interface PaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchItem {
  title: string;
  /** Right-hand label: which part of the site the row belongs to. */
  context: string;
  /** Where selecting the entry navigates, anchor included. */
  path: string;
}

export const Palette: React.FC<PaletteProps> = ({
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

  // Every content file is searchable: a top-level entry plus one per section.
  const itemsFor = (page: PageItem): SearchItem[] => [
    {
      title: `${page.title} — ${page.description || 'Guide'}`,
      context: page.isDoc ? 'Docs' : page.title,
      path: page.path
    },
    ...page.headings.map(heading => ({
      title: `${page.title} > ${heading.text}`,
      context: page.title,
      path: `${page.path}#${heading.id}`
    }))
  ];

  // Docs first, so the default list leads with the main documentation. Every
  // content file contributes a top-level entry plus one per section, so the
  // keybinding page is searchable without a hand-maintained index.
  const allItems: SearchItem[] = [
    ...DOCS.flatMap(itemsFor),
    ...EXTRA_PAGES.flatMap(itemsFor)
  ];

  const filteredItems = query.trim()
    ? allItems.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.context.toLowerCase().includes(query.toLowerCase())
      )
    : allItems.slice(0, 10);

  const handleSelect = (item: SearchItem) => {
    onClose();
    navigate(item.path);
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
          <kbd className="px-1.5 py-0.5 bg-selection-surface border border-hairline-outline rounded text-xs font-mono text-text-muted shrink-0">
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
                    <BookOpen className="w-3.5 h-3.5 text-secondary shrink-0" />
                    <span className="truncate text-text-primary font-medium">
                      {item.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-xs text-text-muted uppercase">
                      {item.context}
                    </span>
                    {isSelected && <ArrowRight className="w-3 h-3 text-secondary" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-canvas-obsidian border-t border-hairline-outline flex items-center justify-center text-xs font-mono text-text-muted">
          <span>Navigate with [↑][↓], Select with [Enter]</span>
        </div>
      </div>
    </div>
  );
};
