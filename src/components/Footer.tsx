import React from 'react';
import { PageTab } from '../types';
import { Github, ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: PageTab, sectionId?: string) => void;
  onOpenKeymap?: () => void;
  onScrollToInstall?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  onNavigate, 
  onOpenKeymap, 
  onScrollToInstall 
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-hairline-outline bg-canvas-obsidian py-8 px-4 sm:px-6 md:px-12 font-mono text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
        {/* Brand & Description */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button 
            type="button"
            onClick={() => onNavigate('home')}
            className="text-base sm:text-lg text-secondary font-bold cursor-pointer hover:opacity-90 tracking-tight"
          >
            &gt; gtm
          </button>
          <span className="hidden sm:inline text-text-muted/30">|</span>
          <span className="text-text-muted text-xs">
            Terminal-first music player built in Rust
          </span>
        </div>

        {/* Navigation & Resource Links */}
        <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-text-muted">
          <button
            type="button"
            onClick={() => onNavigate('docs')}
            className="hover:text-text-primary transition-colors cursor-pointer"
          >
            Docs
          </button>
          <button
            type="button"
            onClick={() => {
              if (onScrollToInstall) {
                onScrollToInstall();
              } else {
                onNavigate('install');
              }
            }}
            className="hover:text-text-primary transition-colors cursor-pointer"
          >
            Install
          </button>
          <button
            type="button"
            onClick={() => onNavigate('blog')}
            className="hover:text-text-primary transition-colors cursor-pointer"
          >
            Blog
          </button>
          {onOpenKeymap && (
            <button
              type="button"
              onClick={onOpenKeymap}
              className="hover:text-text-primary transition-colors cursor-pointer"
            >
              Keymap
            </button>
          )}
          <a
            href="https://github.com/prjctimg/gtm.rs"
            target="_blank"
            rel="noreferrer"
            className="hover:text-text-primary transition-colors inline-flex items-center gap-1.5"
            title="GitHub Repository"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>
          <a
            href="https://github.com/prjctimg/gtm.rs/releases"
            target="_blank"
            rel="noreferrer"
            className="hover:text-text-primary transition-colors inline-flex items-center gap-1"
          >
            <span>Releases</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        </nav>
      </div>

      {/* Bottom bar with clean copyright declaration */}
      <div className="max-w-7xl mx-auto mt-6 pt-6 border-t border-hairline-outline/40 flex items-center justify-center sm:justify-start text-text-muted text-[11px]">
        <span>
          © {currentYear}{' '}
          <a
            href="https://prjctimg.me"
            target="_blank"
            rel="noreferrer"
            className="text-text-primary hover:text-secondary underline decoration-hairline-outline hover:decoration-secondary transition-colors"
          >
            prjctimg
          </a>
          . Distributed under GPL-3.0.
        </span>
      </div>
    </footer>
  );
};

