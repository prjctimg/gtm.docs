// Content loader for the MDX docs in /content
export interface DocItem {
  id: string; // e.g. 'overview', 'getting-started'
  slug: string; // e.g. '/overview/'
  title: string;
  description: string;
  order: number;
  rawContent: string;
  content: string; // without frontmatter
  headings: { id: string; text: string; level: number }[];
  category: string;
}

// Raw MDX files loaded via Vite eager glob
const rawDocs = import.meta.glob<string>('../../content/*.mdx', {
  query: '?raw',
  import: 'default',
  eager: true,
});

// Helper to assign categories based on order or slug
function getDocCategory(order: number, id: string): string {
  if (order <= 4) return 'Getting Started';
  if (order <= 8) return 'Core Features';
  if (order <= 11) return 'Audio & Personalization';
  if (order <= 18) return 'Streaming & Integrations';
  return 'System & Advanced';
}

// Parse frontmatter and headings
function parseDoc(filePath: string, raw: string): DocItem {
  const fileName = filePath.split('/').pop()?.replace(/\.mdx$/, '') || '';
  let title = fileName;
  let description = '';
  let order = 999;
  let content = raw;

  // Frontmatter regex: ^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*[\r\n]+
  const frontmatterMatch = raw.match(/^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*[\r\n]+/);
  if (frontmatterMatch) {
    const fmBlock = frontmatterMatch[1];
    content = raw.slice(frontmatterMatch[0].length);

    const titleMatch = fmBlock.match(/title:\s*["']?([^"'\r\n]+)["']?/);
    if (titleMatch) title = titleMatch[1].trim();

    const descMatch = fmBlock.match(/description:\s*["']?([^"'\r\n]+)["']?/);
    if (descMatch) description = descMatch[1].trim();

    const orderMatch = fmBlock.match(/order:\s*(\d+)/);
    if (orderMatch) order = parseInt(orderMatch[1], 10);
  }

  // Extract headings (## and ###)
  const headings: { id: string; text: string; level: number }[] = [];
  const headingRegex = /^(#{2,3})\s+([^\r\n]+)$/gm;
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    // Skip "On this page" heading itself
    if (text.toLowerCase() === 'on this page') continue;
    
    // Generate anchor ID matching standard markdown/mdx format
    // Notice mdx files use IDs like `_linking-your-account` or `linking-your-account`
    const slug = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    
    headings.push({ id: slug, text, level });
  }

  return {
    id: fileName,
    slug: `/${fileName}/`,
    title,
    description,
    order,
    rawContent: raw,
    content,
    headings,
    category: getDocCategory(order, fileName),
  };
}

// Parse all docs and sort by order
export const ALL_DOCS: DocItem[] = Object.entries(rawDocs)
  .map(([path, raw]) => parseDoc(path, raw))
  .sort((a, b) => a.order - b.order);

// Lookup map by ID
export const DOCS_BY_ID: Record<string, DocItem> = ALL_DOCS.reduce((acc, doc) => {
  acc[doc.id] = doc;
  return acc;
}, {} as Record<string, DocItem>);

// Group docs by category
export const DOCS_BY_CATEGORY: Record<string, DocItem[]> = ALL_DOCS.reduce((acc, doc) => {
  if (!acc[doc.category]) {
    acc[doc.category] = [];
  }
  acc[doc.category].push(doc);
  return acc;
}, {} as Record<string, DocItem[]>);

export const DOC_CATEGORIES = Array.from(
  new Set(ALL_DOCS.map((doc) => doc.category))
);
