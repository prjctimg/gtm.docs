/**
 * The single anchor-slug algorithm, shared by the content loader (which derives
 * a doc's table of contents from its raw markdown, before render) and the
 * Markdown renderer (which stamps `id` attributes onto the headings it mounts).
 * Both must agree or every in-page anchor and scroll-spy entry breaks.
 */
export function slugify(text: string): string {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

