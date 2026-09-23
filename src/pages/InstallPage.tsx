import React, { useState, useEffect, useMemo } from 'react';
import { Link, NavLink } from 'react-router';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { usePageMeta } from '../lib/meta';
import { ALL_DOCS, DOC_CATEGORIES, DOCS_BY_CATEGORY } from '../data/docs';
import { 
  ChevronRight, 
  Github, 
  ArrowUpRight, 
  PanelLeft, 
  ListTree, 
  ChevronDown, 
  Check, 
  Copy, 
  Search, 
  X 
} from 'lucide-react';

interface InstallPageProps {
  onOpenSearch?: () => void;
}

const INSTALL_DOCUMENT_MARKDOWN = `
\`gtm\` is a terminal audio player and music manager written in Rust. It follows a client-daemon architecture: the \`gtm\` interactive terminal UI connects to a background \`gtmd\` daemon process that handles audio decoding, device output, playlist queueing, and state persistence.

A complete installation provides:
- **\`gtm\`** — Interactive terminal UI player frontend powered by ratatui.
- **\`gtmd\`** — Headless audio daemon background service.
- **Shell completions** — Native completions for Bash, Zsh, and Fish.
- **Man pages** — System reference manuals accessible via \`man gtm\`.

---

## Prerequisites

\`gtm\` is tested on Linux and macOS. Ensure you have the required audio libraries and compiler toolchain:

- **Rust toolchain:** 1.81+ (Edition 2024).
- **Linux (ALSA):** \`libasound2-dev\` (Debian/Ubuntu) or \`alsa-lib-devel\` (Fedora/RHEL) for the Rodio audio backend.
- **Linux (PulseAudio):** \`libpulse-dev\` or \`pulseaudio-libs-devel\` when using the optional \`pulseaudio\` feature.
- **macOS:** Audio outputs natively through Rodio and CoreAudio. No additional audio headers are required.

:::note
On Debian or Ubuntu, install system audio development packages with:
\`\`\`bash
sudo apt-get install libasound2-dev libpulse-dev pkg-config
\`\`\`
On Fedora, install with:
\`\`\`bash
sudo dnf install alsa-lib-devel pulseaudio-libs-devel
\`\`\`
:::

---

## Quick Install Script

The fastest way to install \`gtm\` on Linux and macOS is using the automated install script, which downloads pre-compiled release binaries for your architecture:

\`\`\`bash
curl -fsSL https://gtmd.dev/install.sh | bash
\`\`\`

The script automatically:
1. Detects your OS and CPU architecture (x86_64, aarch64).
2. Downloads and unpacks the latest release binaries into \`~/.local/bin\` and adds it to your PATH (bash, zsh, or fish).
3. Installs shell completions into standard completion directories for Bash, Zsh, and Fish.
4. Installs the manual page to \`~/.local/share/man/man1/gtm.1\`.

### Nightly Builds

Nightly builds are automatically compiled and published on every commit to \`main\`:

\`\`\`bash
curl -fsSL https://gtmd.dev/install.sh | bash -s -- --nightly
\`\`\`

---

## Package Managers

### Arch Linux (AUR)

\`gtm\` is available in the Arch User Repository as \`gtm-bin\` (pre-compiled binary) or \`gtm-git\` (compiled from source):

\`\`\`bash
# Install binary release via paru
paru -S gtm-bin

# Or install binary release via yay
yay -S gtm-bin
\`\`\`

### Homebrew (macOS & Linux)

Install via the official Homebrew tap formula:

\`\`\`bash
brew tap prjctimg/gtm
brew install gtm
\`\`\`

### crates.io (Cargo)

If you have a configured Rust development environment, install directly from crates.io:

\`\`\`bash
cargo install gtm
\`\`\`

---

## Build From Source

To compile the latest release or bleeding-edge development version locally:

\`\`\`bash
# 1. Clone the repository
git clone https://github.com/prjctimg/gtm.rs.git
cd gtm.rs

# 2. Build the optimized release binaries
cargo build --release

# 3. Install binaries into ~/.cargo/bin or ~/.local/bin
cp target/release/gtm target/release/gtmd ~/.local/bin/
\`\`\`

:::tip
By default, building from source produces a **nightly** build from the \`main\` branch. To build a specific tagged release, check out the tag first:
\`\`\`bash
git checkout v0.2.83
cargo build --release
\`\`\`
:::

---

## Cargo Features

The daemon includes optional build features that can be toggled via Cargo flags:

| Feature | Default | Description |
|---|---|---|
| \`mpris\` | ✅ Enabled | D-Bus MPRIS media controls for hardware media keys and desktop widgets |
| \`youtube\` | ✅ Enabled | YouTube search and audio streaming via \`innertube-rs\` |
| \`pulseaudio\` | ❌ Disabled | PulseAudio direct audio backend (defaults to Rodio / ALSA / PipeWire MMAP) |

To compile without YouTube or MPRIS (recommended for minimal headless environments):

\`\`\`bash
cargo build --release --no-default-features --features pulseaudio
\`\`\`

---

## Termux (Android)

\`gtm\` can run natively on Android inside the Termux environment:

\`\`\`bash
pkg install rust clang pkg-config pulseaudio make

git clone https://github.com/prjctimg/gtm.rs
cd gtm.rs

make termux
\`\`\`

The build script auto-detects Termux and configures the PulseAudio backend. At runtime, \`gtmd\` starts the PulseAudio server automatically — no manual \`pulseaudio --start\` command is needed.

:::caution
YouTube search is automatically disabled on Android/Termux builds because \`rquickjs\` does not ship Android bindings. Local audio files, playlists, and internet radio streams work without issue.
:::

---

## First Run

Start the interactive terminal UI:

\`\`\`bash
gtm
\`\`\`

The client automatically spawns the background \`gtmd\` daemon process if it is not already running.

1. Press \`1\` to switch to the **Library** tab.
2. Press \`Enter\` on a category or directory to drill down into tracks.
3. Press \`Enter\` on a track to begin playback.
4. Press \`Space\` to pause or resume playback.
5. Press \`n\` for next track, or \`p\` for previous track.

:::note
The daemon logs to \`~/.local/share/gtm/gtmd.log\` (or \`$XDG_DATA_HOME/gtm/gtmd.log\`). It automatically persists playback queue, volume level, repeat mode, and crossfade settings across restarts in \`~/.local/share/gtm/state.json\`.
:::

---

## Limitations

- **macOS:** Audio output operates via Rodio / CoreAudio. PulseAudio support is Linux-only.
- **Windows:** Windows is not officially supported or tested.
- **YouTube search:** Requires the \`youtube\` Cargo feature, which is disabled on Android/Termux builds.
`;

