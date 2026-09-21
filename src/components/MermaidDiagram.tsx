import React, { useEffect, useRef, useState, useId } from 'react';
import mermaid from 'mermaid';
import { Check, Copy } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface MermaidDiagramProps {
  code: string;
}

let lastInitializedTheme: 'dark' | 'light' | null = null;

function initializeMermaid(theme: 'dark' | 'light') {
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
 * Renders a mermaid diagram. Uses the official v12 API (initialize once per
 * theme, then `mermaid.render(id, text)`); render calls are serialized by
 * mermaid itself, so no custom queue is needed. The resulting SVG is written
 * into a ref-owned host div that React never re-renders, and `mermaid.render`
 * cleans its own temporary DOM — the previous version tried to remove mermaid
 * "strays" itself and ended up deleting the very SVG it had just inserted.
 */
export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ code }) => {
  const { theme } = useTheme();
  const uniqueId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [copied, setCopied] = useState<boolean>(false);
  const hostRef = useRef<HTMLDivElement>(null);

  const cleanCode = code.trim();

  // The rendered diagram (and any error state) lives inside a ref-owned host
  // div, injected imperatively rather than driven by React state. React's
  // committed tree just owns the (empty) host div, so re-renders never touch
  // the SVG that mermaid wrote into it.
  useEffect(() => {
    let isMounted = true;
    initializeMermaid(theme);

    // Render one diagram, but never wait forever: mermaid can wedge on some
    // syntaxes, and a hung promise must not block this diagram's retry.
    async function renderOne(renderId: string) {
      let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        const timeout = new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Error('Mermaid render timed out')), 6000);
        });
        return await Promise.race([mermaid.render(renderId, cleanCode), timeout]);
      } finally {
        clearTimeout(timer);
      }
    }

    async function renderDiagram() {
      // One render can lose a cold-start race with mermaid's lazy-loaded
      // diagram chunks; retry once before surfacing an error box.
      let lastError: unknown = null;
      for (let attempt = 0; attempt < 2; attempt++) {
        const renderId = `mermaid-${uniqueId}-${Date.now().toString(36)}`;
        try {
          const renderResult = await renderOne(renderId);
          if (isMounted && hostRef.current) {
            hostRef.current.innerHTML = renderResult.svg;
          }
          return;
        } catch (err) {
          lastError = err;
          if (attempt === 0) {
            await new Promise((r) => setTimeout(r, 150));
          }
        }
      }
      // Fall back to the error box only after both attempts; a hung render
      // (mermaid can wedge on certain syntaxes) must never block this
      // diagram — or the queue behind it — forever. Do not gate on
      // isMounted here: a re-render may have made the old closure stale,
      // but the host ref is still live in the DOM and the error box is
      // a strictly better state than an empty host.
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