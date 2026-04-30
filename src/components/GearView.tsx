import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Mouse, Keyboard, Monitor, Layers, ShoppingCart, ExternalLink, Search } from 'lucide-react';
import { Language } from '../translations';
import { PageType } from '../utils/pageType';
import type { ProGamer } from '../types';
import { getAmazonLink } from '../utils/gear';
import { slugify } from '../utils/slug';
import { GEAR_IMAGE_MANIFEST } from '../gearImageManifest';
import { GearImage } from './GearImage';
import { setSEO } from '../utils/seo';

type GearCategory = 'mouse' | 'keyboard' | 'monitor' | 'mousepad';

// Approximate retail prices — same source as the right-sidebar Most-Expensive
// panel. Items not in this map render without a price line. The list lives
// here so `/gear` can show a "price" column for the items we know about.
const PRICES: Record<string, number> = {
  'Razer Viper V3 Pro': 159, 'Razer DeathAdder V3 Pro': 149, 'Razer Viper V2 Pro': 149,
  'Logitech G Pro X Superlight 2': 159, 'Logitech G Pro X Superlight': 149, 'Logitech G Pro Wireless': 129,
  'Pulsar X2 Wireless': 129, 'Pulsar X2H Wireless': 139, 'Pulsar Xlite V3 Wireless': 134,
  'Zowie EC2-CW': 169, 'Zowie U2': 159, 'Zowie EC1-CW': 169,
  'Glorious Model O Wireless': 99, 'Glorious Model D Wireless': 99,
  'Endgame Gear OP1 8k': 89, 'Endgame Gear XM2we': 109,
  'Lamzu Atlantis OG V2': 119, 'Lamzu Maya': 89,
  'VAXEE XE Wireless': 159, 'VAXEE Outset AX Wireless': 169,
  'Wooting 60HE': 175, 'Wooting Two HE': 200, 'Wooting 80HE': 240,
  'Razer Huntsman V3 Pro': 200, 'Razer Huntsman Mini': 130,
  'Logitech G Pro X TKL': 200, 'Logitech G Pro X 60': 180,
  'SteelSeries Apex Pro TKL Gen 3': 250, 'SteelSeries Apex Pro Mini': 180,
  'Keychron Q1': 175, 'Ducky One 3 Mini': 119,
  'Asus ROG Swift PG27AQDP': 900, 'LG UltraGear 27GR95QE': 1000,
  'Asus ROG Swift PG27AQDM': 1000, 'Alienware AW2725DF': 900,
  'Samsung Odyssey OLED G6': 900, 'BenQ Zowie XL2566K': 600,
  'BenQ Zowie XL2746K': 700, 'BenQ Zowie XL2586X': 700,
  'BenQ Zowie XL2546K': 500, 'BenQ Zowie XL2540': 380,
  'Asus ROG Swift PG259QN': 700, 'Alienware AW2725Q': 1000,
  'Zowie XL2566K': 600, 'ZOWIE XL2566K': 600,
  'Zowie XL2586X': 700, 'ZOWIE XL2586X': 700,
  'Zowie XL2546K': 500, 'ZOWIE XL2546K': 500,
  'Zowie XL2540': 380, 'ZOWIE XL2540': 380,
  'ASUS PG27AQN': 900, 'Asus PG27AQN': 900,
  'ASUS PG259QN': 700, 'Asus PG259QN': 700,
  'Artisan FX Hayate Otsu': 60, 'Artisan FX Zero': 60, 'Artisan Type-99': 60, 'Artisan Hien': 60,
  'Lethal Gaming Gear Saturn Pro': 50, 'Lethal Gaming Gear Saturn': 45,
  'Wallhack SP-004': 65, 'X-raypad Equate Plus': 30,
  'Logitech G640': 40, 'Razer Gigantus V2': 50, 'SteelSeries QcK Heavy XXL': 40,
};

interface Props {
  slug: string | null;
  allProList: ProGamer[];
  theme: 'dark' | 'light';
  lang: Language;
  onNavigate: (p: PageType) => void;
  onSelectSlug: (slug: string | null) => void;
}

interface GearEntry {
  name: string;
  slug: string;
  category: GearCategory;
  count: number;
  pros: ProGamer[];
}

