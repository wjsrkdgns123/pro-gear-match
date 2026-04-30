import { useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, Tag } from 'lucide-react';
import { Language } from '../translations';
import { PageType } from '../utils/pageType';
import { getAllPostsSorted, getPostBySlug, BlogTag } from '../data/blogPosts';
import { setSEO, seoForPage, seoForBlogPost } from '../utils/seo';

const TAG_LABELS: Record<BlogTag, { ko: string; en: string }> = {
  guide:       { ko: '가이드',      en: 'Guide' },
  analysis:    { ko: '분석',        en: 'Analysis' },
  gear:        { ko: '장비',        en: 'Gear' },
  pro:         { ko: '프로 스포트라이트', en: 'Pro Spotlight' },
  sensitivity: { ko: '감도',        en: 'Sensitivity' },
};

export function BlogView({
  slug,
  theme,
  lang,
  onNavigate,
  onSelectSlug,
}: {
  slug: string | null;
  theme: 'dark' | 'light';
  lang: Language;
  onNavigate: (p: PageType) => void;
  onSelectSlug: (slug: string | null) => void;
}) {
  const isDark = theme === 'dark';
  const isKo = lang === 'ko';

  const post = slug ? getPostBySlug(slug) : null;
  const posts = getAllPostsSorted();

  useEffect(() => {
    if (post) {
      const meta = isKo ? post.ko : post.en;
      setSEO(seoForBlogPost(meta.title, meta.excerpt, post.slug, lang));
    } else {
      setSEO(seoForPage('blog', lang));
    }
  }, [post, lang, isKo]);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#050507] text-[#e0e0e0]' : 'bg-[#f0f2f5] text-[#1a1a1a]'} font-sans`}>
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-12">
        {/* Back row */}
        <button
          onClick={() => {
            if (post) onSelectSlug(null);
            else onNavigate('home');
          }}
          className={`mb-8 flex items-center gap-2 px-3 py-2 rounded-none border text-[11px] font-mono uppercase tracking-widest transition-colors ${
            isDark
              ? 'bg-[#0c0c0e] border-[#1e1e22] text-[#888] hover:text-emerald-400 hover:border-emerald-500/40'
              : 'bg-white border-[#e5e7eb] text-[#4b5563] hover:text-emerald-600 hover:border-emerald-500/40'
          }`}
        >
          <ArrowLeft size={12} />
          {post ? (isKo ? '블로그 목록' : 'Back to Blog') : (isKo ? '메인으로' : 'Back to Home')}
        </button>

        {post ? (
          // ────── DETAIL VIEW ──────
          <article>
            <div className="mb-3 flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-emerald-500/80">
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={11} /> {post.date}
              </span>
              <span className={isDark ? 'text-[#333]' : 'text-[#d1d5db]'}>·</span>
              <span className="inline-flex items-center gap-1.5">
                <Clock size={11} /> {post.readMins} {isKo ? '분 읽기' : 'min read'}
              </span>
            </div>
            <h1 className={`text-3xl md:text-4xl font-black tracking-tight leading-tight mb-4 ${isDark ? 'text-white' : 'text-[#111]'}`}>
              {(isKo ? post.ko : post.en).title}
            </h1>
            <p className={`text-base leading-relaxed mb-6 ${isDark ? 'text-[#aaa]' : 'text-[#4b5563]'}`}>
              {(isKo ? post.ko : post.en).excerpt}
            </p>
            <div className="mb-8 flex items-center gap-2 flex-wrap">
              {post.tags.map(t => (
                <span
                  key={t}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-none text-[9px] font-mono uppercase tracking-widest ${
                    isDark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  <Tag size={9} />
                  {TAG_LABELS[t][isKo ? 'ko' : 'en']}
                </span>
              ))}
            </div>
            <div className={`prose-content text-[15px] ${isDark ? 'text-[#d1d5db]' : 'text-[#1f2937]'}`}>
              {(isKo ? post.ko : post.en).content()}
            </div>

            {/* Footer CTA */}
            <div className={`mt-12 p-6 rounded-none border ${isDark ? 'bg-[#0c0c0e] border-[#1e1e22]' : 'bg-white border-[#e5e7eb]'}`}>
              <div className={`text-[10px] font-mono uppercase tracking-widest mb-2 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                / TRY.IT.YOURSELF
              </div>
              <p className={`text-sm mb-4 ${isDark ? 'text-[#aaa]' : 'text-[#4b5563]'}`}>
                {isKo
                  ? '본인 설정과 가장 닮은 프로게이머를 1초 안에 찾아보세요.'
                  : 'Find the pro gamer whose setup mirrors yours in under a second.'}
              </p>
              <button
                onClick={() => onNavigate('home')}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-none font-black uppercase tracking-widest text-sm bg-emerald-500 hover:bg-emerald-400 text-black transition-colors"
              >
                {isKo ? '매칭 시작' : 'Find My Match'}
              </button>
            </div>
          </article>
        ) : (
          // ────── INDEX VIEW ──────
          <>
            <div className="mb-10">
              <div className={`text-[10px] font-mono uppercase tracking-[0.3em] mb-2 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                / BLOG
              </div>
              <h1 className={`text-4xl md:text-5xl font-black tracking-tighter mb-3 ${isDark ? 'text-white' : 'text-[#111]'}`}>
                {isKo ? '가이드 & 분석' : 'Guides & Analysis'}
              </h1>
              <p className={`text-base leading-relaxed max-w-2xl ${isDark ? 'text-[#aaa]' : 'text-[#4b5563]'}`}>
                {isKo
                  ? 'eDPI, 감도, 장비, 프로 분석까지 — FPS 게이머가 알아야 할 모든 것을 데이터 기반으로 풀어드립니다.'
                  : 'Everything an FPS gamer needs to know about eDPI, sensitivity, gear, and pro setups — backed by data.'}
              </p>
            </div>

            <div className="space-y-3">
              {posts.map(p => {
                const meta = isKo ? p.ko : p.en;
                return (
                  <button
                    key={p.slug}
                    onClick={() => onSelectSlug(p.slug)}
                    className={`group w-full text-left p-5 rounded-none border transition-all ${
                      isDark
                        ? 'bg-[#0c0c0e] border-[#1e1e22] hover:border-emerald-500/40 hover:bg-emerald-500/[0.02]'
                        : 'bg-white border-[#e5e7eb] hover:border-emerald-500/40 hover:bg-emerald-50/30'
                    }`}
                  >
                    <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest mb-2 text-emerald-500/70">
                      <span>{p.date}</span>
                      <span className={isDark ? 'text-[#333]' : 'text-[#d1d5db]'}>·</span>
                      <span>{p.readMins} {isKo ? '분' : 'min'}</span>
                      <span className={isDark ? 'text-[#333]' : 'text-[#d1d5db]'}>·</span>
                      <span>{p.tags.map(t => TAG_LABELS[t][isKo ? 'ko' : 'en']).join(' · ')}</span>
                    </div>
                    <h2 className={`text-xl font-black tracking-tight mb-2 group-hover:text-emerald-400 transition-colors ${isDark ? 'text-white' : 'text-[#111]'}`}>
                      {meta.title}
                    </h2>
                    <p className={`text-sm leading-relaxed ${isDark ? 'text-[#888]' : 'text-[#6b7280]'}`}>
                      {meta.excerpt}
                    </p>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
