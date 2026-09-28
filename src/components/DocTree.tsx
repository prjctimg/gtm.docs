import React from 'react';
import { NavLink } from 'react-router';
import { DOCS_BY_CATEGORY, DOC_CATEGORIES, EXTRA_PAGES, type PageItem } from '../data/content';

export interface DocTreeProps {
  /** Fired after a link is followed, so a containing sheet can close itself. */
  onNavigate?: () => void;
  /** Denser rows for the fixed desktop sidebar. */
  compact?: boolean;
}

const CATEGORIES: Array<{ label: string; pages: PageItem[] }> = [
  ...DOC_CATEGORIES.map((category) => ({ label: category, pages: DOCS_BY_CATEGORY[category] })),
  ...(EXTRA_PAGES.length > 0 ? [{ label: 'More', pages: EXTRA_PAGES }] : []),
];

/**
 * The page index: every content page grouped by its frontmatter category, with
 * the pages that belong to no category listed last. Rendered twice — in the
 * desktop sidebar and in the mobile drawer — so it lives in one place.
 */
export const DocTree: React.FC<DocTreeProps> = ({ onNavigate, compact = false }) => {
  const rowPadding = compact ? 'py-1.5 px-2' : 'py-2 px-2.5';

  return (
    <>
      {CATEGORIES.map(({ label, pages }) => (
        <div key={label} className="space-y-1.5">
          <div className="text-xs font-bold text-text-muted tracking-wider uppercase flex items-center gap-1.5 px-1">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            <span>{label}</span>
          </div>

          <ul className="space-y-0.5 border-l border-hairline-subtle ml-2 pl-2">
            {pages.map((page) => (
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
        </div>
      ))}
    </>
  );
};
