import React, { useState, useEffect, useMemo, useRef } from 'react';
import { NavLink, Link, useParams } from 'react-router';
import { 
  ALL_DOCS, 
  DOCS_BY_ID, 
  DOCS_BY_CATEGORY, 
  DOC_CATEGORIES, 
  DocItem 
} from '../data/docs';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { usePageMeta } from '../lib/meta';
import { useRelativeTime } from '../lib/relative-time';
import { NotFoundPage } from './NotFoundPage';
import { 
  Search, 
  Check, 
  Copy, 
  ArrowRight, 
  ArrowLeft,
  ChevronRight,
  ListTree,
  Github,
  ArrowUpRight,
  X,
  BookOpen,
  ChevronDown,
  PanelLeft,
  Clock
} from 'lucide-react';

interface DocsPageProps {
  onOpenSearch: () => void;
}

const DEFAULT_FALLBACK_DOC: DocItem = {
  id: 'overview',
  slug: '/overview/',
  title: 'Intro',
  description: 'What gtm is: a terminal audio player split into a background daemon (gtmd) and a TUI client (gtm).',
  order: 1,
  rawContent: '',
  content: 'Welcome to the gtm documentation.',
  headings: [
    { id: 'overview', text: 'Overview', level: 2 },
    { id: 'how-it-works', text: 'How it works', level: 2 },
    { id: 'features', text: 'Features', level: 2 },
  ],
  category: 'Introduction & Setup',
};

