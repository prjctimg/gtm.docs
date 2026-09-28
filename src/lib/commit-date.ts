import { useEffect, useState } from 'react';

/**
 * Git history of the docs content. A page's "last updated" date is the commit
 * date of the most recent commit that touched its `content/*.mdx` file — there is
 * no timestamp in the frontmatter to fall out of date, and no generator script to
 * forget to run.
 */
const DOCS_REPO = 'prjctimg/gtm.docs';

export const CONTENT_BLOB_URL = `https://github.com/${DOCS_REPO}/blob/main/content`;

function commitsApi(id: string): string {
  return `https://api.github.com/repos/${DOCS_REPO}/commits?path=content/${encodeURIComponent(id)}.mdx&per_page=1`;
}

/** Content mtimes move rarely, so a long cache is safe and keeps the API happy. */
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const cacheKey = (id: string) => `gtm:commit-date:${id}`;

function readCache(id: string): string | null {
  try {
    const raw = window.sessionStorage.getItem(cacheKey(id));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { at: number; iso: string };
    if (!parsed.iso || Date.now() - parsed.at > CACHE_TTL_MS) return null;
    return parsed.iso;
  } catch {
    return null;
  }
}

function writeCache(id: string, iso: string) {
  try {
    window.sessionStorage.setItem(cacheKey(id), JSON.stringify({ at: Date.now(), iso }));
  } catch {
    /* storage unavailable — ignore */
  }
}

/**
 * ISO date of the last commit to a content file, or `null` while unknown or if
 * the API is unreachable — callers render no timestamp rather than a wrong one.
 * Costs at most one request per page per session.
 */
export function useCommitDate(id: string): string | null {
  const [date, setDate] = useState<string | null>(() => readCache(id));

  useEffect(() => {
    setDate(readCache(id));

    let cancelled = false;
    const controller = new AbortController();

    fetch(commitsApi(id), {
      headers: { Accept: 'application/vnd.github+json' },
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: unknown) => {
        const commit = (data as Array<{ commit?: { committer?: { date?: unknown } } }> | null)?.[0];
        const iso = commit?.commit?.committer?.date;
        if (cancelled || typeof iso !== 'string' || !iso) return;
        writeCache(id, iso);
        setDate(iso);
      })
      .catch(() => {
        /* offline, rate-limited or aborted — the timestamp simply stays hidden */
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [id]);

  return date;
}
