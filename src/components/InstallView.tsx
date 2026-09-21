import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import { MarkdownRenderer } from './MarkdownRenderer';
import { usePageMeta } from '../meta';
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
  Keyboard, 
  BookOpen, 
  X 
} from 'lucide-react';

interface InstallViewProps {
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
curl -fsSL https://raw.githubusercontent.com/prjctimg/gtm.rs/main/install.sh | bash
\`\`\`

The script automatically:
1. Detects your OS and CPU architecture (x86_64, aarch64).
2. Downloads and unpacks the latest release binaries into \`/usr/local/bin\`.
3. Installs shell completions into standard completion directories for Bash, Zsh, and Fish.
4. Installs the manual page to \`/usr/local/share/man/man1/gtm.1\`.

### Nightly Builds

Nightly builds are automatically compiled and published on every commit to \`main\`:

\`\`\`bash
curl -fsSL https://raw.githubusercontent.com/prjctimg/gtm.rs/main/install.sh | bash -s -- --nightly
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

### Nix / NixOS

Install reproducibly into your user environment using Nix flakes:

\`\`\`bash
nix profile install github:prjctimg/gtm.rs
\`\`\`

Or run directly without installing (ephemeral execution):

\`\`\`bash
nix run github:prjctimg/gtm.rs
\`\`\`

---

## Cargo (crates.io)

You can compile and install \`gtm\` directly from crates.io using the standard Rust package manager:

\`\`\`bash
cargo install gtm --locked
\`\`\`

To upgrade an existing installation to the latest version:

\`\`\`bash
cargo install --force gtm --locked
\`\`\`

---

## Build from Source

To compile the latest development version directly from Git:

\`\`\`bash
git clone https://github.com/prjctimg/gtm.rs
cd gtm.rs

# Build release binaries
cargo build --release

# Installs binaries, completions, and man pages
sudo make install
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

export const InstallView: React.FC<InstallViewProps> = () => {
  usePageMeta(
    'Install gtm — gtm Docs',
    'Official installation methods, package managers, and build configurations for gtm — the terminal audio player.'
  );

  return (
    <div className="w-full min-h-[calc(100vh-60px)] bg-canvas-obsidian text-text-primary pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-8 sm:pt-12">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 font-mono text-xs text-text-muted mb-6">
          <Link
            to="/"
            className="hover:text-text-primary hover:underline transition-colors"
          >
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-hairline-outline shrink-0" />
          <Link
            to="/docs/overview"
            className="hover:text-text-primary hover:underline transition-colors"
          >
            Docs
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-hairline-outline shrink-0" />
          <span className="text-secondary font-semibold">Installation</span>
        </nav>

        {/* Document Title Header */}
        <div className="border-b border-hairline-outline pb-6 mb-8 space-y-2">
          <h1 className="font-mono text-2xl sm:text-4xl font-bold text-text-primary tracking-tight">
            Installation
          </h1>
          <p className="text-sm sm:text-base text-text-muted leading-relaxed font-sans pt-1">
            Official installation methods, package managers, and build configurations for <span className="font-mono text-secondary font-semibold">&gt; gtm</span>.
          </p>
        </div>

        {/* Standard Markdown Content with Callouts */}
        <article className="prose-container space-y-4">
          <MarkdownRenderer
            content={INSTALL_DOCUMENT_MARKDOWN}
          />
        </article>

        {/* Document Footer: GitHub reference */}
        <div className="mt-14 pt-6 border-t border-hairline-outline flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs">
          <p className="text-text-muted text-xs font-sans">
            Referencing the official <span className="font-mono text-text-primary">gtm.rs</span> documentation and repository.
          </p>
          <a
            href="https://github.com/prjctimg/gtm.rs"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-text-muted hover:text-text-primary bg-surface-container hover:bg-surface-elevated border border-hairline-outline rounded transition-colors group cursor-pointer shrink-0"
          >
            <Github className="w-3.5 h-3.5 text-text-muted group-hover:text-secondary transition-colors" />
            <span>View on GitHub</span>
            <ArrowUpRight className="w-3 h-3 text-text-disabled group-hover:text-text-primary transition-colors" />
          </a>
        </div>

      </div>
    </div>
  );
};
