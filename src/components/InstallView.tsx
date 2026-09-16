import React, { useState } from 'react';
import { 
  Check, 
  Copy, 
  Download, 
  ExternalLink,
  ChevronDown,
  Terminal,
  FileCode,
  ShieldCheck,
  Search,
  Filter
} from 'lucide-react';

interface InstallViewProps {
  onNavigateToDocs?: (sectionId?: string) => void;
}

const GITHUB_RELEASE_VERSION = 'v0.2.83';
const GITHUB_REPO_URL = 'https://github.com/prjctimg/gtm.rs';

interface InstallMethod {
  id: string;
  name: string;
  label: string;
  os: string;
  command: string;
  description: string;
  notes?: string;
}

const INSTALL_METHODS: InstallMethod[] = [
  {
    id: 'curl',
    name: 'Standalone Script (Recommended)',
    label: 'Standalone Script (curl | bash)',
    os: 'Linux & macOS',
    command: 'curl -fsSL https://raw.githubusercontent.com/prjctimg/gtm.rs/main/install.sh | bash',
    description: 'Auto-detects your OS, CPU architecture (x86_64, aarch64), and libc (glibc/musl). Downloads the latest verified release binary, unpacks gtm and gtmd into ~/.local/bin, and configures permissions.',
    notes: 'Requires curl and tar. Installs binaries, shell completions, and man pages.'
  },
  {
    id: 'curl-nightly',
    name: 'Nightly Script',
    label: 'Nightly Script (Latest commits on main)',
    os: 'Linux & macOS',
    command: 'curl -fsSL https://raw.githubusercontent.com/prjctimg/gtm.rs/main/install.sh | bash -s -- --nightly',
    description: 'Downloads the automated bleeding-edge build compiled directly from the latest commit on main.',
    notes: 'Recommended if you want early access to newly committed audio codecs or UI features.'
  },
  {
    id: 'cargo',
    name: 'Cargo / Crates.io',
    label: 'Cargo (cargo install gtm)',
    os: 'All Platforms',
    command: 'cargo install gtm --locked',
    description: 'Compiles and installs gtm directly from source via the official Rust toolchain with locked dependencies.',
    notes: 'Requires Rust 1.81+ and ALSA development headers on Linux.'
  },
  {
    id: 'aur',
    name: 'Arch Linux (AUR)',
    label: 'Arch Linux AUR (paru / yay)',
    os: 'Arch Linux / Manjaro',
    command: 'paru -S gtm-bin',
    description: 'Installs the official pre-compiled release binary directly from the Arch User Repository.',
    notes: 'Alternative: yay -S gtm-bin (or paru -S gtm to compile locally with native CPU flags).'
  },
  {
    id: 'nix',
    name: 'Nix / NixOS',
    label: 'Nix (Flakes / nix-env)',
    os: 'NixOS & nix-darwin',
    command: 'nix profile install github:prjctimg/gtm.rs',
    description: 'Installs the reproducible Nix flake with all audio sink backends and dependencies hermetically managed.',
    notes: 'For legacy nix-env: nix-env -iA nixpkgs.gtm'
  },
  {
    id: 'brew',
    name: 'Homebrew',
    label: 'Homebrew (macOS & Linux)',
    os: 'macOS & Linuxbrew',
    command: 'brew tap prjctimg/gtm && brew install gtm',
    description: 'Official Homebrew formula with native Apple Silicon (M1/M2/M3/M4) and CoreAudio engine support.',
    notes: 'Updates automatically with brew upgrade gtm.'
  },
  {
    id: 'termux',
    name: 'Termux (Android)',
    label: 'Termux (Android build)',
    os: 'Android (Termux)',
    command: 'pkg install rust clang pulseaudio make && make termux',
    description: 'Builds gtm specifically for Android with native PulseAudio backend and automatic daemon auto-spawning.',
    notes: 'PulseAudio is spawned automatically by gtmd on startup.'
  }
];

