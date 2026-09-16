import React, { useState, useEffect } from 'react';
import { IMAGES, PACKAGE_COMMANDS, KEYBINDINGS } from '../data/mockData';
import { PageTab } from '../types';
import { AnimatedTelemetryBenchmark } from './AnimatedTelemetryBenchmark';
import { MusicalDoodleBackground } from './MusicalDoodleBackground';
import { 
  Check, 
  Copy, 
  Terminal, 
  Code, 
  ExternalLink, 
  Music, 
  Sliders, 
  Cpu, 
  Layers, 
  Volume2, 
  Radio, 
  ArrowRight,
  Disc,
  Search,
  Settings,
  CheckCircle2,
  FileCode,
  Apple,
  Server
} from 'lucide-react';

interface LandingViewProps {
  onNavigate: (tab: PageTab, sectionId?: string) => void;
  onOpenKeymap: () => void;
}

type TuiTab = 'library' | 'lyrics' | 'fft' | 'search';
type PkgTab = 'curl' | 'cargo' | 'brew' | 'aur' | 'nix';
type FooterPkgTab = 'curl' | 'cargo' | 'brew' | 'aur' | 'nix';

export const LandingView: React.FC<LandingViewProps> = ({ onNavigate, onOpenKeymap }) => {
  // Hero package switcher
  const [heroPkg, setHeroPkg] = useState<PkgTab>('curl');
  const [heroCopied, setHeroCopied] = useState(false);

  // TUI Explorer Tab
  const [activeTuiTab, setActiveTuiTab] = useState<TuiTab>('library');

  // Interactive Carousel step
  const [carouselStep, setCarouselStep] = useState(0);

  // Footer Install box
  const [footerPkg, setFooterPkg] = useState<FooterPkgTab>('curl');
  const [footerCopied, setFooterCopied] = useState(false);

  // Animated spectrum bars
  const [barHeights, setBarHeights] = useState<number[]>([
    45, 60, 85, 95, 78, 90, 65, 50, 70, 82, 60, 40, 30, 55, 72, 88, 64, 42, 25
  ]);
  const [isPlayingFft, setIsPlayingFft] = useState(true);

  // Interactive fuzzy search simulation
  const [searchQuery, setSearchQuery] = useState('kendrick to pimp a butterfly');

  useEffect(() => {
    if (!isPlayingFft) return;
    const interval = setInterval(() => {
      setBarHeights(prev =>
        prev.map(h => {
          const delta = (Math.random() - 0.48) * 18;
          return Math.min(98, Math.max(15, h + delta));
        })
      );
    }, 120);
    return () => clearInterval(interval);
  }, [isPlayingFft]);

  const carouselItems = [
    {
      step: '01 / Themes',
      title: 'Reactive Album Color Schemes',
      desc: 'Dynamic terminal 24-bit truecolor engine that extracts dominant palettes directly from album artwork in real time. Switch manually with t or enable auto-sync.',
      badge: 'Themes',
      hotkey: 't',
      img: IMAGES.themesArt
    },
    {
      step: '02 / Visualizer',
      title: '60 FPS Waveform & FFT Spectrum Visualizer',
      desc: 'Achieving 120 FPS sub-pixel FFT visualizers without flicker: an analysis of buffer diffing algorithms, terminal escape code congestion, and SIMD-accelerated Braille rendering.',
      badge: 'Audio FFT',
      hotkey: 'v',
      img: IMAGES.libraryView1
    },
    {
      step: '03 / Lyrics',
      title: 'Synchronized Karaoke Lyrics (.lrc)',
      desc: 'Smooth terminal vertical auto-scrolling with microsecond audio clock synchronization and dual-language translation support.',
      badge: 'LRC Engine',
      hotkey: 'L',
      img: IMAGES.lyricsView1
    },
    {
      step: '04 / Concurrency',
      title: 'Lock-Free Ringbuffer Audio Engine',
      desc: 'Dual ring-buffer allocation for seamless cross-fades. Lock-free SPSC channel swaps audio buffers in 18.2 nanoseconds without mutex locks.',
      badge: 'Engine',
      hotkey: 'b',
      img: IMAGES.libraryView2
    }
  ];

  const handleCopyHero = () => {
    navigator.clipboard.writeText(PACKAGE_COMMANDS[heroPkg]);
    setHeroCopied(true);
    setTimeout(() => setHeroCopied(false), 2000);
  };

  const getFooterCommand = () => {
    switch (footerPkg) {
      case 'curl':
        return 'curl -fsSL https://getgtm.dev/install.sh | sh';
      case 'cargo':
        return 'cargo install gtm --locked';
      case 'brew':
        return 'brew install gtm';
      case 'aur':
        return 'yay -S gtm-bin';
      case 'nix':
        return 'nix-env -iA nixpkgs.gtm';
    }
  };

  const handleCopyFooter = () => {
    navigator.clipboard.writeText(getFooterCommand());
    setFooterCopied(true);
    setTimeout(() => setFooterCopied(false), 2000);
  };

  return (
    <div className="w-full flex flex-col font-sans space-y-16 sm:space-y-24">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden w-full pt-6 md:pt-14 pb-8 md:pb-12 px-4 rounded-2xl border border-hairline-outline/40 bg-canvas-obsidian/60 shadow-inner">
        {/* Doodled Musical Background with musical symbols, notes & instruments */}
        <MusicalDoodleBackground />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          {/* Main Title */}
          <h1 className="font-mono text-3xl sm:text-5xl lg:text-6xl font-extrabold text-text-primary tracking-tight leading-tight max-w-4xl mx-auto">
            The missing terminal audio player.
          </h1>

          <p className="text-sm sm:text-base text-text-muted max-w-2xl mx-auto leading-relaxed">
            Switching to your audio player should be a keybinding away at most, and more importantly it has to look stunning.
          </p>

          {/* Multi-package manager install widget */}
          <div className="max-w-xl mx-auto pt-2">
            <div className="bg-surface-container/90 backdrop-blur-md border border-hairline-outline rounded-xl p-3 shadow-2xl">
              {/* Package Selector Tabs */}
              <div className="flex items-center justify-between border-b border-hairline-outline pb-2 px-1 font-mono text-xs">
                <div className="flex items-center gap-1">
                  {(['curl', 'cargo', 'brew', 'aur', 'nix'] as PkgTab[]).map(pkg => (
                    <button
                      key={pkg}
                      onClick={() => setHeroPkg(pkg)}
                      className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                        heroPkg === pkg
                          ? 'bg-surface-elevated text-text-primary font-bold border border-hairline-outline text-secondary'
                          : 'text-text-muted hover:text-text-primary'
                      }`}
                    >
                      {pkg}
                    </button>
                  ))}
                </div>
                <div className="text-text-muted text-[11px] hidden sm:inline-block">
                  SHA-256 verified
                </div>
              </div>

              {/* Command Display + Copy */}
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-code-canvas rounded-lg mt-2 font-mono text-xs">
                <div className="flex items-center gap-2.5 overflow-x-auto">
                  <span className="text-secondary font-bold select-none">$</span>
                  <span className="text-text-primary select-all font-medium truncate">
                    {PACKAGE_COMMANDS[heroPkg]}
                  </span>
                </div>
                <button
                  onClick={handleCopyHero}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-hairline-outline text-text-muted hover:text-primary-container hover:border-primary-container transition-all text-xs shrink-0 ml-3 cursor-pointer bg-surface-elevated"
                >
                  {heroCopied ? (
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
          </div>
        </div>
      </section>

      {/* INTERACTIVE TUI EXPLORER / PLAYGROUND */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="border border-hairline-outline rounded-xl bg-surface-container overflow-hidden shadow-2xl">
          {/* Terminal Body Viewports */}
          <div className="w-full bg-canvas-obsidian relative flex flex-col justify-center px-2 sm:px-4 md:px-6 py-3">
            {/* View 1: Library View (Image 14 / Hotlink) */}
            {activeTuiTab === 'library' && (
              <div className="w-full animate-in fade-in duration-150">
                <img
                  src={IMAGES.libraryView1}
                  alt="gtm terminal music player library interface in dark mode"
                  className="w-full h-auto object-cover select-none mx-auto block rounded border border-hairline-subtle"
                />
              </div>
            )}

            {/* View 2: Lyrics View (Image 15 / Hotlink) */}
            {activeTuiTab === 'lyrics' && (
              <div className="w-full animate-in fade-in duration-150">
                <img
                  src={IMAGES.lyricsView1}
                  alt="gtm terminal music player synchronized lyrics split interface"
                  className="w-full h-auto object-cover select-none mx-auto block rounded border border-hairline-subtle"
                />
              </div>
            )}

            {/* View 3: Animated FFT Spectrum Analyzer */}
            {activeTuiTab === 'fft' && (
              <div className="border border-hairline-outline bg-code-canvas rounded-lg p-6 font-mono text-xs space-y-4 min-h-[460px] flex flex-col justify-between animate-in fade-in duration-150">
                <div className="flex items-center justify-between border-b border-hairline-outline pb-3">
                  <div className="flex items-center gap-2 text-text-muted">
                    <span className="text-accent-coral font-bold">FFT 60FPS</span>
                    <span>// 64-Band Real-Time Fast Fourier Transform with sub-millisecond precision</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsPlayingFft(!isPlayingFft)}
                      className="px-2 py-0.5 rounded bg-surface-elevated border border-hairline-outline text-secondary hover:text-text-primary cursor-pointer text-xs"
                    >
                      {isPlayingFft ? 'Pause visualizer' : 'Resume visualizer'}
                    </button>
                    <span className="text-text-muted text-[11px]">key [v]</span>
                  </div>
                </div>

                {/* Animated Spectrum Analyzer */}
                <div className="py-6 space-y-2 select-none">
                  <div className="flex items-end justify-between h-52 px-4 gap-1.5 bg-surface-container/40 border border-hairline-outline rounded-lg p-3">
                    {barHeights.map((height, i) => (
                      <div
                        key={i}
                        style={{ height: `${height}%` }}
                        className={`w-full rounded-t transition-all duration-100 ${
                          i < 3
                            ? 'bg-primary-container/60 hover:bg-primary-container'
                            : i < 8
                            ? 'bg-secondary hover:bg-secondary-fixed'
                            : i < 12
                            ? 'bg-accent-coral hover:bg-accent-coral/90'
                            : i < 16
                            ? 'bg-accent-purple hover:bg-accent-purple/90'
                            : 'bg-state-success hover:bg-state-success/90'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex justify-between text-[11px] text-text-muted px-4">
                    <span>20 Hz (Sub-Bass)</span>
                    <span>250 Hz (Low-Mid)</span>
                    <span>1 kHz (Mid)</span>
                    <span>4 kHz (High-Mid)</span>
                    <span>12 kHz (Presence)</span>
                    <span>20 kHz (Air)</span>
                  </div>
                </div>

                <div className="border-t border-hairline-outline pt-3 flex items-center justify-between text-text-muted">
                  <span className="text-secondary font-medium">Now Playing: Han Pan — Peggy Gou (FLAC 24-bit / 96kHz)</span>
                  <span>Hann Windowing · 2048 Samples · Lock-Free Sink</span>
                </div>
              </div>
            )}

            {/* View 4: Fuzzy Search Interactive Palette */}
            {activeTuiTab === 'search' && (
              <div className="border border-hairline-outline bg-code-canvas rounded-lg p-6 font-mono text-xs space-y-4 min-h-[460px] animate-in fade-in duration-150">
                <div className="flex items-center gap-3 bg-surface-container border border-hairline-outline rounded-lg px-4 py-2.5">
                  <span className="text-secondary font-bold text-base">&gt;</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search artist, album, or track title..."
                    className="bg-transparent border-none text-text-primary text-sm font-medium w-full focus:outline-none placeholder:text-text-disabled"
                  />
                  <span className="ml-auto text-xs text-text-muted whitespace-nowrap">
                    Filtered in 1.4ms (SQLite FTS5)
                  </span>
                </div>

                <div className="space-y-1.5 pt-2 text-xs">
                  <div className="px-3 py-2 bg-surface-elevated border border-hairline-outline rounded-lg flex items-center justify-between text-text-primary">
                    <div className="flex items-center gap-3">
                      <span className="text-secondary font-bold">01</span>
                      <span className="font-semibold">How Much A Dollar Cost</span>
                      <span className="text-text-muted">— Kendrick Lamar</span>
                    </div>
                    <span className="text-text-muted text-[11px]">To Pimp a Butterfly (2015) [FLAC 24/96]</span>
                  </div>
                  <div className="px-3 py-2 hover:bg-surface-container rounded-lg flex items-center justify-between text-text-body transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-text-muted">02</span>
                      <span>Alright</span>
                      <span className="text-text-muted">— Kendrick Lamar</span>
                    </div>
                    <span className="text-text-muted text-[11px]">To Pimp a Butterfly (2015) [FLAC 24/96]</span>
                  </div>
                  <div className="px-3 py-2 hover:bg-surface-container rounded-lg flex items-center justify-between text-text-body transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-text-muted">03</span>
                      <span>King Kunta</span>
                      <span className="text-text-muted">— Kendrick Lamar</span>
                    </div>
                    <span className="text-text-muted text-[11px]">To Pimp a Butterfly (2015) [FLAC 24/96]</span>
                  </div>
                  <div className="px-3 py-2 hover:bg-surface-container rounded-lg flex items-center justify-between text-text-body transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-text-muted">04</span>
                      <span>The Blacker The Berry</span>
                      <span className="text-text-muted">— Kendrick Lamar</span>
                    </div>
                    <span className="text-text-muted text-[11px]">To Pimp a Butterfly (2015) [FLAC 24/96]</span>
                  </div>
                </div>

                <div className="border-t border-hairline-outline pt-3 flex items-center justify-between text-text-muted">
                  <span>[Enter] Play track · [Tab] Smart Queue · [Ctrl+A] Add to Playlist</span>
                  <span className="text-primary-container font-medium">Skim Fuzzy Filter + In-Memory Index</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FEATURE SHOWCASE */}
      <section 
        id="feature-tour-showcase"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6"
      >
        {/* Section Header */}
        <div className="border-b border-hairline-outline pb-3">
          <span className="font-mono text-xs text-secondary font-bold uppercase tracking-wider">
            Core Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-mono text-text-primary mt-1">
            Terminal-first audio architecture
          </h2>
        </div>

        {/* Feature Card */}
        <div className="w-full border border-hairline-outline rounded-xl bg-surface-container overflow-hidden p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
          {/* Terminal Screenshot Frame */}
          <div className="w-full lg:w-[65%] bg-canvas-obsidian border border-hairline-outline rounded-lg overflow-hidden flex items-center justify-center p-2 sm:p-4">
            <img
              src={carouselItems[carouselStep].img}
              alt={carouselItems[carouselStep].title}
              className="w-full h-auto max-h-[440px] object-contain rounded border border-hairline-subtle block mx-auto"
            />
          </div>

          {/* Right Narrative */}
          <div className="w-full lg:w-[35%] flex flex-col justify-between space-y-6 text-left">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-surface-elevated border border-hairline-outline font-mono text-xs text-secondary">
                <span>{carouselItems[carouselStep].badge}</span>
              </div>

              <h3 className="font-mono text-xl sm:text-2xl font-bold text-text-primary leading-tight">
                {carouselItems[carouselStep].title}
              </h3>

              <p className="text-sm text-text-muted leading-relaxed font-sans">
                {carouselItems[carouselStep].desc}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('docs')}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded bg-surface-elevated border border-hairline-outline hover:border-secondary hover:text-text-primary text-secondary font-mono text-xs transition-colors cursor-pointer"
              >
                <span>Read docs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ARCHITECTURE & SPECS BENTO GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-mono text-xs text-secondary font-bold uppercase tracking-wider">
              Architecture &amp; Specs
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-mono text-text-primary mt-1">
              Engineered for precision and minimum latency
            </h2>
          </div>
          <div className="font-mono text-xs text-text-muted hidden sm:block">
            Rust 2024 Edition
          </div>
        </div>

        {/* 4 Bento Spec Cards with animated figures */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-container border border-hairline-outline p-5 rounded-xl flex flex-col justify-between space-y-3 hover:border-secondary/50 transition-colors">
            <div className="space-y-1">
              <div className="font-mono text-3xl font-bold text-secondary flex items-center gap-2">
                <span>0ms</span>
                <span className="w-2 h-2 rounded-full bg-state-success animate-pulse inline-block" />
              </div>
              <div className="font-bold text-text-primary text-base">Gapless Audio</div>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Pre-decoded ringbuffer avoids inter-track acoustic stutter on 24-bit/192kHz studio masters.
            </p>
          </div>

          <div className="bg-surface-container border border-hairline-outline p-5 rounded-xl flex flex-col justify-between space-y-3 hover:border-primary-container/50 transition-colors">
            <div className="space-y-1">
              <div className="font-mono text-3xl font-bold text-primary-container flex items-center gap-2">
                <span>&lt; 14.2MB</span>
                <span className="text-xs font-mono text-text-muted font-normal">RSS</span>
              </div>
              <div className="font-bold text-text-primary text-base">RAM Footprint</div>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Zero-allocation async iterators via Tokio + Rodio engine with jemalloc profile-guided optimizations.
            </p>
          </div>

          <div className="bg-surface-container border border-hairline-outline p-5 rounded-xl flex flex-col justify-between space-y-3 hover:border-accent-purple/50 transition-colors">
            <div className="space-y-1">
              <div className="font-mono text-3xl font-bold text-accent-purple flex items-center gap-2">
                <span>.lrc</span>
                <span className="text-xs font-mono text-secondary font-normal">[sync 0.2ms]</span>
              </div>
              <div className="font-bold text-text-primary text-base">Live Lyrics</div>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Sub-millisecond timestamp sync rendered directly in the Ratatui split viewport column.
            </p>
          </div>

          <div className="bg-surface-container border border-hairline-outline p-5 rounded-xl flex flex-col justify-between space-y-3 hover:border-secondary/50 transition-colors">
            <div className="space-y-1">
              <div className="font-mono text-3xl font-bold text-secondary flex items-center gap-2">
                <span>Dual</span>
                <span className="text-xs font-mono text-state-success font-normal">24-bit / 192k</span>
              </div>
              <div className="font-bold text-text-primary text-base">Local + Spotify</div>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Seamless fallback between local high-resolution FLACs and remote librespot streams without Electron.
            </p>
          </div>
        </div>

        {/* Lower Bento: TOML Config & Benchmarks */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          {/* TOML Preview */}
          <div className="lg:col-span-5 bg-surface-container border border-hairline-outline rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-hairline-outline pb-3">
              <div className="flex items-center gap-2 font-mono text-xs text-text-muted">
                <Settings className="w-4 h-4 text-secondary" />
                <span>~/.config/gtm/config.toml</span>
              </div>
              <span className="font-mono text-xs text-secondary">Declarative TOML</span>
            </div>

            <div className="bg-code-canvas rounded-lg p-4 font-mono text-xs border border-hairline-outline overflow-x-auto text-text-body space-y-1 leading-relaxed">
              <div className="text-text-muted"># gtm configuration file</div>
              <div><span className="text-accent-coral">[audio]</span></div>
              <div>backend = <span className="text-state-success">"pipewire"</span> <span className="text-text-muted"># auto | alsa | coreaudio | pulse</span></div>
              <div>gapless = <span className="text-secondary font-bold">true</span></div>
              <div>resampler_quality = <span className="text-state-success">"extreme"</span></div>
              <div>buffer_frames = <span className="text-secondary font-bold">256</span></div>
              <br />
              <div><span className="text-accent-coral">[library]</span></div>
              <div>path = <span className="text-state-success">"~/Music"</span></div>
              <div>watch_filesystem = <span className="text-secondary font-bold">true</span></div>
              <div>scan_threads = <span className="text-secondary font-bold">8</span></div>
              <br />
              <div><span className="text-accent-coral">[ui]</span></div>
              <div>layout = <span className="text-state-success">"split_lyrics"</span></div>
              <div>track_format = <span className="text-state-success">"&#123;artist&#125; - &#123;title&#125;"</span></div>
              <div>visualizer = <span className="text-secondary font-bold">false</span></div>
            </div>
          </div>

          {/* Performance Benchmarks & Dynamic Visualizations (div:nth-of-type(2)) */}
          <AnimatedTelemetryBenchmark className="lg:col-span-7" />
        </div>
      </section>



      {/* CLOSING INSTALL CALL TO ACTION */}
      <section id="install" className="max-w-4xl mx-auto px-4 sm:px-6 w-full pb-20 sm:pb-32">
        <div className="border border-hairline-outline rounded-xl bg-surface-container p-8 md:p-12 text-center space-y-6 shadow-2xl">
          <div className="space-y-2">
            <span className="font-mono text-xs text-secondary font-bold uppercase tracking-wider">
              Get Started
            </span>
            <h2 className="text-2xl sm:text-3xl font-mono font-bold text-text-primary">
              Install gtm in seconds
            </h2>
            <p className="text-sm text-text-muted max-w-lg mx-auto leading-relaxed">
              Available on all major platforms. Requires no external C runtime dependencies.
            </p>
          </div>

          {/* Big Terminal Install Box with tabs */}
          <div className="max-w-2xl mx-auto bg-surface-container border border-hairline-outline rounded-xl p-3 space-y-2 text-left">
            <div className="flex items-center justify-between border-b border-hairline-outline pb-2 px-2">
              <div className="flex items-center gap-1 font-mono text-xs flex-wrap">
                {(['curl', 'cargo', 'brew', 'aur', 'nix'] as FooterPkgTab[]).map(t => (
                  <button
                    key={t}
                    onClick={() => setFooterPkg(t)}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      footerPkg === t
                        ? 'text-text-primary bg-surface-elevated font-medium border border-hairline-outline'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {t === 'curl' ? 'curl (default)' : t}
                  </button>
                ))}
              </div>
              <span className="text-text-muted font-mono text-[11px] hidden sm:inline-block">
                POSIX Shell
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 py-2.5 bg-code-canvas rounded-lg font-mono text-xs">
              <div className="flex items-center gap-3 overflow-x-auto w-full sm:w-auto">
                <span className="text-secondary select-none font-bold">$</span>
                <span className="text-text-primary select-all font-medium truncate">
                  {getFooterCommand()}
                </span>
              </div>
              <button
                onClick={handleCopyFooter}
                className="w-full sm:w-auto bg-primary-container text-on-primary-container font-mono text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90 active:opacity-80 transition-opacity flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-sm"
              >
                {footerCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Command</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Platform Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 font-mono text-xs">
            <span className="text-text-muted uppercase tracking-wider text-[11px] mr-1 select-none">
              Available on:
            </span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-hairline-outline bg-surface-elevated text-text-primary hover:border-secondary/60 transition-colors">
              <Terminal className="w-3.5 h-3.5 text-secondary shrink-0" />
              <span className="font-semibold text-xs">Linux</span>
              <span className="text-text-disabled text-[10px] hidden sm:inline">(PipeWire / ALSA)</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-hairline-outline bg-surface-elevated text-text-primary hover:border-secondary/60 transition-colors">
              <Apple className="w-3.5 h-3.5 text-text-primary shrink-0" />
              <span className="font-semibold text-xs">macOS</span>
              <span className="text-text-disabled text-[10px] hidden sm:inline">(Apple Silicon / Intel)</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-hairline-outline bg-surface-elevated text-text-primary hover:border-secondary/60 transition-colors">
              <Server className="w-3.5 h-3.5 text-accent-coral shrink-0" />
              <span className="font-semibold text-xs">FreeBSD</span>
              <span className="text-text-disabled text-[10px] hidden sm:inline">(OSS)</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
