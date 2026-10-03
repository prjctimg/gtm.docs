
/**
 * Home page imagery. Every path is authored the way the file sits on disk —
 * `media/static/<file>` — and anchored to the origin root by `resolveMediaPath`
 * (`src/lib/media.ts`) at the point it becomes an `src`. An empty string means
 * no file has been added yet; the page renders a placeholder instead.
 */
export const IMAGES = {
  themesArt: "media/static/gtm.png",
  libraryView1: "",
  lyricsView1: "",
  libraryView2: "",
  lyricsView2: "",
heroCover: "media/static/hero.png" ,
  // Screenshot per feature card. Each path expects a real file in
  // `public/media/static/`; add the file and the card picks it up. Until then
  // the card shows a placeholder naming the file it is waiting for.
  //
  // The five entries above were hosted off-repo on Googleusercontent, so they
  // break silently when the link rots or the host changes. Prefer adding a
  // local file over reusing one of them for the wrong feature.
  // The first card ("Reactive theming") uses the shared brand logo.
  cardThemes: "media/static/gtm.png",
  cardVisualizer: 'media/static/card-visualizer.png',
  cardLyrics: 'media/static/card-lyrics.png',
  cardCrossfade: 'media/static/card-crossfade.png',
  cardEqualizer: 'media/static/card-equalizer.png',
  cardSleepTimer: 'media/static/card-sleep-timer.png',
  cardLibrary: 'media/static/card-library.png',
  cardCoverArt: 'media/static/card-cover-art.png',
  cardBackground: 'media/static/card-background.png',
  cardStreaming: 'media/static/card-streaming.png',
};
