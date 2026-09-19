import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ALL_DOCS, 
  DOCS_BY_ID, 
  DOCS_BY_CATEGORY, 
  DOC_CATEGORIES, 
  DocItem 
} from '../data/docs';
import { MarkdownRenderer } from './MarkdownRenderer';
import { 
  Search, 
  Check, 
  Copy, 
  Edit, 
  Layers, 
  Keyboard, 
  ArrowRight, 
  ArrowLeft,
  Terminal,
  ExternalLink,
  ChevronRight,
  ListTree,
  Github,
  ArrowUpRight
} from 'lucide-react';

interface DocsViewProps {
  onOpenSearch: () => void;
  onOpenKeymap: () => void;
  activeDocId?: string;
  activeSection?: string;
  onNavigateDoc?: (docId: string, sectionId?: string) => void;
}

const DEFAULT_FALLBACK_DOC: DocItem = {
  id: 'overview',
  slug: '/overview/',
  title: 'Intro',
  description: 'A terminal music player with background playback, YouTube and Spotify integration, and a focus on discoverability.',
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

export const DocsView: React.FC<DocsViewProps> = ({
  onOpenSearch,
  onOpenKeymap,
  activeDocId = 'overview',
  activeSection,
  onNavigateDoc
}) => {
  // Current active doc
  const [currentDocId, setCurrentDocId] = useState<string>(() => {
    return DOCS_BY_ID[activeDocId] ? activeDocId : (ALL_DOCS[0]?.id || 'overview');
  });

  const [activeHeadingId, setActiveHeadingId] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync state if prop changes
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

  const handleSelectDoc = (docId: string, sectionId?: string) => {
    setCurrentDocId(docId);
    if (onNavigateDoc) {
      onNavigateDoc(docId, sectionId);
    }
    if (sectionId) {
      setTimeout(() => {
        const el = document.getElementById(sectionId) || document.getElementById(`_${sectionId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Scroll to section when requested
  useEffect(() => {
    if (activeSection) {
      setTimeout(() => {
        const el = document.getElementById(activeSection) || document.getElementById(`_${activeSection}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    }
  }, [activeSection, currentDocId]);

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

      setActiveHeadingId(currentId);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeDoc?.id, activeDoc?.headings]);

  const activeHeading = useMemo(() => {
    return (activeDoc?.headings || []).find(h => h.id === activeHeadingId);
  }, [activeDoc?.headings, activeHeadingId]);

  const currentHeadingText = activeHeading ? activeHeading.text : (activeDoc?.headings?.[0]?.text || activeDoc?.title);

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

  return (
    <div className="w-full flex flex-col font-sans">
      <div className="max-w-7xl mx-auto flex w-full">
        {/* LEFT SIDEBAR: Document List & Categories (Desktop) */}
        <aside className="w-72 shrink-0 border-r border-hairline-outline bg-canvas-obsidian p-4 hidden lg:block sticky top-14 self-start max-h-[calc(100vh-56px)] overflow-y-auto font-mono text-xs">
          {/* Search Trigger */}
          <div className="relative mb-5">
            <button
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between pl-8 pr-3 py-2 bg-code-canvas border border-hairline-outline hover:border-primary-container rounded text-text-muted text-xs transition-colors cursor-pointer text-left"
            >
              <Search className="w-3.5 h-3.5 absolute left-2.5 text-secondary" />
              <span>Search {ALL_DOCS.length} topics...</span>
              <kbd className="px-1.5 py-0.5 bg-surface-elevated border border-hairline-outline rounded text-[10px] text-text-muted">
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
                  <div className="text-[11px] font-bold text-text-muted tracking-wider uppercase flex items-center gap-1.5 px-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    <span>{category}</span>
                  </div>

                  <ul className="space-y-0.5 border-l border-hairline-subtle ml-2 pl-2">
                    {docsInCat.map((doc) => {
                      const isActive = currentDocId === doc.id;
                      return (
                        <li key={doc.id}>
                          <button
                            onClick={() => handleSelectDoc(doc.id)}
                            className={`w-full text-left py-1.5 px-2 rounded text-xs cursor-pointer transition-colors flex items-center justify-between gap-1.5 ${
                              isActive
                                ? 'bg-surface-elevated text-secondary font-bold border border-secondary/30'
                                : 'text-text-muted hover:text-text-primary hover:bg-surface-elevated/40'
                            }`}
                          >
                            <span className="truncate">{doc.title}</span>
                            <span
                              className={`font-mono text-[10px] shrink-0 ${
                                isActive ? 'text-secondary font-bold' : 'text-text-disabled'
                              }`}
                            >
                              {String(doc.order).padStart(2, '0')}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}

            {/* Quick Tools Box */}
            <div className="pt-2 border-t border-hairline-outline space-y-2">
              <div className="text-[11px] font-bold text-text-muted tracking-wider uppercase flex items-center gap-2 px-1">
                <Keyboard className="w-3 h-3 text-state-warning" />
                <span>Quick Tools</span>
              </div>
              <ul className="space-y-1 border-l border-hairline-subtle ml-2 pl-2">
                <li>
                  <button
                    onClick={onOpenKeymap}
                    className="block w-full text-left py-1 px-2 text-secondary hover:underline text-xs cursor-pointer"
                  >
                    Keybindings Cheatsheet →
                  </button>
                </li>
                <li>
                  <button
                    onClick={onOpenSearch}
                    className="block w-full text-left py-1 px-2 text-text-muted hover:text-text-primary text-xs cursor-pointer"
                  >
                    Fuzzy Search (/)
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </aside>

        {/* CENTER CANVAS: Active Doc Article */}
        <main className="flex-1 min-w-0 px-4 sm:px-8 py-8 max-w-4xl mx-auto space-y-8">
          {/* Mobile Sticky Table of Contents & Navigation */}
          <div className="xl:hidden sticky top-14 z-20 -mx-4 sm:-mx-8 px-4 sm:px-8 pt-5 sm:pt-6 pb-2.5 bg-canvas-obsidian/95 backdrop-blur-md border-b border-hairline-outline shadow-sm space-y-2">
            <div className="flex items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-1.5 min-w-0 text-text-muted">
                <ListTree className="w-3.5 h-3.5 text-secondary shrink-0" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted shrink-0">On this page:</span>
                <span className="text-secondary font-semibold truncate text-xs">
                  {currentHeadingText}
                </span>
              </div>
            </div>

            <select
              id="mobile-doc-selector"
              aria-label="Table of contents and document selector"
              value={activeHeadingId ? `heading:${activeHeadingId}` : `doc:${currentDocId}`}
              onChange={(e) => {
                const val = e.target.value;
                if (val.startsWith('heading:')) {
                  scrollToHeading(val.replace('heading:', ''));
                } else if (val.startsWith('doc:')) {
                  handleSelectDoc(val.replace('doc:', ''));
                }
              }}
              className="w-full bg-surface-container border border-hairline-outline text-text-primary font-mono text-xs rounded px-3 py-2 focus:outline-none focus:border-primary-container cursor-pointer"
            >
              {(activeDoc?.headings || []).length > 0 && (
                <optgroup label={`On this page — ${activeDoc?.title}`}>
                  {activeDoc?.headings.map((h) => (
                    <option key={h.id} value={`heading:${h.id}`}>
                      {h.level === 3 ? '   └ ' : '• '}{h.text}
                    </option>
                  ))}
                </optgroup>
              )}
              <optgroup label="All Documentation Pages">
                {DOC_CATEGORIES.map((cat) => (
                  (DOCS_BY_CATEGORY[cat] || []).map((doc) => (
                    <option key={doc.id} value={`doc:${doc.id}`}>
                      📄 {String(doc.order).padStart(2, '0')} - {doc.title}
                    </option>
                  ))
                ))}
              </optgroup>
            </select>
          </div>

          {/* Breadcrumb Header */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <nav
              id="docs-breadcrumb-nav"
              aria-label="Breadcrumbs"
              className="flex items-center gap-1.5 text-xs font-mono text-text-muted flex-wrap"
            >
              <button
                type="button"
                onClick={() => handleSelectDoc(ALL_DOCS[0]?.id || 'overview')}
                className="hover:text-text-primary hover:underline transition-colors cursor-pointer"
                title="Go to documentation overview"
              >
                Docs
              </button>

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
              onNavigateDoc={(docId, anchorId) => handleSelectDoc(docId, anchorId)}
            />
          </article>

          {/* Page Footer Action: Edit on GitHub */}
          <div className="pt-6 border-t border-hairline-outline flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs">
            <p className="text-text-muted text-xs font-sans">
              See an error or typo? Make this page better by editing it on GitHub.
            </p>
            <a
              href={`https://github.com/prjctimg/gtm.rs/blob/main/content/${activeDoc?.id || 'overview'}.mdx`}
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
              <button
                onClick={() => handleSelectDoc(prevDoc.id)}
                className="p-4 rounded-lg border border-hairline-outline bg-surface-container hover:bg-surface-elevated text-left transition-colors cursor-pointer group flex flex-col justify-between"
              >
                <div className="text-[11px] text-text-muted flex items-center gap-1 mb-1">
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                  <span>Previous</span>
                </div>
                <div className="text-text-primary font-bold text-sm truncate">
                  {prevDoc.title}
                </div>
              </button>
            ) : <div />}

            {nextDoc ? (
              <button
                onClick={() => handleSelectDoc(nextDoc.id)}
                className="p-4 rounded-lg border border-hairline-outline bg-surface-container hover:bg-surface-elevated text-right transition-colors cursor-pointer group flex flex-col justify-between items-end sm:col-start-2"
              >
                <div className="text-[11px] text-text-muted flex items-center gap-1 mb-1">
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="text-text-primary font-bold text-sm truncate">
                  {nextDoc.title}
                </div>
              </button>
            ) : <div />}
          </div>
        </main>

        {/* RIGHT SIDEBAR: On This Page Table of Contents (Desktop) */}
        <aside className="w-60 shrink-0 border-l border-hairline-outline bg-canvas-obsidian p-6 hidden xl:block sticky top-14 self-start max-h-[calc(100vh-56px)] overflow-y-auto font-mono text-xs">
          <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <ListTree className="w-3.5 h-3.5 text-secondary" />
            <span>On this page</span>
          </div>

          {(activeDoc?.headings || []).length === 0 ? (
            <p className="text-text-muted text-[11px] italic">No sub-sections</p>
          ) : (
            <ul className="space-y-1.5 border-l border-hairline-outline pl-3">
              {(activeDoc?.headings || []).map((h) => (
                <li key={h.id} style={{ paddingLeft: h.level === 3 ? '8px' : '0px' }}>
                  <button
                    onClick={() => scrollToHeading(h.id)}
                    className={`block text-left transition-colors cursor-pointer text-xs truncate max-w-[180px] ${
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
              className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors text-xs cursor-pointer w-full text-left"
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
    </div>
  );
};
