#!/usr/bin/env node
/**
 * Single source of truth for the site's route set.
 *
 * Consumed by:
 *   - scripts/generate-sitemap.mjs (sitemap entries)
 *
 * The route set is derived from `content/*.mdx` the same way the app derives it
 * (`src/data/content.ts`): a file is served at its `path:` frontmatter, or at
 * `/docs/<file-name>` when it declares none. So the sitemap can never disagree
 * about what routes exist, and a new content file is a new route with no wiring.
 *
 * Node-only — no dependencies.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const SITE_URL = 'https://gtmd.dev';
export const CONTENT_DIR = join(process.cwd(), 'content');

export const HOME_TITLE = 'gtm - Docs';
export const HOME_DESCRIPTION = '📻 gtm is a feature rich terminal audio player.';

/**
 * @typedef {{ id: string, path: string, title: string, description: string, order: number }} ContentPage
 * @typedef {{ path: string, file: string, title: string, description: string }} Route
 */

/**
 * Flat frontmatter keys. Indentation is not significant, so a `key:` line
 * followed by an indented line collapses to two sibling keys.
 * @returns {Record<string, string>}
 */
function frontmatter(mdx) {
  const block = mdx.match(/^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*[\r\n]+/)?.[1] ?? '';
  const data = {};
  for (const line of block.split(/\r?\n/)) {
    const pair = line.match(/^\s*([A-Za-z][\w-]*):\s*(.*)$/);
    if (pair) data[pair[1]] = pair[2].trim().replace(/^["']/, '').replace(/["']$/, '');
  }
  return data;
}

/** Every content file as the SPA serves it, in the same order the sidebar uses. */
export function contentPages() {
  return readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => {
      const data = frontmatter(readFileSync(join(CONTENT_DIR, f), 'utf8'));
      const id = f.replace(/\.mdx$/, '');
      const order = Number.parseInt(data.order ?? '', 10);
      return {
        id,
        path: data.path || `/docs/${id}`,
        title: data.title || id,
        description: data.description || '',
        order: Number.isFinite(order) ? order : 999,
      };
    })
    .sort((a, b) => a.order - b.order);
}

/** The full route set: home plus every content page, at its declared path. */
export function buildRoutes() {
  const routes = [{ path: '/', file: 'index.html', title: HOME_TITLE, description: HOME_DESCRIPTION }];

  for (const page of contentPages()) {
    routes.push({
      path: page.path,
      file: `${page.path.replace(/^\//, '')}/index.html`,
      title: `${page.title} | gtm`,
      description: page.description,
    });
  }

  return routes;
}
