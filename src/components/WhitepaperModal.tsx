import React, { useEffect } from 'react';
import { BlogPost } from '../types';
import { X, Cpu, CheckCircle2, Terminal, ArrowRight, ExternalLink } from 'lucide-react';

interface WhitepaperModalProps {
  post: BlogPost | null;
  onClose: () => void;
  onNavigateToDocs: (sectionId?: string) => void;
}

export const WhitepaperModal: React.FC<WhitepaperModalProps> = ({
  post,
  onClose,
  onNavigateToDocs
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!post) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-surface-container border border-hairline-outline rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-canvas-obsidian border-b border-hairline-outline">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-coral inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-state-warning inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-state-success inline-block" />
            </div>
            <span className="font-code-inline text-xs text-text-muted">
              gtm://whitepaper/{post.id}.md
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6 font-sans">
          {/* Header */}
          <div className="space-y-2 border-b border-hairline-outline pb-4">
            <div className="flex items-center gap-3 font-code-inline text-xs">
              <span className="px-2 py-0.5 rounded bg-surface-elevated border border-hairline-outline text-secondary font-semibold">
                {post.category}
              </span>
              <span className="text-text-muted">•</span>
              <span className="text-text-muted">{post.date}</span>
              <span className="text-text-muted">•</span>
              <span className="text-secondary">{post.readTime}</span>
              {post.author && (
                <>
                  <span className="text-text-muted">•</span>
                  <span className="text-primary-container">{post.author}</span>
                </>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary leading-tight font-mono">
              {post.title}
            </h2>
            <p className="text-sm text-text-body leading-relaxed">
              {post.summary}
            </p>
          </div>

          {/* Telemetry banner */}
          <div className="p-4 rounded bg-code-canvas border border-hairline-outline font-mono text-xs text-secondary space-y-2">
            <div className="flex justify-between items-center text-text-muted uppercase text-[11px]">
              <span>Real-Time Buffer Telemetry (Track A → Track B)</span>
              <span className="text-state-success font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 0 DROPOUTS DETECTED
              </span>
            </div>
            <div className="text-text-muted leading-relaxed">
              FLAC_RING_01: [████████████████████████░░░░] 82.4% (Pre-decoded 48k Samples)<br />
              FLAC_RING_02: [████████████████████████████] 100% (Ready @ Sample 0x0000)<br />
              CPAL_OUTSTREAM: 192000Hz • 2ch • Float32 • Lock-Free Swap in 18.2µs
            </div>
          </div>

          {/* Code snippet block */}
          {post.codeSnippet && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-text-muted font-mono">
                <span className="flex items-center gap-1.5 text-secondary">
                  <Terminal className="w-3.5 h-3.5" /> {post.codeSnippet.filename}
                </span>
                <span className="text-[11px] text-text-disabled">{post.codeSnippet.badge}</span>
              </div>
              <pre className="p-4 bg-code-canvas border border-hairline-outline rounded-lg text-xs font-mono text-text-body overflow-x-auto leading-relaxed">
                <code>{post.codeSnippet.code}</code>
              </pre>
            </div>
          )}

          {/* Whitepaper Full Narrative */}
          {post.whitepaperContent && (
            <div className="text-sm text-text-body space-y-4 font-sans leading-relaxed border-t border-hairline-outline pt-4">
              <h3 className="text-base font-bold text-text-primary font-mono flex items-center gap-2">
                <Cpu className="w-4 h-4 text-secondary" /> Architectural Deep Dive
              </h3>
              <div className="space-y-3 whitespace-pre-line text-text-muted text-xs sm:text-sm font-sans">
                {post.whitepaperContent}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-3.5 bg-canvas-obsidian border-t border-hairline-outline flex items-center justify-between font-mono text-xs">
          <button
            onClick={() => {
              onClose();
              onNavigateToDocs('architecture');
            }}
            className="text-secondary hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>View Architecture Specification</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-surface-elevated hover:bg-surface-bright border border-hairline-outline text-text-primary rounded transition-colors cursor-pointer"
          >
            Close Whitepaper
          </button>
        </div>
      </div>
    </div>
  );
};
