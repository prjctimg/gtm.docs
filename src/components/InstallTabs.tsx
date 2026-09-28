import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Check, Copy, ChevronDown, FlaskConical, Tag } from 'lucide-react';
import { useAllReleaseTags } from '../lib/version';

export type InstallPkgTab = 'curl' | 'cargo';

export interface InstallTabsProps {
  id?: string;
  className?: string;
}

export const InstallTabs: React.FC<InstallTabsProps> = ({
  id,
  className = '',
}) => {
  const { latestStable, pastVersions } = useAllReleaseTags();

  const [activeTab, setActiveTab] = useState<InstallPkgTab>('curl');
  // 'stable' (default), 'nightly', or a specific tag string like 'v0.2.82'
  const [curlVariant, setCurlVariant] = useState<string>('stable');
  const [isCurlDropdownOpen, setIsCurlDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const curlButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateDropdownPosition = useCallback(() => {
    if (curlButtonRef.current) {
      const rect = curlButtonRef.current.getBoundingClientRect();
      const dropdownWidth = 288; // w-72 = 18rem = 288px
      let left = rect.left;
      if (left + dropdownWidth > window.innerWidth - 16) {
        left = Math.max(16, window.innerWidth - dropdownWidth - 16);
      }
      setDropdownPosition({
        top: rect.bottom + 8,
        left: Math.max(8, left),
      });
    }
  }, []);

  // Update position on scroll/resize when open
  useEffect(() => {
    if (!isCurlDropdownOpen) return;
    updateDropdownPosition();

    const handleScrollOrResize = () => {
      updateDropdownPosition();
    };

    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isCurlDropdownOpen, updateDropdownPosition]);

  // Close dropdown on click outside
  useEffect(() => {
    if (!isCurlDropdownOpen) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        curlButtonRef.current &&
        !curlButtonRef.current.contains(target)
      ) {
        setIsCurlDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCurlDropdownOpen(false);
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('touchstart', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCurlDropdownOpen]);

  // Compute active install command
  const getCommand = (): string => {
    if (activeTab === 'cargo') {
      return 'cargo install gtm --locked';
    }
    // curl tab
    if (curlVariant === 'nightly') {
      return 'curl -fsSL https://gtmd.dev/install.sh | bash -s -- --nightly';
    }
    if (curlVariant === 'stable') {
      return 'curl -fsSL https://gtmd.dev/install.sh | bash';
    }
    // specific past version
    return `curl -fsSL https://gtmd.dev/install.sh | bash -s -- --version ${curlVariant}`;
  };

  const command = getCommand();

  const handleCopy = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(command).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {});
    }
  };

  const handleCurlButtonClick = () => {
    updateDropdownPosition();
    if (activeTab !== 'curl') {
      setActiveTab('curl');
      setIsCurlDropdownOpen(true);
    } else {
      setIsCurlDropdownOpen((prev) => !prev);
    }
  };

  // Label for the curl tab button
  const getCurlTabLabel = () => {
    if (curlVariant === 'nightly') return 'curl: nightly';
    if (curlVariant === 'stable') return 'curl';
    return `curl: ${curlVariant}`;
  };

  return (
    <div
      id={id}
      className={`bg-surface-container/90 backdrop-blur-md border border-hairline-outline rounded-xl p-3 shadow-2xl relative ${className}`}
    >
      {/* Package Selector Tabs */}
      <div className="flex items-center justify-start border-b border-hairline-outline pb-2 px-1 font-mono text-xs scrollbar-none relative overflow-x-auto">
        <div className="flex items-center gap-1.5 whitespace-nowrap min-w-max">
          {/* CURL Tab with Dropdown */}
          <div className="relative">
            <button
              ref={curlButtonRef}
              type="button"
              onClick={handleCurlButtonClick}
              aria-expanded={isCurlDropdownOpen}
              aria-haspopup="listbox"
              className={`px-3 py-1 rounded transition-colors cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 ${
                activeTab === 'curl'
                  ? 'bg-surface-elevated text-text-primary font-bold border border-hairline-outline text-secondary'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              title="Select curl version (nightly, stable, or past releases)"
            >
              <span>{getCurlTabLabel()}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-150 ${
                  isCurlDropdownOpen ? 'rotate-180 text-secondary' : 'text-text-muted'
                }`}
              />
            </button>

            {/* Dropdown Menu rendered outside of section via React Portal */}
            {mounted && isCurlDropdownOpen && typeof document !== 'undefined' && createPortal(
              <div
                ref={dropdownRef}
                role="listbox"
                aria-label="curl release channel and version"
                style={{
                  position: 'fixed',
                  top: `${dropdownPosition.top}px`,
                  left: `${dropdownPosition.left}px`,
                }}
                className="z-[9999] w-72 max-w-[90vw] bg-surface-elevated/95 backdrop-blur-xl border border-hairline-outline rounded-lg shadow-2xl py-1.5 font-mono text-xs animate-in fade-in zoom-in-95 duration-100 divide-y divide-hairline-subtle"
              >
                {/* 1. TOP MOST OPTION: Nightly */}
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setCurlVariant('nightly');
                      setActiveTab('curl');
                      setIsCurlDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between gap-2 hover:bg-surface-container transition-colors cursor-pointer ${
                      curlVariant === 'nightly' ? 'bg-secondary/10 text-secondary font-bold' : 'text-text-primary'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FlaskConical className="w-3.5 h-3.5 text-secondary shrink-0" />
                      <div>
                        <div className="font-semibold flex items-center gap-1.5">
                          <span>nightly</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-secondary/15 text-secondary border border-secondary/30">
                            latest
                          </span>
                        </div>
                        <div className="text-[10px] text-text-muted font-sans pt-0.5">
                          Bleeding-edge builds from the dev branch
                        </div>
                      </div>
                    </div>
                    {curlVariant === 'nightly' && (
                      <Check className="w-3.5 h-3.5 text-secondary shrink-0" />
                    )}
                  </button>
                </div>

                {/* 2. DEFAULT OPTION: Stable Release */}
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setCurlVariant('stable');
                      setActiveTab('curl');
                      setIsCurlDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between gap-2 hover:bg-surface-container transition-colors cursor-pointer ${
                      curlVariant === 'stable' ? 'bg-secondary/10 text-secondary font-bold' : 'text-text-primary'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-state-success shrink-0" />
                      <div>
                        <div className="font-semibold flex items-center gap-1.5">
                          <span>stable release</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-surface-container text-text-muted border border-hairline-outline">
                            {latestStable}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-state-success/15 text-state-success border border-state-success/30 font-medium">
                            default
                          </span>
                        </div>
                        <div className="text-[10px] text-text-muted font-sans pt-0.5">
                          Recommended stable public release
                        </div>
                      </div>
                    </div>
                    {curlVariant === 'stable' && (
                      <Check className="w-3.5 h-3.5 text-secondary shrink-0" />
                    )}
                  </button>
                </div>

                {/* 3. PAST VERSIONS */}
                {pastVersions.length > 0 && (
                  <div className="py-1">
                    <div className="px-3 py-1 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      Past Versions
                    </div>
                    <div className="max-h-44 overflow-y-auto space-y-0.5 scrollbar-thin">
                      {pastVersions.map((versionTag) => (
                        <button
                          key={versionTag}
                          type="button"
                          onClick={() => {
                            setCurlVariant(versionTag);
                            setActiveTab('curl');
                            setIsCurlDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 flex items-center justify-between gap-2 hover:bg-surface-container transition-colors cursor-pointer text-xs ${
                            curlVariant === versionTag
                              ? 'bg-secondary/10 text-secondary font-bold'
                              : 'text-text-primary'
                          }`}
                        >
                          <span className="font-mono">{versionTag}</span>
                          {curlVariant === versionTag && (
                            <Check className="w-3.5 h-3.5 text-secondary shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>,
              document.body
            )}
          </div>

          {/* CARGO Tab */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('cargo');
              setIsCurlDropdownOpen(false);
            }}
            className={`px-3 py-1 rounded transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'cargo'
                ? 'bg-surface-elevated text-text-primary font-bold border border-hairline-outline text-secondary'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            cargo
          </button>
        </div>
      </div>

      {/* Command Display + Copy */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-code-canvas rounded-lg mt-2 font-mono text-xs">
        <div className="flex items-center gap-2.5 overflow-x-auto min-w-0">
          <span className="text-secondary font-bold select-none">$</span>
          <span className="text-text-primary select-all font-medium truncate">
            {command}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-hairline-outline text-text-muted hover:text-primary-container hover:border-primary-container transition-all text-xs shrink-0 ml-3 cursor-pointer bg-surface-elevated"
          title="Copy command to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-state-success" />
              <span className="text-state-success font-bold">copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
