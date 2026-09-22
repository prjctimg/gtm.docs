import React, { useEffect, useRef, useState, useId } from 'react';
// NOTE: `mermaid` is imported lazily via dynamic import() (see getMermaid
// below). mermaid's core + diagram renderers are ~5 MB minified, so it must
// only download on pages that actually render a diagram — never in the main
// entry chunk.
import { Check, Copy } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface MermaidDiagramProps {
  code: string;
}

type Mermaid = typeof import('mermaid')['default'];

let lastInitializedTheme: 'dark' | 'light' | null = null;
let mermaidPromise: Promise<Mermaid> | null = null;

function getMermaid(): Promise<Mermaid> {
  // Cache the chunk across mounts/remounts so repeated navigations are instant.
  mermaidPromise ??= import('mermaid').then((mod) => mod.default);
  return mermaidPromise;
}

function initializeMermaid(mermaid: Mermaid, theme: 'dark' | 'light') {
  if (lastInitializedTheme === theme) return;
  try {
    const isLight = theme === 'light';
    mermaid.initialize({
      startOnLoad: false,
      theme: isLight ? 'default' : 'dark',
      securityLevel: 'loose',
      fontFamily: 'JetBrains Mono, monospace, sans-serif',
      themeVariables: isLight
        ? {
            darkMode: false,
            background: '#ffffff',
            primaryColor: '#f1f5f9',
            primaryTextColor: '#0f172a',
            primaryBorderColor: '#0d9488',
            lineColor: '#0284c7',
            secondaryColor: '#ffffff',
            tertiaryColor: '#f8fafc',
            mainBkg: '#f1f5f9',
            nodeBorder: '#cbd5e1',
            textColor: '#0f172a',
            titleColor: '#0d9488',
            edgeLabelBackground: '#ffffff',
            actorBorder: '#0d9488',
            actorBkg: '#f1f5f9',
            actorTextColor: '#0f172a',
            signalColor: '#0284c7',
            signalTextColor: '#0f172a',
          }
        : {
            darkMode: true,
            background: '#11151c',
            primaryColor: '#161b22',
            primaryTextColor: '#f0f6fc',
            primaryBorderColor: '#55dad0',
            lineColor: '#58a6ff',
            secondaryColor: '#1f242d',
            tertiaryColor: '#171c23',
            mainBkg: '#161b22',
            nodeBorder: '#30363d',
            textColor: '#f0f6fc',
            titleColor: '#55dad0',
            edgeLabelBackground: '#1f242d',
            actorBorder: '#55dad0',
            actorBkg: '#161b22',
            actorTextColor: '#f0f6fc',
            signalColor: '#58a6ff',
            signalTextColor: '#f0f6fc',
          },
    });
    lastInitializedTheme = theme;
  } catch (err) {
    console.error('Failed to initialize mermaid:', err);
  }
}

/**
 * Renders a mermaid diagram lazily. mermaid v12 serializes render calls
 * internally, so no custom queue is needed. The resulting SVG is written into
 * a ref-owned host div that React never re-renders, and `mermaid.render`
 * cleans its own temporary DOM. Render attempts use escalating timeouts +
 * backoff (the flowchart renderer is a lazily imported chunk, so cold-start
 * chunk fetches can hiccup transiently). The mermaid module itself is also
 * imported lazily — it only downloads on pages that render a diagram.
 */
