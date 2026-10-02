import React from 'react';
import { NavLink } from 'react-router';
import { DOCS, EXTRA_PAGES, type PageItem } from '../data/content';

export interface DocTreeProps {
  /** Fired after a link is followed, so a containing sheet can close itself. */
  onNavigate?: () => void;
  /** Denser rows for the fixed desktop sidebar. */
  compact?: boolean;
}

/**
 * The page index: every content file in frontmatter `order` — the `/docs/` pages
 * first, then the top-level pages served outside `/docs/`, as one continuous
 * list. Rendered twice, in the desktop sidebar and in the mobile drawer, so it
 * lives in one place.
 */
export const DocTree: React.FC<DocTreeProps> = ({ onNavigate, compact = false }) => {
  const rowPadding = compact ? 'py-1.5 px-2' : 'py-2 px-2.5';

  const pages = [...DOCS, ...EXTRA_PAGES];

  return (
    <ul className="space-y-0.5 border-l border-hairline-subtle ml-2 pl-2">
      {pages.map((page: PageItem) => (
        <li key={page.id}>
          <NavLink
            to={page.path}
            onClick={onNavigate}
            className={({ isActive }) =>
              `w-full text-left rounded text-sm cursor-pointer transition-colors flex items-center gap-1.5 ${rowPadding} ${
                isActive
                  ? 'bg-surface-elevated text-secondary font-bold border border-secondary/30'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface-elevated/40'
              }`
            }
          >
            <span className="truncate">{page.title}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  );
};