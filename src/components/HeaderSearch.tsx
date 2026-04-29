import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X, Flag, Gamepad2, ChevronDown, ExternalLink } from 'lucide-react';
import { GAMES } from '../constants/games';
import type { ProGamer } from '../types';
import type { Language } from '../translations';
import { formatEdpi } from '../utils/gear';

type Theme = 'dark' | 'light';

interface Props {
  allProList: ProGamer[];
  lang: Language;
  theme: Theme;
}

// Memoized so that App-level re-renders (matches, settings, etc.) don't
// re-render the search bar. State for menu toggles + filter selections lives
// here, so opening menus is instant — no App re-render involved.
export const HeaderSearch = React.memo(function HeaderSearch({ allProList, lang, theme }: Props) {
  const [globalSearch, setGlobalSearch] = useState('');
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [searchGameFilter, setSearchGameFilter] = useState<string>('');
  const [searchCountryFilter, setSearchCountryFilter] = useState<string>('');
  const [showSearchGameMenu, setShowSearchGameMenu] = useState(false);
  const [showSearchCountryMenu, setShowSearchCountryMenu] = useState(false);

  const gameMenuWrapRef = useRef<HTMLDivElement>(null);
  const countryMenuWrapRef = useRef<HTMLDivElement>(null);
  const globalSearchWrapRef = useRef<HTMLDivElement>(null);

  // Outside-click closer (no intercepting backdrop, so the new trigger fires
  // on the same gesture).
  useEffect(() => {
    if (!showSearchGameMenu && !showSearchCountryMenu && !showGlobalSearch) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (showSearchGameMenu && gameMenuWrapRef.current && !gameMenuWrapRef.current.contains(t)) {
        setShowSearchGameMenu(false);
      }
      if (showSearchCountryMenu && countryMenuWrapRef.current && !countryMenuWrapRef.current.contains(t)) {
        setShowSearchCountryMenu(false);
      }
      if (showGlobalSearch && globalSearchWrapRef.current && !globalSearchWrapRef.current.contains(t)) {
        setShowGlobalSearch(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showSearchGameMenu, showSearchCountryMenu, showGlobalSearch]);

  const regionDisplayNames = useMemo(() => {
    try { return new Intl.DisplayNames([lang === 'ko' ? 'ko' : 'en'], { type: 'region' }); }
    catch { return null; }
  }, [lang]);
  const countryName = useMemo(() => (code: string) => {
    if (!regionDisplayNames) return code;
    try { return regionDisplayNames.of(code) || code; } catch { return code; }
  }, [regionDisplayNames]);

  const countryList = useMemo(() => {
    const counts = new Map<string, number>();
    allProList.forEach(p => {
      if (!p.nationality) return;
      const c = p.nationality.toUpperCase();
      if (c.length !== 2) return;
      counts.set(c, (counts.get(c) || 0) + 1);
    });
    return [...counts.keys()]
      .filter(code => countryName(code) !== code)
      .sort((a, b) => countryName(a).localeCompare(countryName(b), lang === 'ko' ? 'ko' : 'en'));
  }, [allProList, lang, countryName]);

  const q = globalSearch.trim().toLowerCase();
  const searchResults = useMemo(() => {
    const hasQuery = q.length > 0;
    const hasFilters = !!(searchGameFilter || searchCountryFilter);
    if (!hasQuery && !hasFilters) return [];
    const out: ProGamer[] = [];
    for (const p of allProList) {
      if (searchGameFilter && p.game !== searchGameFilter) continue;
      if (searchCountryFilter && (p.nationality || '').toUpperCase() !== searchCountryFilter) continue;
      if (hasQuery) {
        const nameMatch = p.name.toLowerCase().includes(q);
        const teamMatch = p.team && p.team.toLowerCase().includes(q);
        if (!nameMatch && !teamMatch) continue;
      }
      out.push(p);
      if (out.length >= 10) break;
    }
    return out;
  }, [q, searchGameFilter, searchCountryFilter, allProList]);

  const hasFilters = !!(searchGameFilter || searchCountryFilter);
  const dropdownOpen = showGlobalSearch && (!!q || hasFilters);
  const activeFilterCount = (searchGameFilter ? 1 : 0) + (searchCountryFilter ? 1 : 0);

  return (
    <div ref={globalSearchWrapRef} className="hidden md:block flex-1 max-w-2xl mx-6 relative">
      <div className="flex items-center gap-1.5">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-[#555]' : 'text-[#9ca3af]'}`} size={13} />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => { setGlobalSearch(e.target.value); setShowGlobalSearch(true); }}
            onFocus={() => { setShowGlobalSearch(true); setShowSearchGameMenu(false); setShowSearchCountryMenu(false); }}
            placeholder={lang === 'ko' ? '프로게이머 검색 — 이름 · 팀' : 'Search pros — name · team'}
            className={`w-full pl-9 pr-7 py-2 text-[12px] font-mono rounded-none border transition-colors focus:outline-none ${
              theme === 'dark'
                ? 'bg-white/[0.04] border-white/[0.08] text-[#ddd] placeholder:text-[#555] focus:border-emerald-500/40 focus:bg-white/[0.06]'
                : 'bg-white border-[#e5e7eb] text-[#111] placeholder:text-[#9ca3af] focus:border-emerald-400'
            }`}
          />
          {globalSearch && (
            <button
              onClick={() => { setGlobalSearch(''); }}
              aria-label="clear"
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-none transition-colors ${theme === 'dark' ? 'text-[#666] hover:text-emerald-400' : 'text-[#9ca3af] hover:text-emerald-600'}`}
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Game filter button */}
        <div ref={gameMenuWrapRef} className="relative">
          <button
            onClick={() => { setShowSearchGameMenu(v => !v); setShowSearchCountryMenu(false); setShowGlobalSearch(false); }}
            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-none text-[10px] font-mono uppercase tracking-widest border transition-colors ${
              searchGameFilter
                ? (theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-emerald-50 border-emerald-300 text-emerald-700')
                : (theme === 'dark' ? 'bg-white/[0.04] border-white/[0.08] text-[#888] hover:text-emerald-400 hover:border-emerald-500/30' : 'bg-white border-[#e5e7eb] text-[#4b5563] hover:text-emerald-600 hover:border-emerald-300')
            }`}
          >
            {(() => {
              const g = GAMES.find(g => g.name === searchGameFilter);
              return g
                ? <img src={g.logo} alt="" title={g.name} className={`object-contain ${g.name === 'CS2' ? 'w-5 h-5' : 'w-4 h-4'}`} />
                : (
                  <>
                    <Gamepad2 size={11} />
                    <span>{lang === 'ko' ? '게임' : 'GAME'}</span>
                  </>
                );
            })()}
            <ChevronDown size={9} />
          </button>
          {showSearchGameMenu && (
            <div className={`absolute right-0 mt-1 w-44 rounded-none border shadow-2xl overflow-hidden z-50 ${theme === 'dark' ? 'bg-[#0c0c0e] border-[#1e1e22]' : 'bg-white border-[#e5e7eb]'}`}>
              <button
                onClick={() => { setSearchGameFilter(''); setShowSearchGameMenu(false); }}
                className={`w-full text-left px-3 py-2 text-[11px] font-mono uppercase tracking-widest transition-colors ${searchGameFilter === '' ? (theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700') : (theme === 'dark' ? 'text-[#888] hover:bg-emerald-500/5' : 'text-[#4b5563] hover:bg-emerald-50')}`}
              >
                {lang === 'ko' ? '모든 게임' : 'All Games'}
              </button>
              {GAMES.map(g => (
                <button
                  key={g.name}
                  onClick={() => { setSearchGameFilter(g.name); setShowSearchGameMenu(false); }}
                  className={`w-full text-left flex items-center gap-2 px-3 py-2 text-[11px] font-mono uppercase tracking-widest transition-colors ${searchGameFilter === g.name ? (theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700') : (theme === 'dark' ? 'text-[#888] hover:bg-emerald-500/5' : 'text-[#4b5563] hover:bg-emerald-50')}`}
                >
                  <img src={g.logo} alt="" className={`object-contain ${g.name === 'CS2' ? 'w-5 h-5' : 'w-3.5 h-3.5'}`} />
                  {g.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Country filter button */}
        <div ref={countryMenuWrapRef} className="relative">
          <button
            onClick={() => { setShowSearchCountryMenu(v => !v); setShowSearchGameMenu(false); setShowGlobalSearch(false); }}
            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-none text-[10px] font-mono uppercase tracking-widest border transition-colors ${
              searchCountryFilter
                ? (theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-emerald-50 border-emerald-300 text-emerald-700')
                : (theme === 'dark' ? 'bg-white/[0.04] border-white/[0.08] text-[#888] hover:text-emerald-400 hover:border-emerald-500/30' : 'bg-white border-[#e5e7eb] text-[#4b5563] hover:text-emerald-600 hover:border-emerald-300')
            }`}
          >
            {searchCountryFilter ? (
              <img
                src={`https://flagcdn.com/20x15/${searchCountryFilter.toLowerCase()}.png`}
                srcSet={`https://flagcdn.com/40x30/${searchCountryFilter.toLowerCase()}.png 2x`}
                alt=""
                title={countryName(searchCountryFilter)}
                className="w-5 h-3.5 rounded-none object-cover"
              />
            ) : (
              <>
                <Flag size={11} />
                <span>{lang === 'ko' ? '국가' : 'COUNTRY'}</span>
              </>
            )}
            <ChevronDown size={9} />
          </button>
          {showSearchCountryMenu && (
            <div className={`absolute right-0 mt-1 w-56 max-h-80 overflow-y-auto pgm-scroll rounded-none border shadow-2xl z-50 ${theme === 'dark' ? 'bg-[#0c0c0e] border-[#1e1e22]' : 'bg-white border-[#e5e7eb] pgm-scroll-light'}`}>
              <button
                onClick={() => { setSearchCountryFilter(''); setShowSearchCountryMenu(false); }}
                className={`w-full text-left px-3 py-2 text-[11px] font-mono uppercase tracking-widest transition-colors ${searchCountryFilter === '' ? (theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700') : (theme === 'dark' ? 'text-[#888] hover:bg-emerald-500/5' : 'text-[#4b5563] hover:bg-emerald-50')}`}
              >
                {lang === 'ko' ? '모든 국가' : 'All Countries'}
              </button>
              {countryList.map(code => (
                <button
                  key={code}
                  onClick={() => { setSearchCountryFilter(code); setShowSearchCountryMenu(false); }}
                  className={`w-full text-left flex items-center gap-2.5 px-3 py-2 text-[11px] normal-case transition-colors ${searchCountryFilter === code ? (theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700') : (theme === 'dark' ? 'text-[#ccc] hover:bg-emerald-500/5' : 'text-[#1f2937] hover:bg-emerald-50')}`}
                >
                  <img src={`https://flagcdn.com/20x15/${code.toLowerCase()}.png`} srcSet={`https://flagcdn.com/40x30/${code.toLowerCase()}.png 2x`} alt="" loading="lazy" className="w-5 h-3.5 rounded-none object-cover flex-shrink-0" />
                  <span className="truncate normal-case">{countryName(code)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Clear all filters */}
        {activeFilterCount > 0 && (
          <button
            onClick={() => { setSearchGameFilter(''); setSearchCountryFilter(''); }}
            title={lang === 'ko' ? '필터 초기화' : 'Reset filters'}
            className={`p-2 rounded-none transition-colors ${theme === 'dark' ? 'bg-white/[0.04] border border-white/[0.08] text-[#666] hover:text-rose-400' : 'bg-white border border-[#e5e7eb] text-[#9ca3af] hover:text-rose-500'}`}
          >
            <X size={11} />
          </button>
        )}
      </div>

      {/* Search results dropdown */}
      {dropdownOpen && (
        <div className={`absolute left-0 right-0 mt-1 rounded-none border shadow-2xl overflow-hidden z-50 ${theme === 'dark' ? 'bg-[#0c0c0e] border-[#1e1e22]' : 'bg-white border-[#e5e7eb]'}`}>
          {searchResults.length === 0 ? (
            <div className={`px-4 py-6 text-center text-[11px] font-mono uppercase tracking-widest ${theme === 'dark' ? 'text-[#555]' : 'text-[#9ca3af]'}`}>
              {lang === 'ko' ? '결과 없음' : 'No results'}
            </div>
          ) : (
            <div className="py-1 max-h-[420px] overflow-y-auto pgm-scroll">
              {searchResults.map(p => {
                const code = p.nationality?.toLowerCase();
                const gameColor =
                  p.game === 'Valorant' ? 'text-rose-400' :
                  p.game === 'CS2' ? 'text-orange-400' :
                  p.game === 'Overwatch 2' ? 'text-sky-400' :
                  'text-red-400';
                return (
                  <a
                    key={p.id || p.name}
                    href={p.profileUrl || `https://www.google.com/search?q=${encodeURIComponent(p.name + ' ' + p.game + ' settings')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 px-3 py-2 transition-colors ${theme === 'dark' ? 'hover:bg-emerald-500/5' : 'hover:bg-emerald-50'}`}
                  >
                    {code ? (
                      <img src={`https://flagcdn.com/20x15/${code}.png`} srcSet={`https://flagcdn.com/40x30/${code}.png 2x`} alt={p.nationality} loading="lazy" className="w-5 h-3.5 rounded-none flex-shrink-0 object-cover" />
                    ) : (
                      <span className={`w-5 h-3.5 rounded-none flex-shrink-0 ${theme === 'dark' ? 'bg-[#1e1e22]' : 'bg-[#e5e7eb]'}`} />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className={`text-[13px] font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-[#111]'}`}>{p.name}</div>
                      <div className={`text-[10px] font-mono uppercase tracking-widest truncate ${theme === 'dark' ? 'text-[#666]' : 'text-[#9ca3af]'}`}>
                        {p.team || '—'}
                      </div>
                    </div>
                    <span className={`text-[9px] font-mono uppercase tracking-widest font-bold flex-shrink-0 ${gameColor}`}>
                      {p.game.split(' ')[0].slice(0, 4).toUpperCase()}
                    </span>
                    <span className={`text-[10px] font-mono font-bold tabular-nums flex-shrink-0 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      {formatEdpi(p.settings.edpi)}
                    </span>
                    <ExternalLink size={11} className={theme === 'dark' ? 'text-[#444]' : 'text-[#9ca3af]'} />
                  </a>
                );
              })}
            </div>
          )}
          {searchResults.length > 0 && (
            <div className={`px-3 py-1.5 border-t text-[9px] font-mono uppercase tracking-widest text-center ${theme === 'dark' ? 'border-[#1e1e22] text-[#444]' : 'border-[#e5e7eb] text-[#9ca3af]'}`}>
              {lang === 'ko' ? `${searchResults.length}명 표시 · 외부 프로필로 이동` : `showing ${searchResults.length} · opens profile`}
            </div>
          )}
        </div>
      )}
    </div>
  );
});