const CATEGORY_META: Record<GearCategory, { ko: string; en: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
  mouse:    { ko: '마우스',    en: 'Mouse',    icon: Mouse },
  keyboard: { ko: '키보드',    en: 'Keyboard', icon: Keyboard },
  monitor:  { ko: '모니터',    en: 'Monitor',  icon: Monitor },
  mousepad: { ko: '마우스패드', en: 'Mousepad', icon: Layers },
};

export function GearView({ slug, allProList, theme, lang, onNavigate, onSelectSlug }: Props) {
  const isDark = theme === 'dark';
  const isKo = lang === 'ko';

  const [activeCat, setActiveCat] = useState<GearCategory>('mouse');
  const [search, setSearch] = useState('');

  // Aggregate gear usage from all pros
  const gearMap = useMemo(() => {
    const map = new Map<string, GearEntry>();
    const fields: Array<[GearCategory, (p: ProGamer) => string]> = [
      ['mouse',    p => (p.gear.mouse || p.gear.controller || '').trim()],
      ['keyboard', p => (p.gear.keyboard || '').trim()],
      ['monitor',  p => (p.gear.monitor || '').trim()],
      ['mousepad', p => (p.gear.mousepad || '').trim()],
    ];
    for (const p of allProList) {
      for (const [cat, getter] of fields) {
        const name = getter(p);
        if (!name) continue;
        const key = `${cat}::${name.toLowerCase()}`;
        const existing = map.get(key);
        if (existing) {
          existing.count += 1;
          existing.pros.push(p);
        } else {
          map.set(key, { name, slug: slugify(name), category: cat, count: 1, pros: [p] });
        }
      }
    }
    return map;
  }, [allProList]);

  // Find currently-selected gear by slug across all categories
  const selectedGear = useMemo(() => {
    if (!slug) return null;
    for (const entry of gearMap.values()) {
      if (entry.slug === slug) return entry;
    }
    return null;
  }, [slug, gearMap]);

  // Index-view filtering — must be declared BEFORE any conditional return
  // to keep hook order stable across renders.
  const allInCategory = useMemo(() => {
    const arr = [...gearMap.values()].filter(g => g.category === activeCat);
    const q = search.trim().toLowerCase();
    const filtered = q ? arr.filter(g => g.name.toLowerCase().includes(q)) : arr;
    return filtered.sort((a, b) => b.count - a.count);
  }, [gearMap, activeCat, search]);

  useEffect(() => {
    if (selectedGear) {
      setSEO({
        title: isKo
          ? `${selectedGear.name} 사용 프로게이머 | ProGear Match`
          : `${selectedGear.name} — Pro Gamer Users | ProGear Match`,
        description: isKo
          ? `${selectedGear.name}을(를) 사용하는 프로게이머 ${selectedGear.count}명의 감도와 설정 정보를 확인하세요.`
          : `${selectedGear.count} pros use the ${selectedGear.name}. See their sensitivity, eDPI, and full setups.`,
        ogType: 'article',
      });
    } else {
      setSEO({
        title: isKo ? '장비 정보 — 마우스, 키보드, 모니터, 마우스패드 | ProGear Match' : 'Gear Database — Mice, Keyboards, Monitors, Pads | ProGear Match',
        description: isKo
          ? '4개 게임 1800+ 프로게이머가 사용하는 장비를 카테고리별로 확인하고 가격, 사용 비율을 비교하세요.'
          : 'Browse mice, keyboards, monitors, and mousepads used by 1,800+ FPS pros across 4 games.',
      });
    }
  }, [selectedGear, isKo]);

  // Detail view
  if (selectedGear) {
    const amazonUrl = getAmazonLink(selectedGear.name);
    const price = PRICES[selectedGear.name];
    const Icon = CATEGORY_META[selectedGear.category].icon;
    const totalInCat = [...gearMap.values()].filter(g => g.category === selectedGear.category).reduce((s, g) => s + g.count, 0);
    const usagePct = totalInCat > 0 ? Math.round((selectedGear.count / totalInCat) * 100) : 0;
    const sortedPros = [...selectedGear.pros].sort((a, b) => (b.settings?.edpi || 0) - (a.settings?.edpi || 0));

    return (
      <div className={`min-h-screen ${isDark ? 'bg-[#050507] text-[#e0e0e0]' : 'bg-[#f0f2f5] text-[#1a1a1a]'} font-sans`}>
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-12">
          <button
            onClick={() => onSelectSlug(null)}
            className={`mb-8 flex items-center gap-2 px-3 py-2 rounded-none border text-[11px] font-mono uppercase tracking-widest transition-colors ${
              isDark ? 'bg-[#0c0c0e] border-[#1e1e22] text-[#888] hover:text-emerald-400' : 'bg-white border-[#e5e7eb] text-[#4b5563] hover:text-emerald-600'
            }`}
          >
            <ArrowLeft size={12} />
            {isKo ? '장비 목록' : 'Back to Gear'}
          </button>

          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
            {/* Image card */}
            <div className={`rounded-none border ${isDark ? 'bg-[#0c0c0e] border-[#1e1e22]' : 'bg-white border-[#e5e7eb]'} overflow-hidden`}>
              <GearImage productName={selectedGear.name} icon={selectedGear.category} theme={theme} />
            </div>

            {/* Info */}
            <div>
              <div className={`flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest mb-2 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                <Icon size={11} />
                {CATEGORY_META[selectedGear.category][isKo ? 'ko' : 'en']}
              </div>
              <h1 className={`text-3xl md:text-4xl font-black tracking-tight mb-4 ${isDark ? 'text-white' : 'text-[#111]'}`}>
                {selectedGear.name}
              </h1>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className={`p-3 rounded-none border ${isDark ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}>
                  <div className={`text-[9px] font-mono uppercase tracking-widest mb-1 ${isDark ? 'text-emerald-300/70' : 'text-emerald-700/70'}`}>
                    {isKo ? '사용 프로' : 'Pro Users'}
                  </div>
                  <div className={`text-2xl font-black tabular-nums ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{selectedGear.count}</div>
                </div>
                <div className={`p-3 rounded-none border ${isDark ? 'bg-[#0c0c0e] border-[#1e1e22]' : 'bg-white border-[#e5e7eb]'}`}>
                  <div className={`text-[9px] font-mono uppercase tracking-widest mb-1 ${isDark ? 'text-[#555]' : 'text-[#9ca3af]'}`}>
                    {isKo ? '카테고리 점유율' : 'Category Share'}
                  </div>
                  <div className={`text-2xl font-black tabular-nums ${isDark ? 'text-white' : 'text-[#111]'}`}>{usagePct}%</div>
                </div>
                <div className={`p-3 rounded-none border ${isDark ? 'bg-[#0c0c0e] border-[#1e1e22]' : 'bg-white border-[#e5e7eb]'}`}>
                  <div className={`text-[9px] font-mono uppercase tracking-widest mb-1 ${isDark ? 'text-[#555]' : 'text-[#9ca3af]'}`}>
                    {isKo ? '추정가' : 'Approx. Price'}
                  </div>
                  <div className={`text-2xl font-black tabular-nums ${price ? (isDark ? 'text-amber-400' : 'text-amber-600') : (isDark ? 'text-[#444]' : 'text-[#9ca3af]')}`}>
                    {price ? `$${price}` : '—'}
                  </div>
                </div>
              </div>

              {amazonUrl ? (
                <a
                  href={amazonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-none font-bold uppercase tracking-widest text-xs transition-colors ${
                    isDark ? 'bg-amber-500/10 border border-amber-500/40 text-amber-400 hover:bg-amber-500/20' : 'bg-amber-50 border border-amber-300 text-amber-700 hover:bg-amber-100'
                  }`}
                >
                  <ShoppingCart size={13} /> {isKo ? '아마존에서 구매' : 'Buy on Amazon'}
                </a>
              ) : (
                <a
                  href={`https://www.amazon.com/s?k=${encodeURIComponent(selectedGear.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-none font-mono uppercase tracking-widest text-xs transition-colors ${
                    isDark ? 'bg-[#0c0c0e] border border-[#1e1e22] text-[#888] hover:text-emerald-400' : 'bg-white border border-[#e5e7eb] text-[#4b5563] hover:text-emerald-600'
                  }`}
                >
                  <ExternalLink size={13} /> {isKo ? '아마존 검색' : 'Search on Amazon'}
                </a>
              )}
            </div>
          </div>

          {/* Pro users list */}
          <div className="mt-12">
            <h2 className={`text-xl font-black tracking-tight mb-4 ${isDark ? 'text-white' : 'text-[#111]'}`}>
              {isKo ? `${selectedGear.name} 사용 프로 (${selectedGear.count}명)` : `Pros Using ${selectedGear.name} (${selectedGear.count})`}
            </h2>
            <div className={`rounded-none border overflow-hidden ${isDark ? 'border-[#1e1e22]' : 'border-[#e5e7eb]'}`}>
              <div className={`grid grid-cols-[1fr_auto_auto_auto] text-[9px] font-mono uppercase tracking-widest font-bold ${isDark ? 'bg-[#0a0a0a] text-[#555]' : 'bg-[#f9fafb] text-[#6b7280]'}`}>
                <div className="px-3 py-2">{isKo ? '선수' : 'Player'}</div>
                <div className="px-3 py-2">{isKo ? '팀' : 'Team'}</div>
                <div className="px-3 py-2">{isKo ? '게임' : 'Game'}</div>
                <div className="px-3 py-2 text-right">eDPI</div>
              </div>
              {sortedPros.map((p, i) => (
                <a
                  key={p.id || `${p.name}-${i}`}
                  href={p.profileUrl || `https://www.google.com/search?q=${encodeURIComponent(`${p.name} ${p.game} settings`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`grid grid-cols-[1fr_auto_auto_auto] text-[12px] transition-colors ${i > 0 ? (isDark ? 'border-t border-[#1e1e22]' : 'border-t border-[#e5e7eb]') : ''} ${isDark ? 'hover:bg-emerald-500/5' : 'hover:bg-emerald-50'}`}
                >
                  <div className={`px-3 py-2 flex items-center gap-2 truncate ${isDark ? 'text-white' : 'text-[#111]'}`}>
                    {p.nationality && (
                      <img src={`https://flagcdn.com/20x15/${p.nationality.toLowerCase()}.png`} alt="" loading="lazy" className="w-5 h-3.5 rounded-sm flex-shrink-0 object-cover" />
                    )}
                    <span className="font-bold truncate">{p.name}</span>
                  </div>
                  <div className={`px-3 py-2 truncate ${isDark ? 'text-[#888]' : 'text-[#6b7280]'}`}>{p.team}</div>
                  <div className={`px-3 py-2 font-mono text-[10px] uppercase tracking-widest ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    {p.game.split(' ')[0].slice(0, 4).toUpperCase()}
                  </div>
                  <div className={`px-3 py-2 font-mono font-bold tabular-nums text-right ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    {p.settings?.edpi?.toFixed(0) || '—'}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Index view — grouped by category
  const totalProsInCat = allInCategory.reduce((s, g) => s + g.count, 0);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#050507] text-[#e0e0e0]' : 'bg-[#f0f2f5] text-[#1a1a1a]'} font-sans`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <button
          onClick={() => onNavigate('home')}
          className={`mb-8 flex items-center gap-2 px-3 py-2 rounded-none border text-[11px] font-mono uppercase tracking-widest transition-colors ${
            isDark ? 'bg-[#0c0c0e] border-[#1e1e22] text-[#888] hover:text-emerald-400' : 'bg-white border-[#e5e7eb] text-[#4b5563] hover:text-emerald-600'
          }`}
        >
          <ArrowLeft size={12} />
          {isKo ? '메인으로' : 'Back to Home'}
        </button>

        <div className="mb-8">
          <div className={`text-[10px] font-mono uppercase tracking-[0.3em] mb-2 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
            / GEAR.DATABASE
          </div>
          <h1 className={`text-4xl md:text-5xl font-black tracking-tighter mb-3 ${isDark ? 'text-white' : 'text-[#111]'}`}>
            {isKo ? '장비 정보' : 'Gear Database'}
          </h1>
          <p className={`text-base leading-relaxed max-w-2xl ${isDark ? 'text-[#aaa]' : 'text-[#4b5563]'}`}>
            {isKo
              ? `${allProList.length}명의 프로게이머가 사용하는 장비를 카테고리별로 확인하고 가격, 사용 비율, 사용 선수 목록을 비교하세요.`
              : `Browse the gear used by ${allProList.length} pro gamers. Compare prices, usage share, and see who uses what.`}
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(['mouse', 'keyboard', 'monitor', 'mousepad'] as GearCategory[]).map(cat => {
            const meta = CATEGORY_META[cat];
            const Icon = meta.icon;
            const count = [...gearMap.values()].filter(g => g.category === cat).length;
            const isActive = activeCat === cat;
            return (
              <button
                key={cat}
                onClick={() => { setActiveCat(cat); setSearch(''); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-none border text-[11px] font-mono uppercase tracking-widest font-bold transition-colors ${
                  isActive
                    ? (isDark ? 'bg-emerald-500 border-emerald-500 text-black' : 'bg-emerald-500 border-emerald-500 text-black')
                    : (isDark ? 'bg-[#0c0c0e] border-[#1e1e22] text-[#888] hover:text-emerald-400 hover:border-emerald-500/40' : 'bg-white border-[#e5e7eb] text-[#4b5563] hover:text-emerald-600 hover:border-emerald-500/40')
                }`}
              >
                <Icon size={13} />
                {meta[isKo ? 'ko' : 'en']}
                <span className={`text-[9px] font-mono ${isActive ? 'text-black/60' : (isDark ? 'text-[#444]' : 'text-[#9ca3af]')}`}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#555]' : 'text-[#9ca3af]'}`} size={13} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isKo ? '장비명 검색…' : 'Search gear…'}
            className={`w-full pl-9 pr-3 py-2 text-[12px] font-mono rounded-none border focus:outline-none ${
              isDark ? 'bg-[#0c0c0e] border-[#1e1e22] text-[#ddd] placeholder:text-[#555] focus:border-emerald-500/40' : 'bg-white border-[#e5e7eb] text-[#111] placeholder:text-[#9ca3af] focus:border-emerald-400'
            }`}
          />
        </div>

        {/* Gear grid */}
        {allInCategory.length === 0 ? (
          <div className={`p-10 text-center text-[12px] font-mono uppercase tracking-widest ${isDark ? 'text-[#555]' : 'text-[#9ca3af]'}`}>
            {isKo ? '결과 없음' : 'No results'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allInCategory.map(g => {
              const price = PRICES[g.name];
              const usagePct = totalProsInCat > 0 ? Math.round((g.count / totalProsInCat) * 100) : 0;
              const hasImage = !!GEAR_IMAGE_MANIFEST[g.slug];
              return (
                <button
                  key={g.slug + '::' + g.name}
                  onClick={() => onSelectSlug(g.slug)}
                  className={`group flex flex-col text-left rounded-none border overflow-hidden transition-all ${
                    isDark ? 'bg-[#0c0c0e] border-[#1e1e22] hover:border-emerald-500/40' : 'bg-white border-[#e5e7eb] hover:border-emerald-500/40 hover:shadow-md'
                  }`}
                >
                  {hasImage ? (
                    <GearImage productName={g.name} icon={g.category} theme={theme} />
                  ) : (
                    <div className={`flex items-center justify-center h-28 ${isDark ? 'bg-[#0a0a0a]' : 'bg-[#f9fafb]'}`}>
                      {(() => { const Icon = CATEGORY_META[g.category].icon; return <Icon size={36} className={isDark ? 'text-[#333]' : 'text-[#d1d5db]'} />; })()}
                    </div>
                  )}
                  <div className="p-3 flex-1 flex flex-col gap-2">
                    <p className={`text-[12px] font-bold leading-tight ${isDark ? 'text-white' : 'text-[#111]'} group-hover:text-emerald-400 transition-colors`}>
                      {g.name}
                    </p>
                    <div className="mt-auto flex items-center justify-between text-[10px] font-mono">
                      <span className={`uppercase tracking-widest ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        {g.count}{isKo ? '명' : ' pros'} · {usagePct}%
                      </span>
                      {price && (
                        <span className={`font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>${price}</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
