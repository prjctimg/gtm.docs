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

## Generated artifacts

- `public/sitemap.xml` is regenerated on **every build** (`prebuild` → `scripts/generate-sitemap.mjs`). It is gitignored — do **not** commit it.
- `public/og.png` is committed; `scripts/generate-og.mjs` only needs `sharp` when regenerating the image, so no build dependency.

## Deployment

- Vercel build: `bun run build` → `dist/`. `bun.lock` is committed so Vercel builds with bun deterministically.