import { useEffect } from 'react';

function setMeta(attr: 'name' | 'property', key: string, value: string) {
  const el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (el) el.setAttribute('content', value);
}

/**
 * Keeps page-level metadata (title, description, OpenGraph, canonical) in
 * sync with the currently rendered route. The static defaults live in
 * index.html; this hook overrides them client-side on navigation.
 */
export function usePageMeta(title: string, description: string, canonicalUrl?: string) {
  useEffect(() => {
    if (title) {
      document.title = title;
      setMeta('property', 'og:title', title);
      setMeta('name', 'twitter:title', title);
    }
    if (description) {
      setMeta('name', 'description', description);
      setMeta('property', 'og:description', description);
      setMeta('name', 'twitter:description', description);
    }
    const url = canonicalUrl ?? window.location.href;
    setMeta('property', 'og:url', url);
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', url);
  }, [title, description, canonicalUrl]);
}