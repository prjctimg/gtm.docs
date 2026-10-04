import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router';
import { 
  ExternalLink, 
  Info, 
  Lightbulb, 
  AlertTriangle, 
  Hash 
} from 'lucide-react';
import { CodeBlock } from './CodeBlock';
import { Gif } from './Gif';
import { AudioPlayer } from './AudioPlayer';
import { DOCS_BY_ID, pageAtPath } from '../data/content';
import { resolveMediaPath } from '../lib/media';
import { slugify } from '../lib/slug';

interface MarkdownProps {
  content: string;
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

// Helper to parse key-values from directives like title="..." src="..." or key=value
function parseAttributes(text: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const regex = /(\w+)=["']([^"']*)["']|(\w+)=([^\s]+)/g;
  let m;
  while ((m = regex.exec(text)) !== null) {
    const key = m[1] || m[3];
    const val = m[2] !== undefined ? m[2] : m[4];
    if (key) attrs[key.toLowerCase()] = val;
  }
  return attrs;
}

// Chunks content into markdown segments and :::note/tip/caution/audio/sound/gif blocks
interface ContentSegment {
  type: 'markdown' | 'callout' | 'audio' | 'gif';
  calloutType?: string;
  body: string;
}

function parseContentSegments(rawContent: string): ContentSegment[] {
  const cleanedContent = rawContent || '';

  const segments: ContentSegment[] = [];
  const calloutRegex = /:::(note|tip|caution|warning|audio|sound|gif)\s*([\s\S]*?):::/g;
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
    const tag = match[1].toLowerCase();
    if (tag === 'audio' || tag === 'sound') {
      segments.push({
        type: 'audio',
        calloutType: tag,
        body: match[2].trim(),
      });
    } else if (tag === 'gif') {
      segments.push({
        type: 'gif',
        calloutType: tag,
        body: match[2].trim(),
      });
    } else {
      segments.push({
        type: 'callout',
        calloutType: tag,
        body: match[2].trim(),
      });
    }

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

export const Markdown = React.memo<MarkdownProps>(
  function Markdown({ content }) {
  const segments = parseContentSegments(content);

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
          p: ({ children, node }) => {
            // Paragraphs holding only an image/gif render block-level media
            // (Gif's <figure>). That nesting is invalid inside <p>, so
            // render a <div> instead.
            const kids = node?.children ?? [];
            const onlyMedia =
              kids.length > 0 &&
              kids.every(
                (c) =>
                  (c.type === 'element' && c.tagName === 'img') ||
                  (c.type === 'text' && !c.value.trim())
              );
            if (onlyMedia) {
              return <div className="my-3">{children}</div>;
            }
            return (
              <p className="my-3 text-sm text-text-body leading-relaxed font-mono">
                {children}
              </p>
            );
          },
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
          img: ({ src, alt }) => {
            if (!src) return null;
            const mediaSrc = resolveMediaPath(src);
            const isGif = mediaSrc.toLowerCase().includes('.gif') || (alt && alt.toLowerCase().includes('[gif]'));
            if (isGif) {
              const cleanAlt = alt?.replace(/\[gif\]/gi, '').trim();
              return <Gif src={mediaSrc} alt={cleanAlt || 'Animated Demonstration'} />;
            }
            return (
              <figure className="my-6 rounded-xl border border-hairline-outline bg-surface-container overflow-hidden shadow-sm">
                <img src={mediaSrc} alt={alt || 'Image'} className="w-full h-auto object-contain max-h-[500px]" />
                {alt && (
                  <figcaption className="px-3.5 py-2 text-center text-xs font-mono text-text-muted bg-surface-elevated/70 border-t border-hairline-subtle">
                    {alt}
                  </figcaption>
                )}
              </figure>
            );
          },
          a: ({ href, children }) => {
            const isAudioFile = href && (
              /\.(mp3|wav|ogg|flac|m4a|aac)(\?.*)?$/i.test(href) ||
              href.startsWith('audio:') ||
              href.startsWith('sound:') ||
              href.startsWith('synth:') ||
              href.startsWith('demo:')
            );

            if (isAudioFile && href) {
              const cleanSrc = resolveMediaPath(href.replace(/^(audio|sound):/, ''));
              const titleText = extractText(children) || 'Audio Sample';
              return (
                <div className="my-3">
                  <AudioPlayer
                    src={cleanSrc}
                    title={titleText}
                    artist="gtm Audio Engine"
                  />
                </div>
              );
            }

            const isExternal = href?.startsWith('http://') || href?.startsWith('https://');

            // Internal links. Content files address each other by file name
            // (/configuration/), by the route they are served at (/install), or
            // with an anchor (/tui/#footer-bar). Anything that
            // resolves to no page stays a plain link.
            if (href?.startsWith('/')) {
              const [path, hash] = href.split('#');
              const slug = path.replace(/^\//, '').replace(/\/$/, '');
              const target = pageAtPath(`/${slug}`) ?? DOCS_BY_ID[slug];
              if (target) {
                return (
                  <Link
                    to={`${target.path}${hash ? `#${hash}` : ''}`}
                    className="text-secondary hover:text-primary transition-colors underline decoration-secondary/40 underline-offset-2 inline-flex items-center gap-0.5"
                  >
                    <span>{children}</span>
                  </Link>
                );
              }
            }

            // In-page anchor links (#section)
            if (href?.startsWith('#')) {
              return (
                <a
                  href={href}
                  className="text-secondary hover:text-primary transition-colors underline decoration-secondary/40 underline-offset-2 inline-flex items-center gap-0.5"
                >
                  <span>{children}</span>
                </a>
              );
            }

            return (
              <a
                href={href}
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
            const lang = match ? match[1].toLowerCase() : '';
            const isInline = !match && !String(children).includes('\n');

            if (isInline) {
              const { node: _node, ...domProps } = props as Record<string, unknown>;
              return (
                <code
                  className="px-1.5 py-0.5 rounded bg-surface-elevated text-secondary border border-hairline-outline font-mono text-xs"
                  {...domProps}
                >
                  {children}
                </code>
              );
            }

            const rawContent = String(children).trim();

            // Embedded Audio codeblock: ```audio ... ```
            if (lang === 'audio' || lang === 'sound') {
              const attrs = parseAttributes(rawContent);
              const lines = rawContent.split('\n');
              const firstLine = lines[0] || '';
              const desc = lines.slice(1).join('\n').trim();
              const audioSrc = resolveMediaPath(attrs['src'] || (firstLine.includes('/') ? firstLine.trim() : '/media/static/audio-equalizer-sample.wav'));
              const audioTitle = attrs['title'] || 'Audio Preview';
              const audioArtist = attrs['artist'] || 'gtm Audio Engine';

              return (
                <AudioPlayer
                  src={audioSrc}
                  title={audioTitle}
                  artist={audioArtist}
                  description={desc || undefined}
                />
              );
            }

            // Embedded GIF codeblock: ```gif ... ```
            if (lang === 'gif') {
              const attrs = parseAttributes(rawContent);
              const lines = rawContent.split('\n');
              const firstLine = lines[0] || '';
              const desc = lines.slice(1).join('\n').trim();
              const gifSrc = resolveMediaPath(attrs['src'] || firstLine.trim());
              const gifCaption = attrs['caption'] || attrs['alt'] || desc || undefined;

              return (
                <Gif
                  src={gifSrc}
                  alt={gifCaption || 'Animated GIF Preview'}
                  caption={gifCaption}
                />
              );
            }

            return (
              <CodeBlock
                language={lang}
                // Strip whole blank lines at either end only. A padded fence
                // would otherwise paint an empty first/last row and push the
                // line-number gutter out of step with the code; trimming any
                // further would eat the first line's own indentation.
                value={String(children).replace(/^\n+/, '').replace(/\n+$/, '')}
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
            <thead className="border-b border-hairline-outline bg-surface-elevated text-text-muted uppercase text-xs">
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

  const renderAudio = (body: string) => {
    const lines = body.split('\n');
    const firstLine = lines[0] || '';
    const attrs = parseAttributes(firstLine);
    const desc = lines.slice(1).join('\n').trim();

    const audioSrc = resolveMediaPath(attrs['src'] || (firstLine.includes('/') || firstLine.startsWith('http') || firstLine.startsWith('demo:') || firstLine.startsWith('synth:') ? firstLine.trim() : '/media/static/audio-equalizer-sample.wav'));
    const audioTitle = attrs['title'] || 'Audio Preview';
    const audioArtist = attrs['artist'] || 'gtm Daemon';

    return (
      <AudioPlayer
        src={audioSrc}
        title={audioTitle}
        artist={audioArtist}
        description={desc || undefined}
      />
    );
  };

  const renderGif = (body: string) => {
    const lines = body.split('\n');
    const firstLine = lines[0] || '';
    const attrs = parseAttributes(firstLine);
    const desc = lines.slice(1).join('\n').trim();

    const gifSrc = resolveMediaPath(attrs['src'] || firstLine.trim());
    const gifCaption = attrs['caption'] || attrs['alt'] || desc || undefined;

    return (
      <Gif
        src={gifSrc}
        alt={gifCaption || 'Animated Preview'}
        caption={gifCaption}
      />
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
        <div className="px-4 py-3.5 text-text-body text-xs sm:text-sm leading-relaxed [&>p:first-child]:mt-0 [&>p:last-child]:mb-0 [&>p]:leading-relaxed font-mono">
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
            : seg.type === 'audio'
            ? renderAudio(seg.body)
            : seg.type === 'gif'
            ? renderGif(seg.body)
            : renderMarkdownComponent(seg.body)}
        </React.Fragment>
      ))}
    </div>
    );
  }
);
