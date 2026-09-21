import { useEffect, useState } from 'react';

/**
 * Latest public release of the gtm binary, resolved from the GitHub releases
 * API. Displayed next to the brand in the navbar.
 */
export const RELEASES_API =
  'https://api.github.com/repos/prjctimg/gtm.rs/releases/latest';

/** Human-facing page for the latest release (current + historical). */
export const RELEASES_URL = 'https://github.com/prjctimg/gtm.rs/releases/latest';

const CACHE_KEY = 'gtm:latest-release';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

interface CacheEntry {
  tag: string;
  at: number;
}

function readCache(): string | null {
  try {
    const raw = window.sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry;
    if (!parsed.tag || Date.now() - parsed.at > CACHE_TTL_MS) return null;
    return parsed.tag;
  } catch {
    return null;
  }
}

function writeCache(tag: string) {
  try {
    const entry: CacheEntry = { tag, at: Date.now() };
    window.sessionStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    /* storage unavailable — ignore */
  }
}

/**
 * Resolves the latest release tag (e.g. `v0.2.83`) once per session. Returns
 * `null` while unknown or if the API is unreachable, so callers can render
 * nothing rather than a placeholder.
 */
export function useLatestReleaseTag(): string | null {
  const [tag, setTag] = useState<string | null>(() => readCache());

  useEffect(() => {
    if (tag) return;

    let cancelled = false;

    fetch(RELEASES_API, {
      headers: { Accept: 'application/vnd.github+json' },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: unknown) => {
        const value = (data as { tag_name?: unknown } | null)?.tag_name;
        if (cancelled || typeof value !== 'string' || value.length === 0) return;
        writeCache(value);
        setTag(value);
      })
      .catch(() => {
        /* offline or rate-limited — the badge simply stays hidden */
      });

    return () => {
      cancelled = true;
    };
  }, [tag]);

  return tag;
}
