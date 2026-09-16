import React from 'react';
import { PageTab } from '../types';
import { Github } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: PageTab, sectionId?: string) => void;
  onOpenKeymap?: () => void;
  onScrollToInstall?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-hairline-outline bg-canvas-obsidian py-6 sm:py-8 px-6 md:px-12 font-mono text-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => onNavigate('home')}
            className="text-base sm:text-lg text-secondary font-bold cursor-pointer hover:opacity-90 tracking-tight"
          >
            &gt; gtm
          </button>
        </div>

        <div className="flex items-center gap-2.5 text-text-muted text-xs font-mono">
          <a 
            href="https://github.com/prjctimg/gtm.rs" 
            target="_blank" 
            rel="noreferrer" 
            className="text-text-muted hover:text-text-primary transition-colors flex items-center"
            title="GitHub"
            aria-label="GitHub Repository"
          >
            <Github className="w-4 h-4" />
          </a>
          <span>©, {currentYear}, prjctimg</span>
        </div>
      </div>
    </footer>
  );
};