export interface ReleaseAsset {
  filename: string;
  category: 'musl' | 'glibc' | 'package' | 'platform';
  target: string;
  arch: string;
  format: string;
  size: string;
  sha256: string;
}

const PUBLISHED_ASSETS: ReleaseAsset[] = [
  {
    filename: 'gtm-x86_64-linux-musl.tar.gz',
    category: 'musl',
    target: 'Linux x86_64 (Static musl, zero runtime dependencies)',
    arch: 'x86_64',
    format: 'tar.gz',
    size: '18.7 MB',
    sha256: '812702d2b7d62760adc82a00ff030e00801ea9aa238964fa8b26c8b773dc7d15'
  },
  {
    filename: 'gtm-aarch64-linux-musl.tar.gz',
    category: 'musl',
    target: 'Linux ARM64 (Static musl, Raspberry Pi 4/5)',
    arch: 'aarch64',
    format: 'tar.gz',
    size: '17.5 MB',
    sha256: 'd405adc19cb75240c9d492be07ce35ad71c770510637a2f14509e9fcf732029f'
  },
  {
    filename: 'gtm-aarch64-darwin.tar.gz',
    category: 'platform',
    target: 'macOS Apple Silicon (M1/M2/M3/M4)',
    arch: 'aarch64',
    format: 'tar.gz',
    size: '16.8 MB',
    sha256: '0cdf4bfbf812b7ff7a621ff35caba3cedb506378f278479308fb2d30e97e5053'
  },
  {
    filename: 'gtm-debian-12-x86_64.tar.gz',
    category: 'glibc',
    target: 'Debian 12+ / Ubuntu 22.04+ x86_64 (glibc)',
    arch: 'x86_64',
    format: 'tar.gz',
    size: '18.6 MB',
    sha256: '44bab0c7230692602062e93997cbff0b3e2baf8044e63e5e48ed07768c2e45d7'
  },
  {
    filename: 'gtm-debian-12-aarch64.tar.gz',
    category: 'glibc',
    target: 'Debian 12+ / Ubuntu 22.04+ ARM64 (glibc)',
    arch: 'aarch64',
    format: 'tar.gz',
    size: '17.4 MB',
    sha256: '29f9b20984d5d572a4a7a29067fd4062de2f3835f7c46338e3c520523bffd543'
  },
  {
    filename: 'gtm-arch-x86_64.tar.gz',
    category: 'glibc',
    target: 'Arch Linux x86_64 Tarball',
    arch: 'x86_64',
    format: 'tar.gz',
    size: '18.8 MB',
    sha256: '880e7f8bb5beec6e0148f598d868f75454f8e8c6427b2d4a97d08d5e1673dc43'
  },
  {
    filename: 'gtm-arch-aarch64.tar.gz',
    category: 'glibc',
    target: 'Arch Linux ARM64 Tarball',
    arch: 'aarch64',
    format: 'tar.gz',
    size: '17.6 MB',
    sha256: '09ba4fc0276575ac5266b0317988d1cf771f8f18e23e15a7daa83866369df5af'
  },
  {
    filename: 'gtm_0.2.83_amd64.deb',
    category: 'package',
    target: 'Debian / Ubuntu / Pop!_OS amd64 (.deb)',
    arch: 'amd64',
    format: 'deb',
    size: '12.3 MB',
    sha256: '8ed4fea13edea065e52d7a0c591eabc57c311d26e8d020df666852f6422f90ce'
  },
  {
    filename: 'gtm_0.2.83_arm64.deb',
    category: 'package',
    target: 'Debian / Ubuntu arm64 (.deb)',
    arch: 'arm64',
    format: 'deb',
    size: '10.9 MB',
    sha256: 'c95569bf71cf5730c91309571abf2ac4427ded62672b37dfbb046e9e8f464f60'
  },
  {
    filename: 'gtm-0.2.83.x86_64.rpm',
    category: 'package',
    target: 'Fedora / RHEL / openSUSE x86_64 (.rpm)',
    arch: 'x86_64',
    format: 'rpm',
    size: '18.0 MB',
    sha256: 'da9766d0c35cadde46abdfe6808dd95060d6ddce9fcefe08770f1a051f664a08'
  },
  {
    filename: 'gtm-0.2.83.aarch64.rpm',
    category: 'package',
    target: 'Fedora / RHEL / openSUSE ARM64 (.rpm)',
    arch: 'aarch64',
    format: 'rpm',
    size: '16.9 MB',
    sha256: 'acbb810559b76bcab5a7517704da3b4f1f6a4534beeb4cd4ecfd46d3dfcf3694'
  },
  {
    filename: 'gtm-0.2.83-x86_64.pkg.tar.zst',
    category: 'package',
    target: 'Arch Linux pacman package x86_64',
    arch: 'x86_64',
    format: 'pkg.tar.zst',
    size: '17.4 MB',
    sha256: 'b94c6d97f54ec3c3f391c361a2ccfe27e0bf4528dbf93800a4f26e8a8e8c41dd'
  },
  {
    filename: 'gtm-0.2.83-aarch64.pkg.tar.zst',
    category: 'package',
    target: 'Arch Linux pacman package aarch64',
    arch: 'aarch64',
    format: 'pkg.tar.zst',
    size: '16.5 MB',
    sha256: '1ddd1e802df8c7d9562b9f6a20c44da64219eec7af153af8b4051780b1583aa9'
  },
  {
    filename: 'gtm-0.2.83-r0-x86_64.apk',
    category: 'package',
    target: 'Alpine Linux x86_64 (.apk)',
    arch: 'x86_64',
    format: 'apk',
    size: '18.7 MB',
    sha256: '88ae7473e8733c43b166c280709571c1d7665afed3fc3ea0c2b3b3ad16937d87'
  },
  {
    filename: 'gtm-0.2.83-r0-aarch64.apk',
    category: 'package',
    target: 'Alpine Linux ARM64 (.apk)',
    arch: 'aarch64',
    format: 'apk',
    size: '17.5 MB',
    sha256: 'f9be24c684c86d899d58bb503ea9e4e5b888455e739287d96a2368ca5c321148'
  },
  {
    filename: 'gtm-aarch64-android.tar.gz',
    category: 'platform',
    target: 'Android Termux ARM64 Tarball',
    arch: 'aarch64',
    format: 'tar.gz',
    size: '15.4 MB',
    sha256: '2501ee5abc691bb8883ae1e76c05775d70307bdfc7a237087595b0f14ee9e341'
  },
  {
    filename: 'gtm-android-0.2.83-aarch64.deb',
    category: 'package',
    target: 'Android Termux (.deb package)',
    arch: 'aarch64',
    format: 'deb',
    size: '9.7 MB',
    sha256: 'b2356a9eca596c908b43b975ed44c5041a55853ad9cea73279673cc6139a54a4'
  }
];

