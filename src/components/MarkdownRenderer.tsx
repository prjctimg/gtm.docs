import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  ExternalLink, 
  Info, 
  Lightbulb, 
  AlertTriangle, 
  Hash 
} from 'lucide-react';
import { CodeBlock } from './CodeBlock';

interface MarkdownRendererProps {
  content: string;
  onNavigateDoc?: (docId: string, anchorId?: string) => void;
}

// Helper to extract text from React children
function extractText(children: React.ReactNode): string {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(extractText).join('');
  if (React.isValidElement(children) && children.props) {
    return extractText((children.props as { children?: React.ReactNode }).children);
  }
  return '';
}

// Convert heading text to safe slug
function slugify(text: string): string {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// Chunks content into markdown segments and :::note/tip/caution callout blocks
interface ContentSegment {
  type: 'markdown' | 'callout';
  calloutType?: 'note' | 'tip' | 'caution' | 'warning';
  body: string;
}

function parseContentSegments(rawContent: string): ContentSegment[] {
  // First, strip the redundant "## On this page\n...\n---" block if present at the top
  const cleanedContent = (rawContent || '').replace(
    /^##\s+On this page[\s\S]*?(?:---\s*[\r\n]+)/m,
    ''
  );

  const segments: ContentSegment[] = [];
  const calloutRegex = /:::(note|tip|caution|warning)\s*([\s\S]*?):::/g;
  let lastIndex = 0;
  let match;

  while ((match = calloutRegex.exec(cleanedContent)) !== null) {
    const start = match.index;
    const end = calloutRegex.lastIndex;

    // Preceding markdown text
    if (start > lastIndex) {
      const mdText = cleanedContent.substring(lastIndex, start);
      if (mdText.trim()) {
        segments.push({ type: 'markdown', body: mdText });
      }
    }

    // Callout segment
    const calloutType = match[1].toLowerCase() as 'note' | 'tip' | 'caution' | 'warning';
    segments.push({
      type: 'callout',
      calloutType,
      body: match[2].trim(),
    });

    lastIndex = end;
  }

  // Trailing markdown text
  if (lastIndex < cleanedContent.length) {
    const trailing = cleanedContent.substring(lastIndex);
    if (trailing.trim()) {
      segments.push({ type: 'markdown', body: trailing });
    }
  }

  if (segments.length === 0 && cleanedContent.trim()) {
    segments.push({ type: 'markdown', body: cleanedContent });
  }

  return segments;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  onNavigateDoc,
}) => {
  const segments = parseContentSegments(content);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href?: string) => {
    if (!href) return;

    // Internal doc links: e.g. /getting-started/ or /configuration/#time_format or #_volume-mute
    if (href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.replace(/^#/, '');
      const el = document.getElementById(targetId) || document.getElementById(`_${targetId}`) || document.getElementById(targetId.replace(/^_/, ''));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    if (href.startsWith('/')) {
      e.preventDefault();
      // Parse out docId and optional hash
      const [path, hash] = href.split('#');
      const docId = path.replace(/^\//, '').replace(/\/$/, '');
      if (onNavigateDoc && docId) {
        onNavigateDoc(docId, hash);
      }
      return;
    }
  };

  const renderMarkdownComponent = (mdText: string) => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => {
            const text = extractText(children);
            const slug = slugify(text);
            return (
              <div id={slug} className="scroll-mt-24 pt-6 pb-2 group">
                {/* Secondary anchor target with underscore prefix */}
                <span id={`_${slug}`} className="block -mt-24 pt-24 invisible" />
                <h2 className="text-xl sm:text-2xl font-mono font-bold text-text-primary flex items-center gap-2 border-b border-hairline-outline pb-2.5">
                  <span>{children}</span>
                  <a
                    href={`#${slug}`}
                    onClick={(e) => handleLinkClick(e, `#${slug}`)}
                    className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-secondary transition-opacity"
                    title="Direct link"
                  >
                    <Hash className="w-4 h-4" />
                  </a>
                </h2>
              </div>
            );
          },
          h3: ({ children }) => {
            const text = extractText(children);
            const slug = slugify(text);
            return (
              <div id={slug} className="scroll-mt-24 pt-4 pb-1 group">
                <span id={`_${slug}`} className="block -mt-24 pt-24 invisible" />
                <h3 className="text-base sm:text-lg font-mono font-bold text-text-primary flex items-center gap-2">
                  <span>{children}</span>
                  <a
                    href={`#${slug}`}
                    onClick={(e) => handleLinkClick(e, `#${slug}`)}
                    className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-secondary transition-opacity"
                    title="Direct link"
                  >
                    <Hash className="w-3.5 h-3.5" />
                  </a>
                </h3>
              </div>
            );
          },
          h4: ({ children }) => (
            <h4 className="text-sm font-mono font-bold text-text-primary pt-3 pb-1">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="my-3 text-sm text-text-body leading-relaxed font-sans">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="my-3 ml-5 list-disc space-y-1.5 text-sm text-text-body leading-relaxed">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-3 ml-5 list-decimal space-y-1.5 text-sm text-text-body leading-relaxed">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-1">{children}</li>,
          a: ({ href, children }) => {
            const isExternal = href?.startsWith('http://') || href?.startsWith('https://');
            return (
              <a
                href={href}
                onClick={(e) => handleLinkClick(e, href)}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noreferrer' : undefined}
                className="text-secondary hover:text-primary transition-colors underline decoration-secondary/40 underline-offset-2 inline-flex items-center gap-0.5"
              >
                <span>{children}</span>
                {isExternal && <ExternalLink className="w-3 h-3 text-text-muted inline ml-0.5" />}
              </a>
            );
          },
          pre: ({ children }) => <>{children}</>,
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && !String(children).includes('\n');

            if (isInline) {
              const { node: _node, ...domProps } = props as Record<string, unknown>;
              return (
                <code
                  className="px-1.5 py-0.5 rounded bg-surface-elevated text-secondary border border-hairline-outline font-mono text-[12px]"
                  {...domProps}
                >
                  {children}
                </code>
              );
            }

            return (
              <CodeBlock
                language={match ? match[1] : ''}
                value={String(children).replace(/\n$/, '')}
              />
            );
          },
          table: ({ children }) => (
            <div className="my-5 border border-hairline-outline bg-surface-container rounded-lg overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="border-b border-hairline-outline bg-surface-elevated text-text-muted uppercase text-[11px]">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="py-2.5 px-3 font-semibold tracking-wider">
              {children}
            </th>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-surface-elevated/30 transition-colors border-b border-hairline-subtle last:border-b-0">
              {children}
            </tr>
          ),
          td: ({ children }) => (
            <td className="py-2.5 px-3 text-text-body align-top">
              {children}
            </td>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-4 pl-4 border-l-2 border-secondary bg-surface-container/60 py-2.5 pr-4 rounded-r text-sm text-text-body italic">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-8 border-hairline-outline" />,
        }}
      >
        {mdText}
      </ReactMarkdown>
    );
  };

  const renderCallout = (type: string, body: string) => {
    let icon = <Info className="w-4 h-4 text-secondary shrink-0" />;
    let borderColor = 'border-secondary/35';
    let leftBorderColor = 'border-l-secondary';
    let bgColor = 'bg-secondary/5';
    let headerBg = 'bg-secondary/10';
    let titleColor = 'text-secondary';
    let badgeText = 'Note';

    if (type === 'tip') {
      icon = <Lightbulb className="w-4 h-4 text-state-success shrink-0" />;
      borderColor = 'border-state-success/35';
      leftBorderColor = 'border-l-state-success';
      bgColor = 'bg-state-success/5';
      headerBg = 'bg-state-success/10';
      titleColor = 'text-state-success';
      badgeText = 'Tip';
    } else if (type === 'caution' || type === 'warning') {
      icon = <AlertTriangle className="w-4 h-4 text-state-warning shrink-0" />;
      borderColor = 'border-state-warning/35';
      leftBorderColor = 'border-l-state-warning';
      bgColor = 'bg-state-warning/5';
      headerBg = 'bg-state-warning/10';
      titleColor = 'text-state-warning';
      badgeText = type === 'warning' ? 'Warning' : 'Caution';
    }

    return (
      <aside
        role="note"
        aria-label={badgeText}
        className={`my-6 rounded-lg border border-l-4 ${leftBorderColor} ${borderColor} ${bgColor} overflow-hidden shadow-xs`}
      >
        <div className={`flex items-center gap-2.5 px-4 py-2.5 border-b ${borderColor} ${headerBg}`}>
          <div className="p-1 rounded bg-canvas-obsidian/60 border border-hairline-outline/60 flex items-center justify-center">
            {icon}
          </div>
          <span className={`font-mono text-xs sm:text-sm font-bold tracking-wide uppercase ${titleColor}`}>
            {badgeText}
          </span>
        </div>
        <div className="px-4 py-3.5 text-text-body text-xs sm:text-sm leading-relaxed [&>p:first-child]:mt-0 [&>p:last-child]:mb-0 [&>p]:leading-relaxed font-sans">
          {renderMarkdownComponent(body)}
        </div>
      </aside>
    );
  };

  return (
    <div className="w-full space-y-2">
      {segments.map((seg, idx) => (
        <React.Fragment key={idx}>
          {seg.type === 'callout'
            ? renderCallout(seg.calloutType || 'note', seg.body)
            : renderMarkdownComponent(seg.body)}
        </React.Fragment>
      ))}
    </div>
  );
};
