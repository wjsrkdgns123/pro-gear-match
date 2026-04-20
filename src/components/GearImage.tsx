import { useState, useEffect } from 'react';
import { Mouse, Keyboard, Monitor, Layers, Loader2 } from 'lucide-react';
import { getAmazonLink } from '../utils/gear';

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
    let cancelled = false;
    const params = new URLSearchParams({ name: productName });
    if (amazonUrl) params.set('url', amazonUrl);
    fetch(`/api/gear-image?${params}`)
      .then(r => r.json())
      .then((d: { image: string | null }) => {
        if (cancelled) return;
        if (d.image) { setImgUrl(d.image); setStatus('ok'); }
        else setStatus('error');
      })
      .catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
  }, [productName, amazonUrl]);

  const FallbackIcon = () => (
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
          alt={productName}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-contain p-3"
          onError={() => setStatus('error')}
        />
      )}
      {status === 'error' && <FallbackIcon />}
    </div>
  );
}
