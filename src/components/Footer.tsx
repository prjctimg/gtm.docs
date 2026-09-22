import React from 'react';
import { Link } from 'react-router';
import { Github, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface FooterProps {
  onOpenKeymap?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  onOpenKeymap
}) => {
  const currentYear = new Date().getFullYear();
  const { theme, toggleTheme } = useTheme();

  return (
    <footer className="w-full border-t border-hairline-outline bg-canvas-obsidian py-8 px-4 sm:px-6 md:px-12 font-mono text-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Theme Switcher Header */}
        <div className="flex items-center justify-center">
          {/* Dedicated Theme Toggle Control */}
          <button
            type="button"
            id="theme-toggle-button"
            onClick={toggleTheme}
            className="flex items-center justify-center p-2 rounded-lg border border-hairline-outline bg-surface-container hover:bg-surface-elevated text-text-muted hover:text-text-primary transition-all cursor-pointer shadow-xs group"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-state-warning group-hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-primary group-hover:-rotate-12 transition-transform" />
            )}
          </button>
        </div>

        {/* Footer Links inline with Copyright */}
        <div className="pt-4 border-t border-hairline-outline/40 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 text-text-muted text-xs">
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
          <nav className="flex flex-wrap items-center justify-center gap-5 sm:gap-6 text-sm">
            <Link
              to="/docs/overview"
              className="hover:text-text-primary transition-colors"
            >
              Docs
            </Link>
            <Link
              to="/install"
              className="hover:text-text-primary transition-colors"
            >
              Install
            </Link>
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