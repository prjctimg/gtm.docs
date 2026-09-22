import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Volume1, 
  RotateCcw, 
  Repeat, 
  Music, 
  Download, 
  AlertCircle
} from 'lucide-react';

interface EmbeddedAudioPlayerProps {
  src: string;
  title?: string;
  artist?: string;
  description?: string;
  autoPlay?: boolean;
  className?: string;
}

export const EmbeddedAudioPlayer: React.FC<EmbeddedAudioPlayerProps> = ({
  src,
  title = 'Audio Sample',
  artist = 'gtm.rs Daemon',
  description,
  autoPlay = false,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [useSynthFallback, setUseSynthFallback] = useState<boolean>(
    src.startsWith('synth:') || src.startsWith('demo:')
  );
  const [hasError, setHasError] = useState<boolean>(false);

  // Frequency bars animation state — starts at the same idle value the mount
  // effect resets to (0.08), so the first committed render has no visual jump.
  const [spectrumLevels, setSpectrumLevels] = useState<number[]>(() => 
    Array.from({ length: 16 }, () => 0.08)
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Web Audio synth fallback references
  const synthCtxRef = useRef<AudioContext | null>(null);
  const synthNodesRef = useRef<{ oscs: OscillatorNode[]; gain: GainNode } | null>(null);
  const synthStartTimeRef = useRef<number>(0);

  // Format time as mm:ss
  const formatTime = (secs: number) => {
    if (!isFinite(secs) || secs < 0) return '--:--';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Web Audio Synth engine (for demo sounds or fallback)
  const startSynthPlayback = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!synthCtxRef.current) {
        synthCtxRef.current = new AudioCtx();
      }
      const ctx = synthCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(isMuted ? 0 : volume * 0.3, ctx.currentTime);
      masterGain.connect(ctx.destination);

      // Create warm dual-oscillator chords
      const notes = [220, 277.18, 329.63, 440]; // A major chord
      const oscs: OscillatorNode[] = [];

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        // Subtle LFO vibrato
        osc.frequency.setValueAtTime(freq * (1 + 0.003 * Math.sin(idx)), ctx.currentTime);

        const noteGain = ctx.createGain();
        noteGain.gain.setValueAtTime(0.2, ctx.currentTime);
        osc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start();
        oscs.push(osc);
      });

      synthNodesRef.current = { oscs, gain: masterGain };
      synthStartTimeRef.current = ctx.currentTime - currentTime;
      if (duration === 0) {
        setDuration(8); // Default 8s loop for synth preview
      }
    } catch {
      // AudioContext unavailable
    }
  }, [currentTime, duration, isMuted, volume]);

  const stopSynthPlayback = useCallback(() => {
    if (synthNodesRef.current) {
      synthNodesRef.current.oscs.forEach(osc => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {}
      });
      synthNodesRef.current.gain.disconnect();
      synthNodesRef.current = null;
    }
  }, []);

  // Play / Pause toggler
  const togglePlay = async () => {
    if (isPlaying) {
      if (useSynthFallback) {
        stopSynthPlayback();
      } else if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      if (useSynthFallback) {
        startSynthPlayback();
        setIsPlaying(true);
      } else if (audioRef.current) {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
          setHasError(false);
        } catch {
          // Playback blocked or failed; switch to synth fallback so user still gets sound!
          setUseSynthFallback(true);
          startSynthPlayback();
          setIsPlaying(true);
        }
      }
    }
  };

  // Spectrum animation loop
  useEffect(() => {
    if (!isPlaying) {
      setSpectrumLevels(Array.from({ length: 16 }, () => 0.08));
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    let t = 0;
    const updateSpectrum = () => {
      t += 0.15;
      setSpectrumLevels(prev => 
        prev.map((_, i) => {
          const base = Math.sin(t * 1.5 + i * 0.45);
          const harmonic = Math.cos(t * 2.2 - i * 0.25);
          const level = Math.max(0.12, Math.min(1.0, (base * 0.4 + harmonic * 0.3 + 0.45)));
          return level;
        })
      );

      // Track time if in synth fallback mode
      if (useSynthFallback && synthCtxRef.current) {
        const elapsed = synthCtxRef.current.currentTime - synthStartTimeRef.current;
        const total = duration || 8;
        if (elapsed >= total) {
          if (isLooping) {
            synthStartTimeRef.current = synthCtxRef.current.currentTime;
            setCurrentTime(0);
          } else {
            stopSynthPlayback();
            setIsPlaying(false);
            setCurrentTime(0);
            return;
          }
        } else {
          setCurrentTime(elapsed);
        }
      }

      animationFrameRef.current = requestAnimationFrame(updateSpectrum);
    };

    animationFrameRef.current = requestAnimationFrame(updateSpectrum);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, useSynthFallback, duration, isLooping, stopSynthPlayback]);

  // Volume & Mute synchronizer
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
    if (synthNodesRef.current && synthCtxRef.current) {
      synthNodesRef.current.gain.gain.setValueAtTime(
        isMuted ? 0 : volume * 0.3,
        synthCtxRef.current.currentTime
      );
    }
  }, [volume, isMuted]);

  // Scrubbing handler
  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = ratio * duration;

    setCurrentTime(newTime);
    if (!useSynthFallback && audioRef.current) {
      audioRef.current.currentTime = newTime;
    } else if (useSynthFallback && synthCtxRef.current) {
      synthStartTimeRef.current = synthCtxRef.current.currentTime - newTime;
    }
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopSynthPlayback();
      if (synthCtxRef.current && synthCtxRef.current.state !== 'closed') {
        synthCtxRef.current.close().catch(() => {});
      }
    };
  }, [stopSynthPlayback]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`my-6 rounded-xl border border-hairline-outline bg-surface-container overflow-hidden shadow-md transition-colors hover:border-secondary/40 font-sans ${className}`}>
      {/* Underlying HTML5 Audio element */}
      {!useSynthFallback && (
        <audio
          ref={audioRef}
          src={src}
          loop={isLooping}
          autoPlay={autoPlay}
          onTimeUpdate={() => {
            if (audioRef.current) {
              setCurrentTime(audioRef.current.currentTime);
            }
          }}
          onLoadedMetadata={() => {
            if (audioRef.current) {
              setDuration(audioRef.current.duration);
              setHasError(false);
            }
          }}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => {
            setIsBuffering(false);
            setIsPlaying(true);
          }}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false);
            setCurrentTime(0);
          }}
          onError={() => {
            setHasError(true);
            setIsBuffering(false);
          }}
        />
      )}

      {/* Main Player Row */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: Play button + Title */}
        <div className="flex items-center gap-3.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={togglePlay}
            title={isPlaying ? 'Pause' : 'Play sound'}
            className="w-12 h-12 rounded-xl bg-secondary text-canvas-obsidian hover:bg-secondary/90 active:scale-95 transition-all flex items-center justify-center shrink-0 shadow-md cursor-pointer group"
          >
            {isBuffering ? (
              <div className="w-5 h-5 rounded-full border-2 border-canvas-obsidian border-t-transparent animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm sm:text-base font-bold text-text-primary truncate">
                {title}
              </span>
            </div>
            <p className="text-xs text-text-muted font-mono truncate mt-0.5">
              {artist}
            </p>
          </div>
        </div>

        {/* Middle: Terminal Spectrum Visualizer */}
        <div className="w-full sm:w-44 h-9 bg-canvas-obsidian/70 rounded-lg border border-hairline-subtle px-2.5 py-1.5 flex items-end justify-between gap-1 shrink-0">
          {spectrumLevels.map((level, idx) => (
            <div
              key={idx}
              className="flex-1 bg-surface-elevated rounded-xs overflow-hidden h-full flex flex-col justify-end"
            >
              <div
                style={{ height: `${Math.round(level * 100)}%` }}
                className={`w-full rounded-xs transition-all duration-75 ${
                  isPlaying 
                    ? idx > 12 
                      ? 'bg-state-warning' 
                      : idx > 8 
                        ? 'bg-secondary' 
                        : 'bg-state-success'
                    : 'bg-text-disabled/40'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Right: Controls & Volume */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-end sm:self-center">
          {/* Loop toggle */}
          <button
            type="button"
            onClick={() => setIsLooping(!isLooping)}
            title={isLooping ? 'Looping enabled' : 'Enable loop'}
            className={`p-1.5 rounded border transition-colors cursor-pointer ${
              isLooping 
                ? 'bg-secondary/15 border-secondary/40 text-secondary' 
                : 'bg-surface-elevated border-hairline-outline text-text-muted hover:text-text-primary'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
          </button>

          {/* Volume Mute + Slider */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? 'Unmute' : 'Mute'}
              className="p-1.5 rounded bg-surface-elevated border border-hairline-outline text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 text-state-warning" />
              ) : volume < 0.5 ? (
                <Volume1 className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              className="w-16 h-1 bg-surface-elevated rounded-lg appearance-none cursor-pointer accent-secondary hidden sm:block"
            />
          </div>

          {/* Download / Source */}
          {!src.startsWith('synth:') && !src.startsWith('demo:') && (
            <a
              href={src}
              download
              target="_blank"
              rel="noreferrer"
              title="Download audio source"
              className="p-1.5 rounded bg-surface-elevated border border-hairline-outline text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Progress Timeline Scrubber */}
      <div className="px-4 pb-3 sm:px-5">
        <div
          ref={progressBarRef}
          onClick={handleScrub}
          className="relative h-2 w-full bg-canvas-obsidian/80 rounded-full overflow-hidden cursor-pointer group/progress border border-hairline-subtle"
        >
          <div
            style={{ width: `${progressPercent}%` }}
            className="h-full bg-secondary transition-all duration-100 rounded-full relative"
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-text-primary opacity-0 group-hover/progress:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Timestamps: pruned from the hydration text comparison — during capture
            the media element's duration/currentTime are already known (and the
            static server may not report ranges, so they can differ from the
            client's initial 0/0:00). The values are patched in on the first
            timeupdate, so nothing visible is lost. */}
        <div className="flex items-center justify-between text-[11px] font-mono text-text-muted mt-1.5">
          <span suppressHydrationWarning>{formatTime(currentTime)}</span>
          <span className="text-text-disabled">/</span>
          <span suppressHydrationWarning>{duration > 0 ? formatTime(duration) : '--:--'}</span>
        </div>
      </div>

      {/* Optional Description or Fallback Notice */}
      {description && (
        <div className="px-4 py-2 bg-surface-elevated/40 border-t border-hairline-subtle text-xs text-text-muted font-mono flex items-center gap-2">
          <Music className="w-3.5 h-3.5 text-secondary shrink-0" />
          <span>{description}</span>
        </div>
      )}

      {hasError && (
        <div className="px-4 py-2 bg-state-warning/10 border-t border-state-warning/30 text-xs text-state-warning font-mono flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>External audio file could not be streamed directly.</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setUseSynthFallback(true);
              setHasError(false);
              togglePlay();
            }}
            className="underline hover:text-text-primary cursor-pointer text-[11px]"
          >
            Switch to Synth Engine Demo
          </button>
        </div>
      )}
    </div>
  );
};
