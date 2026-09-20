import React, { useState, useEffect, useRef } from 'react';
import { motion, type Variants } from 'motion/react';
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
  CheckCircle2, 
  FileCode 
} from 'lucide-react';
import { SiLinux, SiAndroid, SiApple } from 'react-icons/si';

interface LandingViewProps {
  onNavigate: (tab: PageTab, docOrSectionId?: string, sectionId?: string) => void;
  onOpenKeymap: () => void;
}

type TuiTab = 'library' | 'lyrics' | 'fft' | 'search';
type PkgTab = 'curl' | 'cargo' | 'brew' | 'aur' | 'nix';

export const LandingView: React.FC<LandingViewProps> = ({ onNavigate, onOpenKeymap }) => {
  // Hero package switcher
  const [heroPkg, setHeroPkg] = useState<PkgTab>('curl');
  const [heroCopied, setHeroCopied] = useState(false);

  // TUI Explorer Tab
  const [activeTuiTab, setActiveTuiTab] = useState<TuiTab>('library');

  // Interactive Features Showcase scroll-to-review state & refs
  const [activeFeatureIdx, setActiveFeatureIdx] = useState(0);
  const featureItemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Footer Install box
  const [footerPkg, setFooterPkg] = useState<PkgTab>('curl');
  const [footerCopied, setFooterCopied] = useState(false);

  // Animated spectrum bars
  const [barHeights, setBarHeights] = useState<number[]>([
    45, 60, 85, 95, 78, 90, 65, 50, 70, 82, 60, 40, 30, 55, 72, 88, 64, 42, 25
  ]);
  const [isPlayingFft, setIsPlayingFft] = useState(true);

  // Interactive fuzzy search simulation
  const [searchQuery, setSearchQuery] = useState('kendrick to pimp a butterfly');

  // Scroll animation variants
  const scrollSectionVariants: Variants = {
    hidden: { opacity: 0, y: 36 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

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
      img: IMAGES.themesArt,
      specs: '24-bit TrueColor · CIELAB Extraction · ANSI Fallback',
      docId: 'theming'
    },
    {
      step: '02 / Visualizer',
      title: '60 FPS Waveform & FFT Spectrum Visualizer',
      desc: 'Achieving 120 FPS sub-pixel FFT visualizers without flicker: an analysis of buffer diffing algorithms, terminal escape code congestion, and SIMD-accelerated Braille rendering.',
      badge: 'Audio FFT',
      hotkey: 'v',
      img: IMAGES.libraryView1,
      specs: '60 FPS · 2048 Samples · Hann Windowing · Sub-pixel Braille',
      docId: 'audio',
      sectionId: '_visualizer'
    },
    {
      step: '03 / Lyrics',
      title: 'Synchronized Karaoke Lyrics (.lrc)',
      desc: 'Smooth terminal vertical auto-scrolling with microsecond audio clock synchronization and dual-language translation support.',
      badge: 'LRC Engine',
      hotkey: 'L',
      img: IMAGES.lyricsView1,
      specs: '±0.1ms Clock Sync · Dual-Language · Auto-Fetch LRCLIB',
      docId: 'lyrics'
    },
    {
      step: '04 / Concurrency',
      title: 'Lock-Free Ringbuffer Audio Engine',
      desc: 'Dual ring-buffer allocation for seamless cross-fades. Lock-free SPSC channel swaps audio buffers in 18.2 nanoseconds without mutex locks.',
      badge: 'Engine',
      hotkey: 'b',
      img: IMAGES.libraryView2,
      specs: '18.2ns Atomic Swap · Symphonia Pipeline · PipeWire / ALSA',
      docId: 'crossfade'
    }
  ];

  // Track active feature card based on page scroll position (reverses when scrolling up)
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const targetThreshold = windowHeight * 0.45;

      let currentIdx = 0;
      featureItemRefs.current.forEach((el, idx) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.top <= targetThreshold) {
          currentIdx = idx;
        }
      });

      setActiveFeatureIdx(currentIdx);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToFeature = (idx: number) => {
    const el = featureItemRefs.current[idx];
    if (el) {
      const navOffset = 130;
      const elementPosition = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - navOffset,
        behavior: 'smooth'
      });
      setActiveFeatureIdx(idx);
    }
  };

  const handleCopyHero = () => {
    navigator.clipboard.writeText(PACKAGE_COMMANDS[heroPkg]);
    setHeroCopied(true);
    setTimeout(() => setHeroCopied(false), 2000);
  };

  const handleCopyFooter = () => {
    navigator.clipboard.writeText(PACKAGE_COMMANDS[footerPkg]);
    setFooterCopied(true);
    setTimeout(() => setFooterCopied(false), 2000);
  };

  return (
    <div className="w-full flex flex-col font-sans space-y-16 sm:space-y-24">
      {/* HERO SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden w-full pt-6 md:pt-14 pb-8 md:pb-12 px-4 rounded-t-none rounded-b-2xl border border-hairline-outline/40 bg-canvas-obsidian/25 sm:bg-canvas-obsidian/60 shadow-inner"
      >
        {/* Doodled Musical Background with musical symbols, notes & instruments */}
        <MusicalDoodleBackground />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-mono text-3xl sm:text-5xl lg:text-6xl font-extrabold text-text-primary tracking-tight leading-tight max-w-4xl mx-auto"
          >
            The missing terminal audio player.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-sm sm:text-base text-text-muted max-w-2xl mx-auto leading-relaxed"
          >
            Switching to your audio player should be a keybinding away at most, and more importantly it has to look stunning.
          </motion.p>

          {/* Multi-package manager install widget */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl mx-auto pt-2"
          >
            <div className="bg-surface-container/90 backdrop-blur-md border border-hairline-outline rounded-xl p-3 shadow-2xl">
              {/* Package Selector Tabs */}
              <div className="flex items-center justify-start border-b border-hairline-outline pb-2 px-1 font-mono text-xs overflow-x-auto scrollbar-none">
                <div className="flex items-center gap-1 whitespace-nowrap min-w-max">
                  {(['curl', 'cargo', 'brew', 'aur', 'nix'] as PkgTab[]).map(pkg => (
                    <button
                      key={pkg}
                      onClick={() => setHeroPkg(pkg)}
                      className={`px-3 py-1 rounded transition-colors cursor-pointer whitespace-nowrap ${
                        heroPkg === pkg
                          ? 'bg-surface-elevated text-text-primary font-bold border border-hairline-outline text-secondary'
                          : 'text-text-muted hover:text-text-primary'
                      }`}
                    >
                      {pkg}
                    </button>
                  ))}
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
          </motion.div>
        </div>
      </motion.section>

      {/* INTERACTIVE TUI EXPLORER / PLAYGROUND */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1, margin: "0px 0px -50px 0px" }}
        variants={scrollSectionVariants}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
      >
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
      </motion.section>

      {/* FEATURE SHOWCASE - SCROLL TO REVIEW STACK */}
      <motion.section 
        id="feature-tour-showcase"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.08, margin: "0px 0px -50px 0px" }}
        variants={scrollSectionVariants}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6 relative"
      >
        {/* Section Header */}
        <div className="border-b border-hairline-outline pb-3">
          <span className="font-mono text-xs text-secondary font-bold uppercase tracking-wider">
            Features
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-mono text-text-primary mt-1">
            Terminal-first audio architecture
          </h2>
        </div>

        {/* Sticky Navigation Bar */}
        <div className="sticky top-20 z-30 bg-surface-container/95 backdrop-blur-md border border-hairline-outline rounded-xl px-4 py-2 flex items-center justify-center gap-2 font-mono text-xs shadow-md mx-auto w-fit">
          {/* Minimal slide step indicators to jump between slides */}
          <div className="flex items-center gap-2 shrink-0">
            {carouselItems.map((item, idx) => {
              const isActive = activeFeatureIdx === idx;
              return (
                <button
                  key={item.badge}
                  onClick={() => scrollToFeature(idx)}
                  aria-label={`Jump to slide 0${idx + 1} - ${item.badge}`}
                  title={`0${idx + 1} ${item.badge}: ${item.title}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    isActive 
                      ? 'w-6 bg-secondary' 
                      : 'w-2 bg-hairline-outline hover:bg-text-muted'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Scroll-to-review stack of feature cards */}
        <div className="relative space-y-28 sm:space-y-40 pt-2 pb-24">
          {carouselItems.map((item, idx) => {
            const isCurrent = activeFeatureIdx === idx;
            const isPast = activeFeatureIdx > idx;

            return (
              <div
                key={item.badge}
                ref={(el) => { featureItemRefs.current[idx] = el; }}
                style={{
                  top: '7.5rem',
                  zIndex: 10 + idx
                }}
                className={`sticky w-full border border-hairline-outline rounded-xl bg-surface-container shadow-2xl p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row items-center gap-6 lg:gap-8 justify-center min-h-[480px] sm:min-h-[520px] transition-all duration-300 ${
                  isPast ? 'scale-[0.98] opacity-90' : 'scale-100 opacity-100'
                }`}
              >
                {/* Terminal Screenshot Frame */}
                <div 
                  className={`w-full lg:w-[65%] bg-canvas-obsidian border border-hairline-outline rounded-lg overflow-hidden flex items-center justify-center p-2 sm:p-4 shadow-inner relative transition-all duration-500 ease-out ${
                    isCurrent 
                      ? 'translate-y-0 opacity-100 scale-100' 
                      : 'translate-y-4 opacity-75 scale-[0.99]'
                  }`}
                >
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-auto max-h-[420px] object-contain rounded border border-hairline-subtle block mx-auto transition-transform duration-300"
                  />
                </div>

                {/* Right Narrative */}
                <div 
                  className={`w-full lg:w-[35%] flex flex-col justify-between space-y-6 text-left transition-all duration-500 delay-75 ease-out ${
                    isCurrent 
                      ? 'translate-y-0 opacity-100' 
                      : 'translate-y-2 opacity-80'
                  }`}
                >
                  <div className="space-y-3">
                    <h3 className="font-mono text-xl sm:text-2xl font-bold text-text-primary leading-tight">
                      {item.title}
                    </h3>

                    <p className="text-sm text-text-muted leading-relaxed font-sans">
                      {item.desc}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => onNavigate('docs', item.docId, item.sectionId)}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded bg-surface-elevated border border-hairline-outline hover:border-secondary hover:text-text-primary text-secondary font-mono text-xs transition-colors cursor-pointer"
                    >
                      <span>Read docs</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* LIVE CI & TELEMETRY BENCHMARK */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.12, margin: "0px 0px -50px 0px" }}
        variants={scrollSectionVariants}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
      >
        <AnimatedTelemetryBenchmark className="w-full" />
      </motion.section>

      {/* CLOSING INSTALL CALL TO ACTION */}
      <motion.section
        id="install"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15, margin: "0px 0px -50px 0px" }}
        variants={scrollSectionVariants}
        className="max-w-4xl mx-auto px-4 sm:px-6 w-full pb-20 sm:pb-32 scroll-mt-20"
      >
        <div className="border border-hairline-outline rounded-xl bg-surface-container p-8 md:p-12 text-center space-y-6 shadow-2xl">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-mono font-bold text-text-primary">
              Install gtm in seconds
            </h2>
            <p className="text-sm text-text-muted max-w-lg mx-auto leading-relaxed">
              Available on all major platforms. Requires no external C runtime dependencies.
            </p>
          </div>

          {/* Big Terminal Install Box with tabs */}
          <div className="max-w-2xl mx-auto bg-surface-container border border-hairline-outline rounded-xl p-3 space-y-2 text-left">
            {/* Package Selector Tabs */}
            <div className="flex items-center justify-start border-b border-hairline-outline pb-2 px-1 font-mono text-xs overflow-x-auto scrollbar-none">
              <div className="flex items-center gap-1 whitespace-nowrap min-w-max">
                {(['curl', 'cargo', 'brew', 'aur', 'nix'] as PkgTab[]).map(t => (
                  <button
                    key={t}
                    onClick={() => setFooterPkg(t)}
                    className={`px-3 py-1 rounded transition-colors cursor-pointer whitespace-nowrap ${
                      footerPkg === t
                        ? 'bg-surface-elevated text-text-primary font-bold border border-hairline-outline text-secondary'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Command Display + Copy */}
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-code-canvas rounded-lg mt-2 font-mono text-xs">
              <div className="flex items-center gap-2.5 overflow-x-auto min-w-0">
                <span className="text-secondary font-bold select-none">$</span>
                <span className="text-text-primary select-all font-medium truncate">
                  {PACKAGE_COMMANDS[footerPkg]}
                </span>
              </div>
              <button
                onClick={handleCopyFooter}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-hairline-outline text-text-muted hover:text-primary-container hover:border-primary-container transition-all text-xs shrink-0 ml-3 cursor-pointer bg-surface-elevated"
              >
                {footerCopied ? (
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

          {/* Platform Badges */}
          <div className="flex flex-col items-center justify-center gap-2 pt-1 font-mono text-xs">
            <span className="text-text-muted uppercase tracking-wider text-[11px] select-none">
              Available on:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-hairline-outline bg-surface-elevated text-text-primary hover:border-secondary/60 transition-colors">
                <SiLinux className="w-3.5 h-3.5 text-secondary shrink-0" />
                <span className="font-semibold text-xs">Linux</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-hairline-outline bg-surface-elevated text-text-primary hover:border-secondary/60 transition-colors">
                <SiAndroid className="w-3.5 h-3.5 text-state-success shrink-0" />
                <span className="font-semibold text-xs">Android</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-hairline-outline bg-surface-elevated text-text-primary hover:border-secondary/60 transition-colors">
                <SiApple className="w-3.5 h-3.5 text-text-primary shrink-0" />
                <span className="font-semibold text-xs">macOS</span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};
