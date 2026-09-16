import { BlogPost, BenchmarkRow, KeybindingItem } from '../types';

export const IMAGES = {
  themesArt: "https://lh3.googleusercontent.com/aida-public/AB6AXuDLBW2XDyCnRIENZAIHXngeZMEYUcRnInWY8F679xgggSQhIAubP8jw5RnJCneUWLb_STjUTjg4C4G2QYjjHEDlIuOW3OcfAAPgL4ybG86qirdB8wchC3BXxW-pLT5jt5B3GXqI8bg4xuNXRprik_bIzNAV7d1Whq-opKOk2q6SJEfczA9TyXMxbs0cYahoqJYi-44cyI_CJvvM5UtxwnXqiZl75kwcIzenHWzM8_wRFYHxCn2nvtOydTX-aIoVfWZbpA",
  libraryView1: "https://lh3.googleusercontent.com/aida-public/AB6AXuBwH4KkygpN_ShbNAeSEDKI18dqsXnIOACTCCybSqRg7BFKz3NNyf0vM75xOrdMW29SUmYDboThSau9-lKxar1vdDiJ72HBg1WVv9YbZN_puegQPB1rBvK0YfWpWWFz8W9eQHEEp0uTUP_NaBgvC0kKelJnyhWhzXPLkZBkIsg-qo8oQyV-RUtoTRZsy_2PvEPKMK5Cyz8Kneu_tYd8cZGSy5AmZPEl-sJPNSDnpR1vCkBhHCdo3Eup9Fq9ZMhqs9NO3w",
  lyricsView1: "https://lh3.googleusercontent.com/aida-public/AB6AXuBDYayxW79xe3NbEoVGWQ-cdzi2OCjnkRKYe0bAJUJx2fx4AHr1XYUBRyCAo5qWkYcEXcl0VFWunI2e5XN8aDejzIjhL4uIUO_g2TZypX-folzLokaaglHhygNxlxgTcDRXa6f7yIgOv3cV3uDjkOP_7GyvjNcTHeNCWjHzjTvC_7jvRIGERicztyJvYG_HE5jgqgXH42YXmTvzNXCHOcfmvNiNrRu_5M_nLyjRD5gxUPeevizXT5qWNRHgBlNU3aWeQA",
  libraryView2: "https://lh3.googleusercontent.com/aida-public/AB6AXuDZv0l6ooxx_MK8lpGKmOjH1RASoLjAIP-chqizfDu6EWzM_SW7Nl0vpGG8G9KRzDtJwuzxqVL_CNZUBe0xHdm3SRghWsZkFfQCngqdG9rGVeMVXs3C3nf4P_zlDJKZHHDWhBY9mfpxFEBnL-av131vtwfDmXiBzDwHXlUQTjto9cVwzdda-Cr5-pfWN0F5FkQfoVAlx1ZmZBll4gTbrY6rHxzbWERVLmRUa48iztM5ze41Sufd-FsMyOjqsF38_FJ4Rw",
  lyricsView2: "https://lh3.googleusercontent.com/aida-public/AB6AXuDUAiMC3KvJmnK7ndpU0KD3_1bJFs92Axbi6gAWSp3CeV0tE9QGl-mNmWbO17XyxsUrxV8ohexgtuYveiOgQFpzq24nSV8i6hQ65x_1LcXXwS3VLni98uT5EqnF3mvfHtMBmlMWh6pk79ngAmLrEs9suctRnOsl2T93VSbV3MCRZ6h_hfRL7E0IqbeL5fqRik-kEb1IScy2NAs6ryTLFXGCoWCkL4jBPyFel6ezrlNGEZEtq1jEsLgjYn3I4WOqXkw-Rg"
};

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'zero-gap-rust',
    category: 'Engineering',
    categoryColor: 'text-secondary',
    date: 'Sept 28, 2026',
    readTime: '8 min read',
    author: '@alex_audio_rs',
    title: 'Achieving True Zero-Gap Playback in Rust: Rewriting the Symphonia Audio Pipeline',
    summary: 'How we eliminated the 40ms inter-track jitter between 24-bit/192kHz FLAC files using dual-ring lock-free ringbuffers and crossbeam channels, ensuring studio master synchronization directly inside a Ratatui terminal runtime.',
    codeSnippet: {
      filename: '~/gtm/daemon/symphonia_ring.rs',
      badge: 'RUSTC 1.88-NIGHTLY',
      code: `// Dual ring-buffer allocation for seamless cross-fades
pub struct GaplessEngine<T: Sample> {
    stream_a: Arc<LockFreeRing<T>>,
    stream_b: Arc<LockFreeRing<T>>,
    active_bus: AtomicBool,
    sample_rate: u32,
}

// [daemon:info] Track 04 finished cleanly.
// [daemon:swap] Buffer shifted in 0.000018s.
// [daemon:audio] Bit depth: 24-bit Integer -> f32 SIMD`
    },
    metrics: {
      status: '0 DROPOUTS DETECTED',
      bufferRewrite: 'Lock-Free Swap in 18.2µs'
    },
    whitepaperContent: `### Problem Statement: The 40ms Gapless Problem in UNIX Audio

Most desktop players claim "gapless playback," yet under heavy CPU or memory page faults, transition boundaries between hi-res PCM streams (192kHz / 24-bit) experience micro-stalls ranging from 12ms to 65ms. In classical movements and continuous mix albums (e.g. Pink Floyd or Daft Punk's Alive 2007), these stalls translate into perceptible audio clicks.

### Architecture: Dual Ring SPSC Buffers
To achieve true ±0 sample jitter, gtm decouples demuxing, decoding, and sink output across three isolated POSIX threads:

1. **Decoder Worker Thread**: Runs Symphonia with lookahead caching. When the active track reaches its final 3 seconds, the background thread initializes the next file header and pre-fills an auxiliary lock-free SPSC buffer (\`LockFreeRing<f32>\`).
2. **Audio Host Realtime Callback**: Uses CPAL hooked directly into PipeWire or ALSA MMAP mode.
3. **Atomic Swap**: The audio callback swaps ringbuffer pointers in exactly 18.2 nanoseconds without ever acquiring a mutex or triggering a heap allocation.

\`\`\`rust
pub struct GaplessEngine<T: Sample> {
    stream_a: Arc<LockFreeRing<T>>,
    stream_b: Arc<LockFreeRing<T>>,
    active_bus: AtomicBool,
    sample_rate: u32,
}
\`\`\`

### Results & Verification
Across 20,000 continuous track transitions on Linux 6.8 with PipeWire 1.0.4:
- **Buffer Underruns**: 0
- **Boundary Drift**: ±0 samples
- **Memory Overhead**: < 1.2 MiB resident ring cache`
  },
  {
    id: 'gtm-v042-release',
    category: 'Releases',
    categoryColor: 'text-state-success',
    date: 'Sept 19, 2026',
    readTime: '5 min read',
    title: 'gtm v0.4.2 Released: Synchronized .lrc Lyrics, Catppuccin Themes, and MPRIS2 Integration',
    summary: 'Introducing word-by-word micro-timestamped lyric parsing at 60 FPS, full native MPRIS2 D-Bus bindings for Linux media keys, and dynamic 256-color palette swaps.',
    trackPreview: {
      title: '[▶] Daft Punk — Horizon',
      time: '02:14 / 04:24',
      line1: '♪ "Touch, where do you lead?"',
      line2: '♪ "I need something more..."'
    },
    commandSnippet: 'cargo install gtm@0.4.2 --locked'
  },
  {
    id: 'ratatui-termion',
    category: 'TUI & Ratatui',
    categoryColor: 'text-tertiary-container',
    date: 'Aug 30, 2026',
    readTime: '11 min read',
    title: 'Why We Chose Ratatui Over Raw Termion for Audio Waveform Visualizers',
    summary: 'Achieving 120 FPS sub-pixel FFT visualizers without flicker: an analysis of buffer diffing algorithms, terminal escape code congestion, and SIMD-accelerated Braille rendering.',
    metrics: {
      fps: '119.8',
      diffOps: '34',
      bufferRewrite: '1.2%',
      status: 'SMOOTH'
    }
  },
  {
    id: 'spotify-connect-unix',
    category: 'Audio Architecture',
    categoryColor: 'text-secondary',
    date: 'Aug 14, 2026',
    readTime: '7 min read',
    title: 'Streaming Spotify Connect Directly into a UNIX TUI without Electron Bloat',
    summary: 'Reverse engineering librespot daemon sessions to handle authentication tokens, caching OGG Vorbis bitstreams to /dev/shm, and piping directly into CPAL audio sinks.',
    commandSnippet: '$ gtm connect --source=spotify --bitrate=320k --zero-daemon'
  },
  {
    id: 'sub-15mb-memory',
    category: 'Engineering',
    categoryColor: 'text-accent-coral',
    date: 'July 22, 2026',
    readTime: '9 min read',
    title: 'Sub-15MB Memory Footprint: Profile-Guided Optimization in Audio Daemons',
    summary: 'Leveraging jemalloc, aggressive LTO, and PGO profiles to compile a self-contained static audio binary that boots in 12ms and runs comfortably on a Raspberry Pi Zero W.',
    metrics: {
      rss: '13,840 KB',
      bootTime: '0.012s',
      lto: 'FAT'
    }
  }
];

