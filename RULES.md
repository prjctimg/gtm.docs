# RULES

Project rules for `gtm.docs` — the docs/devlog site for [gtm](https://github.com/prjctimg/gtm).

## Dependencies

- **bun is the package manager.** `bun.lock` is committed; never commit `package-lock.json`, `yarn.lock`, or `pnpm-lock.yaml`.
- `node_modules/` is gitignored. Run `bun install` locally to verify; there is **no install restriction** — bun is the canonical toolchain.
- Add deps with `bun add <pkg>` so both `package.json` and `bun.lock` stay in sync.

## Naming

- **File name == what it exports.** `src/pages/Docs.tsx` exports `Docs`; `src/components/Palette.tsx` exports `Palette`. A component-local props type is `<Name>Props` (`DocsProps`, `PaletteProps`).
- **No role suffix the directory already implies.** `pages/` says page, `components/` says component/widget, `context/` says context — so no `*Page.tsx`, `*Widget.tsx`, `*Context.tsx`, `*Manager.tsx`, or `*Renderer.tsx`. Name the *thing* (`Nav`, `InstallTabs`, `Theme`), not its job.
- **Keep partitive/identity compounds** when the bare form would be ambiguous or collide with a library: `CodeBlock` (not `Code` — that is also a lucide icon), `AudioPlayer`, `Doodles`, `Scroll`.
- Module names are for humans. Never sweep a rename across the word "Page" — `usePageMeta` and user-visible copy like "Page not found" are domain words, not filenames.

## Content

- **`content/*.mdx` is the only source of page text** — prose, titles, descriptions, headings, the sidebar tree, prev/next, search entries and the sitemap all read from it. Do not put page copy in a component, in `src/data/site.ts`, or in a build script. UI chrome (nav labels, aria-labels, tooltips, callout badges) is the exception and stays in code.
- Every file is a page, routed by its frontmatter. Required: `title`, `description`, `category`, `sidebar.order`. Optional: `path` — the route, defaulting to `/docs/<file-name>`. Pages under `/docs/` form the sidebar categories and the prev/next sequence; any other `path` is a top-level page, listed after the categories in the nav.
- Frontmatter keys are read flat (`sidebar:` + `order:` collapses to `order`), so there is no nesting to rely on beyond that.
- Do **not** add an `updatedAt` field. A page's last-modified date is the commit date of its file, fetched at runtime by `useCommitDate` (`src/lib/commit-date.ts`), so there is no timestamp to forget to regenerate.
- `src/data/content.ts` is the registry: it globs the directory, parses frontmatter, and exports the lookups (`PAGES_BY_PATH`, `DOCS_BY_ID`, `DOCS`, `EXTRA_PAGES`, `DOC_CATEGORIES`, `FIRST_DOC`). `scripts/routes.mjs` parses the same frontmatter independently for the sitemap — keep the two in step when the schema changes.
- Content files link to each other by file name (`/configuration/`), by the route they are served at (`/install`), or with an anchor (`/interface/#custom-keybindings`). `Markdown.tsx` resolves all three through the registry and leaves anything unknown as a plain link.

## Routing

- The site is a **Vite SPA** with path-based client-side routing via `react-router` (`BrowserRouter`).
- Routes live in `src/App.tsx`. New top-level pages must be registered there.
- Every content page is served by a single wildcard route in `src/App.tsx` that renders `src/pages/Doc.tsx`; it looks the URL up in the registry and shows the 404 page when nothing matches. Do not add a route per doc.
- `vercel.json` rewrites all paths to `/index.html` so deep links, refreshes, and back/forward work in production. Static files in `public/` are still served first.

## Build

- The site is a plain **Vite SPA**: `bun run build` runs `vite build` into `dist/` (a `prebuild` step regenerates `public/sitemap.xml`). No build-time browser or HTML snapshotting.
- `scripts/routes.mjs` is the **single source of truth** for the route set (`/`, every content page at its declared path); it feeds the sitemap generator so URLs never drift. New content files automatically become routes; no per-page wiring.
- Content renders entirely client-side: pages mount with real HTML as React commits, so there is no static-head normalization or hydration step. `usePageMeta` (`src/lib/meta.ts`) sets per-page title/description/OG/canonical at runtime — which is correct in production because the browser's origin is the site's origin.
- Vercel runs `bun run build` only, then serves `dist/` with the SPA rewrite in `vercel.json`.

## Generated artifacts

- `public/sitemap.xml` is regenerated on **every build** (`prebuild` → `scripts/generate-sitemap.mjs`). It is gitignored — do **not** commit it.
- `public/og.png` is committed; `scripts/generate-og.mjs` only needs `sharp` when regenerating the image, so no build dependency.
- `dist/` is generated, not committed — it lives inside the gitignored `dist/`.

## Deployment

- Vercel build: `bun run build` → `dist/`. `bun.lock` is committed so Vercel builds with bun deterministically.