import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import App from './App.tsx';
import {ErrorBoundary} from './components/ErrorBoundary';
import {ProDetail} from './views/ProDetail';
import {initAnalytics} from './utils/analytics';
import './index.css';

// Wire Sentry (always, if DSN set) + GA4 (consent-gated)
initAnalytics();

// Top-level routing. Everything outside /pro/:slug still falls through to
// the existing App (which does its own in-memory page switching for
// home, how-it-works, about, privacy, terms, affiliate).
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/pro/:slug" element={<ProDetail />} />
          <Route path="*" element={<App />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);

// Register the PWA service worker. Only runs in the production build —
// dev mode stays service-worker-free so HMR isn't hijacked.
// The module is injected by vite-plugin-pwa; it's a no-op when unsupported.
if ('serviceWorker' in navigator) {
  import('virtual:pwa-register').then(({registerSW}) => {
    registerSW({immediate: true});
  }).catch(() => {
    /* plugin module unavailable in SSR/test — ignore */
  });
}
