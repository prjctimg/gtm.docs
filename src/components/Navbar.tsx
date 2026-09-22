import React from 'react';
import { Link, NavLink } from 'react-router';
import { Search, Github } from 'lucide-react';
import { useLatestReleaseTag, RELEASES_URL } from '../lib/version';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenKeymap: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onOpenKeymap
}) => {
  const latestTag = useLatestReleaseTag();

  return (
    <header className="w-full border-b border-hairline-outline bg-canvas-obsidian sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
        {/* Brand & Desktop Links */}
        <div className="flex items-center gap-5 sm:gap-8">
          <div className="flex items-center gap-2">
            <Link
              to="/"
              id="nav-brand-button"
              className="font-mono text-base sm:text-lg text-secondary tracking-tight font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer text-left"
            >
              <span>&gt; gtm</span>
            </Link>

            {/* Latest release tag — subtle, next to the brand */}
            {latestTag && (
              <a
                href={RELEASES_URL}
                target="_blank"
                rel="noreferrer"
                id="nav-version-badge"
                className="hidden sm:inline-block font-mono text-[10px] leading-none text-text-disabled hover:text-text-muted border border-hairline-outline rounded px-1.5 py-0.5 transition-colors"
                title={`Latest release: ${latestTag}`}
              >
                {latestTag}
              </a>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-4 sm:gap-6 font-mono text-sm">
            <NavLink
              to="/docs"
              id="nav-docs-link"
              className={({ isActive }) =>
                `py-1 cursor-pointer transition-colors ${
                  isActive
                    ? 'text-text-primary font-bold border-b-2 border-primary-container'
                    : 'text-text-muted hover:text-text-primary'
                }`
              }
            >
              Docs
            </NavLink>
            <NavLink
              to="/install"
              id="nav-install-link"
              end
              className={({ isActive }) =>
                `py-1 cursor-pointer transition-colors ${
                  isActive
                    ? 'text-text-primary font-bold border-b-2 border-primary-container'
                    : 'text-text-muted hover:text-text-primary'
                }`
              }
            >
              Install
            </NavLink>
            <NavLink
              to="/benchmark"
              id="nav-benchmark-link"
              end
              className={({ isActive }) =>
                `py-1 cursor-pointer transition-colors ${
                  isActive
                    ? 'text-text-primary font-bold border-b-2 border-primary-container'
                    : 'text-text-muted hover:text-text-primary'
                }`
              }
            >
              Benchmarks
            </NavLink>
            <button
              id="nav-keymap-link"
              onClick={onOpenKeymap}
              className="py-1 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
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
            className="flex items-center gap-2 px-2.5 py-1.5 bg-surface-container border border-hairline-outline hover:border-text-muted rounded text-sm font-mono text-text-muted hover:text-text-primary transition-colors cursor-pointer min-h-[38px]"
            title="Search docs (Ctrl+K or /)"
          >
            <Search className="w-3.5 h-3.5 text-secondary" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden sm:inline px-1.5 py-0.5 bg-surface-elevated border border-hairline-outline rounded text-[11px] text-text-disabled">
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
        </div>
      </div>
    </header>
  );
};