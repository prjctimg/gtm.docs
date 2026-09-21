#!/usr/bin/env node
/**
 * Option C — Playwright post-build DOM capture (runs after `vite build`).
 *
 * Serves the freshly built `dist/` over a local static server, renders every
 * real route in headless Chromium with JS enabled, captures the fully
 * rendered DOM, then normalizes the head deterministically (fixes the
 * `usePageMeta` origin leak, where canonical/og:url are set from
 * `window.location.href` during capture) and writes per-route HTML files:
 *
 *   /                -> dist/index.html
 *   /install         -> dist/install/index.html
 *   /docs/<slug>     -> dist/docs/<slug>/index.html
 *
 * Each file keeps the app's script tags, so hydrated navigation still works
 * client-side; unmapped URLs fall through to Vercel's rewrite to index.html.
 *
 * Requires: `bunx playwright install --with-deps chromium` once per env.
 */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { buildRoutes, SITE_URL } from './routes.mjs';

const DIST = join(process.cwd(), 'dist');
const INDEX = join(DIST, 'index.html');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.webmanifest': 'application/manifest+json',
  '.txt': 'text/plain; charset=utf-8',
};

/** Minimal static server with an SPA fallback to index.html on 404. Media
 *  elements require HTTP Range support to report a real duration, so serve
 *  `Range: bytes=...` requests with a 206 just like a production host. */
function serveDist() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
      let file = join(DIST, pathname === '/' ? 'index.html' : pathname);
      if (!file.startsWith(DIST)) {
        res.writeHead(403).end();
        return;
      }
      if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
      if (!existsSync(file) || !statSync(file).isFile()) file = INDEX;
      const stat = statSync(file);
      const range = req.headers.range;
      if (range) {
        const match = /bytes=(\d*)-(\d*)/.exec(range);
        if (match) {
          const start = match[1] ? parseInt(match[1], 10) : 0;
          const end = match[2] ? Math.min(parseInt(match[2], 10), stat.size - 1) : stat.size - 1;
          if (start >= 0 && end >= start && start < stat.size) {
            const fd = readFileSync(file);
            res.writeHead(206, {
              'Content-Type': MIME[extname(file)] ?? 'application/octet-stream',
              'Content-Range': `bytes ${start}-${end}/${stat.size}`,
              'Accept-Ranges': 'bytes',
              'Content-Length': String(end - start + 1),
            });
            res.end(fd.subarray(start, end + 1));
            return;
          }
        }
      }
      res.writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' });
      res.end(readFileSync(file));
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

/** Escape text for safe embedding in HTML attributes/content. */
function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Deterministic head for the route: title, then a single canonical, and the
 * description / og / twitter metas — any copies leaked by usePageMeta during
 * capture are stripped first so exactly one of each survives.
 */
function normalizeHead(html, route) {
  const { title, description } = route;
  const url = route.path === '/' ? SITE_URL : `${SITE_URL}${route.path}`;

  html = html.replace(/<title[^>]*>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`);
  // Drop every head element this script owns, wherever it ended up.
  html = html.replace(/<link\b[^>]*rel="canonical"[^>]*>\s*/gi, '');
  for (const attr of ['name="description"', 'property="og:url"', 'property="og:title"', 'property="og:description"', 'name="twitter:title"', 'name="twitter:description"']) {
    html = html.replace(new RegExp(`<meta\\b[^>]*${attr}[^>]*>\\s*`, 'gi'), '');
  }
  // Insert the canonical set right after the title.
  const meta = [
    `<link rel="canonical" href="${esc(url)}">`,
    `<meta name="description" content="${esc(description)}">`,
    `<meta property="og:url" content="${esc(url)}">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(description)}">`,
    `<meta name="twitter:title" content="${esc(title)}">`,
    `<meta name="twitter:description" content="${esc(description)}">`,
  ].join('\n    ');
  return html.replace(/(<\/title>)/i, `$1\n    ${meta}`);
}

