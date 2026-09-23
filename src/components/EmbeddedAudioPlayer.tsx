import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Info, 
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
  title: _title = 'Audio Sample',
  artist: _artist = 'gtm.rs Daemon',
  description,
  autoPlay = false,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [useSynthFallback, setUseSynthFallback] = useState<boolean>(
    src.startsWith('synth:') || src.startsWith('demo:')
  );
  const [hasError, setHasError] = useState<boolean>(false);

  // Frequency bars animation state
  const [spectrumLevels, setSpectrumLevels] = useState<number[]>(() => 
    Array.from({ length: 10 }, () => 0.08)
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
      masterGain.gain.setValueAtTime(0.25, ctx.currentTime);
      masterGain.connect(ctx.destination);

      // Create warm dual-oscillator chords
      const notes = [220, 277.18, 329.63, 440]; // A major chord
      const oscs: OscillatorNode[] = [];

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
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
  }, [currentTime, duration]);

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
          // Playback blocked or failed; switch to synth fallback
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
      setSpectrumLevels(Array.from({ length: 10 }, () => 0.08));
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
          stopSynthPlayback();
          setIsPlaying(false);
          setCurrentTime(0);
          return;
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
  }, [isPlaying, useSynthFallback, duration, stopSynthPlayback]);

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
  const remainingTime = duration > 0 ? Math.max(0, duration - currentTime) : 0;

  return (
    <div className={`my-4 rounded-lg border border-hairline-outline bg-surface-container overflow-hidden shadow-xs transition-colors hover:border-secondary/40 font-sans ${className}`}>
      {/* Underlying HTML5 Audio element */}
      {!useSynthFallback && (
        <audio
          ref={audioRef}
          src={src}
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

      {/* Main Inlined Row: Play/Pause button + Scrubber & Remaining Countdown */}
      <div className="p-3 sm:px-4 sm:py-3 flex items-center gap-3">
        {/* Inlined Play/Pause button */}
        <button
          type="button"
          onClick={togglePlay}
          title={isPlaying ? 'Pause audio' : 'Play audio'}
          aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
          className="w-8 h-8 rounded-lg bg-secondary text-canvas-obsidian hover:bg-secondary/90 active:scale-95 transition-all flex items-center justify-center shrink-0 shadow-xs cursor-pointer group"
        >
          {isBuffering ? (
            <div className="w-3.5 h-3.5 rounded-full border-2 border-canvas-obsidian border-t-transparent animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          )}
        </button>

        {/* Inlined & Reduced-size Progress Indicator */}
        <div
          ref={progressBarRef}
          onClick={handleScrub}
          className="relative h-1.5 flex-1 bg-canvas-obsidian/80 rounded-full overflow-hidden cursor-pointer group/progress border border-hairline-subtle"
        >
          <div
            style={{ width: `${progressPercent}%` }}
            className="h-full bg-secondary transition-all duration-100 rounded-full relative"
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-text-primary opacity-0 group-hover/progress:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Remaining Time Countdown */}
        <span
          className="text-xs font-mono text-text-muted shrink-0 tabular-nums select-none min-w-[36px] text-right"
          suppressHydrationWarning
        >
          {duration > 0 ? `-${formatTime(remainingTime)}` : '--:--'}
        </span>

        {/* Compact Inlined Spectrum Visualizer */}
        <div className="hidden sm:flex w-20 h-6 bg-canvas-obsidian/60 rounded border border-hairline-subtle px-1.5 py-1 items-end justify-between gap-0.5 shrink-0">
          {spectrumLevels.map((level, idx) => (
            <div
              key={idx}
              className="flex-1 bg-surface-elevated rounded-2xs overflow-hidden h-full flex flex-col justify-end"
            >
              <div
                style={{ height: `${Math.round(level * 100)}%` }}
                className={`w-full rounded-2xs transition-all duration-75 ${
                  isPlaying 
                    ? idx > 7 
                      ? 'bg-state-warning' 
                      : idx > 4 
                        ? 'bg-secondary' 
                        : 'bg-state-success'
                    : 'bg-text-disabled/40'
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Audio Description with Info Icon */}
      {description && (
        <div className="px-3.5 py-2 bg-surface-elevated/40 border-t border-hairline-subtle text-xs text-text-muted font-mono flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-secondary shrink-0" />
          <span>{description}</span>
        </div>
      )}

      {/* Fallback Notice */}
      {hasError && (
        <div className="px-3.5 py-2 bg-state-warning/10 border-t border-state-warning/30 text-xs text-state-warning font-mono flex items-center justify-between">
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
            className="underline hover:text-text-primary cursor-pointer text-xs"
          >
            Switch to Synth Engine Demo
          </button>
        </div>
      )}
    </div>
  );
};
