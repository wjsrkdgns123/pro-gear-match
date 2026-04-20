import { useRef, useEffect } from 'react';

export function GoogleAd({ slot }: { slot?: string }) {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        if (adRef.current && !adRef.current.getAttribute('data-adsbygoogle-status')) {
          if (adRef.current.offsetWidth > 0) {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          } else {
            console.warn('AdSense: availableWidth is 0, skipping push.');
          }
        }
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="my-8 flex justify-center overflow-hidden min-h-[100px] w-full">
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', minWidth: '250px' }}
        data-ad-client="ca-pub-6219520263101018"
        data-ad-slot={slot || ''}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
