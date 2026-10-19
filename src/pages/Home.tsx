import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import { IMAGES } from '../data/site';
import { Telemetry } from '../components/Telemetry';
import { Doodles } from '../components/Doodles';
import { InstallTabs } from '../components/InstallTabs';
import { usePageMeta } from '../lib/meta';
import { mediaName, resolveMediaPath } from '../lib/media';
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
  CheckCircle2,
  FileCode,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { SiLinux, SiAndroid, SiApple } from 'react-icons/si';

type TuiTab = 'library' | 'lyrics' | 'fft' | 'search';

// One screenshot in the TUI explorer. `IMAGES` entries are empty until the file
// is added under `public/media/static/`, so an empty path — and a path whose
// file is still missing — renders the placeholder rather than a broken image.
function TuiShot({ src, alt }: { src: string; alt: string }) {
  const [broken, setBroken] = useState<boolean>(false);
  const mediaSrc = resolveMediaPath(src);

  if (!mediaSrc || broken) {
    return (
      <div className="w-full min-h-[300px] rounded border border-dashed border-hairline-outline bg-canvas-obsidian flex items-center justify-center">
        <span className="font-mono text-xs text-text-disabled px-6 text-center">
          screenshot pending{src ? ` — ${mediaName(src)}` : ''}
        </span>
      </div>
    );
  }

  return (
    <img
      src={mediaSrc}
      alt={alt}
      onError={() => setBroken(true)}
      className="w-full h-auto max-h-[520px] object-contain select-none mx-auto block rounded border border-hairline-subtle shadow-md"
    />
  );
}

