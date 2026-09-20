import React, { useEffect, useState, useId } from 'react';
import mermaid from 'mermaid';
import { Check, Copy, AlertCircle, RefreshCw } from 'lucide-react';
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

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ code }) => {
  const { theme } = useTheme();
  const uniqueId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const cleanCode = code.trim();

  useEffect(() => {
    let isMounted = true;
    initializeMermaid(theme);

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
              <span>Diagram Syntax Error</span>
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
