/**
 * Media files live under `public/media/` — `static/` for images and audio,
 * `gif/` for animations — and are authored the way they sit on disk:
 * `media/static/gtm.png`, `media/gif/terminal-player-demo.gif`. The leading
 * slash and the `public/` prefix are both optional.
 *
 * Everything under `public/` is served from the origin root, so a path has to
 * be anchored before it reaches an `src`. Left document-relative, the browser
 * resolves it against the current route: on `/docs/tui` the src
 * `media/static/gtm.png` becomes `/docs/media/static/gtm.png`, which misses the
 * file and — because the SPA rewrite answers every unknown path with
 * `index.html` — comes back as a 200 of HTML that fails to decode. That is why
 * a media path that "does not resolve" shows a broken image rather than a 404.
 *
 * Only `media/` paths are rewritten. Anything else is left exactly as written:
 * absolute URLs, `data:` URIs, the `AudioPlayer` pseudo-schemes (`synth:`,
 * `demo:`), and paths that were genuinely meant to be relative to the route.
 */
export function resolveMediaPath(path: string): string {
  if (!path) return path;

  // Any scheme at all — http:, https:, data:, blob:, synth:, demo:.
  if (/^[a-z][a-z0-9+.-]*:/i.test(path)) return path;

  const rooted = path.trim().replace(/^\.\//, '').replace(/^public\//, '');
  if (rooted !== 'media' && !rooted.startsWith('media/')) return path;

  return `/${rooted}`;
}

/**
 * The bare filename of a media path, for labels that name the file without
 * repeating its directory: `media/static/card-themes.png` → `card-themes.png`.
 * Query strings and fragments are dropped so a cache-busting suffix does not
 * end up in the label.
 */
export function mediaName(path: string): string {
  const filename = resolveMediaPath(path).split(/[?#]/)[0].split('/').pop();
  return filename || path;
}