export const DocsPage: React.FC<DocsPageProps> = ({
  onOpenSearch
}) => {
  const { docId } = useParams();
  const activeDocId = docId || 'overview';

  // Unknown /docs/:docId URLs render a real 404 page (preserving the URL)
  // instead of silently redirecting to the overview doc.
  const missingDoc = Boolean(docId && !DOCS_BY_ID[docId]);

  // Current active doc
  const [currentDocId, setCurrentDocId] = useState<string>(() => {
    return DOCS_BY_ID[activeDocId] ? activeDocId : (ALL_DOCS[0]?.id || 'overview');
  });

  // Start with the first heading active: the scroll-spy sets the same value
  // right after the first paint (the page loads at the top), so the active
  // class is present from the start instead of flashing after the spy runs.
  const [activeHeadingId, setActiveHeadingId] = useState<string>(() => {
    const doc = DOCS_BY_ID[activeDocId] || ALL_DOCS[0];
    return doc?.headings?.[0]?.id ?? '';
  });
  const [copiedLink, setCopiedLink] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileDrawerOpen) {
        setIsMobileDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileDrawerOpen]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isMobileDrawerOpen]);

  // Sync state if route param changes
  useEffect(() => {
    if (activeDocId && DOCS_BY_ID[activeDocId] && activeDocId !== currentDocId) {
      setCurrentDocId(activeDocId);
    }
  }, [activeDocId]);

  const activeDoc: DocItem = useMemo(() => {
    return DOCS_BY_ID[currentDocId] || ALL_DOCS[0] || DEFAULT_FALLBACK_DOC;
  }, [currentDocId]);

  // Current doc index for Prev/Next
  const currentIndex = useMemo(() => {
    return ALL_DOCS.findIndex(d => d.id === activeDoc.id);
  }, [activeDoc?.id]);

  const prevDoc = currentIndex > 0 ? ALL_DOCS[currentIndex - 1] : null;
  const nextDoc = (currentIndex >= 0 && currentIndex < ALL_DOCS.length - 1) ? ALL_DOCS[currentIndex + 1] : null;

  // Scroll spy to track current active heading in viewport
  useEffect(() => {
    const headings = activeDoc?.headings || [];
    if (headings.length === 0) {
      setActiveHeadingId('');
      return;
    }

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const offset = 140; // Navbar (56px) + sticky mobile TOC (~60px) + buffer
      let currentId = headings[0]?.id || '';

      for (const h of headings) {
        const el = document.getElementById(h.id) || document.getElementById(`_${h.id}`);
        if (el) {
          const top = el.getBoundingClientRect().top + scrollY;
          if (scrollY >= top - offset) {
            currentId = h.id;
          }
        }
      }

      setActiveHeadingId((prev) => (prev === currentId ? prev : currentId));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeDoc?.id, activeDoc?.headings]);

  // Fluid reading-progress path in the right sidebar. The stroke's dashoffset
  // is driven straight off the DOM (rAF-throttled) — never through React
  // state — so scrolling can't trigger re-renders or layout shifts.
  const tanglePathRef = useRef<SVGPathElement>(null);
  const progressPctRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const pathEl = tanglePathRef.current;
    if (!pathEl) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      // pathLength={1} normalizes the path to unit length, so offset 1-p
      // directly maps to how much of the curve has been "drawn".
      pathEl.style.strokeDashoffset = String(1 - p);
      if (progressPctRef.current) {
        progressPctRef.current.textContent = `${Math.round(p * 100)}%`;
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [activeDoc?.id]); // re-baseline the readout when switching docs

  const activeHeading = useMemo(() => {
    return (activeDoc?.headings || []).find(h => h.id === activeHeadingId);
  }, [activeDoc?.headings, activeHeadingId]);

  const scrollToHeading = (id: string) => {
    setActiveHeadingId(id);
    const el = document.getElementById(id) || document.getElementById(`_${id}`);
    if (el) {
      const navOffset = 135;
      const elementPosition = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: Math.max(0, elementPosition - navOffset),
        behavior: 'smooth'
      });
    }
  };

  const handleCopyDocUrl = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }).catch(() => {});
    }
  };

  usePageMeta(
    missingDoc
      ? 'Page not found | gtm'
      : activeDoc
        ? `${activeDoc.title} | gtm`
        : 'Docs | gtm',
    missingDoc
      ? 'The page you are looking for does not exist or has moved.'
      : activeDoc?.description || 'gtm documentation — terminal audio player guides and references.'
  );

  // Unknown /docs/:docId URLs render a real 404 page (URL is preserved).
  if (missingDoc) {
    return <NotFoundPage onOpenSearch={onOpenSearch} />;
  }

  const updatedLabel = useRelativeTime(activeDoc?.updatedAt);

  return (
    <div className="w-full flex flex-col font-sans">
      <div className="max-w-7xl mx-auto flex w-full">
        {/* LEFT SIDEBAR: Document List & Categories (Desktop) */}
        <aside className="w-72 shrink-0 border-r border-hairline-outline bg-canvas-obsidian px-4 pt-6 pb-6 hidden lg:block sticky top-14 self-start max-h-[calc(100vh-56px)] overflow-y-auto font-mono text-sm">
          {/* Search Trigger */}
          <div className="relative mb-5">
            <button
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between pl-8 pr-3 py-2 bg-code-canvas border border-hairline-outline hover:border-primary-container rounded text-text-muted text-sm transition-colors cursor-pointer text-left"
            >
              <Search className="w-3.5 h-3.5 absolute left-2.5 text-secondary" />
              <span>Search {ALL_DOCS.length} topics...</span>
              <kbd className="px-1.5 py-0.5 bg-surface-elevated border border-hairline-outline rounded text-[11px] text-text-muted">
                /
              </kbd>
            </button>
          </div>

          {/* Categorized Document Navigation Tree */}
          <div className="space-y-6">
            {DOC_CATEGORIES.map((category) => {
              const docsInCat = DOCS_BY_CATEGORY[category] || [];
              return (
                <div key={category} className="space-y-1.5">
                  <div className="text-xs font-bold text-text-muted tracking-wider uppercase flex items-center gap-1.5 px-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    <span>{category}</span>
                  </div>

                  <ul className="space-y-0.5 border-l border-hairline-subtle ml-2 pl-2">
                    {docsInCat.map((doc) => (
                      <React.Fragment key={doc.id}>
                        <li>
                          <NavLink
                            to={`/docs/${doc.id}`}
                            className={({ isActive }) =>
                              `w-full text-left py-1.5 px-2 rounded text-sm cursor-pointer transition-colors flex items-center gap-1.5 ${
                                isActive
                                  ? 'bg-surface-elevated text-secondary font-bold border border-secondary/30'
                                  : 'text-text-muted hover:text-text-primary hover:bg-surface-elevated/40'
                              }`
                            }
                          >
                            <span className="truncate">{doc.title}</span>
                          </NavLink>
                        </li>
                      </React.Fragment>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </aside>

        {/* CENTER CANVAS: Active Doc Article */}
        <main className="flex-1 min-w-0 px-4 sm:px-8 py-8 max-w-4xl mx-auto space-y-8">
          {/* Mobile Sticky Table of Contents & Navigation */}
          <div className="xl:hidden sticky top-14 z-20 -mx-4 sm:-mx-8 px-4 sm:px-8 pt-5 sm:pt-6 pb-3 bg-canvas-obsidian/95 backdrop-blur-md border-b border-hairline-outline shadow-sm flex items-center gap-2 relative">
            {/* Mobile Side Drawer Toggle Icon on the left */}
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-surface-container hover:bg-surface-elevated border border-hairline-outline hover:border-secondary/40 text-secondary transition-colors cursor-pointer shrink-0 flex items-center justify-center min-h-[38px] min-w-[38px]"
              title="Documentation Pages Index"
              aria-label="Toggle documentation side drawer"
            >
              <PanelLeft className="w-4 h-4 text-secondary" />
            </button>

            <select
              id="mobile-doc-selector"
              aria-label="Current document table of contents"
              value={activeHeadingId}
              onChange={(e) => {
                const val = e.target.value;
                if (val) {
                  scrollToHeading(val);
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setActiveHeadingId('');
                }
              }}
              className="flex-1 min-w-0 appearance-none bg-surface-container hover:bg-surface-elevated/70 border border-hairline-outline hover:border-secondary/40 focus:border-secondary focus:ring-1 focus:ring-secondary/30 text-text-primary font-mono text-sm rounded-lg px-3.5 py-2.5 pr-10 focus:outline-none transition-all cursor-pointer shadow-xs min-h-[38px]"
            >
              <option value="" className="bg-canvas-obsidian text-text-primary font-mono">
                {activeDoc?.title} (Top)
              </option>
              {(activeDoc?.headings || []).map((h) => (
                <option key={h.id} value={h.id} className="bg-canvas-obsidian text-text-primary font-mono">
                  {h.level === 3 ? '   └ ' : '• '}{h.text}
                </option>
              ))}
            </select>

            <div className="pointer-events-none absolute right-7 sm:right-11 top-1/2 -translate-y-1/2 mt-1 sm:mt-1.5 flex items-center text-secondary/70">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>

          {/* Breadcrumb Header */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <nav
              id="docs-breadcrumb-nav"
              aria-label="Breadcrumbs"
              className="flex items-center gap-1.5 text-sm font-mono text-text-muted flex-wrap"
            >
              <Link
                to={`/docs/${ALL_DOCS[0]?.id || 'overview'}`}
                className="hover:text-text-primary hover:underline transition-colors cursor-pointer"
                title="Go to documentation overview"
              >
                Docs
              </Link>

              <ChevronRight className="w-3.5 h-3.5 text-hairline-outline shrink-0" />
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-secondary font-semibold hover:underline transition-colors cursor-pointer text-left"
                title="Scroll to top of current page"
              >
                {activeDoc?.title}
              </button>
            </nav>
          </div>

          {/* Document Title Header */}
          <div className="border-b border-hairline-outline pb-6 space-y-2">
            <h1 className="font-mono text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
              {activeDoc?.title}
            </h1>
            {activeDoc?.description && (
              <p className="text-sm sm:text-base text-text-muted leading-relaxed font-sans pt-1">
                {activeDoc.description}
              </p>
            )}
          </div>

          {/* Rendered MDX Content */}
          <article className="prose-container space-y-4">
            <MarkdownRenderer
              content={activeDoc?.content || ''}
            />
          </article>

          {/* Last Updated timestamp */}
          {activeDoc?.updatedAt && (
            <div className="-mt-2 flex items-center gap-1.5 font-mono text-xs text-text-muted">
              <Clock className="w-3.5 h-3.5 text-text-disabled" />
              <span>Updated</span>
              <span className="text-text-primary font-semibold">{updatedLabel}</span>
            </div>
          )}

          {/* Page Footer Action: Edit on GitHub */}
          <div className="pt-6 border-t border-hairline-outline flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs">
            <p className="text-text-muted text-xs font-sans">
              See an error or typo? Make this page better by editing it on GitHub.
            </p>
            <a
              href={`https://github.com/prjctimg/gtm.docs/blob/main/content/${activeDoc?.id || 'overview'}.mdx`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-text-muted hover:text-text-primary bg-surface-container hover:bg-surface-elevated border border-hairline-outline rounded transition-colors group cursor-pointer shrink-0"
              title={`Edit ${activeDoc?.id || 'overview'}.mdx on GitHub`}
              id="edit-on-github-button"
            >
              <Github className="w-3.5 h-3.5 text-text-muted group-hover:text-secondary transition-colors" />
              <span>Edit on GitHub</span>
              <ArrowUpRight className="w-3 h-3 text-text-disabled group-hover:text-text-primary transition-colors" />
            </a>
          </div>

          {/* Pagination Controls (Prev / Next) */}
          <div className="pt-6 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            {prevDoc ? (
              <Link
                to={`/docs/${prevDoc.id}`}
                className="p-4 rounded-lg border border-hairline-outline bg-surface-container hover:bg-surface-elevated text-left transition-colors group flex flex-col justify-between"
              >
                <div className="text-[11px] text-text-muted flex items-center gap-1 mb-1">
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                  <span>Previous</span>
                </div>
                <div className="text-text-primary font-bold text-sm truncate">
                  {prevDoc.title}
                </div>
              </Link>
            ) : <div />}

            {nextDoc ? (
              <Link
                to={`/docs/${nextDoc.id}`}
                className="p-4 rounded-lg border border-hairline-outline bg-surface-container hover:bg-surface-elevated text-right transition-colors group flex flex-col justify-between items-end sm:col-start-2"
              >
                <div className="text-[11px] text-text-muted flex items-center gap-1 mb-1">
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="text-text-primary font-bold text-sm truncate">
                  {nextDoc.title}
                </div>
              </Link>
            ) : <div />}
          </div>
        </main>

        {/* RIGHT SIDEBAR: On This Page Table of Contents (Desktop) */}
        <aside className="w-60 shrink-0 border-l border-hairline-outline bg-canvas-obsidian px-6 pt-6 pb-6 hidden xl:block sticky top-14 self-start max-h-[calc(100vh-56px)] overflow-y-auto font-mono text-sm">
          {/* Reading progress — a fluid path that "draws" as you scroll */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Reading progress
              </span>
              <span ref={progressPctRef} className="text-[11px] text-secondary font-bold" suppressHydrationWarning>
                0%
              </span>
            </div>
            <svg
              viewBox="0 0 36 96"
              className="w-full h-20"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {/* Track (full path, dimmed) */}
              <path
                d="M18 6 C 28 16, 8 26, 18 36 C 28 46, 8 56, 18 66 C 26 74, 26 82, 18 90"
                fill="none"
                stroke="var(--hairline-outline)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              {/* Progress path — dashoffset updated directly via ref/rAF */}
              <path
                ref={tanglePathRef}
                d="M18 6 C 28 16, 8 26, 18 36 C 28 46, 8 56, 18 66 C 26 74, 26 82, 18 90"
                fill="none"
                stroke="var(--secondary)"
                strokeWidth="2.5"
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset="1"
                style={{ filter: 'drop-shadow(0 0 3px color-mix(in srgb, var(--secondary) 60%, transparent))' }}
              />
            </svg>
          </div>

          <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <ListTree className="w-3.5 h-3.5 text-secondary" />
            <span>On this page</span>
          </div>

          {(activeDoc?.headings || []).length === 0 ? (
            <p className="text-text-muted text-xs italic">No sub-sections</p>
          ) : (
            <ul className="space-y-1.5 border-l border-hairline-outline pl-3">
              {(activeDoc?.headings || []).map((h) => (
                <li
                  key={h.id}
                  style={h.level === 3 ? { paddingLeft: '8px' } : undefined}
                >
                  <button
                    onClick={() => scrollToHeading(h.id)}
                    className={`block text-left transition-colors cursor-pointer text-sm truncate max-w-[180px] ${
                      activeHeadingId === h.id
                        ? 'text-secondary font-bold'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                    title={h.text}
                  >
                    {h.text}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 pt-6 border-t border-hairline-outline space-y-2.5">
            <button
              onClick={handleCopyDocUrl}
              className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors text-sm cursor-pointer w-full text-left"
            >
              {copiedLink ? (
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
      </div>

      {/* MOBILE SIDE DRAWER: Document List & Categories */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Sheet */}
          <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-canvas-obsidian border-r border-hairline-outline shadow-2xl flex flex-col font-mono text-sm z-10 animate-in slide-in-from-left duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-hairline-outline bg-surface-container/50">
              <div className="flex items-center gap-2 text-secondary font-bold text-xs">
                <BookOpen className="w-4 h-4 text-secondary" />
                <span>Documentation Pages</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1 text-text-muted hover:text-text-primary rounded hover:bg-surface-elevated transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                aria-label="Close documentation drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Trigger inside Drawer */}
            <div className="p-3.5 border-b border-hairline-outline bg-surface-container/30">
              <button
                type="button"
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  onOpenSearch();
                }}
                className="w-full flex items-center justify-between px-3 py-2 bg-code-canvas border border-hairline-outline hover:border-secondary/50 rounded text-text-muted text-sm transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-secondary" />
                  <span>Search {ALL_DOCS.length} topics...</span>
                </div>
                <kbd className="px-1.5 py-0.5 bg-surface-elevated border border-hairline-outline rounded text-[11px] text-text-muted">
                  /
                </kbd>
              </button>
            </div>

            {/* Document Navigation Tree */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {DOC_CATEGORIES.map((category) => {
                const docsInCat = DOCS_BY_CATEGORY[category] || [];
                return (
                  <div key={category} className="space-y-1.5">
                    <div className="text-xs font-bold text-text-muted tracking-wider uppercase flex items-center gap-1.5 px-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                      <span>{category}</span>
                    </div>

                    <ul className="space-y-0.5 border-l border-hairline-subtle ml-2 pl-2">
                      {docsInCat.map((doc) => (
                        <React.Fragment key={doc.id}>
                          <li>
                            <NavLink
                              to={`/docs/${doc.id}`}
                              onClick={() => setIsMobileDrawerOpen(false)}
                              className={({ isActive }) =>
                                `w-full text-left py-2 px-2.5 rounded text-sm cursor-pointer transition-colors flex items-center gap-1.5 ${
                                  isActive
                                    ? 'bg-surface-elevated text-secondary font-bold border border-secondary/30'
                                    : 'text-text-muted hover:text-text-primary hover:bg-surface-elevated/40'
                                }`
                              }
                            >
                              <span className="truncate">{doc.title}</span>
                            </NavLink>
                          </li>
                        </React.Fragment>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};