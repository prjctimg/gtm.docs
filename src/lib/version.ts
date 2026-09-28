import { useEffect, useState } from 'react';

/**
 * Latest public release of the gtm binary, resolved from the GitHub releases
 * API. Displayed next to the brand in the navbar.
 */
export const RELEASES_API =
  'https://api.github.com/repos/prjctimg/gtm/releases/latest';

/** Human-facing page for the latest release (current + historical). */
export const RELEASES_URL = 'https://github.com/prjctimg/gtm/releases/latest';

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

export const RELEASES_ALL_API =
  'https://api.github.com/repos/prjctimg/gtm/releases?per_page=30';

const ALL_TAGS_CACHE_KEY = 'gtm:all-release-tags';

export const FALLBACK_RELEASE_TAGS = [
  'v0.2.83',
  'v0.2.82',
  'v0.2.74',
  'v0.2.73',
  'v0.2.71',
  'v0.2.7',
  'v0.2.6',
  'v0.2.5',
  'v0.2.4',
  'v0.1.9',
  'v0.1.8',
  'v0.1.7',
  'v0.1.6',
  'v0.1.5',
  'v0.1.4',
  'v0.1.3',
  'v0.1.2',
];

export interface AllReleaseTagsData {
  latestStable: string;
  hasNightly: boolean;
  pastVersions: string[];
  loading: boolean;
}

export function useAllReleaseTags(): AllReleaseTagsData {
  const [tags, setTags] = useState<string[]>(() => {
    try {
      const raw = window.sessionStorage.getItem(ALL_TAGS_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      /* ignore */
    }
    return ['nightly', ...FALLBACK_RELEASE_TAGS];
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch(RELEASES_ALL_API, {
      headers: { Accept: 'application/vnd.github+json' },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: unknown) => {
        if (cancelled || !Array.isArray(data)) return;
        const fetchedTags = data
          .map((item: any) => item?.tag_name)
          .filter((t): t is string => typeof t === 'string' && t.trim().length > 0);

        if (fetchedTags.length > 0) {
          try {
            window.sessionStorage.setItem(ALL_TAGS_CACHE_KEY, JSON.stringify(fetchedTags));
          } catch {
            /* ignore */
          }
          setTags(fetchedTags);
        }
      })
      .catch(() => {
        /* offline or rate-limited */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const hasNightly = tags.some((t) => t.toLowerCase().includes('nightly'));
  const nonNightly = tags.filter((t) => !t.toLowerCase().includes('nightly'));
  const latestStable = nonNightly[0] || 'v0.2.83';
  const pastVersions = nonNightly.slice(1);

  return {
    latestStable,
    hasNightly,
    pastVersions,
    loading,
  };
}

