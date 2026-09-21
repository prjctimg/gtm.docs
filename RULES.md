# RULES

Project rules for `gtm.docs` — the docs/devlog site for [gtm.rs](https://github.com/prjctimg/gtm.rs).

## Dependencies

- **bun is the package manager.** `bun.lock` is committed; never commit `package-lock.json`, `yarn.lock`, or `pnpm-lock.yaml`.
- `node_modules/` is gitignored. Run `bun install` locally to verify; there is **no install restriction** — bun is the canonical toolchain.
- Add deps with `bun add <pkg>` so both `package.json` and `bun.lock` stay in sync.

## Routing

- The site is a **Vite SPA** with path-based client-side routing via `react-router` (`BrowserRouter`).
- Routes live in `src/App.tsx`. New top-level pages must be registered there.
- Docs live in **`content/*.mdx`** at the repo root (not `src/`). Each file is exposed at `/docs/<slug>` automatically via `src/data/docs.ts`; a route is not needed per doc.
- `vercel.json` rewrites all paths to `/index.html` so deep links, refreshes, and back/forward work in production. Static files in `public/` are still served first.

## Prerendering

- The build **prerenders every real route** with Playwright (Option C: post-build DOM capture) — service worker-free, JS-store-then-hydrate.
- `scripts/routes.mjs` is the **single source of truth** for the route set (`/`, `/install`, every `/docs/<slug>`). It feeds both the sitemap and the prerender step so they can never disagree. New docs automatically become routes; no per-doc wiring.
- `scripts/prerender.mjs` runs after `vite build` (`build` = `vite build && node scripts/prerender.mjs`): it serves `dist/`, renders each route in headless Chromium, normalizes the head deterministically to `https://gtmd.dev` (fixing the `usePageMeta` origin leak that sets canonical/og:url from `window.location.href` during capture), and writes `dist/<path>/index.html` per route.
- The static snapshot has to round-trip through the browser **and** re-parse without diverging from hydration's first commit, so the capture post-processes the DOM: it scrolls through the page (motion `whileInView` sections below the fold would otherwise be captured at `opacity:0`), finishes/strips motion's inline `opacity`/`transform` styles, re-serializes remaining inline styles into React's attribute format (React compares `getAttribute("style")` verbatim), inserts `<!-- -->` separators between adjacent text nodes (same as ReactDOMServer), and serves media with HTTP Range support so `<audio>` reports a real duration.
- `src/main.tsx` hydrates when `#root` already has children (prerendered HTML) and does a plain `createRoot` render otherwise. Components that animate or load asynchronously on mount use `IS_HYDRATING` (`src/lib/hydration.ts`) to keep their first committed render identical to the snapshot.
- Prerendered pages load **real content with JS disabled**; with JS enabled they hydrate and stay fully interactive (theme toggle, mobile drawer, version badge, docs navigation).
- Vercel installs Chromium before building: `bunx playwright install --with-deps chromium`.

## Generated artifacts

- `public/sitemap.xml` is regenerated on **every build** (`prebuild` → `scripts/generate-sitemap.mjs`). It is gitignored — do **not** commit it.
- `public/og.png` is committed; `scripts/generate-og.mjs` only needs `sharp` when regenerating the image, so no build dependency.
- `dist/<path>/index.html` per route is generated, not committed — it lives inside the gitignored `dist/`.

## Deployment

- Vercel build: `bun run build` → `dist/`. `bun.lock` is committed so Vercel builds with bun deterministically.