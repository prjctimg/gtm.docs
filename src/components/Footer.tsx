import React from 'react';
import { PageTab } from '../types';
import { Github } from 'lucide-react';

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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Brand & Leading Header matching hero */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => onNavigate('home')}
              className="text-base sm:text-lg text-secondary font-bold cursor-pointer hover:opacity-90 tracking-tight"
            >
              &gt; gtm
            </button>
            <span className="text-text-muted/30">|</span>
            <span className="text-text-muted text-xs">
              The missing terminal audio player.
            </span>
          </div>
        </div>

        {/* Footer Links inline with Copyright */}
        <div className="pt-4 border-t border-hairline-outline/40 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 text-text-muted text-[11px]">
          <span>
            © {currentYear},{' '}
            <a
              href="https://prjctimg.me"
              target="_blank"
              rel="noreferrer"
              className="text-text-primary hover:text-secondary underline decoration-hairline-outline hover:decoration-secondary transition-colors"
            >
              prjctimg
            </a>
          </span>

          {/* Navigation links matching the navbar */}
          <nav className="flex flex-wrap items-center justify-center gap-5 sm:gap-6 text-xs">
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
          </nav>
        </div>
      </div>
    </footer>
  );
};

