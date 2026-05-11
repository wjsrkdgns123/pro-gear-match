// Build-time sitemap generator. Reads blog post slugs + dates straight from
// src/data/blogPosts.tsx so /public/sitemap.xml never drifts out of sync with
// content. Emits a per-language URL set (/en/..., /ko/...) and embeds
// xhtml:link hreflang alternates so Google understands the en/ko split.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = 'https://progearmatch.site';
const LANGS = ['en', 'ko'];
const today = new Date().toISOString().slice(0, 10);

const blogSrc = readFileSync(join(__dirname, '..', 'src', 'data', 'blogPosts.tsx'), 'utf-8');
const posts = [];
const slugMatches = [...blogSrc.matchAll(/slug:\s*['"]([\w-]+)['"]/g)];
for (let i = 0; i < slugMatches.length; i++) {
  const start = slugMatches[i].index;
  const end = i + 1 < slugMatches.length ? slugMatches[i + 1].index : blogSrc.length;
  const block = blogSrc.slice(start, end);
  const date = (block.match(/date:\s*['"]([0-9-]+)['"]/) || [])[1] || today;
  posts.push({ slug: slugMatches[i][1], date });
}
posts.sort((a, b) => b.date.localeCompare(a.date));

// Each entry represents a "logical" page. Each will be emitted twice (once per
// language) with hreflang alternates pointing across.
const staticPages = [
  { suffix: '/',                       priority: '1.0', changefreq: 'daily',   lastmod: today },
  { suffix: '/blog/',                  priority: '0.9', changefreq: 'weekly',  lastmod: today },
  { suffix: '/gear/',                  priority: '0.9', changefreq: 'weekly',  lastmod: today },
  { suffix: '/how-it-works/',          priority: '0.7', changefreq: 'monthly', lastmod: today },
  { suffix: '/about/',                 priority: '0.6', changefreq: 'monthly', lastmod: today },
  { suffix: '/affiliate-disclosure/',  priority: '0.4', changefreq: 'yearly',  lastmod: today },
  { suffix: '/privacy/',               priority: '0.3', changefreq: 'yearly',  lastmod: today },
  { suffix: '/terms/',                 priority: '0.3', changefreq: 'yearly',  lastmod: today },
];

const blogPages = posts.map(p => ({
  suffix: `/blog/${p.slug}/`,
  priority: '0.7',
  changefreq: 'monthly',
  lastmod: p.date,
}));

const logicalPages = [...staticPages, ...blogPages];

// Build URL entries with hreflang alternates linking en <-> ko.
const urlEntries = [];
for (const page of logicalPages) {
  for (const lang of LANGS) {
    const loc = `${BASE}/${lang}${page.suffix}`;
    const alts = LANGS.map(l => `      <xhtml:link rel="alternate" hreflang="${l}" href="${BASE}/${l}${page.suffix}" />`);
    alts.push(`      <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}/en${page.suffix}" />`);
    urlEntries.push([
      '  <url>',
      `    <loc>${loc}</loc>`,
      `    <lastmod>${page.lastmod}</lastmod>`,
      `    <changefreq>${page.changefreq}</changefreq>`,
      `    <priority>${page.priority}</priority>`,
      ...alts,
      '  </url>',
    ].join('\n'));
  }
}

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ...urlEntries,
  '</urlset>',
  '',
].join('\n');

writeFileSync(join(__dirname, '..', 'public', 'sitemap.xml'), xml);
console.log(`generate_sitemap: wrote ${urlEntries.length} URL entries (${logicalPages.length} pages × ${LANGS.length} langs) with hreflang alternates`);
