#!/usr/bin/env node
/**
 * Single source of truth for the site's route set.
 *
 * Consumed by:
 *   - scripts/generate-sitemap.mjs (sitemap entries)
 *
 * So the sitemap can never disagree about what routes exist. Node-only — no
 * dependencies.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const SITE_URL = 'https://gtmd.dev';
export const CONTENT_DIR = join(process.cwd(), 'content');

export const HOME_TITLE = 'gtm - Docs';
export const HOME_DESCRIPTION = '📻 gtm is a feature rich terminal audio player.';
export const INSTALL_TITLE = 'Install | gtm';
export const INSTALL_DESCRIPTION =
  'Install methods for gtm: the install script, crates.io, a source build, and Termux.';

/**
 * @typedef {{ path: string, file: string, title: string, description: string }} Route
 */

/** Parse `title:` / `description:` out of an MDX frontmatter block. */
function frontmatter(mdx) {
  const fm = mdx.match(/^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*[\r\n]+/)?.[1] ?? '';
  const match = (key) =>
    (fm.match(new RegExp(`${key}:\\s*["']?([^"'\r\n]+)["']?`))?.[1] ?? '').trim();
  return { title: match('title'), description: match('description') };
}

/** Every doc slug, sorted by name (same set `src/data/docs.ts` exposes). */
export function docSlugs() {
  return readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''))
    .sort();
}

/** The full route set: home + install + every /docs/<slug>. */
export function buildRoutes() {
  const routes = [
    { path: '/', file: 'index.html', title: HOME_TITLE, description: HOME_DESCRIPTION },
    { path: '/install', file: 'install/index.html', title: INSTALL_TITLE, description: INSTALL_DESCRIPTION },
  ];
  for (const slug of docSlugs()) {
    const { title, description } = frontmatter(readFileSync(join(CONTENT_DIR, `${slug}.mdx`), 'utf8'));
    routes.push({
      path: `/docs/${slug}`,
      file: `docs/${slug}/index.html`,
      title: `${title} | gtm`,
      description,
    });
  }
  return routes;
}