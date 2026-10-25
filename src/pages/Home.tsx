import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import { IMAGES } from '../data/site';
import { Telemetry } from '../components/Telemetry';
import { Doodles } from '../components/Doodles';
import { InstallTabs } from '../components/InstallTabs';
import { usePageMeta } from '../lib/meta';
import { mediaName, resolveMediaPath } from '../lib/media';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { SiLinux, SiAndroid, SiApple } from 'react-icons/si';

const CAROUSEL_IMAGES = [
  { src: IMAGES.hero1, title: 'Preview 1' },
  { src: IMAGES.hero2, title: 'Preview 2' },
  { src: IMAGES.hero3, title: 'Preview 3' },
];

// Eagerly prefetch images as soon as module loads so carousel never renders blank
const PRELOADED_SRCS = new Set<string>();
function prefetchMedia(src: string) {
  const resolved = resolveMediaPath(src);
  if (!resolved || PRELOADED_SRCS.has(resolved)) return;
  PRELOADED_SRCS.add(resolved);
  const img = new Image();
  img.src = resolved;
}

if (typeof window !== 'undefined') {
  CAROUSEL_IMAGES.forEach((item) => prefetchMedia(item.src));
  prefetchMedia(IMAGES.cardSleepTimer);
}

function TuiShot({ src, alt, priority }: { src: string; alt?: string; priority?: boolean }) {
  const [broken, setBroken] = useState<boolean>(false);
  const mediaSrc = resolveMediaPath(src);

  if (!mediaSrc || broken) {
    return (
      <div className="w-full h-full min-h-[300px] border border-dashed border-hairline-outline bg-canvas-obsidian flex items-center justify-center">
        <span className="font-mono text-xs text-text-disabled px-6 text-center">
          screenshot pending{src ? ` — ${mediaName(src)}` : ''}
        </span>
      </div>
    );
  }

  return (
    <img
      src={mediaSrc}
      alt={alt || 'Terminal screenshot'}
      loading="eager"
      decoding="sync"
      fetchPriority={priority ? 'high' : 'auto'}
      onError={() => setBroken(true)}
      className="w-full h-full object-cover select-none block"
    />
  );
}

