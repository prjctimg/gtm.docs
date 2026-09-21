import {StrictMode} from 'react';
import {createRoot, hydrateRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './context/ThemeContext';

const rootEl = document.getElementById('root')!;
const app = (
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);

// After a build, scripts/prerender.mjs writes per-route HTML with the app
// already rendered into #root; hydrate that static markup instead of
// starting from an empty tree so every prerendered URL is interactive.
if (rootEl.hasChildNodes()) {
  hydrateRoot(rootEl, app);
} else {
  createRoot(rootEl).render(app);
}