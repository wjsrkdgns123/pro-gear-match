// Post-build: write a fully-formed dist/<route>/index.html for every SPA
// route. Two jobs:
//   1) Make Cloudflare Pages serve the SPA shell at the real URL (status 200)
//      without depending on _redirects, which has been unreliable on this
//      project (wildcard rules triggered "infinite loop" deploy failures).
//   2) Inject per-route <title>, <meta description>, canonical, OpenGraph,
//      and <noscript> content so Googlebot / AdSense bot can read unique
//      metadata + visible text per URL BEFORE JavaScript executes. Without
//      this, every route serves identical metadata pointing at "/" — which
//      causes Google to merge URLs and skip indexing the blog/gear pages.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const INDEX = join(DIST, 'index.html');
const BASE = 'https://progearmatch.site';

const indexHtml = readFileSync(INDEX, 'utf-8');

// Read blog post data straight off the source file so the route list stays
// in sync with content without us hand-maintaining a separate manifest.
const blogSrc = readFileSync(join(__dirname, '..', 'src', 'data', 'blogPosts.tsx'), 'utf-8');

/**
 * Parse blogPosts.tsx into [{ slug, koTitle, koExcerpt, enTitle, enExcerpt }].
 * We use a forgiving regex sweep rather than evaluating the TSX, which keeps
 * the script dependency-free.
 */
