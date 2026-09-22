import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify - file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      // The largest remaining chunks (elk ~1.5 MB, cynefin, mermaid.core) are
      // all lazily loaded via dynamic import() — they only download when a
      // mermaid diagram actually renders, never on first paint. Tune the limit
      // to acknowledge those intentional async chunks; the initial-load chunks
      // are all far below 500 kB (entry ~250 kB).
      chunkSizeWarningLimit: 1600,
      rollupOptions: {
        output: {
          // Split the heavy vendor deps out of the main entry chunk so nothing
          // in the initial load exceeds Vite's 500 kB chunk-size threshold:
          // - mermaid is imported dynamically by MermaidDiagram (it only
          //   downloads on pages that render a diagram) — its renderers
          //   (elk, dagre, cytoscape, katex) stay separate lazy chunks
          // - react+router runtime, the markdown/unified pipeline,
          //   prism, lucide and home-page-only libs all get stable,
          //   cacheable chunks that load in parallel with the entry
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined;
            if (id.includes('/node_modules/react/') ||
                id.includes('/node_modules/react-dom/') ||
                id.includes('/node_modules/scheduler/') ||
                id.includes('/node_modules/react-router/') ||
                id.includes('/node_modules/@remix-run/') ||
                id.includes('/node_modules/use-sync-external-store/')) {
              return 'vendor-react';
            }
            if (id.includes('/node_modules/motion/')) return 'motion';
            if (id.includes('/node_modules/react-icons/')) return 'react-icons';
            if (/node_modules\/(react-markdown|remark-|rehype-|unified|micromark|mdast-util-|hast-util-|unist-util-|vfile|property-information|devlop|trough|bail|zwitch|longest-streak|markdown-table|ccount|character-entities|decode-named-character-reference|escape-string-regexp|is-plain-obj|comma-separated-tokens|trim-lines|extend|ext|web-namespaces)\//.test(id)) {
              return 'vendor-markdown';
            }
            if (id.includes('/node_modules/prismjs/')) return 'prism';
            if (id.includes('/node_modules/lucide-react/')) return 'vendor-icons';
            return undefined;
          },
        },
      },
    },
  };
});