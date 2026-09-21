#!/usr/bin/env node
/**
 * Generates public/sitemap.xml from the shared route set (scripts/routes.mjs)
 * so the sitemap regenerates on every build (runs as the `prebuild` npm
 * script) and always matches the routes the SPA actually serves.
 *
 * Every route maps to a real navigable path served by index.html via the
 * `vercel.json` SPA rewrite.
 *
 * Node-only — no dependencies.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { SITE_URL, buildRoutes } from './routes.mjs';

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

const routes = buildRoutes();
const entries = routes.map((r) =>
  urlEntry(
    r.path,
    r.path === '/' ? '1.0' : '0.9',
    r.path === '/install' ? 'monthly' : 'weekly',
  ),
);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_FILE, sitemap + '\n');
console.log(`✓ generated ${OUT_FILE} (${routes.length} URLs)`);