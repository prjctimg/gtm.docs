import React from 'react';
import { Check, Copy, ListTree } from 'lucide-react';
import type { PageHeading } from '../data/content';
import { useCopy } from '../lib/copy';

export interface DocTocProps {
  headings: PageHeading[];
  /** Heading currently at the top of the viewport. */
  activeId: string;
  onSelect: (id: string) => void;
}

/** Fixed right-hand table of contents, shown from the `xl` breakpoint up. */
export const DocToc: React.FC<DocTocProps> = ({ headings, activeId, onSelect }) => {
  const [copied, copy] = useCopy();

  return (
    <aside className="w-60 shrink-0 border-l border-hairline-outline bg-canvas-obsidian px-6 pt-6 pb-6 hidden xl:block sticky top-14 self-start max-h-[calc(100vh-56px)] overflow-y-auto font-mono text-sm">
      <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <ListTree className="w-3.5 h-3.5 text-secondary" />
        <span>On this page</span>
      </div>

      {headings.length === 0 ? (
        <p className="text-text-muted text-xs italic">No sub-sections</p>
      ) : (
        <ul className="space-y-1.5 border-l border-hairline-outline pl-3">
          {headings.map((heading) => (
            <li key={heading.id} style={heading.level === 3 ? { paddingLeft: '8px' } : undefined}>
              <button
                onClick={() => onSelect(heading.id)}
                className={`block text-left transition-colors cursor-pointer text-sm truncate max-w-[180px] ${
                  activeId === heading.id
                    ? 'text-secondary font-bold'
                    : 'text-text-muted hover:text-text-primary'
                }`}
                title={heading.text}
              >
                {heading.text}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 pt-6 border-t border-hairline-outline space-y-2.5">
        <button
          onClick={() => copy(window.location.href)}
          className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors text-sm cursor-pointer w-full text-left"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-state-success" />
              <span className="text-state-success">Link Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Page URL</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
