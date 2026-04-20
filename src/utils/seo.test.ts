import { describe, it, expect, beforeEach } from 'vitest';
import { seoForPage, seoForPro, setSEO } from './seo';

describe('seoForPage', () => {
  it('returns localized titles for EN and KO', () => {
    const en = seoForPage('home', 'en');
    const ko = seoForPage('home', 'ko');
    expect(en.title).toMatch(/ProGear Match/);
    expect(ko.title).toMatch(/ProGear Match|프로게이머/);
    expect(en.title).not.toBe(ko.title);
  });

  it('falls back to home for unknown page', () => {
    const unk = seoForPage('nonexistent', 'en');
    const home = seoForPage('home', 'en');
    expect(unk.title).toBe(home.title);
  });

  it('provides a description for every known page', () => {
    for (const page of ['home', 'how-it-works', 'about', 'privacy', 'terms', 'affiliate']) {
      const s = seoForPage(page, 'en');
      expect(s.description).toBeTruthy();
    }
  });
});

describe('seoForPro', () => {
  it('includes name, team, game, and edpi in title/description', () => {
    const s = seoForPro('TenZ', 'Sentinels', 'Valorant', 280, 'Finalmouse Starlight', 'en');
    expect(s.title).toContain('TenZ');
    expect(s.title).toContain('Valorant');
    expect(s.description).toContain('Sentinels');
    expect(s.description).toContain('280');
    expect(s.ogType).toBe('profile');
  });

  it('handles missing mouse gracefully', () => {
    const s = seoForPro('aspas', 'Leviatán', 'Valorant', 320, '', 'en');
    expect(s.description).toMatch(/undisclosed/i);
  });
});

describe('setSEO', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.title = '';
  });

  it('sets document.title with site name appended', () => {
    setSEO({ title: 'Test Page' });
    expect(document.title).toContain('Test Page');
    expect(document.title).toContain('ProGear Match');
  });

  it('upserts meta description', () => {
    setSEO({ title: 'X', description: 'hello world' });
    const m = document.head.querySelector('meta[name="description"]') as HTMLMetaElement;
    expect(m?.content).toBe('hello world');
  });

  it('upserts canonical link', () => {
    setSEO({ title: 'X', canonical: 'https://example.com/a' });
    const l = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    expect(l?.href).toContain('example.com/a');
  });

  it('sets OG and Twitter tags', () => {
    setSEO({ title: 'Y', description: 'd', image: '/img.png' });
    expect(document.head.querySelector('meta[property="og:title"]')).toBeTruthy();
    expect(document.head.querySelector('meta[name="twitter:card"]')).toBeTruthy();
    expect(
      document.head
        .querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content,
    ).toBe('/img.png');
  });

  it('does not duplicate meta tags on repeated calls', () => {
    setSEO({ title: 'A', description: 'd1' });
    setSEO({ title: 'B', description: 'd2' });
    const metas = document.head.querySelectorAll('meta[name="description"]');
    expect(metas.length).toBe(1);
    expect((metas[0] as HTMLMetaElement).content).toBe('d2');
  });
});
