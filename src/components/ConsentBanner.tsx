import { useEffect, useState } from 'react';
import { readConsent, setConsent } from '../utils/consent';

// Thin self-contained consent banner. Renders nothing once the user has
// answered — the choice is persisted in localStorage by `setConsent`.
// Styling mirrors the rest of the app (dark emerald, mono caps labels).
export function ConsentBanner({ lang }: { lang: 'en' | 'ko' }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (readConsent() === null) setVisible(true);
  }, []);

  if (!visible) return null;

  const t = lang === 'ko'
    ? {
        title: '쿠키 & 개인정보 고지',
        body:
          '이 사이트는 서비스 개선과 광고를 위해 쿠키를 사용합니다. ' +
          '동의하지 않으셔도 기본 기능은 그대로 사용할 수 있습니다.',
        accept: '동의',
        reject: '거부',
        privacy: '개인정보처리방침',
      }
    : {
        title: 'Cookies & Privacy',
        body:
          'We use cookies to improve this site and to serve ads. ' +
          'You can decline — the core matcher still works either way.',
        accept: 'Accept',
        reject: 'Reject',
        privacy: 'Privacy Policy',
      };

  const answer = (v: 'granted' | 'denied') => {
    setConsent(v);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label={t.title}
      className="fixed bottom-0 left-0 right-0 z-[200] border-t border-[#10b981]/30 bg-[#050507]/95 backdrop-blur-md px-4 py-4 text-[#e5e7eb] shadow-2xl"
    >
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex-1 text-xs leading-relaxed">
          <div className="font-mono uppercase tracking-widest text-emerald-400 mb-1">
            {t.title}
          </div>
          <p className="text-[#aaa]">
            {t.body}{' '}
            <a href="/privacy" className="underline hover:text-emerald-400">
              {t.privacy}
            </a>
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => answer('denied')}
            className="px-4 py-2 text-xs font-mono uppercase tracking-wider border border-[#333] text-[#aaa] rounded hover:border-[#555] hover:text-white transition-colors"
          >
            {t.reject}
          </button>
          <button
            onClick={() => answer('granted')}
            className="px-4 py-2 text-xs font-mono uppercase tracking-wider bg-emerald-500 text-black font-bold rounded hover:bg-emerald-400 transition-colors"
          >
            {t.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