const SOURCE_DEPS: { id: string; name: string; command: string }[] = [
  { id: 'debian', name: 'Debian / Ubuntu', command: 'sudo apt install -y libasound2-dev pkg-config' },
  { id: 'fedora', name: 'Fedora / RHEL', command: 'sudo dnf install -y alsa-lib-devel' },
  { id: 'arch', name: 'Arch Linux', command: 'sudo pacman -S --needed alsa-lib pkgconf' },
  { id: 'macos', name: 'macOS', command: 'xcode-select --install' },
  { id: 'termux', name: 'Android Termux', command: 'pkg install -y rust clang pulseaudio make' }
];

export const InstallView: React.FC<InstallViewProps> = ({ onNavigateToDocs }) => {
  const [selectedMethodId, setSelectedMethodId] = useState<string>('curl');
  const [selectedDepDistro, setSelectedDepDistro] = useState<string>('debian');
  const [binaryFilter, setBinaryFilter] = useState<string>('all');
  const [binarySearch, setBinarySearch] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeMethod = INSTALL_METHODS.find(m => m.id === selectedMethodId) || INSTALL_METHODS[0];
  const activeDep = SOURCE_DEPS.find(d => d.id === selectedDepDistro) || SOURCE_DEPS[0];

  const handleCopy = (text: string, id: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      }).catch(() => {});
    }
  };

  const filteredAssets = PUBLISHED_ASSETS.filter(asset => {
    if (binaryFilter !== 'all' && asset.category !== binaryFilter) {
      return false;
    }
    if (binarySearch.trim()) {
      const q = binarySearch.toLowerCase();
      return (
        asset.filename.toLowerCase().includes(q) ||
        asset.target.toLowerCase().includes(q) ||
        asset.arch.toLowerCase().includes(q) ||
        asset.format.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 font-sans space-y-10">
      {/* Header Section */}
      <div className="border-b border-hairline-outline pb-6 space-y-3">
        <div className="flex items-center gap-2 text-secondary font-mono text-xs font-semibold">
          <Download className="w-4 h-4" />
          <span>Release {GITHUB_RELEASE_VERSION} (Latest)</span>
        </div>
        <h1 className="font-mono text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
          Install gtm
        </h1>
        <p className="text-sm sm:text-base text-text-muted max-w-3xl leading-relaxed">
          Install the zero-latency, terminal-native audio player and background daemon on your machine.
          Official release binaries are built reproducibly with full PipeWire, ALSA, PulseAudio, and CoreAudio sinks.
        </p>

        {/* Supported Platform Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px] text-text-muted">
          <span className="px-2.5 py-0.5 rounded bg-surface-container border border-hairline-outline text-text-primary">
            Linux x86_64
          </span>
          <span className="px-2.5 py-0.5 rounded bg-surface-container border border-hairline-outline text-text-primary">
            Linux ARM64
          </span>
          <span className="px-2.5 py-0.5 rounded bg-surface-container border border-hairline-outline text-text-primary">
            macOS Apple Silicon
          </span>
          <span className="px-2.5 py-0.5 rounded bg-surface-container border border-hairline-outline text-text-primary">
            Static musl
          </span>
          <span className="px-2.5 py-0.5 rounded bg-surface-container border border-hairline-outline text-text-primary">
            Android (Termux)
          </span>
        </div>
      </div>

      {/* SECTION 1: Choose Installation Method (Unified Single Codeblock with Dropdown) */}
      <section className="space-y-3">
        <div>
          <h2 className="font-mono text-lg font-bold text-text-primary">
            Choose Installation Method
          </h2>
          <p className="text-xs text-text-muted">
            Select your preferred package manager or installer script below.
          </p>
        </div>

        {/* Unified Interactive Codeblock */}
        <div className="rounded-lg border border-hairline-outline bg-code-canvas overflow-hidden font-mono text-xs shadow-sm">
          {/* Top Control Bar: Dropdown Selector + Meta Info + Copy Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-4 py-2.5 bg-surface-elevated border-b border-hairline-outline gap-3 text-xs">
            {/* Dropdown Menu for Alternative Installation Commands */}
            <div className="flex items-center gap-2 min-w-0">
              <label htmlFor="install-method-select" className="text-text-muted shrink-0 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-secondary" />
                <span>Method:</span>
              </label>

              <div className="relative flex-1 sm:w-80">
                <select
                  id="install-method-select"
                  value={selectedMethodId}
                  onChange={(e) => setSelectedMethodId(e.target.value)}
                  className="w-full appearance-none bg-surface-container border border-hairline-outline text-text-primary font-mono text-xs rounded px-3 py-1.5 pr-8 focus:outline-none focus:border-secondary cursor-pointer"
                >
                  {INSTALL_METHODS.map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-text-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Platform Tag & Copy Button */}
            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
              <span className="px-2 py-0.5 rounded bg-surface-container border border-hairline-outline text-[11px] text-text-muted">
                {activeMethod.os}
              </span>

              <button
                type="button"
                onClick={() => handleCopy(activeMethod.command, 'install-cmd')}
                className="flex items-center gap-1.5 px-3 py-1 bg-surface-container hover:bg-surface-bright border border-hairline-outline hover:border-secondary/60 text-text-primary rounded text-xs transition-colors cursor-pointer"
                title="Copy installation command"
              >
                {copiedId === 'install-cmd' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-state-success" />
                    <span className="text-state-success font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-text-muted" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Terminal Command Output */}
          <div className="p-4 sm:p-5 overflow-x-auto select-all text-text-primary leading-relaxed bg-code-canvas">
            <div className="flex items-center gap-3">
              <span className="text-secondary font-bold select-none text-sm">$</span>
              <code className="text-secondary font-semibold text-xs sm:text-sm tracking-wide">
                {activeMethod.command}
              </code>
            </div>
          </div>

          {/* Method Explanatory Footnote */}
          <div className="px-4 py-3 bg-surface-container/60 border-t border-hairline-outline flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono text-text-muted">
            <div className="flex items-center gap-2">
              <span className="font-bold text-text-primary">{activeMethod.name}:</span>
              <span>{activeMethod.description}</span>
            </div>
            {activeMethod.notes && (
              <span className="text-[11px] text-text-disabled shrink-0 italic">
                {activeMethod.notes}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 2: Compile from Source (Simplified Action) */}
      <section className="space-y-4">
        <div className="border-b border-hairline-outline pb-2">
          <h2 className="font-mono text-lg font-bold text-text-primary">
            Compile from Source
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Clone the repository and build native binaries optimized for your CPU instruction set.
          </p>
        </div>

        <div className="bg-surface-container border border-hairline-outline rounded-lg p-4 sm:p-6 space-y-4 font-mono text-xs">
          {/* Step 1: System Audio Headers Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-text-muted flex-wrap gap-2">
              <span className="font-bold text-text-primary text-xs">
                1. Install Audio Development Headers
              </span>
              <div className="flex items-center gap-1.5 text-[11px]">
                {SOURCE_DEPS.map(dep => (
                  <button
                    key={dep.id}
                    type="button"
                    onClick={() => setSelectedDepDistro(dep.id)}
                    className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                      selectedDepDistro === dep.id
                        ? 'bg-surface-elevated text-secondary border-secondary/50 font-bold'
                        : 'bg-surface-container text-text-muted border-hairline-outline hover:text-text-primary'
                    }`}
                  >
                    {dep.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between bg-code-canvas p-3 rounded border border-hairline-outline overflow-x-auto gap-3">
              <div className="flex items-center gap-2 select-all">
                <span className="text-secondary font-bold select-none">$</span>
                <span className="text-text-body">{activeDep.command}</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(activeDep.command, `dep-${activeDep.id}`)}
                className="text-text-muted hover:text-text-primary transition-colors cursor-pointer shrink-0 text-[11px] flex items-center gap-1 px-2 py-0.5 rounded hover:bg-surface-elevated"
              >
                {copiedId === `dep-${activeDep.id}` ? (
                  <span className="text-state-success font-semibold">Copied</span>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Step 2: Build & Install Command */}
          <div className="space-y-2 pt-2 border-t border-hairline-subtle">
            <div className="flex items-center justify-between text-text-muted">
              <span className="font-bold text-text-primary text-xs">
                2. Clone & Build Release Binary
              </span>
              <button
                type="button"
                onClick={() => handleCopy('git clone https://github.com/prjctimg/gtm.rs && cd gtm.rs && cargo build --release && sudo make install', 'build-source')}
                className="text-text-muted hover:text-text-primary transition-colors cursor-pointer text-[11px] flex items-center gap-1 px-2 py-0.5 rounded hover:bg-surface-elevated"
              >
                {copiedId === 'build-source' ? (
                  <span className="text-state-success font-semibold">Copied</span>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy All</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-code-canvas p-3.5 rounded border border-hairline-outline text-text-primary select-all overflow-x-auto space-y-1">
              <div><span className="text-secondary select-none">$ </span>git clone {GITHUB_REPO_URL} && cd gtm.rs</div>
              <div><span className="text-secondary select-none">$ </span>cargo build --release</div>
              <div><span className="text-secondary select-none">$ </span>sudo make install <span className="text-text-disabled select-none"># installs gtm, gtmd, completions, man pages</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Actual GitHub Release Matrix (Precompiled Binaries) */}
      <section className="space-y-4">
        <div className="border-b border-hairline-outline pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-mono text-lg font-bold text-text-primary">
                Precompiled Release Binaries
              </h2>
              <span className="px-2 py-0.5 rounded bg-surface-elevated border border-hairline-outline text-[11px] font-mono text-secondary">
                {GITHUB_RELEASE_VERSION}
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Official standalone binaries and distro packages published directly on GitHub Releases.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <a
              href={`${GITHUB_REPO_URL}/releases/download/${GITHUB_RELEASE_VERSION}/checksums.txt`}
              target="_blank"
              rel="noreferrer"
              className="text-text-muted hover:text-secondary flex items-center gap-1 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-state-success" />
              <span>checksums.txt</span>
            </a>
            <a
              href={`${GITHUB_REPO_URL}/releases/tag/${GITHUB_RELEASE_VERSION}`}
              target="_blank"
              rel="noreferrer"
              className="text-secondary hover:underline flex items-center gap-1"
            >
              <span>GitHub Release</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 font-mono text-xs">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: `All (${PUBLISHED_ASSETS.length})` },
              { id: 'musl', label: 'Static musl' },
              { id: 'glibc', label: 'glibc Tarballs' },
              { id: 'package', label: 'Packages (.deb/.rpm/.pkg/.apk)' },
              { id: 'platform', label: 'macOS & Android' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setBinaryFilter(tab.id)}
                className={`px-2.5 py-1 rounded border text-xs whitespace-nowrap transition-colors cursor-pointer ${
                  binaryFilter === tab.id
                    ? 'bg-surface-elevated text-secondary border-secondary/50 font-bold'
                    : 'bg-surface-container text-text-muted border-hairline-outline hover:text-text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter by arch, format..."
              value={binarySearch}
              onChange={(e) => setBinarySearch(e.target.value)}
              className="w-full bg-surface-container border border-hairline-outline text-text-primary font-mono text-xs rounded pl-8 pr-3 py-1.5 focus:outline-none focus:border-secondary placeholder:text-text-disabled"
            />
          </div>
        </div>

        {/* Assets Table */}
        <div className="border border-hairline-outline bg-surface-container rounded-lg overflow-x-auto">
          <table className="w-full min-w-[700px] text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-hairline-outline bg-surface-elevated text-text-muted uppercase text-[11px]">
                <th className="py-2.5 px-4">Artifact / Filename</th>
                <th className="py-2.5 px-3">Target Platform</th>
                <th className="py-2.5 px-2">Arch</th>
                <th className="py-2.5 px-3">Size</th>
                <th className="py-2.5 px-3">SHA-256 Checksum</th>
                <th className="py-2.5 px-4 text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline-subtle text-text-body">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-muted">
                    No release assets match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset, idx) => {
                  const downloadUrl = `${GITHUB_REPO_URL}/releases/download/${GITHUB_RELEASE_VERSION}/${asset.filename}`;
                  const shortSha = `${asset.sha256.slice(0, 7)}...${asset.sha256.slice(-7)}`;

                  return (
                    <tr key={idx} className="hover:bg-surface-elevated/40 transition-colors">
                      <td className="py-3 px-4 font-semibold text-text-primary">
                        <div className="flex items-center gap-1.5">
                          <FileCode className="w-3.5 h-3.5 text-secondary shrink-0" />
                          <span className="font-mono text-xs text-text-primary">{asset.filename}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-text-muted text-[11px]">
                        {asset.target}
                      </td>
                      <td className="py-3 px-2 text-text-body text-[11px]">
                        <span className="px-1.5 py-0.5 rounded bg-surface-elevated border border-hairline-outline text-[10px]">
                          {asset.arch}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-text-muted text-[11px]">
                        {asset.size}
                      </td>
                      <td className="py-3 px-3 text-[11px]">
                        <button
                          type="button"
                          onClick={() => handleCopy(asset.sha256, `sha-${idx}`)}
                          className="font-mono text-text-disabled hover:text-text-primary transition-colors cursor-pointer flex items-center gap-1"
                          title="Click to copy full SHA-256 hash"
                        >
                          <span>{copiedId === `sha-${idx}` ? 'Copied SHA' : shortSha}</span>
                          <Copy className="w-2.5 h-2.5 shrink-0 opacity-60" />
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopy(downloadUrl, `url-${idx}`)}
                            className="px-2 py-1 rounded bg-surface-elevated border border-hairline-outline text-text-muted hover:text-text-primary text-[11px] transition-colors cursor-pointer"
                            title="Copy download URL"
                          >
                            {copiedId === `url-${idx}` ? 'Copied' : 'Copy'}
                          </button>
                          <a
                            href={downloadUrl}
                            download
                            className="px-2.5 py-1 rounded bg-surface-elevated hover:bg-secondary/15 border border-hairline-outline hover:border-secondary text-text-primary hover:text-secondary text-[11px] font-semibold transition-colors inline-flex items-center gap-1"
                            title={`Download ${asset.filename}`}
                          >
                            <Download className="w-3 h-3" />
                            <span>Download</span>
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 4: Post-Installation Verification */}
      <section className="space-y-3">
        <div className="border-b border-hairline-outline pb-2">
          <h2 className="font-mono text-lg font-bold text-text-primary">
            Verify Your Installation
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Check that the binary is available in your PATH and start the player.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-surface-container border border-hairline-outline rounded-lg p-4 space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between text-text-muted">
              <span className="font-bold text-text-primary">1. Check Binary Version</span>
              <button
                type="button"
                onClick={() => handleCopy('gtm --version', 'check-ver')}
                className="hover:text-text-primary transition-colors cursor-pointer text-[11px] flex items-center gap-1"
              >
                {copiedId === 'check-ver' ? <span className="text-state-success font-semibold">Copied</span> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <div className="bg-code-canvas p-2.5 rounded border border-hairline-outline text-text-primary select-all">
              <span className="text-secondary select-none">$ </span>gtm --version
            </div>
            <div className="text-text-muted text-[11px]">
              Expected: <span className="text-state-success font-semibold">gtm 0.2.83</span> (with rustc edition 2024)
            </div>
          </div>

          <div className="bg-surface-container border border-hairline-outline rounded-lg p-4 space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between text-text-muted">
              <span className="font-bold text-text-primary">2. Launch TUI & Daemon</span>
              <button
                type="button"
                onClick={() => handleCopy('gtm', 'launch-gtm')}
                className="hover:text-text-primary transition-colors cursor-pointer text-[11px] flex items-center gap-1"
              >
                {copiedId === 'launch-gtm' ? <span className="text-state-success font-semibold">Copied</span> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <div className="bg-code-canvas p-2.5 rounded border border-hairline-outline text-text-primary select-all">
              <span className="text-secondary select-none">$ </span>gtm
            </div>
            <div className="text-text-muted text-[11px]">
              Spawns <code className="text-secondary">gtmd</code> in background, probes ALSA/Pulse/CoreAudio, and opens the interface.
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: Link to Documentation */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-surface-elevated/40 border border-hairline-outline rounded-lg gap-4 font-mono text-xs">
        <div>
          <div className="font-bold text-text-primary text-sm mb-1">Next: Configure Your Audio Pipeline</div>
          <div className="text-text-muted">Learn how to customize config.toml, setup your library, and configure gapless playback.</div>
        </div>
        {onNavigateToDocs && (
          <button
            type="button"
            onClick={() => onNavigateToDocs('overview')}
            className="shrink-0 px-4 py-2 bg-primary-container text-on-primary-container rounded font-bold hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-2"
          >
            <span>Open Documentation</span>
            <Terminal className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
