import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {ErrorBoundary} from './components/ErrorBoundary';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
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
