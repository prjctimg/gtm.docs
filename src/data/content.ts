// Content registry for the MDX in /content.
//
// Every `content/*.mdx` file is a page. The frontmatter decides where it lives:
// `path` names the route (default `/docs/<file-name>`). That makes this directory
// the single source of truth for routes, the sidebar, command-palette search,
// prev/next ordering and the sitemap generator (scripts/routes.mjs reads the same
// frontmatter), so adding a page needs no wiring anywhere else.

import { slugify } from '../lib/slug';

export interface PageHeading {
  id: string;
  text: string;
  level: number;
}

export interface PageItem {
  /** File name without extension, e.g. `overview`, `install`. */
  id: string;
  /** Route this page is served at, e.g. `/docs/overview`, `/install`. */
  path: string;
  title: string;
  description: string;
  /** Sort key, shared by the sidebar and the prev/next sequence. */
  order: number;
  /** Body with the frontmatter block removed. */
  content: string;
  headings: PageHeading[];
  category: string;
  /** Served under `/docs/` — the pages that participate in prev/next and categories. */
  isDoc: boolean;
  /** Show the live latest-release version in the page footer. */
  showVersion: boolean;
}

const rawPages = import.meta.glob<string>('../../content/*.mdx', {
  query: '?raw',
  import: 'default',
  eager: true,
});

/**
 * Splits a raw file into flat frontmatter keys and the body. Indentation is not
 * significant, which is deliberate: it lets `sidebar:` followed by an indented
 * `order:` collapse to a single `order` key, and the `sidebar` block is not read
 * for anything else.
 */
function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const block = raw.match(/^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*[\r\n]+/);
  if (!block) return { data: {}, body: raw };

  const data: Record<string, string> = {};
  for (const line of block[1].split(/\r?\n/)) {
    const pair = line.match(/^\s*([A-Za-z][\w-]*):\s*(.*)$/);
    if (!pair) continue;
    data[pair[1]] = pair[2].trim().replace(/^["']/, '').replace(/["']$/, '');
  }
  return { data, body: raw.slice(block[0].length) };
}

/** Table of contents for a page: its own `##`/`###` headings, in document order. */
function parseHeadings(content: string): PageHeading[] {
  const headings: PageHeading[] = [];
  for (const match of content.matchAll(/^(#{2,3})\s+([^\r\n]+)$/gm)) {
    const text = match[2].trim();
    headings.push({ id: slugify(text), text, level: match[1].length });
  }
  return headings;
}

function parsePage(filePath: string, raw: string): PageItem {
  const id = filePath.split('/').pop()?.replace(/\.mdx$/, '') || '';
  const { data, body } = parseFrontmatter(raw);

  const path = data.path || `/docs/${id}`;
  const order = Number.parseInt(data.order ?? '', 10);

  return {
    id,
    path,
    title: data.title || id,
    description: data.description || '',
    order: Number.isFinite(order) ? order : 999,
    content: body,
    headings: parseHeadings(body),
    category: data.category || '',
    isDoc: path.startsWith('/docs/'),
    showVersion: data.showVersion === 'true',
  };
}

/** Every content file, ordered for the sidebar. */
export const ALL_PAGES: PageItem[] = Object.entries(rawPages)
  .map(([path, raw]) => parsePage(path, raw))
  .sort((a, b) => a.order - b.order);

/** Lookup by route — this is what turns a URL into a page. */
export const PAGES_BY_PATH: Record<string, PageItem> = ALL_PAGES.reduce(
  (acc, page) => {
    acc[page.path] = page;
    return acc;
  },
  {} as Record<string, PageItem>
);

/** Lookup by file name — used for `/docs/:docId` and for resolving markdown links. */
export const DOCS_BY_ID: Record<string, PageItem> = ALL_PAGES.reduce((acc, page) => {
  acc[page.id] = page;
  return acc;
}, {} as Record<string, PageItem>);

/** The page a URL belongs to, or undefined when the path is not a content page. */
export function pageAtPath(pathname: string): PageItem | undefined {
  return PAGES_BY_PATH[pathname] ?? PAGES_BY_PATH[pathname.replace(/\/+$/, '')];
}

/** The pages that live in the docs navigation tree and the prev/next sequence. */
export const DOCS: PageItem[] = ALL_PAGES.filter((page) => page.isDoc);

/** The docs landing page, linked from the navbar, the footer and `/docs`. */
export const FIRST_DOC: PageItem | undefined = DOCS[0];

/** Top-level pages that are not part of a category, listed after them in the nav. */
export const EXTRA_PAGES: PageItem[] = ALL_PAGES.filter((page) => !page.isDoc);

export const DOCS_BY_CATEGORY: Record<string, PageItem[]> = DOCS.reduce((acc, doc) => {
  if (!acc[doc.category]) acc[doc.category] = [];
  acc[doc.category].push(doc);
  return acc;
}, {} as Record<string, PageItem[]>);

export const DOC_CATEGORIES = Array.from(new Set(DOCS.map((doc) => doc.category)));
