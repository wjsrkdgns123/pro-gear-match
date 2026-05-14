// Post-build: write a fully-formed dist/<lang>/<route>/index.html for every
// SPA route × language (en, ko). Three jobs:
//   1) Make Cloudflare Pages serve the SPA shell at the real URL (status 200)
//      without depending on _redirects, which has been unreliable on this
//      project (wildcard rules triggered "infinite loop" deploy failures).
//   2) Inject per-route, per-language <title>, <meta description>, canonical,
//      OpenGraph, hreflang alternates (en/ko/x-default), and <noscript> content
//      so Googlebot / AdSense bot can read unique metadata + visible text per
//      URL BEFORE JavaScript executes.
//   3) Make the root dist/index.html a redirect shell that bounces to /en/ for
//      JS-enabled clients and exposes canonical=/en/ for crawlers.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const INDEX = join(DIST, 'index.html');
const BASE = 'https://progearmatch.site';
const LANGS = ['en', 'ko'];

const indexHtml = readFileSync(INDEX, 'utf-8');

const blogSrc = readFileSync(join(__dirname, '..', 'src', 'data', 'blogPosts.tsx'), 'utf-8');

function parseBlogPosts(src) {
  const posts = [];
  const slugMatches = [...src.matchAll(/slug:\s*['"]([\w-]+)['"]/g)];
  const quoted = (field, block) => {
    const re = new RegExp(`${field}:\\s*(['"])((?:\\\\.|(?!\\1).)*?)\\1`, 's');
    return (block.match(re) || [])[2] || '';
  };
  for (let i = 0; i < slugMatches.length; i++) {
    const start = slugMatches[i].index;
    const end = i + 1 < slugMatches.length ? slugMatches[i + 1].index : src.length;
    const block = src.slice(start, end);
    const slug = slugMatches[i][1];
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

// Per-language static page metadata. EN uses the existing copy; KO mirrors the
// shape so Korean crawlers see Korean text in the noscript fallback.
const STATIC_META = {
  'how-it-works': {
    en: {
      title: 'How It Works — Pro Gear Match',
      description: 'See how Pro Gear Match uses the eDPI algorithm to match your sensitivity, mouse, keyboard, and monitor with 1,800+ FPS pros across Valorant, CS2, Overwatch 2, and Apex Legends.',
      h1: 'How Pro Gear Match Works',
      body: 'Enter your DPI and in-game sensitivity. Pro Gear Match computes your eDPI and compares it against 1,800+ professional players across Valorant, CS2, Overwatch 2, and Apex Legends. Gear overlap (mouse, keyboard, monitor, mousepad) is weighted into the match score. Results include eDPI distribution charts, the closest pro twin, and similar matches you can browse.',
    },
    ko: {
      title: '작동 원리 — Pro Gear Match',
      description: 'Pro Gear Match가 eDPI 알고리즘으로 발로란트, CS2, 오버워치2, 에이펙스 1,800명 이상의 프로 감도·마우스·키보드·모니터와 어떻게 매칭하는지 확인하세요.',
      h1: 'Pro Gear Match 작동 원리',
      body: 'DPI와 인게임 감도를 입력하면 Pro Gear Match가 eDPI를 계산하고 발로란트·CS2·오버워치2·에이펙스 레전드 1,800명 이상의 프로 선수와 비교합니다. 마우스·키보드·모니터·마우스패드의 일치 여부도 점수에 반영됩니다. 결과 화면에서는 eDPI 분포, 가장 비슷한 프로, 유사한 다른 프로 목록을 확인할 수 있습니다.',
    },
  },
  'about': {
    en: {
      title: 'About Pro Gear Match — Methodology & Data Sources',
      description: 'Pro Gear Match is an independent FPS sensitivity matching tool with 1,800+ verified pro player setups, sourced from ProSettings.net, Liquipedia, and team social media, and updated weekly.',
      h1: 'About Pro Gear Match',
      body: 'Pro Gear Match is a free FPS sensitivity matching tool run independently by a developer with 10+ years of FPS experience. Data on 1,800+ professional gamers is personally collected, verified against team announcements, filtered for outliers, and updated weekly. Every blog guide is original, written from our own data — not scraped.',
    },
    ko: {
      title: 'Pro Gear Match 소개 — 방법론 및 데이터 출처',
      description: 'Pro Gear Match는 10년 이상 FPS 경험의 개발자가 독립 운영하는 감도 매칭 도구입니다. ProSettings, Liquipedia, 팀 SNS 기반의 검증된 1,800명 이상 프로 데이터를 매주 업데이트합니다.',
      h1: 'Pro Gear Match 소개',
      body: 'Pro Gear Match는 10년 이상의 FPS 경험을 가진 개발자가 독립적으로 운영하는 무료 감도 매칭 도구입니다. 1,800명 이상의 프로 데이터를 직접 수집·검증하고 매주 업데이트합니다. 모든 블로그 글은 자체 데이터를 기반으로 직접 작성한 오리지널 콘텐츠입니다.',
    },
  },
  'privacy': {
    en: {
      title: 'Privacy Policy — Pro Gear Match',
      description: 'Pro Gear Match privacy policy. We use Firebase, Google AdSense, and Amazon Associates. Matching input is never stored. Cookie and ad personalization opt-out info inside.',
      h1: 'Privacy Policy',
      body: 'Pro Gear Match collects minimal data. Matching input (DPI, sensitivity, gear) is processed in your browser and not stored. Comments use Firebase. Ads via Google AdSense may set cookies — you can opt out at adssettings.google.com.',
    },
    ko: {
      title: '개인정보 처리방침 — Pro Gear Match',
      description: 'Pro Gear Match 개인정보 처리방침. Firebase, Google AdSense, Amazon Associates 사용 안내, 매칭 입력값 저장하지 않음, 쿠키/광고 개인화 옵트아웃 안내.',
      h1: '개인정보 처리방침',
      body: 'Pro Gear Match는 최소한의 데이터만 수집합니다. 매칭 입력값(DPI, 감도, 장비)은 브라우저에서만 처리되며 저장되지 않습니다. 댓글은 Firebase를 사용합니다. Google AdSense 광고는 쿠키를 설정할 수 있으며 adssettings.google.com에서 옵트아웃할 수 있습니다.',
    },
  },
  'terms': {
    en: {
      title: 'Terms of Service — Pro Gear Match',
      description: 'Pro Gear Match terms of service. Free use, no signup. Pro player data is public information from third-party sources; we make no warranty of accuracy.',
      h1: 'Terms of Service',
      body: 'Pro Gear Match is provided as-is, free, with no warranty of data accuracy. Pro player data is aggregated from public sources. Use at your own discretion.',
    },
    ko: {
      title: '이용약관 — Pro Gear Match',
      description: 'Pro Gear Match 이용약관. 가입 없이 무료 사용, 프로 데이터는 공개 출처에서 수집된 정보이며 정확성에 대한 보증은 제공하지 않습니다.',
      h1: '이용약관',
      body: 'Pro Gear Match는 무료로 제공되며 데이터 정확성에 대한 보증이 없습니다. 프로 선수 데이터는 공개된 출처에서 수집된 정보입니다. 사용자 본인의 판단으로 활용해 주세요.',
    },
  },
  'affiliate-disclosure': {
    en: {
      title: 'Affiliate Disclosure — Pro Gear Match',
      description: 'Pro Gear Match participates in the Amazon Associates affiliate program. Qualifying purchases through our links may earn us a commission at no extra cost to you.',
      h1: 'Affiliate Disclosure',
      body: 'Pro Gear Match participates in the Amazon Associates affiliate program. Some gear links earn us a commission at no cost to the buyer. This funding helps keep the matcher free.',
    },
    ko: {
      title: '제휴 공시 — Pro Gear Match',
      description: 'Pro Gear Match는 Amazon Associates 제휴 프로그램에 참여합니다. 링크를 통한 적격 구매 시 수수료가 발생할 수 있으며, 구매자의 추가 부담은 없습니다.',
      h1: '제휴 공시',
      body: 'Pro Gear Match는 Amazon Associates 제휴 프로그램에 참여합니다. 일부 장비 링크는 구매자의 추가 비용 없이 수수료가 발생할 수 있으며, 이는 매칭 도구의 무료 운영에 활용됩니다.',
    },
  },
  'blog': {
    en: {
      title: 'Blog — Guides & Analysis on FPS Sensitivity, Gear, and Pros',
      description: 'Data-driven FPS guides: eDPI explained, why 800 DPI dominates, cm/360° cross-game conversion, monitor refresh rate analysis, Wooting Rapid Trigger, and per-pro deep dives.',
      h1: 'Pro Gear Match Blog',
      body: 'Read in-depth, original FPS gear and sensitivity guides backed by data from 1,800+ pros. Topics include eDPI fundamentals, mouse and keyboard reviews, per-game sensitivity guides, pro player history, and gear comparisons.',
    },
    ko: {
      title: '블로그 — FPS 감도·장비·프로 분석 가이드',
      description: '데이터 기반 FPS 가이드: eDPI 해설, 800 DPI가 표준이 된 이유, cm/360 게임 간 변환, 모니터 주사율 분석, Wooting 래피드 트리거, 프로 선수별 심층 분석.',
      h1: 'Pro Gear Match 블로그',
      body: '1,800명 이상의 프로 데이터를 바탕으로 작성한 깊이 있는 FPS 장비·감도 가이드. eDPI 기초, 마우스·키보드 리뷰, 게임별 감도 가이드, 프로 선수 히스토리, 장비 비교 글을 읽어보세요.',
    },
  },
  'gear': {
    en: {
      title: 'Gear Database — Mice, Keyboards, Monitors, Mousepads Used by FPS Pros',
      description: 'Browse the mice, keyboards, monitors, and mousepads used by 1,800+ professional FPS players. See usage share, prices, and which pros run each item.',
      h1: 'FPS Pro Gear Database',
      body: 'Browse the complete gear database of 1,800+ professional FPS players. Filter by mouse, keyboard, monitor, or mousepad. Each item shows the number of pros using it, approximate price, and the player list for that item.',
    },
    ko: {
      title: '장비 데이터베이스 — FPS 프로들의 마우스·키보드·모니터·마우스패드',
      description: '1,800명 이상 프로 FPS 선수들이 사용하는 마우스·키보드·모니터·마우스패드를 둘러보세요. 사용 점유율, 가격, 그리고 각 장비를 쓰는 프로 목록을 확인할 수 있습니다.',
      h1: 'FPS 프로 장비 데이터베이스',
      body: '1,800명 이상의 프로 FPS 선수 장비 데이터베이스. 마우스, 키보드, 모니터, 마우스패드별로 필터링하여 사용 수, 대략적인 가격, 해당 장비를 쓰는 선수 목록을 확인하세요.',
    },
  },
};

const HOME_META = {
  en: {
    title: 'Pro Gear Match — Find Your Pro Gamer Twin',
    description: 'Match your DPI, in-game sensitivity, and gear with 1,800+ FPS pros across Valorant, CS2, Overwatch 2, and Apex Legends. Free, no signup.',
    h1: 'Find Your Pro Gamer Twin',
    body: 'Pro Gear Match is a free FPS sensitivity matching tool. Enter your DPI, in-game sensitivity, and gear (mouse, keyboard, monitor, mousepad). We compare your setup against 1,800+ pro players across Valorant, CS2, Overwatch 2, and Apex Legends and surface the closest pro twin plus similar matches.',
  },
  ko: {
    title: 'Pro Gear Match — 나와 가장 닮은 프로게이머 찾기',
    description: '발로란트, CS2, 오버워치2, 에이펙스 1,800명 이상의 프로 선수와 DPI·인게임 감도·장비를 비교해 보세요. 무료, 가입 불필요.',
    h1: '나와 가장 닮은 프로게이머 찾기',
    body: 'Pro Gear Match는 무료 FPS 감도 매칭 도구입니다. DPI, 인게임 감도, 장비(마우스·키보드·모니터·마우스패드)를 입력하면 발로란트·CS2·오버워치2·에이펙스 1,800명 이상의 프로 선수와 비교하여 가장 닮은 프로와 유사한 매칭 결과를 보여줍니다.',
  },
};

function buildRouteHtml(meta) {
  let html = indexHtml;
  const canonical = `${BASE}${meta.path}`;
  const ogImage = `${BASE}/favicon-512.png`;

  // 0) <html lang="..."> attribute
  html = html.replace(/<html\s+lang="[^"]*">/, `<html lang="${meta.lang}">`);

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

  // 4) hreflang alternates — proper per-language URLs.
  //    Each route has an "en" and "ko" variant at the same suffix.
  const enUrl = `${BASE}/en${meta.suffix}`;
  const koUrl = `${BASE}/ko${meta.suffix}`;
  const altsBlock =
    `<link rel="alternate" hreflang="en" href="${enUrl}" />\n` +
    `    <link rel="alternate" hreflang="ko" href="${koUrl}" />\n` +
    `    <link rel="alternate" hreflang="x-default" href="${enUrl}" />`;
  // Replace the three existing alternate tags (in order) with our block.
  html = html.replace(
    /<link\s+rel="alternate"\s+hreflang="en"\s+href="[^"]*"\s*\/?>\s*\n?\s*<link\s+rel="alternate"\s+hreflang="ko"\s+href="[^"]*"\s*\/?>\s*\n?\s*<link\s+rel="alternate"\s+hreflang="x-default"\s+href="[^"]*"\s*\/?>/,
    altsBlock,
  );

  // 5) og:locale per language + alternate
  const ogLocale = meta.lang === 'ko' ? 'ko_KR' : 'en_US';
  const ogAlternate = meta.lang === 'ko' ? 'en_US' : 'ko_KR';
  html = html.replace(
    /<meta\s+property="og:locale"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:locale" content="${ogLocale}" />`,
  );
  html = html.replace(
    /<meta\s+property="og:locale:alternate"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:locale:alternate" content="${ogAlternate}" />`,
  );

  // 6) OpenGraph + Twitter tags
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
  if (meta.isPost) {
    html = html.replace(
      /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:type" content="article" />`,
    );
  }
  html = html.replace(
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:image" content="${ogImage}" />`,
  );

  // 7) <noscript> body content so crawlers without JS still see real text
  const noscript = `
    <noscript>
      <style>.pgm-noscript-body{max-width:760px;margin:24px auto;padding:0 16px;font-family:Inter,system-ui,sans-serif;color:#222;line-height:1.6}</style>
      <main class="pgm-noscript-body">
        <h1>${escapeHtml(meta.h1)}</h1>
        <p>${escapeHtml(meta.body)}</p>
        <p style="font-size:14px;color:#666">${meta.lang === 'ko' ? 'JavaScript를 활성화하면 전체 인터랙티브 기능을 사용할 수 있습니다.' : 'Enable JavaScript for the full interactive experience.'} <a href="${BASE}/${meta.lang}/">Pro Gear Match</a>.</p>
      </main>
    </noscript>`;
  html = html.replace(/<body([^>]*)>/, `<body$1>${noscript}`);

  // 8) Per-route JSON-LD.
  if (meta.isPost && meta.datePublished) {
    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': meta.h1,
      'description': meta.description,
      'image': ogImage,
      'datePublished': meta.datePublished,
      'dateModified': meta.datePublished,
      'inLanguage': meta.lang,
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
        { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${BASE}/${meta.lang}/` },
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

// Build the route table: for every (route, lang) pair, produce a meta record.
const routes = [];

for (const [route, langs] of Object.entries(STATIC_META)) {
  for (const lang of LANGS) {
    const m = langs[lang];
    const suffix = `/${route}/`;
    routes.push({
      writePath: `${lang}/${route}`,
      meta: { ...m, lang, path: `/${lang}${suffix}`, suffix, isPost: false },
    });
  }
}

for (const p of posts) {
  for (const lang of LANGS) {
    const title   = lang === 'ko' ? (p.koTitle   || p.enTitle)   : (p.enTitle   || p.koTitle);
    const excerpt = lang === 'ko' ? (p.koExcerpt || p.enExcerpt) : (p.enExcerpt || p.koExcerpt);
    const suffix = `/blog/${p.slug}/`;
    routes.push({
      writePath: `${lang}/blog/${p.slug}`,
      meta: {
        lang,
        path: `/${lang}${suffix}`,
        suffix,
        isPost: true,
        title: `${title} — Pro Gear Match Blog`,
        description: excerpt,
        h1: title,
        body: excerpt,
        datePublished: p.date,
      },
    });
  }
}

let count = 0;
for (const { writePath, meta } of routes) {
  const dir = join(DIST, writePath);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), buildRouteHtml(meta));
  count++;
}

// Per-language home pages at /en/ and /ko/.
for (const lang of LANGS) {
  const m = HOME_META[lang];
  const homeMeta = {
    ...m,
    lang,
    path: `/${lang}/`,
    suffix: `/`,
    isHome: true,
    isPost: false,
  };
  const dir = join(DIST, lang);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), buildRouteHtml(homeMeta));
  count++;
}

// Root dist/index.html: bare redirect shell so /  ->  /en/ for browsers AND
// crawlers (canonical signal + JS push). We deliberately do NOT serve content
// from / since hreflang split requires a canonical language URL.
const rootRedirect = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Pro Gear Match</title>
    <link rel="canonical" href="${BASE}/en/" />
    <link rel="alternate" hreflang="en" href="${BASE}/en/" />
    <link rel="alternate" hreflang="ko" href="${BASE}/ko/" />
    <link rel="alternate" hreflang="x-default" href="${BASE}/en/" />
    <meta http-equiv="refresh" content="0; url=/en/" />
    <meta name="robots" content="noindex" />
    <meta name="google-site-verification" content="iWpvo3tLATlV-UlS1aCZ6DcbESInYCw6h9ZOJC-6ytY" />
    <meta name="naver-site-verification" content="732c3b8a038d8d95d96f9b7001cd6d223eb08cce" />
    <script>
      (function () {
        var lang = (navigator.language || 'en').toLowerCase().startsWith('ko') ? 'ko' : 'en';
        var p = window.location.pathname;
        var qs = window.location.search || '';
        var hash = window.location.hash || '';
        // If user hit a stale path like /blog/foo, send them to /en/blog/foo.
        // Otherwise (just "/"), send to the detected language root.
        var target = (p === '/' || p === '')
          ? '/' + lang + '/'
          : '/' + lang + p.replace(/\\/$/, '') + '/';
        window.location.replace(target + qs + hash);
      })();
    </script>
  </head>
  <body>
    <p>Redirecting to <a href="/en/">Pro Gear Match</a>…</p>
  </body>
</html>
`;
writeFileSync(INDEX, rootRedirect);
count++;

console.log(`generate_route_html: wrote ${count} route HTML files with per-route metadata + hreflang split`);
console.log('  langs:', LANGS.join(', '));
console.log('  also wrote root dist/index.html as a /en/ redirect shell');
console.log('  dist top-level dirs:', readdirSync(DIST).filter(f => !f.includes('.')).join(', '));
