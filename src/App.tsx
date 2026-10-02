import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router';
import { motion } from 'motion/react';
import { Nav } from './components/Nav';
import { Footer } from './components/Footer';
import { Palette } from './components/Palette';
import { Scroll } from './components/Scroll';
import { FIRST_DOC } from './data/content';
import { Home } from './pages/Home';
import { Doc } from './pages/Doc';
import { Benchmark } from './pages/Benchmark';

export default function App() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();

  // Global key listener for '/' and 'Ctrl+K'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' || (e.ctrlKey && e.key === 'k') || (e.metaKey && e.key === 'k')) &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-canvas-obsidian text-text-primary flex flex-col font-mono selection:bg-secondary/30 selection:text-secondary transition-colors duration-200">
      <Nav onOpenSearch={() => setIsSearchOpen(true)} />

      <div className="flex-grow flex flex-col">
        <Scroll />
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="flex-grow flex flex-col"
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/docs" element={<Navigate to={FIRST_DOC?.path ?? '/'} replace />} />
            <Route path="/benchmark" element={<Benchmark />} />
            {/* Every content file is a route; unknown paths 404 inside `Doc`. */}
            <Route
              path="*"
              element={
                <Doc
                  onOpenSearch={() => setIsSearchOpen(true)}
                />
              }
            />
          </Routes>
        </motion.div>
      </div>

      <Footer />

      <Palette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}

