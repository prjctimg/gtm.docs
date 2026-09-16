import React, { useEffect, useState, useId } from 'react';
import mermaid from 'mermaid';
import { Check, AlertCircle, RefreshCw } from 'lucide-react';

interface MermaidDiagramProps {
  code: string;
}

const MermaidIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 491 491"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M490.16,84.61C490.16,37.912 452.248,0 405.55,0L84.61,0C37.912,0 0,37.912 0,84.61L0,405.55C0,452.248 37.912,490.16 84.61,490.16L405.55,490.16C452.248,490.16 490.16,452.248 490.16,405.55L490.16,84.61Z"
      fill="#ff3670"
    />
    <path
      d="M407.48,111.18C335.587,108.103 269.573,152.338 245.08,220C220.587,152.338 154.573,108.103 82.68,111.18C80.285,168.229 107.577,222.632 154.74,254.82C178.908,271.419 193.35,298.951 193.27,328.27L193.27,379.13L296.9,379.13L296.9,328.27C296.816,298.953 311.255,271.42 335.42,254.82C382.596,222.644 409.892,168.233 407.48,111.18Z"
      fill="white"
    />
  </svg>
);

let isMermaidInitialized = false;

function initializeMermaid() {
  if (isMermaidInitialized) return;
  try {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
      fontFamily: 'JetBrains Mono, monospace, sans-serif',
      themeVariables: {
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
    isMermaidInitialized = true;
  } catch (err) {
    console.error('Failed to initialize mermaid:', err);
  }
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ code }) => {
  const uniqueId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const cleanCode = code.trim();

  useEffect(() => {
    let isMounted = true;
    initializeMermaid();

    async function renderDiagram() {
      setLoading(true);
      setError(null);
      const renderId = `mermaid-${uniqueId}-${Date.now().toString(36)}`;

      try {
        const renderResult = await mermaid.render(renderId, cleanCode);
        if (isMounted) {
          setSvg(renderResult.svg);
          setError(null);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'Invalid Mermaid syntax';
          setError(errorMessage);
          setLoading(false);
        }
        // Clean up any stray DOM elements mermaid may leave behind on parse error
        const stray = document.getElementById(renderId) || document.getElementById('d' + renderId);
        if (stray) stray.remove();
      }
    }

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [cleanCode, uniqueId]);

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
      {/* Mermaid Icon at the top-right position */}
      <button
        type="button"
        onClick={handleCopy}
        className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded bg-surface-elevated/85 hover:bg-surface-elevated border border-hairline-outline hover:border-secondary/40 transition-colors cursor-pointer backdrop-blur-xs flex items-center justify-center shadow-xs"
        title={copied ? 'Copied Mermaid source code!' : 'Mermaid Diagram (click to copy code)'}
        aria-label="Mermaid Diagram"
      >
        {copied ? (
          <Check className="w-4 h-4 text-state-success" />
        ) : (
          <MermaidIcon className="w-4 h-4" />
        )}
      </button>

      {/* Main Diagram Area */}
      <div className="p-4 sm:p-6 overflow-x-auto min-h-[120px] flex items-center justify-center bg-canvas-obsidian/40 relative">
        {loading && (
          <div className="flex items-center gap-2 text-text-muted py-6">
            <RefreshCw className="w-4 h-4 animate-spin text-secondary" />
            <span className="text-xs">Rendering diagram...</span>
          </div>
        )}

        {!loading && error && (
          <div className="w-full space-y-2 p-4 rounded border border-state-error/40 bg-state-error/10 text-left">
            <div className="flex items-center gap-2 text-state-error font-semibold text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Mermaid Diagram Syntax Error</span>
            </div>
            <p className="text-[11px] text-text-body font-mono break-all">{error}</p>
            <pre className="p-3 bg-code-canvas rounded border border-hairline-outline text-xs font-mono text-text-body overflow-x-auto">
              <code>{cleanCode}</code>
            </pre>
          </div>
        )}

        {!loading && !error && svg && (
          <div
            className="w-full flex justify-center items-center select-none [&>svg]:max-w-full [&>svg]:h-auto [&>svg]:transition-all"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )}
      </div>
    </div>
  );
};
