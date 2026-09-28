import React from 'react';
import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';

export interface Crumb {
  label: string;
  /** Omit for a crumb that is not a link. */
  to?: string;
}

export interface DocBreadcrumbProps {
  /** Ordered from the site root; the last crumb is the current page. */
  trail: Crumb[];
}

/**
 * The last crumb is the current page and scrolls to the top of it, so a reader
 * deep in a long page has a way back to the heading they landed on.
 */
export const DocBreadcrumb: React.FC<DocBreadcrumbProps> = ({ trail }) => {
  const current = trail[trail.length - 1];
  const ancestors = trail.slice(0, -1);

  return (
    <nav
      id="docs-breadcrumb-nav"
      aria-label="Breadcrumbs"
      className="flex items-center gap-1.5 text-sm font-mono text-text-muted flex-wrap"
    >
      {ancestors.map((crumb) => (
        <React.Fragment key={crumb.label}>
          {crumb.to ? (
            <Link
              to={crumb.to}
              className="hover:text-text-primary hover:underline transition-colors cursor-pointer"
              title={`Go to ${crumb.label}`}
            >
              {crumb.label}
            </Link>
          ) : (
            <span>{crumb.label}</span>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-hairline-outline shrink-0" />
        </React.Fragment>
      ))}

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="text-secondary font-semibold hover:underline transition-colors cursor-pointer text-left"
        title="Scroll to top of current page"
      >
        {current?.label}
      </button>
    </nav>
  );
};
