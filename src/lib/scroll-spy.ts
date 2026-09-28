import { useCallback, useEffect, useState } from 'react';
import type { PageHeading } from '../data/content';

/** Nav height (56px) + the sticky mobile TOC (~60px), plus a little breathing room. */
const SPY_OFFSET = 140;
/** Where a heading lands when jumped to from the table of contents. */
const JUMP_OFFSET = 135;

/** The renderer emits both `id` and a legacy `_<id>` alias per heading. */
function headingEl(id: string): HTMLElement | null {
  return document.getElementById(id) || document.getElementById(`_${id}`);
}

/**
 * Tracks which heading of the rendered page is at the top of the viewport, and
 * scrolls to a heading on demand. Every content page needs both, so the logic
 * lives here rather than in each page.
 */
export function useScrollSpy(headings: PageHeading[]) {
  const [activeId, setActiveId] = useState(() => headings[0]?.id ?? '');

  useEffect(() => {
    setActiveId(headings[0]?.id ?? '');
  }, [headings]);

  useEffect(() => {
    if (headings.length === 0) {
      setActiveId('');
      return;
    }

    const handleScroll = () => {
      const scrollY = window.scrollY;
      let currentId = headings[0].id;

      for (const heading of headings) {
        const el = headingEl(heading.id);
        if (!el) continue;
        if (scrollY >= el.getBoundingClientRect().top + scrollY - SPY_OFFSET) {
          currentId = heading.id;
        }
      }

      setActiveId((prev) => (prev === currentId ? prev : currentId));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  const scrollTo = useCallback((id: string) => {
    setActiveId(id);
    const el = headingEl(id);
    if (!el) return;
    const top = Math.max(0, el.getBoundingClientRect().top + window.scrollY - JUMP_OFFSET);
    window.scrollTo({ top, behavior: 'smooth' });
  }, []);

  return [activeId, scrollTo] as const;
}
