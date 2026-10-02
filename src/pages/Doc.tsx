import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { ArrowLeft, ArrowRight, ArrowUpRight, Clock, Github } from 'lucide-react';
import { DOCS, pageAtPath, type PageItem } from '../data/content';
import { Markdown } from '../components/Markdown';
import { DocDrawer } from '../components/DocDrawer';
import { DocNav } from '../components/DocNav';
import { DocToc } from '../components/DocToc';
import { HeadingSelect } from '../components/HeadingSelect';
import { CONTENT_BLOB_URL, useCommitDate } from '../lib/commit-date';
import { usePageMeta } from '../lib/meta';
import { useRelativeTime } from '../lib/relative-time';
import { useScrollSpy } from '../lib/scroll-spy';
import { useLatestReleaseTag } from '../lib/version';
import { NotFound } from './NotFound';

export interface DocProps {
  onOpenSearch: () => void;
}

/**
 * Renders whichever content file the URL points at. Every page in `content/` is
 * reachable this way, so there is one route and no per-page wiring: a `/docs/<id>`
 * path, a top-level path declared with `path:` in frontmatter, and anything else
 * gets the 404 page with its URL preserved.
 */
export const Doc: React.FC<DocProps> = ({ onOpenSearch }) => {
  const { pathname } = useLocation();
  const page = pageAtPath(pathname);

  if (!page) return <NotFound onOpenSearch={onOpenSearch} />;

  return <Article page={page} onOpenSearch={onOpenSearch} />;
};

interface ArticleProps {
  page: PageItem;
  onOpenSearch: () => void;
}

/** The reading view: navigation tree, the page itself, and its table of contents. */
const Article: React.FC<ArticleProps> = ({ page, onOpenSearch }) => {
  const [activeHeadingId, scrollToHeading] = useScrollSpy(page.headings);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  usePageMeta(
    `${page.title} | gtm`,
    page.description || 'gtm documentation — terminal audio player guides and references.'
  );

  // Escape closes the drawer, and the page behind it must not scroll while it is up.
  useEffect(() => {
    if (!isDrawerOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsDrawerOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  const { prev, next } = useMemo(() => {
    const index = DOCS.findIndex((doc) => doc.id === page.id);
    return {
      prev: index > 0 ? DOCS[index - 1] : null,
      next: index >= 0 && index < DOCS.length - 1 ? DOCS[index + 1] : null,
    };
  }, [page.id]);

  return (
    <div className="w-full flex flex-col font-sans">
      <div className="max-w-7xl mx-auto flex w-full">
        <DocNav onOpenSearch={onOpenSearch} />

        <main className="flex-1 min-w-0 px-4 sm:px-8 py-8 max-w-4xl mx-auto space-y-8">
          <HeadingSelect
            title={page.title}
            headings={page.headings}
            activeId={activeHeadingId}
            onSelect={(id) => (id ? scrollToHeading(id) : window.scrollTo({ top: 0, behavior: 'smooth' }))}
            onOpenDrawer={() => setIsDrawerOpen(true)}
          />

          <div className="border-b border-hairline-outline pb-6 space-y-2">
            <h1 className="font-mono text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
              {page.title}
            </h1>
            {page.description && (
              <p className="text-sm sm:text-base text-text-muted leading-relaxed font-sans pt-1">
                {page.description}
              </p>
            )}
          </div>

          <article className="prose-container space-y-4">
            <Markdown content={page.content} />
          </article>

          <Footer page={page} prev={prev} next={next} />
        </main>

        <DocToc
          headings={page.headings}
          activeId={activeHeadingId}
          onSelect={scrollToHeading}
        />
      </div>

      {isDrawerOpen && (
        <DocDrawer onClose={() => setIsDrawerOpen(false)} onOpenSearch={onOpenSearch} />
      )}
    </div>
  );
};

interface FooterProps {
  page: PageItem;
  prev: PageItem | null;
  next: PageItem | null;
}

const Footer: React.FC<FooterProps> = ({ page, prev, next }) => {
  const updatedLabel = useRelativeTime(useCommitDate(page.id));

  return (
    <>
      <div className="-mt-2 flex items-center gap-3 flex-wrap font-mono text-xs text-text-muted">
        {updatedLabel && (
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-text-disabled" />
            <span>Updated</span>
            <span>{updatedLabel}</span>
          </div>
        )}
        {page.showVersion && <LatestVersion />}
      </div>

      <div className="pt-6 border-t border-hairline-outline flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs">
        <p className="text-text-muted text-xs font-sans">
          See an error or typo? Make this page better by editing it on GitHub.
        </p>
        <a
          href={`${CONTENT_BLOB_URL}/${page.id}.mdx`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-text-muted hover:text-text-primary bg-surface-container hover:bg-surface-elevated border border-hairline-outline rounded transition-colors group cursor-pointer shrink-0"
          title={`Edit ${page.id}.mdx on GitHub`}
          id="edit-on-github-button"
        >
          <Github className="w-3.5 h-3.5 text-text-muted group-hover:text-secondary transition-colors" />
          <span>Edit</span>
          <ArrowUpRight className="w-3 h-3 text-text-disabled group-hover:text-text-primary transition-colors" />
        </a>
      </div>

      <div className="pt-6 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
        {prev ? (
          <Link
            to={prev.path}
            className="p-4 rounded-lg border border-hairline-outline bg-surface-container hover:bg-surface-elevated text-left transition-colors group flex flex-col justify-between"
          >
            <div className="text-xs text-text-muted flex items-center gap-1 mb-1">
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              <span>Previous</span>
            </div>
            <div className="text-text-primary font-bold text-sm truncate">{prev.title}</div>
          </Link>
        ) : (
          <div />
        )}

        {next ? (
          <Link
            to={next.path}
            className="p-4 rounded-lg border border-hairline-outline bg-surface-container hover:bg-surface-elevated text-right transition-colors group flex flex-col justify-between items-end sm:col-start-2"
          >
            <div className="text-xs text-text-muted flex items-center gap-1 mb-1">
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="text-text-primary font-bold text-sm truncate">{next.title}</div>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </>
  );
};

/** Only mounted on pages that opt in with `showVersion`, so no page pays for the request. */
const LatestVersion: React.FC = () => {
  const tag = useLatestReleaseTag();
  if (!tag) return null;

  return (
    <div className="flex items-center gap-1.5">
      <span>Latest version</span>
      <span className="text-secondary font-bold">{tag}</span>
    </div>
  );
};
