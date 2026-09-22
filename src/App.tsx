import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CommandPalette } from './components/CommandPalette';
import { KeymapModal } from './components/KeymapModal';
import { ScrollManager } from './components/ScrollManager';
import { HomePage } from './pages/HomePage';
import { DocsPage } from './pages/DocsPage';
import { InstallPage } from './pages/InstallPage';
import { BenchmarkPage } from './pages/BenchmarkPage';
import { NotFoundPage } from './pages/NotFoundPage';

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
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenKeymap={() => setIsKeymapOpen(true)}
      />

      <div className="flex-grow flex flex-col">
        <ScrollManager />
        <Routes>
          <Route path="/" element={<HomePage onOpenKeymap={() => setIsKeymapOpen(true)} />} />
          <Route path="/docs" element={<Navigate to="/docs/overview" replace />} />
          <Route
            path="/docs/:docId"
            element={
              <DocsPage
                onOpenSearch={() => setIsSearchOpen(true)}
              />
            }
          />
          <Route path="/install" element={<InstallPage />} />
          <Route path="/benchmark" element={<BenchmarkPage />} />
          <Route
            path="*"
            element={
              <NotFoundPage onOpenSearch={() => setIsSearchOpen(true)} />
            }
          />
        </Routes>
      </div>

      <Footer onOpenKeymap={() => setIsKeymapOpen(true)} />

      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <KeymapModal isOpen={isKeymapOpen} onClose={() => setIsKeymapOpen(false)} />
    </div>
  );
}
