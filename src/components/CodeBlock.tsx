import React, { useState, useMemo } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-bash.js';
import 'prismjs/components/prism-toml.js';
import 'prismjs/components/prism-rust.js';
import 'prismjs/components/prism-json.js';
import 'prismjs/components/prism-yaml.js';
import 'prismjs/components/prism-markdown.js';
import 'prismjs/components/prism-typescript.js';
import 'prismjs/components/prism-python.js';
import 'prismjs/components/prism-sql.js';
import 'prismjs/components/prism-diff.js';
import 'prismjs/components/prism-ini.js';
import { Check, Copy, Terminal } from 'lucide-react';
import { MermaidDiagram } from './MermaidDiagram';

interface CodeBlockProps {
  language?: string;
  value: string;
}

// Check if string contains Mermaid diagram declaration
function isMermaidCode(text: string): boolean {
  const trimmed = text.trim();
  return (
    trimmed.startsWith('graph ') ||
    trimmed.startsWith('graph\n') ||
    trimmed.startsWith('flowchart ') ||
    trimmed.startsWith('flowchart\n') ||
    trimmed.startsWith('sequenceDiagram') ||
    trimmed.startsWith('classDiagram') ||
    trimmed.startsWith('stateDiagram') ||
    trimmed.startsWith('erDiagram') ||
    trimmed.startsWith('journey') ||
    trimmed.startsWith('gantt') ||
    trimmed.startsWith('pie') ||
    trimmed.startsWith('gitGraph') ||
    trimmed.startsWith('mindmap')
  );
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getGrammar(language: string): Prism.Grammar | null {
  const lang = (language || 'text').toLowerCase();
  if (lang === 'sh' || lang === 'shell' || lang === 'zsh' || lang === 'bash') {
    return Prism.languages.bash || null;
  }
  if (lang === 'toml') {
    return Prism.languages.toml || null;
  }
  if (lang === 'rust' || lang === 'rs') {
    return Prism.languages.rust || null;
  }
  if (lang === 'json') {
    return Prism.languages.json || null;
  }
  if (lang === 'yaml' || lang === 'yml') {
    return Prism.languages.yaml || null;
  }
  if (lang === 'ts' || lang === 'tsx' || lang === 'typescript') {
    return Prism.languages.typescript || null;
  }
  if (lang === 'js' || lang === 'jsx' || lang === 'javascript') {
    return Prism.languages.javascript || null;
  }
  if (lang === 'py' || lang === 'python') {
    return Prism.languages.python || null;
  }
  if (lang === 'sql') {
    return Prism.languages.sql || null;
  }
  if (lang === 'diff') {
    return Prism.languages.diff || null;
  }
  if (lang === 'ini') {
    return Prism.languages.ini || null;
  }
  if (lang === 'markdown' || lang === 'md' || lang === 'mdx') {
    return Prism.languages.markdown || null;
  }
  return Prism.languages[lang] || null;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language = '', value }) => {
  const [copied, setCopied] = useState(false);

  // If explicitly designated mermaid or looks like mermaid code
  const isMermaid = language.toLowerCase() === 'mermaid' || isMermaidCode(value);

  if (isMermaid) {
    return <MermaidDiagram code={value} />;
  }

  const cleanLang = language.trim().toLowerCase();

  const highlightedHtml = useMemo(() => {
    const grammar = getGrammar(cleanLang);
    if (grammar) {
      try {
        return Prism.highlight(value, grammar, cleanLang);
      } catch {
        return escapeHtml(value);
      }
    }
    return escapeHtml(value);
  }, [value, cleanLang]);

  const handleCopy = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(value).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {});
    }
  };

  const lineCount = value.split('\n').length;
  const showLineNumbers = lineCount > 4 && cleanLang !== 'bash' && cleanLang !== 'sh';

  return (
    <div className="my-5 rounded-lg border border-hairline-outline bg-code-canvas overflow-hidden font-mono text-xs shadow-xs group">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-surface-elevated border-b border-hairline-outline text-[11px] text-text-muted">
        <div className="flex items-center gap-1.5">
          <Terminal className="w-3 h-3 text-secondary" />
          <span className="uppercase tracking-wider font-semibold text-secondary">
            {cleanLang || 'text'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-text-muted hover:text-text-primary transition-colors cursor-pointer px-2 py-0.5 rounded hover:bg-surface-container"
          title="Copy code snippet"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-state-success" />
              <span className="text-state-success font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Display with Syntax Highlighting */}
      <div className="p-4 overflow-x-auto select-all leading-relaxed text-text-body">
        {showLineNumbers ? (
          <div className="flex text-[12px] font-mono leading-relaxed">
            <div className="select-none pr-4 text-right text-text-disabled font-mono border-r border-hairline-subtle mr-4">
              {Array.from({ length: lineCount }).map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <pre className="m-0 flex-1 overflow-x-auto font-mono text-[12px] leading-relaxed">
              <code
                className={`language-${cleanLang || 'text'}`}
                dangerouslySetInnerHTML={{ __html: highlightedHtml }}
              />
            </pre>
          </div>
        ) : (
          <pre className="m-0 font-mono text-[12px] leading-relaxed">
            <code
              className={`language-${cleanLang || 'text'}`}
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />
          </pre>
        )}
      </div>
    </div>
  );
};
