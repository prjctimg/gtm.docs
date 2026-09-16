import React, { useState } from 'react';
import { BlogPost } from '../types';
import { BLOG_POSTS } from '../data/mockData';
import { 
  ArrowRight, 
  Terminal, 
  Rss, 
  Check, 
  Copy, 
  CheckCircle2, 
  Radio, 
  Music, 
  Layers, 
  Cpu 
} from 'lucide-react';

interface BlogViewProps {
  onOpenWhitepaper: (post: BlogPost) => void;
  onNavigateToDocs: (sectionId?: string) => void;
}

export const BlogView: React.FC<BlogViewProps> = ({
  onOpenWhitepaper,
  onNavigateToDocs
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [emailInput, setEmailInput] = useState('');
  const [subStatus, setSubStatus] = useState<'idle' | 'success'>('idle');
  const [copiedBanner, setCopiedBanner] = useState(false);
  const [bannerPkg, setBannerPkg] = useState<'curl' | 'cargo' | 'brew'>('curl');

  const bannerCommands = {
    curl: 'curl -fsSL https://getgtm.dev/install.sh | sh',
    cargo: 'cargo install gtm --locked',
    brew: 'brew install gtm'
  };

  const categories = ['All', 'Engineering', 'Releases', 'Audio Architecture', 'TUI & Ratatui'];

  const filteredPosts = selectedCategory === 'All'
    ? BLOG_POSTS
    : BLOG_POSTS.filter(p => p.category.toLowerCase().includes(selectedCategory.toLowerCase()) || (selectedCategory === 'TUI & Ratatui' && p.category.includes('Ratatui')));

  const featuredPost = BLOG_POSTS[0];
  const recentPosts = BLOG_POSTS.slice(1);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setSubStatus('success');
    setTimeout(() => {
      setEmailInput('');
      setSubStatus('idle');
    }, 4000);
  };

  const handleCopyBanner = () => {
    navigator.clipboard.writeText(bannerCommands[bannerPkg]);
    setCopiedBanner(true);
    setTimeout(() => setCopiedBanner(false), 2000);
  };

  return (
    <div className="w-full flex flex-col font-sans space-y-12">
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-12">
        {/* Devlog Hero Header */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-secondary font-mono text-xs">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            <span className="font-bold">DEVLOG DISPATCHES //</span>
            <span className="text-text-muted">systems_audio_telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-text-primary tracking-tight font-mono leading-tight max-w-3xl">
            Systems audio. Zero jitter. Built for the terminal.
          </h1>
          <p className="text-sm sm:text-base text-text-muted max-w-2xl leading-relaxed">
            Deconstructing Symphonia decoders, lock-free ringbuffers, sub-15ms TUI telemetry, and 24-bit gapless architecture in pure Rust.
          </p>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-3 pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1 rounded-full text-xs font-mono font-medium transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-primary-container text-canvas-obsidian font-bold shadow-xs'
                    : 'bg-surface-container hover:bg-surface-elevated text-text-muted hover:text-text-primary border border-hairline-outline'
                }`}
              >
                {cat === 'All' ? 'All Updates' : cat}
              </button>
            ))}
          </div>
        </section>

        {/* FEATURED ARTICLE (Bento Dual Layout: Narrative + Simulated TUI Live Terminal) */}
        <section className="border border-hairline-outline bg-surface-container-low rounded-xl p-6 lg:p-8 relative overflow-hidden shadow-xl">
          <div className="flex flex-col lg:flex-row gap-8 items-stretch relative z-10">
            {/* Left: Editorial Content */}
            <div className="lg:w-7/12 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 font-mono text-xs mb-3">
                  <span className="px-2 py-0.5 rounded bg-surface-elevated border border-hairline-outline text-secondary font-semibold">
                    {featuredPost.category}
                  </span>
                  <span className="text-text-disabled">•</span>
                  <span className="text-text-muted">{featuredPost.date}</span>
                  <span className="text-text-disabled">•</span>
                  <span className="text-secondary">{featuredPost.readTime}</span>
                  {featuredPost.author && (
                    <>
                      <span className="text-text-disabled">•</span>
                      <span className="text-primary-fixed-dim">{featuredPost.author}</span>
                    </>
                  )}
                </div>

                <h2 
                  onClick={() => onOpenWhitepaper(featuredPost)}
                  className="font-mono text-xl sm:text-2xl lg:text-[28px] lg:leading-[34px] text-text-primary font-bold hover:text-primary transition-colors cursor-pointer"
                >
                  {featuredPost.title}
                </h2>

                <p className="mt-4 text-sm sm:text-base text-text-body leading-relaxed">
                  {featuredPost.summary}
                </p>

                {/* Audio Waveform Telemetry ASCII */}
                <div className="mt-6 p-4 rounded-lg bg-code-canvas border border-hairline-outline font-mono text-xs text-secondary space-y-2">
                  <div className="flex justify-between items-center text-text-muted text-[11px] uppercase">
                    <span>BUFFER TRANSITION (TRACK A → TRACK B)</span>
                    <span className="text-state-success font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 0 DROPOUTS DETECTED
                    </span>
                  </div>
                  <div className="text-text-muted leading-tight text-[11px] select-all">
                    FLAC_RING_01: [████████████████████████░░░░] 82.4% (Pre-decoded 48k Samples)<br />
                    FLAC_RING_02: [████████████████████████████] 100% (Ready @ Sample 0x0000)<br />
                    CPAL_OUTSTREAM: 192000Hz • 2ch • Float32 • Lock-Free Swap in 18.2µs
                  </div>
                </div>
              </div>

              {/* Action bar */}
              <div className="mt-6 pt-6 border-t border-hairline-outline flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => onOpenWhitepaper(featuredPost)}
                  className="inline-flex items-center gap-2 font-mono text-sm text-primary-container font-semibold hover:text-primary transition-colors cursor-pointer"
                >
                  <span>Read Technical Whitepaper</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <span className="font-mono text-xs text-text-muted">
                  64 comments • 3 pull requests
                </span>
              </div>
            </div>

            {/* Right: TUI Terminal Simulation Card */}
            <div className="lg:w-5/12 bg-code-canvas border border-hairline-outline rounded-lg flex flex-col font-mono text-xs">
              {/* Titlebar */}
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-surface-elevated border-b border-hairline-outline">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent-coral inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-state-warning inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-state-success inline-block" />
                  <span className="ml-2 text-text-muted text-[11px]">
                    ~/gtm/daemon/symphonia_ring.rs
                  </span>
                </div>
                <span className="text-[10px] text-text-muted font-bold">RUSTC 1.88-NIGHTLY</span>
              </div>

              {/* Code / Telemetry Log */}
              <div className="p-4 space-y-2 text-text-body flex-grow overflow-x-auto text-[12px] leading-relaxed">
                <p className="text-text-muted">// Dual ring-buffer allocation for seamless cross-fades</p>
                <p>
                  <span className="text-accent-coral font-bold">pub struct</span>{' '}
                  <span className="text-primary font-bold">GaplessEngine</span>&lt;T:{' '}
                  <span className="text-secondary font-bold">Sample</span>&gt; &#123;
                </p>
                <p className="pl-4">
                  stream_a: <span className="text-tertiary">Arc</span>&lt;
                  <span className="text-secondary">LockFreeRing</span>&lt;T&gt;&gt;,
                </p>
                <p className="pl-4">
                  stream_b: <span className="text-tertiary">Arc</span>&lt;
                  <span className="text-secondary">LockFreeRing</span>&lt;T&gt;&gt;,
                </p>
                <p className="pl-4">
                  active_bus: <span className="text-secondary">AtomicBool</span>,
                </p>
                <p className="pl-4">
                  sample_rate: <span className="text-accent-purple">u32</span>,
                </p>
                <p>&#125;</p>
                <div className="pt-3 border-t border-hairline-subtle space-y-1 text-[11px]">
                  <p className="text-state-success font-semibold">[daemon:info] Track 04 finished cleanly.</p>
                  <p className="text-secondary font-semibold">[daemon:swap] Buffer shifted in 0.000018s.</p>
                  <p className="text-text-muted">[daemon:audio] Bit depth: 24-bit Integer → f32 SIMD</p>
                </div>
              </div>

              {/* Quick Terminal Footnote */}
              <div className="px-3.5 py-2 bg-surface-container border-t border-hairline-outline flex justify-between items-center text-[11px] font-mono text-text-muted">
                <span>RAM: 12.8 MiB</span>
                <span className="text-state-success flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-state-success animate-pulse" />
                  ALSA/PipeWire Linked
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* GRID OF RECENT ARTICLES */}
        <section className="space-y-6">
          <div className="flex justify-between items-end border-b border-hairline-outline pb-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold font-mono text-text-primary">
                Recent Logs &amp; Releases
              </h3>
              <p className="text-xs sm:text-sm text-text-muted mt-1 font-sans">
                Dispatches from the audio daemon, terminal UI, and cross-platform subsystem.
              </p>
            </div>
            <span className="font-mono text-xs text-text-muted hidden sm:inline">
              SORT: CHRONOLOGICAL
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentPosts.map((post) => (
              <article
                key={post.id}
                className="p-6 bg-surface-container rounded-xl border border-hairline-outline hover:border-primary-container/60 transition-all duration-150 flex flex-col justify-between group shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3 font-mono text-xs">
                    <span className="px-2 py-0.5 rounded bg-selection-surface border border-hairline-outline text-secondary font-semibold">
                      {post.category}
                    </span>
                    <span className="text-text-muted">{post.date}</span>
                  </div>

                  <h4 
                    onClick={() => onOpenWhitepaper(post)}
                    className="font-mono text-base sm:text-lg text-text-primary font-bold group-hover:text-primary transition-colors cursor-pointer"
                  >
                    {post.title}
                  </h4>

                  <p className="mt-2.5 text-xs sm:text-sm text-text-muted leading-relaxed font-sans">
                    {post.summary}
                  </p>

                  {/* Context preview widget */}
                  {post.trackPreview && (
                    <div className="mt-4 p-3 bg-code-canvas border border-hairline-outline rounded-lg font-mono text-[11px] space-y-1">
                      <div className="flex justify-between text-secondary">
                        <span>{post.trackPreview.title}</span>
                        <span>{post.trackPreview.time}</span>
                      </div>
                      <div className="text-text-primary font-bold">{post.trackPreview.line1}</div>
                      <div className="text-text-disabled">{post.trackPreview.line2}</div>
                    </div>
                  )}

                  {post.metrics?.fps && (
                    <div className="mt-4 p-3 bg-code-canvas border border-hairline-outline rounded-lg font-mono text-[11px] text-secondary flex items-center justify-between">
                      <span>FPS: {post.metrics.fps} • DIFF_OPS: {post.metrics.diffOps} • REWRITE: {post.metrics.bufferRewrite}</span>
                      <span className="text-state-success font-bold">{post.metrics.status}</span>
                    </div>
                  )}

                  {post.commandSnippet && (
                    <div className="mt-4 p-3 bg-code-canvas border border-hairline-outline rounded-lg font-mono text-[11px] text-text-muted overflow-x-auto">
                      <span className="text-secondary font-bold mr-1">$</span> {post.commandSnippet.replace('$ ', '')}
                    </div>
                  )}

                  {post.metrics?.rss && (
                    <div className="mt-4 p-3 bg-code-canvas border border-hairline-outline rounded-lg font-mono text-[11px] text-text-muted flex justify-between">
                      <span>RSS: {post.metrics.rss}</span>
                      <span>BOOT: {post.metrics.bootTime}</span>
                      <span className="text-state-success font-bold">LTO={post.metrics.lto}</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-hairline-subtle flex items-center justify-between font-mono text-xs">
                  <span className="text-text-muted">{post.readTime}</span>
                  <button
                    onClick={() => onOpenWhitepaper(post)}
                    className="text-primary-container group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <span>Read log</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* TERMINAL SUBSCRIPTION / RSS SECTION */}
        <section className="p-6 md:p-8 bg-surface-container-low border border-hairline-outline rounded-xl shadow-xl">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2 font-mono text-xs text-secondary">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              <span className="font-bold">DEVLOG TELEMETRY DISPATCH</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-mono text-text-primary">
              Subscribe via CLI or RSS
            </h3>
            <p className="text-sm text-text-muted font-sans leading-relaxed">
              Get notified when new audio engineering whitepapers or gtm releases drop. No marketing spam, strictly technical release diffs.
            </p>

            {/* Interactive Terminal Prompt Input Form */}
            <form onSubmit={handleSubscribe} className="mt-6 flex flex-col sm:flex-row items-stretch gap-3">
              <div className="flex-grow flex items-center px-3.5 py-2.5 bg-canvas-obsidian border border-hairline-outline rounded-lg focus-within:border-primary-container focus-within:ring-1 focus-within:ring-primary-container transition-all">
                <span className="text-secondary font-mono text-xs mr-2 select-none font-bold">
                  $ gtm blog sub
                </span>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="you@domain.rs"
                  required
                  className="bg-transparent border-none text-text-primary font-mono text-xs p-0 focus:outline-none w-full placeholder:text-text-disabled"
                />
              </div>
              <button
                type="submit"
                className="bg-primary-container text-canvas-obsidian font-mono text-xs font-bold px-6 py-2.5 rounded-lg hover:opacity-90 active:opacity-80 transition-opacity whitespace-nowrap cursor-pointer shadow-sm"
              >
                Confirm
              </button>
            </form>

            {subStatus === 'success' && (
              <div className="mt-3 p-2.5 bg-code-canvas border border-state-success/40 rounded text-xs font-mono text-state-success flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>[daemon:ok] Subscribed via CLI daemon! Verification token dispatched.</span>
              </div>
            )}

            <div className="mt-3 flex items-center gap-4 font-mono text-xs text-text-muted">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText("https://getgtm.dev/rss.xml");
                  setSubStatus('success');
                  setTimeout(() => setSubStatus('idle'), 2500);
                }}
                className="hover:text-primary flex items-center gap-1 underline underline-offset-4 cursor-pointer"
              >
                <Rss className="w-3.5 h-3.5" /> rss.xml
              </button>
              <span>•</span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText("https://getgtm.dev/atom.xml");
                  setSubStatus('success');
                  setTimeout(() => setSubStatus('idle'), 2500);
                }}
                className="hover:text-primary flex items-center gap-1 underline underline-offset-4 cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5" /> atom.xml
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* HERDR-STYLE BIG INSTALL BANNER */}
      <section className="w-full bg-[#0c1017] border-t border-[#1e2633] px-6 py-12 md:py-16">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-2xl md:text-3xl font-mono font-bold tracking-tight text-white mb-2">
              Play music in the terminal <span className="text-[#38bdae]">without compromise.</span>
            </h3>
            <p className="text-xs sm:text-sm font-mono text-[#8b949e]">
              Lightweight binary, zero telemetry overhead, built for tiling window managers and true hi-res DAC setups.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs font-mono text-[#8b949e]">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#38bdae]" /> Linux (PipeWire/ALSA)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8b949e]" /> macOS (CoreAudio)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8b949e]" /> FreeBSD (OSS)
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
            <div className="flex items-center gap-1 font-mono text-xs">
              <span className="text-text-muted text-[11px] mr-1">Method:</span>
              <button
                onClick={() => setBannerPkg('curl')}
                className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                  bannerPkg === 'curl'
                    ? 'bg-[#1e2633] text-[#38bdae] font-bold border border-[#2b3342]'
                    : 'text-[#8b949e] hover:text-[#c9d1d9]'
                }`}
              >
                curl (script)
              </button>
              <button
                onClick={() => setBannerPkg('cargo')}
                className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                  bannerPkg === 'cargo'
                    ? 'bg-[#1e2633] text-[#38bdae] font-bold border border-[#2b3342]'
                    : 'text-[#8b949e] hover:text-[#c9d1d9]'
                }`}
              >
                cargo
              </button>
              <button
                onClick={() => setBannerPkg('brew')}
                className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                  bannerPkg === 'brew'
                    ? 'bg-[#1e2633] text-[#38bdae] font-bold border border-[#2b3342]'
                    : 'text-[#8b949e] hover:text-[#c9d1d9]'
                }`}
              >
                brew
              </button>
            </div>

            <div className="flex items-stretch bg-[#101620] border border-[#2b3342] rounded-md overflow-hidden shadow-2xl">
              <div className="px-4 py-3 font-mono text-xs sm:text-sm text-[#c9d1d9] flex items-center gap-2 select-all overflow-x-auto">
                <span className="text-[#38bdae] font-bold select-none">$</span> {bannerCommands[bannerPkg]}
              </div>
              <button
                onClick={handleCopyBanner}
                className="px-4 py-3 bg-[#58a6ff] hover:bg-[#79c0ff] text-[#090d16] font-mono text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {copiedBanner ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>COPIED!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
