// Client-side SEO helper: updates document <title>, meta description, canonical,
// and OpenGraph/Twitter tags on route change. Lightweight alternative to react-helmet.

type SEOInput = {
  title: string;
  description?: string;
  canonical?: string;
  image?: string;
  ogType?: 'website' | 'article' | 'profile';
};

const SITE_NAME = 'ProGear Match';
const DEFAULT_IMAGE = '/favicon-512.png';

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  if (!content) return;
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string) {
  if (!href) return;
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function setSEO({ title, description, canonical, image, ogType = 'website' }: SEOInput) {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  document.title = fullTitle;

  if (description) upsertMeta('name', 'description', description);

  const url = canonical || (typeof window !== 'undefined' ? window.location.href : '');
  if (url) upsertLink('canonical', url);

  const img = image || DEFAULT_IMAGE;

  // OpenGraph
  upsertMeta('property', 'og:title', fullTitle);
  if (description) upsertMeta('property', 'og:description', description);
  upsertMeta('property', 'og:type', ogType);
  if (url) upsertMeta('property', 'og:url', url);
  upsertMeta('property', 'og:site_name', SITE_NAME);
  upsertMeta('property', 'og:image', img);

  // Twitter
  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', fullTitle);
  if (description) upsertMeta('name', 'twitter:description', description);
  upsertMeta('name', 'twitter:image', img);
}

export function seoForPage(page: string, lang: 'en' | 'ko'): SEOInput {
  const isKo = lang === 'ko';
  const map: Record<string, SEOInput> = {
    home: {
      title: isKo
        ? '프로게이머 장비·감도 매칭 - ProGear Match'
        : 'Find Your Pro Gamer Twin — ProGear Match',
      description: isKo
        ? 'Valorant, CS2, Overwatch 2, Apex Legends 프로게이머의 마우스, 키보드, 감도(eDPI) 설정을 비교하고 나와 가장 비슷한 프로를 찾아보세요.'
        : 'Compare your mouse, keyboard, and sensitivity (eDPI) with pro players in Valorant, CS2, Overwatch 2, and Apex Legends. Find the pro that matches you.',
    },
    'how-it-works': {
      title: isKo ? '작동 방식 - ProGear Match' : 'How It Works — ProGear Match',
      description: isKo
        ? 'eDPI 알고리즘으로 나와 가장 비슷한 프로게이머를 찾는 방법을 알아보세요.'
        : 'Learn how our eDPI algorithm matches your settings to pro gamers.',
    },
    about: {
      title: isKo ? '소개 - ProGear Match' : 'About — ProGear Match',
      description: isKo
        ? 'ProGear Match는 프로게이머 장비 데이터베이스와 매칭 도구입니다.'
        : 'ProGear Match is a pro gamer gear database and matching tool.',
    },
    privacy: {
      title: isKo ? '개인정보처리방침 - ProGear Match' : 'Privacy Policy — ProGear Match',
      description: isKo ? '개인정보 수집 및 이용 방침.' : 'Our privacy policy.',
    },
    terms: {
      title: isKo ? '이용약관 - ProGear Match' : 'Terms of Service — ProGear Match',
      description: isKo ? '서비스 이용약관.' : 'Terms of service.',
    },
    affiliate: {
      title: isKo ? '제휴 고지 - ProGear Match' : 'Affiliate Disclosure — ProGear Match',
      description: isKo
        ? 'Amazon Associates 제휴 링크 사용에 관한 고지사항.'
        : 'Disclosure about our Amazon Associates affiliate links.',
    },
    blog: {
      title: isKo ? '블로그 - 가이드 & 분석 - ProGear Match' : 'Blog — Guides & Analysis — ProGear Match',
      description: isKo
        ? 'eDPI, 감도, 장비, 프로 분석 등 FPS 게이머가 알아야 할 모든 것을 데이터 기반으로 풀어드립니다.'
        : 'Data-driven guides on eDPI, sensitivity, gear, and pro analysis for FPS gamers.',
    },
  };
  return map[page] || map.home;
}

/** SEO meta for an individual blog post. */
export function seoForBlogPost(
  title: string,
  excerpt: string,
  slug: string,
  lang: 'en' | 'ko',
): SEOInput {
  return {
    title: lang === 'ko' ? `${title} - 블로그 - ProGear Match` : `${title} — Blog — ProGear Match`,
    description: excerpt,
    canonical: typeof window !== 'undefined' ? `${window.location.origin}/blog/${slug}` : undefined,
    ogType: 'article',
  };
}

export function seoForPro(
  name: string,
  team: string,
  game: string,
  edpi: number,
  mouse: string,
  lang: 'en' | 'ko',
): SEOInput {
  const isKo = lang === 'ko';
  const title = isKo
    ? `${name} ${game} 감도·장비 (${team})`
    : `${name} ${game} Settings & Gear (${team})`;
  const description = isKo
    ? `${name}(${team}) ${game} 프로 선수의 감도 eDPI ${edpi}, 사용 마우스 ${mouse || '비공개'}. 나와 감도를 비교해보세요.`
    : `${name} of ${team} plays ${game} at eDPI ${edpi} with ${mouse || 'undisclosed mouse'}. Compare your sensitivity.`;
  return { title, description, ogType: 'profile' };
}