function parseBlogPosts(src) {
  const posts = [];
  // Each post object spans from "slug: '...'" up to the next "slug:" or end.
  const slugMatches = [...src.matchAll(/slug:\s*['"]([\w-]+)['"]/g)];
  // Match `field: "..."` or `field: '...'` where content may contain the
  // opposite quote (e.g. "TenZ's Sensitivity History"). The capture group is
  // the quote char; content uses negated-class against the matched quote.
  const quoted = (field, block) => {
    const re = new RegExp(`${field}:\\s*(['"])((?:\\\\.|(?!\\1).)*?)\\1`, 's');
    return (block.match(re) || [])[2] || '';
  };
  for (let i = 0; i < slugMatches.length; i++) {
    const start = slugMatches[i].index;
    const end = i + 1 < slugMatches.length ? slugMatches[i + 1].index : src.length;
    const block = src.slice(start, end);
    const slug = slugMatches[i][1];
    // Split into ko / en sub-blocks by their literal markers so the regex
    // doesn't pick up the wrong field. Each lang block goes from its marker
    // until the next top-level lang marker or end of post.
    const koStart = block.indexOf('ko: {');
    const enStart = block.indexOf('en: {');
    const koBlock = koStart >= 0 ? block.slice(koStart, enStart >= 0 ? enStart : block.length) : '';
    const enBlock = enStart >= 0 ? block.slice(enStart) : '';
    const koTitle   = quoted('title',   koBlock).replace(/\\'/g, "'").replace(/\\"/g, '"');
    const koExcerpt = quoted('excerpt', koBlock).replace(/\\'/g, "'").replace(/\\"/g, '"');
    const enTitle   = quoted('title',   enBlock).replace(/\\'/g, "'").replace(/\\"/g, '"');
    const enExcerpt = quoted('excerpt', enBlock).replace(/\\'/g, "'").replace(/\\"/g, '"');
    const date      = quoted('date',    block);
    posts.push({ slug, koTitle, koExcerpt, enTitle, enExcerpt, date });
  }
  return posts;
}

const posts = parseBlogPosts(blogSrc);

const STATIC_META = {
  'how-it-works': {
    title: 'How It Works — Pro Gear Match',
    description: 'See how Pro Gear Match uses the eDPI algorithm to match your sensitivity, mouse, keyboard, and monitor with 1,800+ FPS pros across Valorant, CS2, Overwatch 2, and Apex Legends.',
    h1: 'How Pro Gear Match Works',
    body: 'Enter your DPI and in-game sensitivity. Pro Gear Match computes your eDPI and compares it against 1,800+ professional players across Valorant, CS2, Overwatch 2, and Apex Legends. Gear overlap (mouse, keyboard, monitor, mousepad) is weighted into the match score. Results include eDPI distribution charts, the closest pro twin, and similar matches you can browse.',
  },
  'about': {
    title: 'About Pro Gear Match — Methodology & Data Sources',
    description: 'Pro Gear Match is an independent FPS sensitivity matching tool with 1,800+ verified pro player setups, sourced from ProSettings.net, Liquipedia, and team social media, and updated weekly.',
    h1: 'About Pro Gear Match',
    body: 'Pro Gear Match is a free FPS sensitivity matching tool run independently by a developer with 10+ years of FPS experience. Data on 1,800+ professional gamers is personally collected, verified against team announcements, filtered for outliers, and updated weekly. Every blog guide is original, written from our own data — not scraped.',
  },
  'privacy': {
    title: 'Privacy Policy — Pro Gear Match',
    description: 'Pro Gear Match privacy policy. We use Firebase, Google AdSense, and Amazon Associates. Matching input is never stored. Cookie and ad personalization opt-out info inside.',
    h1: 'Privacy Policy',
    body: 'Pro Gear Match collects minimal data. Matching input (DPI, sensitivity, gear) is processed in your browser and not stored. Comments use Firebase. Ads via Google AdSense may set cookies — you can opt out at adssettings.google.com.',
  },
  'terms': {
    title: 'Terms of Service — Pro Gear Match',
    description: 'Pro Gear Match terms of service. Free use, no signup. Pro player data is public information from third-party sources; we make no warranty of accuracy.',
    h1: 'Terms of Service',
    body: 'Pro Gear Match is provided as-is, free, with no warranty of data accuracy. Pro player data is aggregated from public sources. Use at your own discretion.',
  },
  'affiliate-disclosure': {
    title: 'Affiliate Disclosure — Pro Gear Match',
    description: 'Pro Gear Match participates in the Amazon Associates affiliate program. Qualifying purchases through our links may earn us a commission at no extra cost to you.',
    h1: 'Affiliate Disclosure',
    body: 'Pro Gear Match participates in the Amazon Associates affiliate program. Some gear links earn us a commission at no cost to the buyer. This funding helps keep the matcher free.',
  },
  'blog': {
    title: 'Blog — Guides & Analysis on FPS Sensitivity, Gear, and Pros',
    description: 'Data-driven FPS guides: eDPI explained, why 800 DPI dominates, cm/360° cross-game conversion, monitor refresh rate analysis, Wooting Rapid Trigger, and per-pro deep dives.',
    h1: 'Pro Gear Match Blog',
    body: 'Read in-depth, original FPS gear and sensitivity guides backed by data from 1,800+ pros. Topics include eDPI fundamentals, mouse and keyboard reviews, per-game sensitivity guides, pro player history, and gear comparisons.',
  },
  'gear': {
    title: 'Gear Database — Mice, Keyboards, Monitors, Mousepads Used by FPS Pros',
    description: 'Browse the mice, keyboards, monitors, and mousepads used by 1,800+ professional FPS players. See usage share, prices, and which pros run each item.',
    h1: 'FPS Pro Gear Database',
    body: 'Browse the complete gear database of 1,800+ professional FPS players. Filter by mouse, keyboard, monitor, or mousepad. Each item shows the number of pros using it, approximate price, and the player list for that item.',
  },
};

/**
 * Build a route-specific HTML by string-replacing the canonical metadata
 * inside dist/index.html. We keep the build dependency-free and avoid an
 * HTML parser; the original tags use stable formatting from index.html.
 */
function buildRouteHtml(meta) {
  let html = indexHtml;
  const canonical = `${BASE}${meta.path}`;
  const ogImage = `${BASE}/favicon-512.png`;

  // 1) <title>
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${escapeHtml(meta.title)}</title>`,
  );

  // 2) <meta name="description">
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${escapeAttr(meta.description)}" />`,
  );

  // 3) <link rel="canonical">
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${canonical}" />`,
  );

  // 4) hreflang alternates — same URL since we don't have separate /en, /ko paths
  html = html.replace(
    /<link\s+rel="alternate"\s+hreflang="[^"]*"\s+href="[^"]*"\s*\/?>/g,
    (m) => m.replace(/href="[^"]*"/, `href="${canonical}"`),
  );

  // 5) OpenGraph + Twitter tags
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${escapeAttr(meta.title)}" />`,
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${escapeAttr(meta.description)}" />`,
  );
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${canonical}" />`,
  );
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${escapeAttr(meta.title)}" />`,
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${escapeAttr(meta.description)}" />`,
  );
  // og:type=article for blog posts, website for everything else
  if (meta.isPost) {
    html = html.replace(
      /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:type" content="article" />`,
    );
  }
  // og:image stays /favicon-512.png absolute
  html = html.replace(
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:image" content="${ogImage}" />`,
  );

  // 6) <noscript> body content so crawlers without JS still see real text
  //    Drop a minimal HTML fragment right after <body> tag.
  const noscript = `
    <noscript>
      <style>.pgm-noscript-body{max-width:760px;margin:24px auto;padding:0 16px;font-family:Inter,system-ui,sans-serif;color:#222;line-height:1.6}</style>
      <main class="pgm-noscript-body">
        <h1>${escapeHtml(meta.h1)}</h1>
        <p>${escapeHtml(meta.body)}</p>
        <p style="font-size:14px;color:#666">Enable JavaScript for the full interactive experience. <a href="${BASE}/">Pro Gear Match home</a>.</p>
      </main>
    </noscript>`;
  html = html.replace(/<body([^>]*)>/, `<body$1>${noscript}`);

  // 7) Per-route JSON-LD. Blog posts get Article schema so Google can show
  //    rich results (author, datePublished, headline). Static pages get
  //    BreadcrumbList back to home so the page sits inside site hierarchy.
  if (meta.isPost && meta.datePublished) {
    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': meta.h1,
      'description': meta.description,
      'image': ogImage,
      'datePublished': meta.datePublished,
      'dateModified': meta.datePublished,
      'author': { '@type': 'Organization', 'name': 'Pro Gear Match' },
      'publisher': {
        '@type': 'Organization',
        'name': 'Pro Gear Match',
        'logo': { '@type': 'ImageObject', 'url': ogImage },
      },
      'mainEntityOfPage': { '@type': 'WebPage', '@id': canonical },
    };
    const articleTag = `\n    <script type="application/ld+json">${JSON.stringify(articleSchema)}</script>`;
    html = html.replace(/(<\/head>)/, articleTag + '$1');
  } else if (!meta.isHome) {
    const crumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${BASE}/` },
        { '@type': 'ListItem', 'position': 2, 'name': meta.h1, 'item': canonical },
      ],
    };
    const crumbTag = `\n    <script type="application/ld+json">${JSON.stringify(crumbSchema)}</script>`;
    html = html.replace(/(<\/head>)/, crumbTag + '$1');
  }

  return html;
}

function escapeAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const routes = [];

// Static routes
for (const [route, meta] of Object.entries(STATIC_META)) {
  routes.push({ route, meta: { ...meta, path: `/${route}/`, isPost: false } });
}

// Blog post routes — prefer English title/excerpt for crawlers since
// AdSense bot defaults to en-US, while Korean readers still see the
// Korean UI once JS loads.
for (const p of posts) {
  routes.push({
    route: `blog/${p.slug}`,
    meta: {
      path: `/blog/${p.slug}/`,
      isPost: true,
      title: `${p.enTitle || p.koTitle} — Pro Gear Match Blog`,
      description: p.enExcerpt || p.koExcerpt,
      h1: p.enTitle || p.koTitle,
      body: p.enExcerpt || p.koExcerpt,
      datePublished: p.date,
    },
  });
}

let count = 0;
for (const { route, meta } of routes) {
  const dir = join(DIST, route);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), buildRouteHtml(meta));
  count++;
}

// Also update the root index.html so its canonical is /, og is correct,
// and the noscript home body is present for crawlers landing on /.
const homeMeta = {
  path: '/',
  isHome: true,
  isPost: false,
  title: 'Pro Gear Match — Find Your Pro Gamer Twin',
  description: 'Match your DPI, in-game sensitivity, and gear with 1,800+ FPS pros across Valorant, CS2, Overwatch 2, and Apex Legends. Free, no signup.',
  h1: 'Find Your Pro Gamer Twin',
  body: 'Pro Gear Match is a free FPS sensitivity matching tool. Enter your DPI, in-game sensitivity, and gear (mouse, keyboard, monitor, mousepad). We compare your setup against 1,800+ pro players across Valorant, CS2, Overwatch 2, and Apex Legends and surface the closest pro twin plus similar matches.',
};
writeFileSync(INDEX, buildRouteHtml(homeMeta));
count++;

console.log(`generate_route_html: wrote ${count} route HTML files with per-route metadata`);
console.log('  routes:', routes.map(r => r.route).join(', '));
console.log('  also copied to dist root:', readdirSync(DIST).filter(f => !f.includes('.')).join(', '));