export const BENCHMARKS: BenchmarkRow[] = [
  {
    player: '> gtm',
    version: 'v0.4.2',
    rss: '12.8 MB',
    coldBoot: '6.2 ms',
    accuracy: 'Bit-Perfect (±0 smp)',
    cpu: '0.14%',
    isHero: true
  },
  {
    player: 'cmus',
    version: 'v2.10.0',
    rss: '18.4 MB',
    coldBoot: '14.1 ms',
    accuracy: 'Variable (±12 smp)',
    cpu: '0.32%'
  },
  {
    player: 'mocp',
    version: 'v2.6',
    rss: '22.1 MB',
    coldBoot: '28.4 ms',
    accuracy: 'Interpolated Drift',
    cpu: '0.51%'
  },
  {
    player: 'mpd + ncmpcpp',
    version: 'v0.23',
    rss: '34.6 MB',
    coldBoot: '45.0 ms',
    accuracy: 'Bit-Perfect',
    cpu: '0.88%'
  }
];

export const KEYBINDINGS: KeybindingItem[] = [
  { key: 'Space', action: 'Play / Pause toggle', scope: 'Global' },
  { key: 'j / k', action: 'Cursor Down / Up track', scope: 'Queue' },
  { key: 'n', action: 'Next track in queue', scope: 'Queue' },
  { key: 'p', action: 'Previous track', scope: 'Queue' },
  { key: 'h / ←', action: 'Seek backward 5s', scope: 'Player' },
  { key: 'l / →', action: 'Seek forward 5s', scope: 'Player' },
  { key: '+ / -', action: 'Volume control (±2dB)', scope: 'Audio' },
  { key: 'L', action: 'Toggle synced lyrics split view', scope: 'View' },
  { key: 'v / b', action: 'Cycle spectrum visualizer mode', scope: 'Visual' },
  { key: 't', action: 'Switch reactive album theme', scope: 'Theme' },
  { key: '/', action: 'Fuzzy search library palette', scope: 'Filter' },
  { key: 'e', action: 'Open metadata tag inspector', scope: 'Inspector' },
  { key: 'q', action: 'Quit / Detach gtm daemon', scope: 'Lifecycle' }
];

export const PACKAGE_COMMANDS = {
  curl: 'curl -fsSL https://getgtm.dev/install.sh | sh',
  cargo: 'cargo install gtm --locked --features pipewire,mpris',
  brew: 'brew tap gtm/tap && brew install gtm',
  aur: 'paru -S gtm-bin',
  nix: 'nix-env -iA nixpkgs.gtm'
};

export const TOML_CONFIG_CODE = `# Audio backend parameters
[audio]
backend = "pipewire"            # options: pipewire, alsa, pulseaudio, coreaudio
sample_rate = 192000             # resample target (0 for bit-perfect passthrough)
gapless = true                 # dual-engine pre-buffering for seamless tracks
buffer_duration_ms = 150        # ring buffer sizing for ultra-low latency scrub

# Library scanner
[library]
music_dir = "~/Music"
cache_dir = "~/.cache/gtm"
startup_view = "queue"            # options: queue, library, artist, visualizer
watch_filesystem = true         # auto-index newly downloaded audio tracks

# UI theme
[ui]
theme = "obsidian-cyan"         # references theme JSON in ~/.config/gtm/themes/
show_spectrogram = true
spectrogram_fps = 60
synced_lyrics = true            # parses matching .lrc or embedded ID3 tags`;