export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ code }) => {
  const { theme } = useTheme();
  const uniqueId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [copied, setCopied] = useState<boolean>(false);
  const hostRef = useRef<HTMLDivElement>(null);

  const cleanCode = code.trim();

  useEffect(() => {
    let isMounted = true;

    // Render one diagram, but never wait forever: mermaid can wedge on some
    // syntaxes, and a hung promise must not block this diagram's retry.
    async function renderOne(
      mermaid: Mermaid,
      renderId: string,
      timeoutMs: number
    ) {
      let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        const timeout = new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Error('Mermaid render timed out')), timeoutMs);
        });
        return await Promise.race([mermaid.render(renderId, cleanCode), timeout]);
      } finally {
        clearTimeout(timer);
      }
    }

    async function renderDiagram() {
      // The mermaid module chunk + the flowchart renderer are lazily
      // dynamic-imported chunks, so the first attempt can lose a cold-start
      // race (slow network, cold browser cache, or a transiently failed chunk
      // fetch). Retry with escalating timeouts and backoff — a chunk/network
      // failure is transient, while a syntax error always fails identically —
      // and only surface the error box once every attempt has exhausted its
      // wait.
      let lastError: unknown = null;
      const attempts = [
        { timeout: 7000, backoff: 400 },
        { timeout: 10000, backoff: 1500 },
        { timeout: 14000, backoff: 4000 },
        { timeout: 18000, backoff: 0 },
      ];

      try {
        const mermaid = await getMermaid();
        if (!isMounted) return;
        initializeMermaid(mermaid, theme);

        for (let attempt = 0; attempt < attempts.length; attempt++) {
          const renderId = `mermaid-${uniqueId}-${Date.now().toString(36)}`;
          try {
            const renderResult = await renderOne(mermaid, renderId, attempts[attempt].timeout);
            if (isMounted && hostRef.current) {
              hostRef.current.innerHTML = renderResult.svg;
            }
            return;
          } catch (err) {
            lastError = err;
            const isChunkFailure =
              typeof err === 'object' &&
              err !== null &&
              /dynamically imported module|failed to fetch|failed to load resource|import/i.test(
                Object.prototype.toString.call(err) === '[object Error]' ? (err as Error).message : String(err)
              );
            if (isChunkFailure) {
              // Chunk fetches are transient: give them the long backoff so the
              // browser can retry the download before we burn further attempts.
              console.warn('[mermaid] lazy chunk load hiccup, retrying:', err);
            }
            if (attempt < attempts.length - 1) {
              await new Promise((r) => setTimeout(r, isChunkFailure ? attempts[attempt].backoff * 2 : attempts[attempt].backoff));
            }
          }
        }
      } catch (err) {
        lastError = err;
      }

      // Fall back to the error box after the attempts exhausted; a hung render
      // (mermaid can wedge on certain syntaxes) must never block this diagram.
      // Do not gate on isMounted here: a re-render may have made the old
      // closure stale, but the host ref is still live in the DOM and the error
      // box is a strictly better state than an empty host.
      if (!hostRef.current) return;
      const errorMessage = lastError instanceof Error ? lastError.message : 'Invalid Mermaid syntax';
      const escaped = errorMessage
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      hostRef.current.innerHTML =
        `<div class="w-full space-y-2 p-4 rounded border border-state-error/40 bg-state-error/10 text-left">` +
        `<div class="flex items-center gap-2 text-state-error font-semibold text-xs">` +
        `  <span>Diagram Syntax Error</span>` +
        `</div>` +
        `<p class="text-[11px] text-text-body font-mono break-all">${escaped}</p>` +
        `<pre class="p-3 bg-code-canvas rounded border border-hairline-outline text-xs font-mono text-text-body overflow-x-auto"><code>${escaped}</code></pre>` +
        `</div>`;
    }

    if (hostRef.current && !hostRef.current.innerHTML.trim()) {
      hostRef.current.innerHTML =
        `<div class="font-mono text-xs text-text-muted py-6">Loading diagram…</div>`;
    }

    void renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [cleanCode, uniqueId, theme]);

  const handleCopy = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(cleanCode).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {});
    }
  };

  return (
    <div className="relative my-6 rounded-lg border border-hairline-outline bg-code-canvas overflow-hidden font-mono text-xs shadow-xs group">
      {/* Copy Button at the top-right position */}
      <button
        type="button"
        onClick={handleCopy}
        className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded bg-surface-elevated/85 hover:bg-surface-elevated border border-hairline-outline hover:border-secondary/40 transition-colors cursor-pointer backdrop-blur-xs flex items-center justify-center shadow-xs"
        title={copied ? 'Copied diagram code!' : 'Copy diagram code'}
        aria-label="Copy diagram code"
      >
        {copied ? (
          <Check className="w-4 h-4 text-state-success" />
        ) : (
          <Copy className="w-4 h-4 text-text-muted hover:text-text-primary" />
        )}
      </button>

      {/* Main Diagram Area */}
      <div className="p-4 sm:p-6 overflow-x-auto min-h-[120px] flex items-center justify-center bg-canvas-obsidian/40 relative">
        <div
          ref={hostRef}
          data-mermaid-host
          className="w-full flex justify-center items-center select-none [&>svg]:max-w-full [&>svg]:h-auto [&>svg]:transition-all"
        />
      </div>
    </div>
  );
};