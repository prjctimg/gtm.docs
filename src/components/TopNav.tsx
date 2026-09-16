import React, { useState } from 'react';
import { PageTab } from '../types';
import { Search, Menu, X, ArrowUpRight, Github } from 'lucide-react';

interface TopNavProps {
  currentTab: PageTab;
  onSelectTab: (tab: PageTab) => void;
  onOpenSearch: () => void;
  onOpenKeymap: () => void;
  onScrollToInstall?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenSearch,
  onOpenKeymap,
  onScrollToInstall
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileNav = (tab: PageTab) => {
    onSelectTab(tab);
    setIsMobileMenuOpen(false);
  };

  const handleMobileKeymap = () => {
    setIsMobileMenuOpen(false);
    onOpenKeymap();
  };

  return (
    <header className="w-full border-b border-hairline-outline bg-canvas-obsidian sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
        {/* Brand & Desktop Links */}
        <div className="flex items-center gap-6 sm:gap-8">
          <button
            onClick={() => onSelectTab('home')}
            className="font-mono text-base sm:text-lg text-secondary tracking-tight font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer text-left"
          >
            <span>&gt; gtm</span>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 font-mono text-xs">
            <button
              onClick={() => onSelectTab('docs')}
              className={`py-1 cursor-pointer transition-colors ${
                currentTab === 'docs'
                  ? 'text-text-primary font-bold border-b-2 border-primary-container'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Docs
            </button>
            <button
              onClick={() => onSelectTab('install')}
              className={`py-1 cursor-pointer transition-colors ${
                currentTab === 'install'
                  ? 'text-text-primary font-bold border-b-2 border-primary-container'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Install
            </button>
            <button
              onClick={onOpenKeymap}
              className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              Keymap
            </button>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-2.5 py-1.5 bg-surface-container border border-hairline-outline hover:border-text-muted rounded text-xs font-mono text-text-muted hover:text-text-primary transition-colors cursor-pointer min-h-[38px]"
            title="Search docs (Ctrl+K or /)"
          >
            <Search className="w-3.5 h-3.5 text-secondary" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden sm:inline px-1.5 py-0.5 bg-surface-elevated border border-hairline-outline rounded text-[10px] text-text-disabled">
              /
            </kbd>
          </button>

          {/* GitHub Icon Link */}
          <a
            href="https://github.com/prjctimg/gtm.rs"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center p-2 text-text-muted hover:text-text-primary border border-hairline-outline hover:border-text-muted rounded bg-surface-container hover:bg-surface-elevated transition-colors min-h-[38px] min-w-[38px]"
            title="View on GitHub"
            aria-label="GitHub Repository"
          >
            <Github className="w-4 h-4" />
          </a>

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-text-muted hover:text-text-primary border border-hairline-outline rounded bg-surface-container cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-hairline-outline bg-surface-container px-4 py-4 space-y-3 font-mono text-sm animate-in fade-in slide-in-from-top-2 duration-150">
          <button
            onClick={() => handleMobileNav('docs')}
            className={`block w-full text-left py-2.5 px-3 rounded transition-colors ${
              currentTab === 'docs'
                ? 'bg-surface-elevated text-secondary font-bold'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Docs
          </button>
          <button
            onClick={() => handleMobileNav('install')}
            className={`block w-full text-left py-2.5 px-3 rounded transition-colors ${
              currentTab === 'install'
                ? 'bg-surface-elevated text-secondary font-bold'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Install
          </button>
          <button
            onClick={handleMobileKeymap}
            className="block w-full text-left py-2.5 px-3 rounded text-text-muted hover:text-text-primary transition-colors"
          >
            Keymap Cheatsheet
          </button>
          <a
            href="https://github.com/prjctimg/gtm.rs"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between w-full py-2.5 px-3 rounded text-text-muted hover:text-text-primary transition-colors"
          >
            <span className="flex items-center gap-2">
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </span>
            <ArrowUpRight className="w-4 h-4 text-text-disabled" />
          </a>
        </div>
      )}
    </header>
  );
};
