import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router';
import { BlogPost } from './types';
import { BLOG_POSTS } from './data/mockData';
import { DOCS_BY_ID } from './data/docs';
import { TopNav } from './components/TopNav';
import { DocsView } from './components/DocsView';
import { BlogView } from './components/BlogView';
import { LandingView } from './components/LandingView';
import { InstallView } from './components/InstallView';
import { Footer } from './components/Footer';
import { CommandPalette } from './components/CommandPalette';
import { WhitepaperModal } from './components/WhitepaperModal';
import { KeymapModal } from './components/KeymapModal';

/** Scrolls to top on route change; to the anchor element when a #hash is present. */
function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const target = hash ? hash.slice(1) : null;

    if (!target) {
      window.scrollTo({ top: 0 });
      return;
    }

    const findEl = () =>
      document.getElementById(target) ||
      document.getElementById(target.startsWith('_') ? target.slice(1) : `_${target}`);

    const scroll = () => {
      const el = findEl();
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0 });
      }
    };

    // Retry a few times: the doc renders + images below the anchor shift layout,
    // and a single scroll call during the initial commit can get swallowed.
    const timers = [80, 250, 600].map((ms) => window.setTimeout(scroll, ms));
    window.addEventListener('load', scroll);

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener('load', scroll);
    };
  }, [pathname, hash]);

  return null;
}

/** Blog route wrapper — opens the whitepaper modal when deep-linked at /blog/:postId. */
function BlogPage({ onOpenWhitepaper }: { onOpenWhitepaper: (postId: string) => void }) {
  const { postId } = useParams();

  useEffect(() => {
    if (postId && BLOG_POSTS.some((p) => p.id === postId)) onOpenWhitepaper(postId);
  }, [postId, onOpenWhitepaper]);

  return <BlogView onOpenWhitepaper={(post) => onOpenWhitepaper(post.id)} />;
}

/** Redirects unknown /docs/:docId URLs to the overview doc. */
function DocsGuard({ children }: { children: React.ReactNode }) {
  const { docId } = useParams();
  if (docId && !DOCS_BY_ID[docId]) {
    return <Navigate to="/docs/overview" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isKeymapOpen, setIsKeymapOpen] = useState(false);
  const [selectedWhitepaper, setSelectedWhitepaper] = useState<BlogPost | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Global key listener for '/' and 'Ctrl+K'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || (e.ctrlKey && e.key === 'k') || (e.metaKey && e.key === 'k')) &&
          !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openWhitepaperById = useCallback((postId: string) => {
    const post = BLOG_POSTS.find((p) => p.id === postId) || null;
    setSelectedWhitepaper(post);
  }, []);

  const closeWhitepaper = useCallback(() => {
    setSelectedWhitepaper(null);
    if (/^\/blog\/[^/]+/.test(location.pathname)) {
      navigate('/blog', { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-canvas-obsidian text-text-primary flex flex-col font-sans selection:bg-secondary/30 selection:text-secondary transition-colors duration-200">
      {/* Top Navigation */}
      <TopNav
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenKeymap={() => setIsKeymapOpen(true)}
      />

      {/* Dynamic View Body */}
      <div className="flex-grow flex flex-col">
        <ScrollManager />
        <Routes>
          <Route path="/" element={<LandingView onOpenKeymap={() => setIsKeymapOpen(true)} />} />
          <Route
            path="/docs"
            element={<Navigate to="/docs/overview" replace />}
          />
          <Route
            path="/docs/:docId"
            element={
              <DocsGuard>
                <DocsView onOpenSearch={() => setIsSearchOpen(true)} onOpenKeymap={() => setIsKeymapOpen(true)} />
              </DocsGuard>
            }
          />
          <Route path="/install" element={<InstallView />} />
          <Route path="/blog" element={<BlogPage onOpenWhitepaper={openWhitepaperById} />} />
          <Route path="/blog/:postId" element={<BlogPage onOpenWhitepaper={openWhitepaperById} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Global Footer */}
      <Footer onOpenKeymap={() => setIsKeymapOpen(true)} />

      {/* Global Interactive Modals */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onOpenWhitepaper={openWhitepaperById}
      />

      <WhitepaperModal post={selectedWhitepaper} onClose={closeWhitepaper} />

      <KeymapModal
        isOpen={isKeymapOpen}
        onClose={() => setIsKeymapOpen(false)}
      />
    </div>
  );
}