// Build-time sitemap generator. Reads blog post slugs + dates straight from
// src/data/blogPosts.tsx so /public/sitemap.xml never drifts out of sync with
// content the way it did when sitemap was hand-maintained.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = 'https://progearmatch.site';
const today = new Date().toISOString().slice(0, 10);

const blogSrc = readFileSync(join(__dirname, '..', 'src', 'data', 'blogPosts.tsx'), 'utf-8');
// Match `slug:` and the post's own `date:` (the first one inside that post object).
const posts = [];
const slugMatches = [...blogSrc.matchAll(/slug:\s*['"]([\w-]+)['"]/g)];
for (let i = 0; i < slugMatches.length; i++) {
  const start = slugMatches[i].index;
  const end = i + 1 < slugMatches.length ? slugMatches[i + 1].index : blogSrc.length;
  const block = blogSrc.slice(start, end);
  const date = (block.match(/date:\s*['"]([0-9-]+)['"]/) || [])[1] || today;
  posts.push({ slug: slugMatches[i][1], date });
}
posts.sort((a, b) => b.date.localeCompare(a.date)); // newest first

const staticPages = [
  { loc: '/',                       priority: '1.0', changefreq: 'daily',   lastmod: today },
  { loc: '/blog',                   priority: '0.9', changefreq: 'weekly',  lastmod: today },
  { loc: '/gear',                   priority: '0.9', changefreq: 'weekly',  lastmod: today },
  { loc: '/how-it-works',           priority: '0.7', changefreq: 'monthly', lastmod: today },
  { loc: '/about',                  priority: '0.6', changefreq: 'monthly', lastmod: today },
  { loc: '/affiliate-disclosure',   priority: '0.4', changefreq: 'yearly',  lastmod: today },
  { loc: '/privacy',                priority: '0.3', changefreq: 'yearly',  lastmod: today },
  { loc: '/terms',                  priority: '0.3', changefreq: 'yearly',  lastmod: today },
];

const urls = [
  ...staticPages,
  ...posts.map(p => ({
    loc: `/blog/${p.slug}`,
    priority: '0.7',
    changefreq: 'monthly',
    lastmod: p.date,
  })),
];

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map(u => [
    '  <url>',
    `    <loc>${BASE}${u.loc}</loc>`,
    `    <lastmod>${u.lastmod}</lastmod>`,
    `    <changefreq>${u.changefreq}</changefreq>`,
    `    <priority>${u.priority}</priority>`,
    '  </url>',
  ].join('\n')),
  '</urlset>',
  '',
].join('\n');

writeFileSync(join(__dirname, '..', 'public', 'sitemap.xml'), xml);
console.log(`generate_sitemap: wrote ${urls.length} URLs (${staticPages.length} static + ${posts.length} blog posts)`);
