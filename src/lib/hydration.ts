/**
 * True when the app is hydrating an already-rendered tree (set by
 * scripts/prerender.mjs: every route ships with the app pre-rendered into
 * #root). Components use this to skip mount-time effects that would otherwise
 * diverge from the static DOM — e.g. motion entrance animations, which write
 * `initial` styles into the first committed tree but were already animated to
 * their final values when the page was captured. The captured page is already
 * visible, so skipping the entrance animation on load is imperceptible.
 */
export const IS_HYDRATING =
  typeof document !== 'undefined' && document.getElementById('root')?.hasChildNodes() === true;