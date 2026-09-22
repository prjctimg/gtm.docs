import React from 'react';
import { Link } from 'react-router';
import { FileQuestion, ArrowLeft, BookOpen, Search } from 'lucide-react';
import { usePageMeta } from '../lib/meta';

interface NotFoundPageProps {
  onOpenSearch?: () => void;
}

/**
 * Real client-side 404 page. Rendered for unknown /docs/:docId URLs (URL is
 * preserved) and as the catch-all route for every other unknown path.
 */
export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onOpenSearch }) => {
  usePageMeta(
    'Page not found | gtm',
    'The page you are looking for does not exist or has moved.'
  );

  return (
    <div className="w-full flex flex-col items-center justify-center px-4 py-20 sm:py-28 text-center min-h-[60vh]">
      <div className="font-mono text-7xl sm:text-8xl font-bold leading-none text-secondary/80 select-none">
        404
      </div>

      <h1 className="mt-6 font-mono text-xl sm:text-2xl font-bold text-text-primary">
        Page not found
      </h1>

      <p className="mt-3 max-w-md text-sm text-text-muted leading-relaxed font-sans">
        The page you are looking for doesn&apos;t exist, was moved, or never
        lived here. Double-check the URL, or head back to something that does.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container border border-hairline-outline hover:border-secondary/40 hover:bg-surface-elevated text-xs font-mono text-text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-secondary" />
          <span>Back to Home</span>
        </Link>

        <Link
          to="/docs/overview"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary/10 border border-secondary/30 hover:bg-secondary/20 text-xs font-mono text-secondary font-bold transition-colors cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Browse the Docs</span>
        </Link>

        {onOpenSearch && (
          <button
            type="button"
            onClick={onOpenSearch}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container border border-hairline-outline hover:border-secondary/40 hover:bg-surface-elevated text-xs font-mono text-text-primary transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-secondary" />
            <span>Search Docs</span>
          </button>
        )}
      </div>
    </div>
  );
};