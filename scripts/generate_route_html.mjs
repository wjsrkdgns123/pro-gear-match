// Post-build: copy dist/index.html into a subfolder for every SPA route, so
// Cloudflare Pages serves the SPA shell at the actual URL (status 200) even
// when the project's _redirects rewrite isn't being honored. Without this,
// /blog, /gear, /blog/{slug}, etc. return 404 — which blocks Google indexing
// and AdSense approval.

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const INDEX = join(DIST, 'index.html');

const indexHtml = readFileSync(INDEX, 'utf-8');

// Read blog post slugs straight off the source file so the route list stays
// in sync with content without us hand-maintaining a separate manifest.
const blogSrc = readFileSync(join(__dirname, '..', 'src', 'data', 'blogPosts.tsx'), 'utf-8');
const blogSlugs = [...blogSrc.matchAll(/slug:\s*['"]([\w-]+)['"]/g)].map(m => m[1]);

const staticRoutes = [
  'how-it-works',
  'about',
  'privacy',
  'terms',
  'affiliate-disclosure',
  'blog',
  'gear',
];

const routes = [
  ...staticRoutes,
  ...blogSlugs.map(s => `blog/${s}`),
];

let count = 0;
for (const route of routes) {
  const dir = join(DIST, route);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), indexHtml);
  count++;
}

console.log(`generate_route_html: wrote ${count} route HTML files`);
console.log('  routes:', routes.join(', '));
console.log('  also copied to dist root:', readdirSync(DIST).filter(f => !f.includes('.')).join(', '));
