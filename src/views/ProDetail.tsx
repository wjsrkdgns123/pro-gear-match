import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { Mouse, Keyboard, Monitor, Layers, Target, ArrowLeft, ExternalLink } from 'lucide-react';
import { db } from '../firebase';
import { ProGamer } from '../types';
import { slugify } from '../utils/slug';
import { cmPer360, formatCmPer360 } from '../utils/sensitivity';
import { GearImage } from '../components/GearImage';
import { getAmazonLink } from '../utils/gear';
import { setSEO, seoForPro } from '../utils/seo';
import { translations, getLanguage } from '../translations';

// Standalone route for a single pro gamer — reached via /pro/<slug>.
// Owns its own data fetch so the user can deep-link or share the URL
// without hitting the main app first. SEO meta is written per-pro so
// the sitemap URLs finally resolve to rich, unique pages.
export function ProDetail() {
  const { slug = '' } = useParams();
  const [lang] = useState(getLanguage());
  const [theme] = useState<'dark' | 'light'>(() =>
    (localStorage.getItem('theme') as 'dark' | 'light') || 'dark',
  );
  const [pros, setPros] = useState<ProGamer[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const t = translations[lang];

  // One-shot fetch — /pro/:slug is a shallow page that doesn't need live updates
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'progamers'));
        if (cancelled) return;
        const list: ProGamer[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...(d.data() as ProGamer) }));
        setPros(list);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const pro = useMemo(
    () => pros?.find((p) => slugify(p.name) === slug) ?? null,
    [pros, slug],
  );

  // SEO: write per-pro meta once we have data. Falls back to generic
  // landing meta while fetching so crawlers don't see a blank page.
  useEffect(() => {
    if (pro) {
      setSEO(
        seoForPro(pro.name, pro.team, pro.game, pro.settings.edpi, pro.gear.mouse, lang),
      );
    } else {
      setSEO({
        title: 'ProGear Match',
        description: 'Pro gamer gear and settings.',
        canonical: `${location.origin}/pro/${slug}`,
      });
    }
  }, [pro, slug, lang]);

  const bg = theme === 'dark' ? 'bg-[#050507] text-[#e5e7eb]' : 'bg-[#f8f9fa] text-[#1a1a1a]';
  const card = theme === 'dark' ? 'bg-[#0c0c0e] border-[#222]' : 'bg-white border-[#e5e7eb]';
  const muted = theme === 'dark' ? 'text-[#888]' : 'text-[#6b7280]';

  if (err) {
    return (
      <div className={`min-h-screen ${bg} flex items-center justify-center p-8`}>
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold mb-2">Error</h1>
          <p className={muted}>{err}</p>
          <Link to="/" className="mt-4 inline-block text-emerald-500 underline">← Home</Link>
        </div>
      </div>
    );
  }

  if (!pros) {
    return (
      <div className={`min-h-screen ${bg} flex items-center justify-center`}>
        <div className={`${muted} font-mono text-xs uppercase tracking-widest`}>Loading…</div>
      </div>
    );
  }

  if (!pro) {
    return (
      <div className={`min-h-screen ${bg} flex items-center justify-center p-8`}>
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold mb-2">{lang === 'ko' ? '선수를 찾을 수 없습니다' : 'Pro not found'}</h1>
          <p className={`${muted} text-sm mb-4`}>slug: {slug}</p>
          <Link to="/" className="text-emerald-500 underline">{lang === 'ko' ? '← 홈으로' : '← Back to home'}</Link>
        </div>
      </div>
    );
  }

  const cm360 = pro.settings.dpi && pro.settings.sensitivity
    ? cmPer360(pro.game, pro.settings.dpi, pro.settings.sensitivity)
    : null;

  return (
    <div className={`min-h-screen ${bg}`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/" className={`inline-flex items-center gap-2 ${muted} hover:text-emerald-500 text-xs font-mono uppercase tracking-widest mb-6`}>
          <ArrowLeft size={14} /> {lang === 'ko' ? '홈' : 'Home'}
        </Link>

        <header className="mb-8">
          <div className={`${muted} text-[10px] font-mono uppercase tracking-widest mb-1`}>{pro.game} · {pro.team}</div>
          <h1 className="text-5xl font-black tracking-tighter">{pro.name}</h1>
        </header>

        {/* Sensitivity block */}
        <section className={`${card} border rounded-none p-6 mb-6`}>
          <h2 className={`text-xs font-mono uppercase tracking-widest ${muted} mb-4`}>
            {lang === 'ko' ? '민감도' : 'Sensitivity'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat label="DPI" value={String(pro.settings.dpi || '—')} />
            <Stat label="SENS" value={String(pro.settings.sensitivity || '—')} />
            <Stat label="eDPI" value={String(pro.settings.edpi || '—')} />
            <Stat label="cm/360°" value={cm360 ? formatCmPer360(cm360) : '—'} />
          </div>
        </section>

        {/* Gear grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <GearCard icon="mouse"    label={t.mouse}    value={pro.gear.mouse}    theme={theme} />
          <GearCard icon="keyboard" label={t.keyboard} value={pro.gear.keyboard} theme={theme} />
          <GearCard icon="monitor"  label={t.monitor}  value={pro.gear.monitor}  theme={theme} />
          <GearCard icon="mousepad" label={t.mousepad} value={pro.gear.mousepad} theme={theme} />
        </section>

        {/* Source link */}
        {pro.profileUrl && (
          <a
            href={pro.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 ${muted} hover:text-emerald-500 text-xs font-mono uppercase tracking-widest`}
          >
            {lang === 'ko' ? '원본 프로필' : 'Source'} <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-widest text-[#888] mb-1">{label}</div>
      <div className="text-2xl font-bold tracking-tight text-emerald-500">{value}</div>
    </div>
  );
}

function GearCard({
  icon, label, value, theme,
}: {
  icon: 'mouse' | 'keyboard' | 'monitor' | 'mousepad';
  label: string;
  value: string;
  theme: 'dark' | 'light';
}) {
  const card = theme === 'dark' ? 'bg-[#0c0c0e] border-[#222]' : 'bg-white border-[#e5e7eb]';
  const muted = theme === 'dark' ? 'text-[#888]' : 'text-[#6b7280]';
  const amazonUrl = getAmazonLink(value);
  const Icon = { mouse: Mouse, keyboard: Keyboard, monitor: Monitor, mousepad: Layers }[icon];

  return (
    <div className={`${card} border rounded-none overflow-hidden`}>
      <GearImage productName={value} icon={icon} theme={theme} />
      <div className="p-4">
        <div className={`flex items-center gap-2 ${muted} text-[10px] font-mono uppercase tracking-widest mb-1`}>
          <Icon size={12} /> {label}
        </div>
        <div className="font-medium text-sm mb-2">{value || '—'}</div>
        {amazonUrl && (
          <a
            href={amazonUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-amber-500 hover:text-amber-400"
          >
            <Target size={10} /> Amazon <ExternalLink size={10} />
          </a>
        )}
      </div>
    </div>
  );
}
