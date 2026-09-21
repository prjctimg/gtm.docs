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

## Build

- The site is a plain **Vite SPA**: `bun run build` runs `vite build` into `dist/` (a `prebuild` step regenerates `public/sitemap.xml`). No build-time browser or HTML snapshotting.
- `scripts/routes.mjs` is the **single source of truth** for the route set (`/`, `/install`, every `/docs/<slug>`); it feeds the sitemap generator so URLs never drift. New docs automatically become routes; no per-doc wiring.
- Content renders entirely client-side: pages mount with real HTML as React commits, so there is no static-head normalization or hydration step. `usePageMeta` (`src/lib/meta.ts`) sets per-page title/description/OG/canonical at runtime — which is correct in production because the browser's origin is the site's origin.
- Vercel runs `bun run build` only, then serves `dist/` with the SPA rewrite in `vercel.json`.

## Generated artifacts

- `public/sitemap.xml` is regenerated on **every build** (`prebuild` → `scripts/generate-sitemap.mjs`). It is gitignored — do **not** commit it.
- `public/og.png` is committed; `scripts/generate-og.mjs` only needs `sharp` when regenerating the image, so no build dependency.
- `dist/` is generated, not committed — it lives inside the gitignored `dist/`.

## Deployment

- Vercel build: `bun run build` → `dist/`. `bun.lock` is committed so Vercel builds with bun deterministically.