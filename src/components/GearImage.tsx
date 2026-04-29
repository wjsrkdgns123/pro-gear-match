import { useState, useEffect } from 'react';
import { Mouse, Keyboard, Monitor, Layers, Loader2 } from 'lucide-react';
import { getAmazonLink } from '../utils/gear';
import { slugify } from '../utils/slug';
import { GEAR_IMAGE_MANIFEST } from '../gearImageManifest';

export function GearImage({ productName, icon }: {
  productName: string;
  icon: 'mouse' | 'keyboard' | 'monitor' | 'mousepad';
  theme: 'dark' | 'light';
}) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const amazonUrl = getAmazonLink(productName);

  useEffect(() => {
    if (!productName) { setStatus('error'); return; }

    // 1) Local manifest hit — instant, works in production (no API needed).
    const slug = slugify(productName);
    const local = GEAR_IMAGE_MANIFEST[slug];
    if (local) {
      setImgUrl(local);
      setStatus('ok');
      return;
    }

    // 2) Otherwise try the dev-only scraper API. In production (static deploy)
    //    this returns 404/HTML and we fall through to the icon fallback.
    let cancelled = false;
    const params = new URLSearchParams({ name: productName });
    if (amazonUrl) params.set('url', amazonUrl);
    fetch(`/api/gear-image?${params}`)
      .then(r => {
        const ct = r.headers.get('content-type') || '';
        if (!r.ok || !ct.includes('application/json')) throw new Error('no-api');
        return r.json();
      })
      .then((d: { image: string | null }) => {
        if (cancelled) return;
        if (d.image) { setImgUrl(d.image); setStatus('ok'); }
        else setStatus('error');
      })
      .catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
  }, [productName, amazonUrl]);

  const fallback = (
    <div className="absolute inset-0 flex items-center justify-center">
      {icon === 'mouse'    && <Mouse    size={36} className="text-[#d1d5db]" />}
      {icon === 'keyboard' && <Keyboard size={36} className="text-[#d1d5db]" />}
      {icon === 'monitor'  && <Monitor  size={36} className="text-[#d1d5db]" />}
      {icon === 'mousepad' && <Layers   size={36} className="text-[#d1d5db]" />}
    </div>
  );

  return (
    <div className="relative flex items-center justify-center h-28 bg-white">
      {status === 'loading' && (
        <Loader2 size={20} className="animate-spin text-emerald-500/40" />
      )}
      {status === 'ok' && imgUrl && (
        <img
          src={imgUrl}
          // Descriptive alt so screen readers announce the gear item in
          // context (icon type + product name) rather than a bare name.
          alt={productName ? `${icon} — ${productName}` : icon}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-contain p-3"
          onError={() => setStatus('error')}
        />
      )}
      {status === 'error' && fallback}
    </div>
  );
}
