import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import { Nav } from './components/Nav';
import { Footer } from './components/Footer';
import { Palette } from './components/Palette';
import { Keymap } from './components/Keymap';
import { Scroll } from './components/Scroll';
import { Home } from './pages/Home';
import { Docs } from './pages/Docs';
import { Install } from './pages/Install';
import { Benchmark } from './pages/Benchmark';
import { NotFound } from './pages/NotFound';

export default function App() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isKeymapOpen, setIsKeymapOpen] = useState(false);

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
    <div className="min-h-screen bg-canvas-obsidian text-text-primary flex flex-col font-sans selection:bg-secondary/30 selection:text-secondary transition-colors duration-200">
      <Nav
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenKeymap={() => setIsKeymapOpen(true)}
      />

      <div className="flex-grow flex flex-col">
        <Scroll />
        <Routes>
          <Route path="/" element={<Home onOpenKeymap={() => setIsKeymapOpen(true)} />} />
          <Route path="/docs" element={<Navigate to="/docs/overview" replace />} />
          <Route
            path="/docs/:docId"
            element={
              <Docs
                onOpenSearch={() => setIsSearchOpen(true)}
              />
            }
          />
          <Route
            path="/install"
            element={
              <Install
                onOpenSearch={() => setIsSearchOpen(true)}
              />
            }
          />
          <Route path="/benchmark" element={<Benchmark />} />
          <Route
            path="*"
            element={
              <NotFound onOpenSearch={() => setIsSearchOpen(true)} />
            }
          />
        </Routes>
      </div>

      <Footer onOpenKeymap={() => setIsKeymapOpen(true)} />

      <Palette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <Keymap isOpen={isKeymapOpen} onClose={() => setIsKeymapOpen(false)} />
    </div>
  );
}
