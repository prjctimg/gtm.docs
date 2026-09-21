import { useEffect } from 'react';
import { useLocation } from 'react-router';

/** Scrolls to top on route change; to the anchor element when a #hash is present. */
export function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const target = hash ? hash.slice(1) : null;

    if (!target) {
      window.scrollTo({ top: 0 });
      return;
    }

    const findEl = () =>
      document.getElementById(target) ||
      document.getElementById(target.startsWith('_') ? target.slice(1) : `_${target}`);

    const scroll = () => {
      const el = findEl();
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0 });
      }
    };

    // Retry a few times: the doc renders + images below the anchor shift layout,
    // and a single scroll call during the initial commit can get swallowed.
    const timers = [80, 250, 600].map((ms) => window.setTimeout(scroll, ms));
    window.addEventListener('load', scroll);

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener('load', scroll);
    };
  }, [pathname, hash]);

  return null;
}