const INSTALL_HEADINGS = [
  { id: 'prerequisites', text: 'Prerequisites', level: 2 },
  { id: 'quick-install-script', text: 'Quick Install Script', level: 2 },
  { id: 'nightly-builds', text: 'Nightly Builds', level: 3 },
  { id: 'package-managers', text: 'Package Managers', level: 2 },
  { id: 'arch-linux-aur', text: 'Arch Linux (AUR)', level: 3 },
  { id: 'homebrew-macos-linux', text: 'Homebrew (macOS & Linux)', level: 3 },
  { id: 'cratesio-cargo', text: 'crates.io (Cargo)', level: 3 },
  { id: 'build-from-source', text: 'Build From Source', level: 2 },
  { id: 'cargo-features', text: 'Cargo Features', level: 2 },
  { id: 'termux-android', text: 'Termux (Android)', level: 2 },
  { id: 'first-run', text: 'First Run', level: 2 },
  { id: 'limitations', text: 'Limitations', level: 2 },
];

export const InstallPage: React.FC<InstallPageProps> = ({ onOpenSearch }) => {
  usePageMeta(
    'Install | gtm',
    'Install methods for gtm: the install script, crates.io, a source build, and Termux.'
  );

  const [activeHeadingId, setActiveHeadingId] = useState<string>(INSTALL_HEADINGS[0]?.id || '');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileDrawerOpen) {
        setIsMobileDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileDrawerOpen]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isMobileDrawerOpen]);

  // Scroll spy to track current active heading in viewport
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const offset = 140; // Navbar (56px) + sticky mobile TOC (~60px) + buffer
      let currentId = INSTALL_HEADINGS[0]?.id || '';

      for (const h of INSTALL_HEADINGS) {
        const el = document.getElementById(h.id) || document.getElementById(`_${h.id}`);
        if (el) {
          const top = el.getBoundingClientRect().top + scrollY;
          if (scrollY >= top - offset) {
            currentId = h.id;
          }
        }
      }

      setActiveHeadingId((prev) => (prev === currentId ? prev : currentId));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToHeading = (id: string) => {
    setActiveHeadingId(id);
    const el = document.getElementById(id) || document.getElementById(`_${id}`);
    if (el) {
      const navOffset = 135;
      const elementPosition = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: Math.max(0, elementPosition - navOffset),
        behavior: 'smooth'
      });
    }
  };

  const handleCopyDocUrl = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }).catch(() => {});
    }
  };

  return (
    <div className="w-full flex flex-col font-sans">
      <div className="max-w-7xl mx-auto flex w-full">
        {/* CENTER CANVAS: Install Article */}
        <main className="flex-1 min-w-0 px-4 sm:px-8 py-8 max-w-4xl mx-auto space-y-8">
          {/* Mobile Sticky Table of Contents & Navigation */}
          <div className="xl:hidden sticky top-14 z-20 -mx-4 sm:-mx-8 px-4 sm:px-8 pt-5 sm:pt-6 pb-3 bg-canvas-obsidian/95 backdrop-blur-md border-b border-hairline-outline shadow-sm flex items-center gap-2 relative">
            {/* Side Drawer Toggle Icon */}
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              className="p-2 rounded-lg bg-surface-container hover:bg-surface-elevated border border-hairline-outline hover:border-secondary/40 text-secondary transition-colors cursor-pointer shrink-0 flex items-center justify-center min-h-[38px] min-w-[38px]"
              title="Documentation Pages Index"
              aria-label="Toggle documentation side drawer"
            >
              <PanelLeft className="w-4 h-4 text-secondary" />
            </button>

            <select
              id="mobile-install-selector"
              aria-label="Current document table of contents"
              value={activeHeadingId}
              onChange={(e) => {
                const val = e.target.value;
                if (val) {
                  scrollToHeading(val);
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setActiveHeadingId('');
                }
              }}
              className="flex-1 min-w-0 appearance-none bg-surface-container hover:bg-surface-elevated/70 border border-hairline-outline hover:border-secondary/40 focus:border-secondary focus:ring-1 focus:ring-secondary/30 text-text-primary font-mono text-sm rounded-lg px-3.5 py-2.5 pr-10 focus:outline-none transition-all cursor-pointer shadow-xs min-h-[38px]"
            >
              <option value="" className="bg-canvas-obsidian text-text-primary font-mono">
                Installation (Top)
              </option>
              {INSTALL_HEADINGS.map((h) => (
                <option key={h.id} value={h.id} className="bg-canvas-obsidian text-text-primary font-mono">
                  {h.level === 3 ? '   └ ' : '• '}{h.text}
                </option>
              ))}
            </select>

            <div className="pointer-events-none absolute right-7 sm:right-11 top-1/2 -translate-y-1/2 mt-1 sm:mt-1.5 flex items-center text-secondary/70">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>

          {/* Breadcrumbs with side drawer trigger on desktop */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <nav
              id="install-breadcrumb-nav"
              aria-label="Breadcrumbs"
              className="flex items-center gap-1.5 text-sm font-mono text-text-muted flex-wrap"
            >
              <Link
                to="/"
                className="hover:text-text-primary hover:underline transition-colors cursor-pointer"
              >
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-hairline-outline shrink-0" />
              <Link
                to="/docs/overview"
                className="hover:text-text-primary hover:underline transition-colors cursor-pointer"
              >
                Docs
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-hairline-outline shrink-0" />
              <span className="text-secondary font-semibold">Installation</span>
            </nav>

            {/* Desktop side drawer button */}
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-text-muted hover:text-text-primary bg-surface-container hover:bg-surface-elevated border border-hairline-outline hover:border-secondary/40 rounded transition-colors cursor-pointer"
              title="Open documentation drawer"
            >
              <PanelLeft className="w-3.5 h-3.5 text-secondary" />
              <span>Docs Index</span>
            </button>
          </div>

          {/* Document Title Header */}
          <div className="border-b border-hairline-outline pb-6 space-y-2">
            <h1 className="font-mono text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
              Installation
            </h1>
            <p className="text-sm sm:text-base text-text-muted leading-relaxed font-sans pt-1">
              Official installation methods, package managers, and build configurations for <span className="font-mono text-secondary font-semibold">gtm</span>.
            </p>
          </div>

          {/* Standard Markdown Content */}
          <article className="prose-container space-y-4">
            <MarkdownRenderer
              content={INSTALL_DOCUMENT_MARKDOWN}
            />
          </article>

          {/* Document Footer: GitHub reference */}
          <div className="mt-14 pt-6 border-t border-hairline-outline flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs">
            <p className="text-text-muted text-xs font-sans">
              Referencing the official <span className="font-mono text-text-muted font-medium">gtm.rs</span> documentation and repository.
            </p>
            <a
              href="https://github.com/prjctimg/gtm.rs"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-text-muted hover:text-text-primary bg-surface-container hover:bg-surface-elevated border border-hairline-outline rounded transition-colors group cursor-pointer shrink-0"
              title="View on GitHub"
            >
              <Github className="w-3.5 h-3.5 text-text-muted group-hover:text-secondary transition-colors" />
              <span>View on GitHub</span>
              <ArrowUpRight className="w-3 h-3 text-text-disabled group-hover:text-text-primary transition-colors" />
            </a>
          </div>
        </main>

        {/* RIGHT SIDEBAR: On This Page Table of Contents (Desktop Floating TOC) */}
        <aside className="w-60 shrink-0 border-l border-hairline-outline bg-canvas-obsidian px-6 pt-6 pb-6 hidden xl:block sticky top-14 self-start max-h-[calc(100vh-56px)] overflow-y-auto font-mono text-sm">
          <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <ListTree className="w-3.5 h-3.5 text-secondary" />
            <span>On this page</span>
          </div>

          <ul className="space-y-1.5 border-l border-hairline-outline pl-3">
            {INSTALL_HEADINGS.map((h) => (
              <li
                key={h.id}
                style={h.level === 3 ? { paddingLeft: '8px' } : undefined}
              >
                <button
                  onClick={() => scrollToHeading(h.id)}
                  className={`block text-left transition-colors cursor-pointer text-sm truncate max-w-[180px] ${
                    activeHeadingId === h.id
                      ? 'text-secondary font-bold'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                  title={h.text}
                >
                  {h.text}
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-8 pt-6 border-t border-hairline-outline space-y-2.5">
            <button
              onClick={handleCopyDocUrl}
              className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors text-sm cursor-pointer w-full text-left"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-state-success" />
                  <span className="text-state-success">Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Page URL</span>
                </>
              )}
            </button>
          </div>
        </aside>
      </div>

      {/* MOBILE / FLYOUT SIDE DRAWER: Document List & Categories */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Sheet */}
          <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-canvas-obsidian border-r border-hairline-outline shadow-2xl flex flex-col font-mono text-sm z-10 animate-in slide-in-from-left duration-200">
            {/* Header */}
            <div className="flex items-center justify-end p-4 border-b border-hairline-outline bg-surface-container/50">
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1 text-text-muted hover:text-text-primary rounded hover:bg-surface-elevated transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                aria-label="Close documentation drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Trigger inside Drawer */}
            {onOpenSearch && (
              <div className="p-3.5 border-b border-hairline-outline bg-surface-container/30">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    onOpenSearch();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 bg-code-canvas border border-hairline-outline hover:border-secondary/50 rounded text-text-muted text-sm transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-secondary" />
                    <span>Search</span>
                  </div>
                  <kbd className="px-1.5 py-0.5 bg-surface-elevated border border-hairline-outline rounded text-xs text-text-muted">
                    /
                  </kbd>
                </button>
              </div>
            )}

            {/* Document Navigation Tree */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {DOC_CATEGORIES.map((category) => {
                const docsInCat = DOCS_BY_CATEGORY[category] || [];
                return (
                  <div key={category} className="space-y-1.5">
                    <div className="text-xs font-bold text-text-muted tracking-wider uppercase flex items-center gap-1.5 px-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                      <span>{category}</span>
                    </div>

                    <ul className="space-y-0.5 border-l border-hairline-subtle ml-2 pl-2">
                      {docsInCat.map((doc) => (
                        <React.Fragment key={doc.id}>
                          <li>
                            <NavLink
                              to={`/docs/${doc.id}`}
                              onClick={() => setIsMobileDrawerOpen(false)}
                              className="w-full text-left py-2 px-2.5 rounded text-sm cursor-pointer transition-colors flex items-center gap-1.5 text-text-muted hover:text-text-primary hover:bg-surface-elevated/40"
                            >
                              <span className="truncate">{doc.title}</span>
                            </NavLink>
                          </li>
                        </React.Fragment>
                      ))}
                    </ul>
                  </div>
                );
              })}

              {/* Benchmarks Section in Drawer */}
              <div className="space-y-1.5 pt-2 border-t border-hairline-subtle">
                <div className="text-xs font-bold text-text-muted tracking-wider uppercase flex items-center gap-1.5 px-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  <span>Benchmarks</span>
                </div>
                <ul className="space-y-0.5 border-l border-hairline-subtle ml-2 pl-2">
                  <li>
                    <NavLink
                      to="/benchmark"
                      onClick={() => setIsMobileDrawerOpen(false)}
                      className={({ isActive }) =>
                        `w-full text-left py-2 px-2.5 rounded text-sm cursor-pointer transition-colors flex items-center gap-1.5 ${
                          isActive
                            ? 'bg-surface-elevated text-secondary font-bold border border-secondary/30'
                            : 'text-text-muted hover:text-text-primary hover:bg-surface-elevated/40'
                        }`
                      }
                    >
                      <span className="truncate">Benchmarks</span>
                    </NavLink>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
