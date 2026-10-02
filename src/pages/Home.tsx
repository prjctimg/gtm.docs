import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { motion, type Variants } from 'motion/react';
import { IMAGES } from '../data/site';
import { Telemetry } from '../components/Telemetry';
import { Doodles } from '../components/Doodles';
import { InstallTabs } from '../components/InstallTabs';
import { usePageMeta } from '../lib/meta';
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

type TuiTab = 'library' | 'lyrics' | 'fft' | 'search';

export const Home: React.FC = () => {
  usePageMeta('gtm - Docs', '📻 gtm is a feature rich terminal audio player.');

  // TUI Explorer Tab
  const [activeTuiTab, setActiveTuiTab] = useState<TuiTab>('library');

  // Interactive Features Showcase scroll-to-review state & refs
  const [activeFeatureIdx, setActiveFeatureIdx] = useState(0);
  const featureItemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Cards whose screenshot has not been added to public/media/static yet.
  const [imgBroken, setImgBroken] = useState<Record<number, boolean>>({});

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

  // Feature cards. Titles say what the feature does for you; the copy avoids
  // implementation detail, and every claim here is checkable against the docs
  // page it links to. `hotkey` is the real binding, not a shorthand.
  const carouselItems = [
    {
      title: 'Reactive theming',
      desc: 'Turn on reactive theming and the player picks up the colours from whatever is playing — a red cover art tints the whole interface red. Sixteen built-in themes are there too, light and dark.',
      badge: 'Themes',
      hotkey: 'Alt+T',
      img: IMAGES.cardThemes,
      docId: 'theming'
    },
    {
      title: 'Audio visualizer',
      desc: 'Twelve ways to draw the sound: bars, dots, a bouncing wave, an eighties sunset, even fire. Pick one and it fills the screen whenever you leave the player alone for a moment.',
      badge: 'Visualizer',
      hotkey: 'Alt+v',
      img: IMAGES.cardVisualizer,
      docId: 'audio',
      sectionId: '_visualizer'
    },
    {
      title: 'Synced lyrics',
      desc: 'Lyrics scroll along with the song, one line at a time, right on cue. gtm looks them up for you and remembers them for next time. Nudge them early or late with the bracket keys.',
      badge: 'Lyrics',
      hotkey: 'l',
      img: IMAGES.cardLyrics,
      docId: 'lyrics'
    },
    {
      title: 'Crossfade',
      desc: 'Blend one track into the next instead of stopping dead. Choose how long the fade takes, from three seconds to half a minute, or turn it off.',
      badge: 'Crossfade',
      hotkey: 'Alt+,',
      img: IMAGES.cardCrossfade,
      docId: 'crossfade'
    },
    {
      title: 'Tune the sound',
      desc: 'Shape the sound sixteen different ways, or draw your own curve. More bass for headphones, softer highs for a podcast — it remembers what you picked.',
      badge: 'Equalizer',
      hotkey: 'Alt+e',
      img: IMAGES.cardEqualizer,
      docId: 'audio',
      sectionId: '_equalizer'
    },
    {
      title: 'Sleep timer',
      desc: 'Set a timer and playback stops when it runs out. Handy for falling asleep to something without it playing all night.',
      badge: 'Sleep timer',
      hotkey: 'Alt+z',
      img: IMAGES.cardSleepTimer,
      docId: 'playback',
      sectionId: '_sleep-timer'
    },
    {
      title: 'Your music, sorted for you',
      desc: 'Point gtm at your music folders and it reads the tags, finds the artwork and groups everything by album, artist, genre and folder. Favourites and playlists are in there too.',
      badge: 'Library',
      hotkey: 'Alt+.',
      img: IMAGES.cardLibrary,
      docId: 'library'
    },
    {
      title: 'Cover image support',
      desc: 'Artwork is looked up for you — from the file when it has some, from the internet when it does not. It is cached after the first fetch, so it never looks twice.',
      badge: 'Cover art',
      hotkey: 'z',
      img: IMAGES.cardCoverArt,
      docId: 'cover-art'
    },
    {
      title: 'Background playback',
      desc: 'Close the player, start something else, close the terminal — the music carries on in the background until you stop it. It picks up where you left off, same volume included.',
      badge: 'Background',
      hotkey: null,
      img: IMAGES.cardBackground,
      docId: 'daemon'
    },
    {
      title: 'Streaming',
      desc: 'Search and play from YouTube, stream from Spotify with your own account, subscribe to podcasts and tune in to thousands of radio stations — all without leaving the player.',
      badge: 'Streaming',
      hotkey: 'Alt+y',
      img: IMAGES.cardStreaming,
      docId: 'youtube'
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

      setActiveFeatureIdx((prev) => (prev === currentIdx ? prev : currentIdx));
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

  return (
    <div className="w-full flex flex-col font-mono space-y-16 sm:space-y-24">
      {/* HERO SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden w-full pt-6 md:pt-14 pb-8 md:pb-12 px-4 rounded-t-none rounded-b-2xl border border-hairline-outline/40 bg-canvas-obsidian/25 sm:bg-canvas-obsidian/60 shadow-inner"
      >
        {/* Doodled Musical Background with musical symbols, notes & instruments */}
        <Doodles />

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
            <InstallTabs id="hero-install-widget" />
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
                    <span className="text-text-muted text-xs">key [v]</span>
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

                  <div className="flex justify-between text-xs text-text-muted px-4">
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
                    <span className="text-text-muted text-xs">To Pimp a Butterfly (2015) [FLAC 24/96]</span>
                  </div>
                  <div className="px-3 py-2 hover:bg-surface-container rounded-lg flex items-center justify-between text-text-body transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-text-muted">02</span>
                      <span>Alright</span>
                      <span className="text-text-muted">— Kendrick Lamar</span>
                    </div>
                    <span className="text-text-muted text-xs">To Pimp a Butterfly (2015) [FLAC 24/96]</span>
                  </div>
                  <div className="px-3 py-2 hover:bg-surface-container rounded-lg flex items-center justify-between text-text-body transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-text-muted">03</span>
                      <span>King Kunta</span>
                      <span className="text-text-muted">— Kendrick Lamar</span>
                    </div>
                    <span className="text-text-muted text-xs">To Pimp a Butterfly (2015) [FLAC 24/96]</span>
                  </div>
                  <div className="px-3 py-2 hover:bg-surface-container rounded-lg flex items-center justify-between text-text-body transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-text-muted">04</span>
                      <span>The Blacker The Berry</span>
                      <span className="text-text-muted">— Kendrick Lamar</span>
                    </div>
                    <span className="text-text-muted text-xs">To Pimp a Butterfly (2015) [FLAC 24/96]</span>
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
          <div className="flex items-center gap-2 shrink-0 flex-wrap justify-center max-w-full">
            {carouselItems.map((item, idx) => {
              const isActive = activeFeatureIdx === idx;
              const step = String(idx + 1).padStart(2, '0');
              return (
                <button
                  key={item.badge}
                  onClick={() => scrollToFeature(idx)}
                  aria-label={`Jump to slide ${step} - ${item.title}`}
                  title={`${step} ${item.title}`}
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
                {/* Screenshot. Falls back to a placeholder rather than a broken
                    image when the file has not been added yet. */}
                {item.img && !imgBroken[idx] ? (
                  <img
                    src={item.img}
                    alt={item.title}
                    onError={() =>
                        setImgBroken((prev) => ({ ...prev, [idx]: true }))
                    }
                    className={`w-full lg:w-[65%] h-auto max-h-[420px] object-contain rounded-lg border border-hairline-outline bg-canvas-obsidian p-2 sm:p-4 shadow-inner block mx-auto transition-all duration-500 ease-out ${
                      isCurrent
                        ? 'translate-y-0 opacity-100 scale-100'
                        : 'translate-y-4 opacity-75 scale-[0.99]'
                    }`}
                  />
                ) : (
                  <div
                    className={`w-full lg:w-[65%] max-h-[420px] rounded-lg border border-dashed border-hairline-outline bg-canvas-obsidian flex items-center justify-center transition-all duration-500 ease-out ${
                      isCurrent
                        ? 'translate-y-0 opacity-100 scale-100'
                        : 'translate-y-4 opacity-75 scale-[0.99]'
                    }`}
                  >
                    <span className="font-mono text-xs text-text-disabled px-6 text-center">
                      screenshot pending —{' '}
                      <span className="text-text-muted">
                        {item.img?.replace('/media/static/', '')}
                      </span>
                    </span>
                  </div>
                )}

                {/* Right Narrative */}
                <div 
                  className={`w-full lg:w-[35%] flex flex-col justify-between space-y-6 text-left transition-all duration-500 delay-75 ease-out ${
                    isCurrent 
                      ? 'translate-y-0 opacity-100' 
                      : 'translate-y-2 opacity-80'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <span className="font-mono text-[11px] uppercase tracking-wider text-secondary font-semibold">
                        {item.badge}
                      </span>
                      <h3 className="font-mono text-2xl sm:text-3xl lg:text-[1.85rem] font-bold text-text-primary tracking-tight leading-snug">
                        {item.title}
                      </h3>
                    </div>

                    <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-mono max-w-sm lg:max-w-[34ch] text-pretty">
                      {item.desc}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Link
                      to={`/docs/${item.docId}${item.sectionId ? `#${item.sectionId}` : ''}`}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded bg-surface-elevated border border-hairline-outline hover:border-secondary hover:text-text-primary text-secondary font-mono text-xs transition-colors cursor-pointer"
                    >
                      <span>Read docs</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
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
        <Telemetry className="w-full" />
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
          <div className="max-w-2xl mx-auto text-left">
            <InstallTabs id="footer-install-widget" />
          </div>

          {/* Platform Badges */}
          <div className="flex flex-col items-center justify-center gap-2 pt-1 font-mono text-xs">
            <span className="text-text-muted uppercase tracking-wider text-xs select-none">
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
