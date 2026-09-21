import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Maximize2,
  X,
  Copy,
  Check,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Film,
  Sparkles
} from 'lucide-react';

interface GifPreviewProps {
  src: string;
  alt?: string;
  caption?: string;
  className?: string;
  autoPlay?: boolean;
}

export const GifPreview: React.FC<GifPreviewProps> = ({
  src,
  alt = 'Animated GIF preview',
  caption,
  className = '',
  autoPlay = true
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lightboxImgRef = useRef<HTMLImageElement | null>(null);
  const lightboxCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Capture still frame onto canvas when paused
  const captureFreezeFrame = useCallback((targetCanvas: HTMLCanvasElement | null, targetImg: HTMLImageElement | null) => {
    if (!targetCanvas || !targetImg || !targetImg.complete || targetImg.naturalWidth === 0) return;
    try {
      targetCanvas.width = targetImg.naturalWidth;
      targetCanvas.height = targetImg.naturalHeight;
      const ctx = targetCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(targetImg, 0, 0);
      }
    } catch {
      // If cross-origin restrictions apply, still display image
    }
  }, []);

  const handleTogglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isPlaying) {
      // Switching to paused: freeze current frame
      captureFreezeFrame(canvasRef.current, imgRef.current);
      captureFreezeFrame(lightboxCanvasRef.current, lightboxImgRef.current);
      setIsPlaying(false);
    } else {
      // Switching to playing
      setIsPlaying(true);
    }
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setHasLoaded(true);
    setHasError(false);
    setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    if (!isPlaying) {
      captureFreezeFrame(canvasRef.current, img);
    }
  };

  const handleCopyLink = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const fullUrl = src.startsWith('http') ? src : `${window.location.origin}${src.startsWith('/') ? '' : '/'}${src}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
        setZoomLevel(1);
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.key === '+' || e.key === '=') {
        setZoomLevel(prev => Math.min(prev + 0.25, 3));
      } else if (e.key === '-') {
        setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
      } else if (e.key === '0') {
        setZoomLevel(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, isPlaying]);

  return (
    <figure className={`my-6 group/gif ${className}`}>
      {/* Container frame */}
      <div 
        onClick={() => setIsLightboxOpen(true)}
        className="relative overflow-hidden rounded-xl border border-hairline-outline bg-surface-container hover:border-secondary/50 transition-all duration-200 shadow-md cursor-pointer group"
      >
        {/* Top Header Bar / Badge */}
        <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-canvas-obsidian/90 backdrop-blur-md border border-hairline-outline text-[11px] font-mono font-bold tracking-wider text-secondary shadow-xs">
            <Film className="w-3 h-3 text-secondary animate-pulse" />
            <span>GIF</span>
          </div>

          {!isPlaying && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-state-warning/20 border border-state-warning/40 text-[10px] font-mono text-state-warning font-semibold backdrop-blur-md">
              PAUSED
            </span>
          )}
        </div>

        {/* Quick actions top-right */}
        <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={handleTogglePlay}
            title={isPlaying ? 'Pause animation' : 'Play animation'}
            className="p-1.5 rounded-md bg-canvas-obsidian/85 hover:bg-canvas-obsidian text-text-muted hover:text-text-primary border border-hairline-outline backdrop-blur-md transition-colors cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-secondary" />}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsLightboxOpen(true);
            }}
            title="Expand to full preview"
            className="p-1.5 rounded-md bg-canvas-obsidian/85 hover:bg-canvas-obsidian text-text-muted hover:text-text-primary border border-hairline-outline backdrop-blur-md transition-colors cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Media display */}
        <div className="relative flex items-center justify-center min-h-[140px] max-h-[460px] bg-canvas-obsidian/40">
          {/* The overlay renders until the GIF's onLoad fires; the image is
              local and loads in a frame, so the spinner is barely visible. */}
          {!hasLoaded && !hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-surface-container/50">
              <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
                <div className="w-4 h-4 rounded-full border-2 border-secondary/30 border-t-secondary animate-spin" />
                <span>Loading GIF...</span>
              </div>
            </div>
          )}

          {hasError ? (
            <div className="p-8 text-center space-y-2">
              <p className="font-mono text-xs text-state-warning">Unable to load GIF from source</p>
              <p className="font-mono text-[11px] text-text-disabled truncate max-w-sm">{src}</p>
            </div>
          ) : (
            <>
              {/* Active animated GIF */}
              <img
                ref={imgRef}
                src={src}
                alt={alt}
                onLoad={handleImageLoad}
                onError={() => setHasError(true)}
                className={`w-full max-h-[460px] object-contain transition-opacity duration-150 ${
                  isPlaying ? 'opacity-100' : 'hidden'
                }`}
              />

              {/* Frozen frame canvas when paused */}
              <canvas
                ref={canvasRef}
                className={`w-full max-h-[460px] object-contain ${
                  !isPlaying ? 'block' : 'hidden'
                }`}
              />
            </>
          )}

          {/* Hover Overlay with big play button when paused */}
          {!isPlaying && !hasError && (
            <div 
              onClick={handleTogglePlay}
              className="absolute inset-0 bg-canvas-obsidian/30 flex items-center justify-center backdrop-blur-[1px] hover:bg-canvas-obsidian/20 transition-all cursor-pointer"
            >
              <div className="p-3 rounded-full bg-secondary/90 text-canvas-obsidian hover:scale-110 transition-transform shadow-lg">
                <Play className="w-6 h-6 fill-current" />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Bar: info + click to zoom prompt */}
        <div className="px-3.5 py-2 bg-surface-elevated/80 border-t border-hairline-subtle flex items-center justify-between text-[11px] font-mono text-text-muted">
          <div className="flex items-center gap-2 truncate">
            <span className="text-text-primary font-medium truncate">{caption || alt}</span>
            {/* Always in the tree: the captured DOM shows real pixel sizes but
                hydration's first commit has none yet (load is async), so this
                text is exempted from hydration comparison and just updates
                once onLoad provides the numbers. */}
            <span
              suppressHydrationWarning
              className="text-text-disabled text-[10px] hidden sm:inline"
            >
              {dimensions ? `(${dimensions.width}×${dimensions.height})` : ''}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-text-disabled">
              <Sparkles className="w-3 h-3 text-secondary/70" />
              Click to preview
            </span>
          </div>
        </div>
      </div>

      {caption && (
        <figcaption className="mt-2 text-center text-xs text-text-muted font-mono">
          {caption}
        </figcaption>
      )}

      {/* FULLSCREEN LIGHTBOX PREVIEW MODAL */}
      {isLightboxOpen && (
        <div 
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex flex-col bg-canvas-obsidian/95 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => {
            setIsLightboxOpen(false);
            setZoomLevel(1);
          }}
        >
          {/* Lightbox Toolbar Header */}
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-hairline-outline bg-surface-container/70 shrink-0"
          >
            {/* Title & Dimension */}
            <div className="flex items-center gap-3 truncate max-w-md">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary/15 border border-secondary/30 text-xs font-mono text-secondary font-semibold">
                <Film className="w-3 h-3" />
                <span>GIF Preview</span>
              </div>
              <span className="font-mono text-xs sm:text-sm text-text-primary font-medium truncate">
                {caption || alt}
              </span>
              {dimensions && (
                <span className="text-xs font-mono text-text-muted hidden md:inline">
                  {dimensions.width}×{dimensions.height}px
                </span>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Play/Pause in Modal */}
              <button
                type="button"
                onClick={handleTogglePlay}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-elevated hover:bg-surface-elevated/80 border border-hairline-outline text-xs font-mono text-text-primary transition-colors cursor-pointer"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-text-muted" />
                    <span className="hidden sm:inline">Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-secondary" />
                    <span className="hidden sm:inline text-secondary">Play</span>
                  </>
                )}
              </button>

              {/* Zoom Controls */}
              <div className="hidden sm:flex items-center border border-hairline-outline rounded-md bg-surface-elevated divide-x divide-hairline-subtle">
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.5))}
                  title="Zoom Out (-)"
                  className="p-1.5 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 text-[11px] font-mono text-text-muted select-none">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 3))}
                  title="Zoom In (+)"
                  className="p-1.5 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                {zoomLevel !== 1 && (
                  <button
                    type="button"
                    onClick={() => setZoomLevel(1)}
                    title="Reset Zoom (0)"
                    className="p-1.5 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Copy URL */}
              <button
                type="button"
                onClick={handleCopyLink}
                title="Copy GIF URL"
                className="p-1.5 rounded-md bg-surface-elevated hover:bg-surface-elevated/80 border border-hairline-outline text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-state-success" /> : <Copy className="w-4 h-4" />}
              </button>

              {/* Open in new tab */}
              <a
                href={src}
                target="_blank"
                rel="noreferrer"
                title="Open original file in new tab"
                className="p-1.5 rounded-md bg-surface-elevated hover:bg-surface-elevated/80 border border-hairline-outline text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              {/* Close Modal */}
              <button
                type="button"
                onClick={() => {
                  setIsLightboxOpen(false);
                  setZoomLevel(1);
                }}
                title="Close (Esc)"
                className="p-1.5 rounded-md bg-surface-elevated hover:bg-state-warning/20 border border-hairline-outline text-text-muted hover:text-text-primary transition-colors cursor-pointer ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Lightbox Canvas Area */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-4 sm:p-8">
            <div 
              onClick={(e) => e.stopPropagation()}
              style={{ transform: `scale(${zoomLevel})` }}
              className="relative transition-transform duration-150 max-w-full max-h-full flex items-center justify-center"
            >
              <img
                ref={lightboxImgRef}
                src={src}
                alt={alt}
                className={`max-w-[85vw] max-h-[75vh] object-contain rounded-lg shadow-2xl border border-hairline-outline ${
                  isPlaying ? 'block' : 'hidden'
                }`}
              />
              <canvas
                ref={lightboxCanvasRef}
                className={`max-w-[85vw] max-h-[75vh] object-contain rounded-lg shadow-2xl border border-hairline-outline ${
                  !isPlaying ? 'block' : 'hidden'
                }`}
              />
            </div>
          </div>

          {/* Footer help tip */}
          <div className="py-2.5 px-4 text-center font-mono text-xs text-text-disabled border-t border-hairline-subtle bg-surface-container/40">
            Press <kbd className="px-1.5 py-0.5 rounded bg-surface-elevated border border-hairline-outline text-text-muted">Space</kbd> to toggle play/pause · <kbd className="px-1.5 py-0.5 rounded bg-surface-elevated border border-hairline-outline text-text-muted">Esc</kbd> to close · <kbd className="px-1.5 py-0.5 rounded bg-surface-elevated border border-hairline-outline text-text-muted">+</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-surface-elevated border border-hairline-outline text-text-muted">-</kbd> to zoom
          </div>
        </div>
      )}
    </figure>
  );
};