export const Home: React.FC = () => {
  usePageMeta('gtm - Docs', '📻 gtm is a feature rich terminal audio player.');

  // Basic image carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);

  const carouselImages = [
    {
      src: IMAGES.heroCover,
      alt: 'gtm terminal music player library interface in dark mode',
      title: 'Terminal Library & Playback',
    },
    {
      src: 'media/gif/terminal-player-demo.gif',
      alt: 'gtm interactive playback and navigation session',
      title: 'Terminal Playback Demo',
    },
    {
      src: 'media/gif/spectrum-visualizer-demo.gif',
      alt: 'gtm real-time spectrum visualizer in terminal',
      title: 'Real-Time Spectrum Visualizer',
    },
    {
      src: IMAGES.themesArt,
      alt: 'gtm audio player branding and reactive themes',
      title: 'Interface & Reactive Theming',
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  // Auto scrolling & infinite carousel
  useEffect(() => {
    if (isCarouselHovered) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isCarouselHovered, carouselImages.length]);

  // Interactive Features Showcase scroll-to-review state & refs
  const [activeFeatureIdx, setActiveFeatureIdx] = useState(0);
  const featureItemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Cards whose screenshot has not been added to public/media/static yet.
  const [imgBroken, setImgBroken] = useState<Record<number, boolean>>({});

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

  // Feature cards. Titles say what the feature does for you; the copy avoids
  // implementation detail, and every claim here is checkable against the docs
  // page it links to. `hotkey` is the real binding, not a shorthand.
  const carouselItems = [
    {
      title: 'Reactive theming',
      desc: 'Pick up the colours from whatever is playing. Also comes with 16 built-in themes and support for transparent mode.',
      badge: 'Themes',
      img: IMAGES.cardThemes,
      docId: 'theming'
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
      title: 'Sleep timer',
      desc: 'Set a timer and playback stops when it runs out. Handy for falling asleep to something without it playing all night.',
      badge: 'Sleep timer',
      hotkey: 'Alt+z',
      img: IMAGES.cardSleepTimer,
      docId: 'playback',
      sectionId: '_sleep-timer'
    },
    {
      title: 'Cover image support',
      desc: 'Rich image preview in pickers,lists and more. Available in all modern terminals that support an image protocol.  ',
      badge: 'Cover art',
      img: IMAGES.cardCoverArt,
      docId: 'cover-art'
    },
    {
      title: 'Background playback',
      desc: 'Close the player, and playback carries on in the background. Until you stop it, of course.',
      badge: 'Background',
      img: IMAGES.cardBackground,
      docId: 'daemon'
    },
    {
      title: 'Streaming',
      desc: 'Stream from different sources, including internet radio.',
      badge: 'Streaming',
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
            gtm (goto music) is a reimagined audio player built for terminal enthusiasts.

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

      {/* BASIC IMAGE CAROUSEL */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1, margin: "0px 0px -50px 0px" }}
        variants={scrollSectionVariants}
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
      >
        <div className="border border-hairline-outline rounded-xl bg-surface-container overflow-hidden shadow-2xl">
          {/* Carousel Image Viewport with Previous & Next Arrows, Dots Progress, and Auto-scroll */}
          <div
            className="relative w-full bg-canvas-obsidian flex items-center justify-center p-3 sm:p-6 min-h-[380px] sm:min-h-[480px]"
            onMouseEnter={() => setIsCarouselHovered(true)}
            onMouseLeave={() => setIsCarouselHovered(false)}
          >
            {/* Prev Button */}
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous image"
              className="absolute left-3 sm:left-6 z-20 p-2 sm:p-2.5 rounded-full bg-surface-elevated/85 hover:bg-surface-elevated text-text-muted hover:text-text-primary border border-hairline-outline backdrop-blur-sm transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Next Button */}
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next image"
              className="absolute right-3 sm:right-6 z-20 p-2 sm:p-2.5 rounded-full bg-surface-elevated/85 hover:bg-surface-elevated text-text-muted hover:text-text-primary border border-hairline-outline backdrop-blur-sm transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Image display */}
            <div className="w-full max-w-4xl mx-auto flex items-center justify-center pb-8 sm:pb-9">
              <AnimatePresence mode="wait">
                <motion.div
                  key={carouselImages[currentSlide].src}
                  initial={{ opacity: 0, scale: 0.99 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.99 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="w-full flex items-center justify-center"
                >
                  <TuiShot
                    src={carouselImages[currentSlide].src}
                    alt={carouselImages[currentSlide].alt}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Dots Progress Indicator */}
            <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-elevated/85 border border-hairline-outline backdrop-blur-md shadow-lg">
              {carouselImages.map((image, idx) => {
                const isActive = currentSlide === idx;
                return (
                  <button
                    key={image.src + idx}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    aria-label={`Go to slide ${idx + 1}: ${image.title || image.alt}`}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'w-6 bg-brand-primary shadow-[0_0_8px_rgba(var(--brand-primary-rgb,6,182,212),0.5)]'
                        : 'w-2 bg-text-muted/40 hover:bg-text-muted/80'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </motion.section>

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
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${isActive
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
                className={`sticky w-full border border-hairline-outline rounded-xl bg-surface-container shadow-2xl p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row items-center gap-6 lg:gap-8 justify-center min-h-[480px] sm:min-h-[520px] transition-all duration-300 ${isPast ? 'scale-[0.98] opacity-90' : 'scale-100 opacity-100'
                  }`}
              >
                {/* Screenshot. Falls back to a placeholder rather than a broken
                    image when the file has not been added yet. */}
                {item.img && !imgBroken[idx] ? (
                  <img
                    src={resolveMediaPath(item.img)}
                    alt={item.title}
                    onError={() =>
                      setImgBroken((prev) => ({ ...prev, [idx]: true }))
                    }
                    className={`w-full lg:w-[65%] h-auto max-h-[420px] object-contain rounded-lg border border-hairline-outline bg-canvas-obsidian p-2 sm:p-4 shadow-inner block mx-auto transition-all duration-500 ease-out ${isCurrent
                      ? 'translate-y-0 opacity-100 scale-100'
                      : 'translate-y-4 opacity-75 scale-[0.99]'
                      }`}
                  />
                ) : (
                  <div
                    className={`w-full lg:w-[65%] max-h-[420px] rounded-lg border border-dashed border-hairline-outline bg-canvas-obsidian flex items-center justify-center transition-all duration-500 ease-out ${isCurrent
                      ? 'translate-y-0 opacity-100 scale-100'
                      : 'translate-y-4 opacity-75 scale-[0.99]'
                      }`}
                  >
                    <span className="font-mono text-xs text-text-disabled px-6 text-center">
                      screenshot pending —{' '}
                      <span className="text-text-muted">
                        {mediaName(item.img)}
                      </span>
                    </span>
                  </div>
                )}

                {/* Right Narrative */}
                <div
                  className={`w-full lg:w-[35%] flex flex-col justify-between space-y-6 text-left transition-all duration-500 delay-75 ease-out ${isCurrent
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
              Available on major platforms. Windows support coming soon
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
