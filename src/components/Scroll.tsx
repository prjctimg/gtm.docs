import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router';

/** Scrolls to top on route change; to the anchor element when a #hash is present. */
export function Scroll() {
  const { pathname, hash } = useLocation();

  // Disable browser's native automatic scroll restoration so it doesn't fight SPA route changes
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useLayoutEffect(() => {
    const target = hash ? hash.slice(1) : null;

    if (!target) {
      // Instant pre-paint scroll reset to top
      const resetScroll = () => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      };

      resetScroll();

      // Enforce reset on next frame and short timeout in case async elements or markdown layout settles
      const rafId = requestAnimationFrame(resetScroll);
      const timerId = window.setTimeout(resetScroll, 40);

      return () => {
        cancelAnimationFrame(rafId);
        window.clearTimeout(timerId);
      };
    }

    // Anchor hash present: find element and scroll into view with sticky header offset
    const findEl = () =>
      document.getElementById(target) ||
      document.getElementById(target.startsWith('_') ? target.slice(1) : `_${target}`);

    const scroll = () => {
      const el = findEl();
      if (el) {
        const navOffset = 80; // Accounts for sticky navbar (56px) + breathing space
        const elementPosition = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: Math.max(0, elementPosition - navOffset),
          behavior: 'smooth',
        });
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
    };

    const timers = [0, 80, 250, 600].map((ms) =>
      ms === 0 ? requestAnimationFrame(scroll) : window.setTimeout(scroll, ms)
    );
    window.addEventListener('load', scroll);

    return () => {
      timers.forEach((t) => {
        if (typeof t === 'number') {
          window.clearTimeout(t);
          cancelAnimationFrame(t);
        }
      });
      window.removeEventListener('load', scroll);
    };
  }, [pathname, hash]);

  return null;
}

