import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        // Keep using our hand-written public/manifest.json
        registerType: 'autoUpdate',
        manifest: false,
        includeAssets: [
          'favicon.ico', 'favicon.svg', 'favicon.png',
          'favicon-192.png', 'favicon-512.png',
        ],
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico,webp}'],
          // Never intercept API, sitemap, or robots.txt with the SPA shell
          navigateFallbackDenylist: [/^\/api\//, /^\/sitemap\.xml/, /^\/robots\.txt/],
          runtimeCaching: [
            {
              // Scraped gear images — long-lived CacheFirst
              urlPattern: /\/gear-images\/.*\.(?:png|jpe?g|webp|avif|gif)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gear-images',
                expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              // /api/gear-image JSON lookups — fresh-first, cached fallback
              urlPattern: /\/api\/gear-image/,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'gear-image-api',
                expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7 },
              },
            },
          ],
        },
      }),
    ],
    build: {
      // Split heavy third-party deps into their own chunks so the main
      // bundle shrinks and long-term HTTP caching pays off across deploys
      // that don't touch firebase/sentry/etc.
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
            motion: ['motion/react'],
            icons: ['lucide-react'],
            sentry: ['@sentry/react'],
          },
        },
      },
      chunkSizeWarningLimit: 700,
    },
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
      'process.env.ANTHROPIC_API_KEY': JSON.stringify(env.ANTHROPIC_API_KEY || ''),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: false,
      watch: null,
      strictPort: true,
    },
  };
});
