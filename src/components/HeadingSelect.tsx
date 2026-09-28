import React from 'react';
import { ChevronDown, PanelLeft } from 'lucide-react';
import type { PageHeading } from '../data/content';

export interface HeadingSelectProps {
  /** Page title, shown as the "top of page" option. */
  title: string;
  headings: PageHeading[];
  activeId: string;
  /** Empty id means "scroll to the top of the page". */
  onSelect: (id: string) => void;
  onOpenDrawer: () => void;
}

/**
 * Sticky jump-to-heading control for narrow viewports, where the fixed sidebars
 * are hidden. Sits below the navbar on every page that has headings or a tree.
 */
export const HeadingSelect: React.FC<HeadingSelectProps> = ({
  title,
  headings,
  activeId,
  onSelect,
  onOpenDrawer,
}) => (
  <div className="xl:hidden sticky top-14 z-20 -mx-4 sm:-mx-8 px-4 sm:px-8 pt-5 sm:pt-6 pb-3 bg-canvas-obsidian/95 backdrop-blur-md border-b border-hairline-outline shadow-sm flex items-center gap-2 relative">
    <button
      type="button"
      onClick={onOpenDrawer}
      className="lg:hidden p-2 rounded-lg bg-surface-container hover:bg-surface-elevated border border-hairline-outline hover:border-secondary/40 text-secondary transition-colors cursor-pointer shrink-0 flex items-center justify-center min-h-[38px] min-w-[38px]"
      title="Documentation Pages Index"
      aria-label="Toggle documentation side drawer"
    >
      <PanelLeft className="w-4 h-4 text-secondary" />
    </button>

    <select
      id="mobile-doc-selector"
      aria-label="Current document table of contents"
      value={activeId}
      onChange={(event) => onSelect(event.target.value)}
      className="flex-1 min-w-0 appearance-none bg-surface-container hover:bg-surface-elevated/70 border border-hairline-outline hover:border-secondary/40 focus:border-secondary focus:ring-1 focus:ring-secondary/30 text-text-primary font-mono text-sm rounded-lg px-3.5 py-2.5 pr-10 focus:outline-none transition-all cursor-pointer shadow-xs min-h-[38px]"
    >
      <option value="" className="bg-canvas-obsidian text-text-primary font-mono">
        {title} (Top)
      </option>
      {headings.map((heading) => (
        <option key={heading.id} value={heading.id} className="bg-canvas-obsidian text-text-primary font-mono">
          {heading.level === 3 ? '   └ ' : '• '}
          {heading.text}
        </option>
      ))}
    </select>

    <div className="pointer-events-none absolute right-7 sm:right-11 top-1/2 -translate-y-1/2 mt-1 sm:mt-1.5 flex items-center text-secondary/70">
      <ChevronDown className="w-4 h-4" />
    </div>
  </div>
);