export const Home: React.FC = () => {
  usePageMeta('gtm - Docs', '📻 gtm is a feature rich terminal audio player.');

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);

  const carouselImages = CAROUSEL_IMAGES;

  useEffect(() => {
    CAROUSEL_IMAGES.forEach(({ src }) => prefetchMedia(src));
    prefetchMedia(IMAGES.cardSleepTimer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  useEffect(() => {
    if (isCarouselHovered) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isCarouselHovered, carouselImages.length]);

  const [activeFeatureIdx, setActiveFeatureIdx] = useState(0);
  const featureItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [videoMuted, setVideoMuted] = useState<Record<number, boolean>>({});
  const [videoProgress, setVideoProgress] = useState<Record<number, number>>({});
  const [videoPlaying, setVideoPlaying] = useState<Record<number, boolean>>({});
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});

  const toggleVideoSound = (idx: number) => {
    setVideoMuted((prev) => {
      const isCurrentlyMuted = prev[idx] ?? true;
      const nextMuted = !isCurrentlyMuted;
      const vid = videoRefs.current[idx];
      if (vid) {
        vid.muted = nextMuted;
        if (!nextMuted) {
          vid.play().catch(() => {});
        }
      }
      return { ...prev, [idx]: nextMuted };
    });
  };

  const toggleVideoPlay = (idx: number) => {
    const vid = videoRefs.current[idx];
    if (!vid) return;
    if (vid.paused) {
      vid.play().catch(() => {});
      setVideoPlaying((prev) => ({ ...prev, [idx]: true }));
    } else {
      vid.pause();
      setVideoPlaying((prev) => ({ ...prev, [idx]: false }));
    }
  };

  const [imgBroken, setImgBroken] = useState<Record<number, boolean>>({});

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

  const carouselItems = [
    {
      title: 'Zen mode',
      desc: 'Go fullscreen on one surface at a time — now playing, lyrics or the visualizer. Tab cycles between them; Esc leaves.',
      badge: 'Zen mode',
      img: IMAGES.cardThemes,
      docId: 'tui',
      sectionId: '_zen-mode'
    },
    {
      title: 'Synced lyrics',
      desc: 'Lyrics scroll along with the song, one line at a time, right on cue. gtm looks them up for you and remembers them for next time. Nudge them early or late with the bracket keys.',
      badge: 'Lyrics',
      img: IMAGES.cardLyrics,
      docId: 'lyrics'
    },
    {
      title: 'Sleep timer',
      desc: 'Set a timer and playback stops when it runs out. Handy for falling asleep to something without it playing all night.',
      badge: 'Sleep timer',
      img: IMAGES.cardSleepTimer,
      docId: 'playback',
      sectionId: '_sleep-timer'
    },
  ];

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
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden w-full pt-6 md:pt-14 pb-8 md:pb-12 px-4 rounded-t-none rounded-b-2xl border border-hairline-outline/40 bg-canvas-obsidian/25 sm:bg-canvas-obsidian/60 shadow-inner"
      >
        <Doodles />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
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

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1, margin: "0px 0px -50px 0px" }}
        variants={scrollSectionVariants}
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
      >
        <div className="border border-hairline-outline rounded-2xl bg-surface-container overflow-hidden shadow-2xl">
          <div
            className="relative w-full aspect-video bg-canvas-obsidian overflow-hidden"
            onMouseEnter={() => setIsCarouselHovered(true)}
            onMouseLeave={() => setIsCarouselHovered(false)}
          >
            {/* Carousel slides: all slides remain mounted so images are prefetched, decoded, and transition seamlessly without blank frames */}
            {carouselImages.map((image, idx) => {
              const isActive = currentSlide === idx;
              return (
                <div
                  key={image.src}
                  aria-hidden={!isActive}
                  className={`absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out ${
                    isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  <TuiShot src={image.src} alt={image.title} priority={idx === 0} />
                </div>
              );
            })}

            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous image"
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-surface-elevated/85 hover:bg-surface-elevated text-text-muted hover:text-text-primary border border-hairline-outline backdrop-blur-sm transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next image"
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-surface-elevated/85 hover:bg-surface-elevated text-text-muted hover:text-text-primary border border-hairline-outline backdrop-blur-sm transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-elevated/85 border border-hairline-outline backdrop-blur-md shadow-lg">
              {carouselImages.map((image, idx) => {
                const isActive = currentSlide === idx;
                return (
                  <button
                    key={image.src + idx}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    aria-label={`Go to slide ${idx + 1}: ${image.title}`}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'w-6 bg-secondary shadow-[0_0_8px_rgba(0,136,255,0.7)]'
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
        <div className="border-b border-hairline-outline pb-3">
          <span className="font-mono text-sm sm:text-base text-secondary font-bold uppercase tracking-wider">
            Features
          </span>
        </div>

        <div className="sticky top-20 z-30 bg-surface-container/95 backdrop-blur-md border border-hairline-outline rounded-xl px-4 py-2 flex items-center justify-center gap-2 font-mono text-xs shadow-md mx-auto w-fit">
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

        <div className="relative space-y-28 sm:space-y-40 pt-2 pb-24">
          {carouselItems.map((item, idx) => {
            const isCurrent = activeFeatureIdx === idx;
            const isPast = activeFeatureIdx > idx;
            const isVideo = /\.(webm|mp4|mov)$/i.test(item.img);

            return (
              <div
                key={item.badge}
                ref={(el) => { featureItemRefs.current[idx] = el; }}
                style={{
                  top: '7.5rem',
                  zIndex: 10 + idx
                }}
                className={`sticky w-full max-w-4xl mx-auto border border-hairline-outline rounded-2xl bg-surface-container overflow-hidden flex flex-col shadow-2xl transition-all duration-400 ease-out ${
                  isPast
                    ? 'opacity-0 pointer-events-none -translate-y-8 scale-[0.96]'
                    : isCurrent
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-85 translate-y-4 scale-[0.99]'
                }`}
              >
                {/* Top half: Video or media preview */}
                {item.img && !imgBroken[idx] ? (
                  isVideo ? (
                    <div className="relative w-full aspect-video bg-canvas-obsidian border-b border-hairline-outline overflow-hidden">
                      {/* Unobtrusive progress indicator: small thin line at the top that shrinks as video plays */}
                      <div
                        className="absolute top-0 left-0 right-0 z-20 pointer-events-none overflow-hidden"
                        aria-label="Video playback progress"
                      >
                        <div className="w-full h-[2.5px] bg-white/10">
                          <div
                            className="h-full bg-secondary transition-[width] duration-200 ease-linear shadow-[0_0_8px_rgba(0,136,255,0.7)]"
                            style={{ width: `${videoProgress[idx] ?? 100}%` }}
                          />
                        </div>
                      </div>

                      <video
                        ref={(el) => {
                          videoRefs.current[idx] = el;
                        }}
                        src={resolveMediaPath(item.img)}
                        autoPlay
                        muted={videoMuted[idx] ?? true}
                        loop
                        playsInline
                        preload="auto"
                        onTimeUpdate={(e) => {
                          const vid = e.currentTarget;
                          if (vid.duration && !isNaN(vid.duration) && vid.duration > 0) {
                            const remaining = Math.max(0, Math.min(100, (1 - vid.currentTime / vid.duration) * 100));
                            setVideoProgress((prev) => ({ ...prev, [idx]: remaining }));
                          }
                        }}
                        onPlay={() => setVideoPlaying((prev) => ({ ...prev, [idx]: true }))}
                        onPause={() => setVideoPlaying((prev) => ({ ...prev, [idx]: false }))}
                        onError={() =>
                          setImgBroken((prev) => ({ ...prev, [idx]: true }))
                        }
                        onClick={() => toggleVideoPlay(idx)}
                        className="w-full h-full object-cover block cursor-pointer"
                      />

                      {/* Video playback controls: play/pause and volume toggle */}
                      <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleVideoPlay(idx);
                          }}
                          aria-label={
                            videoPlaying[idx] !== false
                              ? 'Pause video preview'
                              : 'Play video preview'
                          }
                          title={
                            videoPlaying[idx] !== false
                              ? 'Pause preview'
                              : 'Play preview'
                          }
                          className="p-1.5 text-text-muted hover:text-text-primary transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer focus:outline-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] select-none"
                        >
                          {videoPlaying[idx] !== false ? (
                            <Pause className="w-4 h-4 text-secondary hover:text-secondary-hover transition-colors" />
                          ) : (
                            <Play className="w-4 h-4 text-text-muted hover:text-text-primary transition-colors" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleVideoSound(idx);
                          }}
                          aria-label={
                            (videoMuted[idx] ?? true)
                              ? 'Unmute video preview'
                              : 'Mute video preview'
                          }
                          title={
                            (videoMuted[idx] ?? true)
                              ? 'Unmute audio'
                              : 'Mute audio'
                          }
                          className="p-1.5 text-text-muted hover:text-text-primary transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer focus:outline-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] select-none group/mute"
                        >
                          {(videoMuted[idx] ?? true) ? (
                            <VolumeX className="w-4 h-4 text-text-muted group-hover/mute:text-text-primary transition-colors" />
                          ) : (
                            <Volume2 className="w-4 h-4 text-secondary group-hover/mute:text-secondary-hover transition-colors" />
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full aspect-video bg-canvas-obsidian border-b border-hairline-outline overflow-hidden">
                      <img
                        src={resolveMediaPath(item.img)}
                        loading="eager"
                        decoding="sync"
                        onError={() =>
                          setImgBroken((prev) => ({ ...prev, [idx]: true }))
                        }
                        className="w-full h-full object-cover block"
                      />
                    </div>
                  )
                ) : (
                  <div className="relative w-full aspect-video bg-canvas-obsidian border-b border-hairline-outline flex items-center justify-center overflow-hidden">
                    <span className="font-mono text-xs text-text-disabled px-6 text-center">
                      screenshot pending —{' '}
                      <span className="text-text-muted">
                        {mediaName(item.img)}
                      </span>
                    </span>
                  </div>
                )}

                {/* Bottom half: Card text and docs link */}
                <div className="w-full p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-surface-container">
                  <div className="space-y-3 max-w-2xl text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs uppercase tracking-wider text-secondary font-semibold">
                        {item.badge}
                      </span>
                    </div>
                    <h3 className="font-mono text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-mono text-pretty">
                      {item.desc}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center pt-2 sm:pt-0">
                    <Link
                      to={`/docs/${item.docId}${item.sectionId ? `#${item.sectionId}` : ''}`}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-elevated border border-hairline-outline hover:border-secondary hover:text-text-primary text-secondary font-mono text-xs font-medium transition-colors cursor-pointer"
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

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.12, margin: "0px 0px -50px 0px" }}
        variants={scrollSectionVariants}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
      >
        <Telemetry className="w-full" />
      </motion.section>

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

          <div className="max-w-2xl mx-auto text-left">
            <InstallTabs id="footer-install-widget" />
          </div>

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