async function main() {
  if (!existsSync(INDEX)) {
    console.error('✗ dist/ is missing — run `bun run build` (vite build) first.');
    process.exit(1);
  }

  const routes = buildRoutes();
  const server = await serveDist();
  const port = server.address().port;
  const origin = `http://127.0.0.1:${port}`;

  // --no-sandbox + --disable-dev-shm-usage are required in containerized
  // build images (Vercel runs the build as root with a small /dev/shm).
  const browser = await chromium.launch({
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  // Capture the app's own DOM deterministically: block anything off-origin
  // (the GitHub releases call for the version badge, webfonts) so the result
  // never depends on network state. The <link> tags stay in the HTML, so a
  // real visitor's browser still loads fonts normally.
  await page.route('**/*', (route) => {
    const host = new URL(route.request().url()).hostname;
    if (host === '127.0.0.1' || host === 'localhost') route.continue();
    else route.abort();
  });

  let written = 0;
  for (const r of routes) {
    await page.goto(`${origin}${r.path}`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#root > *', { timeout: 15_000 });
    await page.waitForTimeout(400);

    // Motion `whileInView` sections below the fold sit at their `initial`
    // styles (opacity:0 / translateY) until scrolled into view, so without
    // this the captured HTML would hide whole page sections from crawlers.
    // Scroll through the page so every entrance animation completes and the
    // static DOM holds the same visible (final) state hydration renders — on
    // hydration IS_HYDRATING skips the animations, so both agree. End back at
    // the top so scroll spies start at the document's natural position.
    await page.evaluate(async () => {
      const height = document.body.scrollHeight;
      const step = Math.max(400, Math.round(height / 10));
      for (let y = 0; y <= height; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 30));
      }
      window.scrollTo(0, 0);
    });
    // Let every entrance animation finish (longest variant is 0.7s), force-finish
    // stragglers, then drop motion's inline styles.
    await page.waitForTimeout(900);
    await page.evaluate(() => {
      document.getAnimations?.().forEach((a) => {
        try {
          a.finish();
        } catch {
          /* infinite animations can't finish — leave them */
        }
      });
    });

    // Mermaid renders are serialized through a module-level promise queue
    // (concurrent .render() calls race and intermittently fail), so wait until
    // every diagram host has committed content before serializing — this keeps
    // a slow diagram from being captured empty or as a spurious error box. A
    // timeout here is not fatal: an empty host is still hydration-clean, and
    // the serialization step below runs regardless.
    try {
      await page.waitForFunction(
        () =>
          [...document.querySelectorAll('[data-mermaid-host]')].every(
            (el) => el.childElementCount > 0,
          ),
        undefined,
        { timeout: 10_000, polling: 500 },
      );
    } catch {
      console.warn(`⚠ mermaid render(s) unfinished on ${r.path} — capturing as-is`);
    }

    // Framer-motion leaves its finished animations behind as inline styles
    // ("opacity:1;transform:none", or mid-flight values for a section that
    // was still animating). The hydrating client (IS_HYDRATING) never writes
    // those, so remove any inline style consisting solely of motion properties:
    // the content is already at its final visible state, and dropping the
    // attribute keeps the static DOM identical to hydration's first commit.
    //
    // Everything below must run atomically inside ONE evaluate: React re-renders
    // on the telemetry 1s tick and framer-motion re-asserts its inline styles,
    // so any gap between "fix the styles" and "serialize" lets the live app
    // undo our work (the earlier run captured freshly re-written styles). Strip
    // motion styles, re-serialize the remaining styles into React's attribute
    // format, insert text-node separators, then serialize in the same step.
    const html = await page.evaluate(() => {
      const motionProps = new Set(['opacity', 'transform', 'translate', 'rotate', 'scale']);
      // A diagram host holding the error box (real syntax errors) must not
      // ship in the static HTML: hydration's first commit renders an empty
      // host, so an errored box would read as a mismatch. Blank it — the
      // client re-places content during effects, so nothing is lost.
      for (const el of document.querySelectorAll('[data-mermaid-host]')) {
        const first = el.firstElementChild;
        if (
          first &&
          typeof first.className === 'string' &&
          first.className.includes('state-error')
        ) {
          el.textContent = '';
        }
      }
      for (const el of document.querySelectorAll('[style]')) {
        const decl = el.style;
        let onlyMotion = decl.length > 0;
        for (let i = 0; i < decl.length; i++) {
          if (!motionProps.has(decl[i])) {
            onlyMotion = false;
            break;
          }
        }
        if (onlyMotion) {
          el.removeAttribute('style');
          continue;
        }
        // React's hydration compares `getAttribute("style")` — the raw
        // attribute string — against its own serialization (kebab-case names,
        // no spaces after colons, no trailing semicolon, e.g. "height:8%").
        // The live DOM carries the browser's CSSOM-canonical form
        // ("height: 8%;"), so re-serialize from the parsed declaration.
        const parts = [];
        for (let i = 0; i < decl.length; i++) {
          const value = decl.getPropertyValue(decl[i]).trim();
          if (value) parts.push(`${decl[i]}:${value}`);
        }
        if (parts.length > 0) el.setAttribute('style', parts.join(';'));
        else el.removeAttribute('style');
      }
      // React renders adjacent text expressions ("© ", 2026, ", ") as separate
      // text nodes, but serializing and re-parsing the DOM merges them back into
      // one — which hydration then reports as a mismatch. ReactDOMServer avoids
      // this by emitting `<!-- -->` separators between such text runs; mirror
      // that here so the static DOM round-trips into the same text-node layout.
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
      );
      let node = walker.nextNode();
      while (node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const children = node.childNodes;
          for (let i = 0; i < children.length - 1; i++) {
            if (children[i].nodeType === Node.TEXT_NODE && children[i + 1].nodeType === Node.TEXT_NODE) {
              node.insertBefore(document.createComment(''), children[i + 1]);
              i += 1; /* skip the freshly inserted comment */
            }
          }
        }
        node = walker.nextNode();
      }
      return document.documentElement.outerHTML;
    });

    const out = join(DIST, r.file);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, `<!DOCTYPE html>\n${normalizeHead(html, r)}`);
    written += 1;
    console.log(`✓ prerendered ${r.path}  -> ${r.file}`);
  }

  await browser.close();
  server.close();
  console.log(`\nDone — ${written} route(s) written to dist/.`);

  if (!process.env.CI) {
    // Leave the server running briefly is not needed; close is enough.
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});