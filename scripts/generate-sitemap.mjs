#!/usr/bin/env node
/**
 * Generates public/sitemap.xml from the docs in content/ so the sitemap
 * regenerates on every build (runs as the `prebuild` npm script).
 *
 * Every doc in content/*.mdx maps to a /docs/<slug> route. The SPA is a
 * client-side routed app (see vercel.json rewrite), so all URLs here are
 * real navigable paths served by index.html.
 *
 * Node-only — no dependencies, safe to run anywhere bun/node exist.
 */
import { readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const SITE_URL = 'https://gtmd.dev';
const CONTENT_DIR = join(process.cwd(), 'content');
const OUT_DIR = join(process.cwd(), 'public');
const OUT_FILE = join(OUT_DIR, 'sitemap.xml');

const lastmod = new Date().toISOString().slice(0, 10);

/** @param {string} loc @param {string} [priority] @param {string} [changefreq] */
function urlEntry(loc, priority = '0.7', changefreq = 'weekly') {
  return `  <url>
    <loc>${SITE_URL}${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

let entries = [
  urlEntry('/', '1.0', 'weekly'),
  urlEntry('/docs', '0.9', 'weekly'),
  urlEntry('/install', '0.9', 'monthly'),
  urlEntry('/blog', '0.8', 'weekly'),
];

const docSlugs = readdirSync(CONTENT_DIR)
  .filter((f) => f.endsWith('.mdx'))
  .map((f) => f.replace(/\.mdx$/, ''))
  .sort();

for (const slug of docSlugs) {
  entries.push(urlEntry(`/docs/${slug}`, '0.9', 'weekly'));
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_FILE, sitemap + '\n');
console.log(`✓ generated ${OUT_FILE} (${docSlugs.length} docs, ${entries.length} URLs)`);