// Lazy GA4 + Sentry bootstrap.
//
// GA4 runs unconditionally (anonymize_ip: true). No consent gate needed
// for the site's target audience (KR-primary, no EU targeting).
//
//   VITE_SENTRY_DSN  — Sentry DSN; empty string disables Sentry entirely
//   VITE_GA4_ID      — GA4 Measurement ID (G-XXXXXXX); empty disables GA4

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;
const GA4_ID = import.meta.env.VITE_GA4_ID as string | undefined;

let sentryStarted = false;
let ga4Started = false;

async function startSentry() {
  if (sentryStarted || !SENTRY_DSN) return;
  sentryStarted = true;
  try {
    const Sentry = await import('@sentry/react');
    Sentry.init({
      dsn: SENTRY_DSN,
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0.2,
      environment: import.meta.env.MODE,
    });
  } catch (e) {
    console.warn('Sentry init failed:', e);
  }
}

function startGA4() {
  if (ga4Started || !GA4_ID) return;
  ga4Started = true;
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(s);

  const w = window as unknown as { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void };
  w.dataLayer = w.dataLayer || [];
  w.gtag = function () {
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer!.push(arguments);
  };
  w.gtag('js', new Date());
  w.gtag('config', GA4_ID, { anonymize_ip: true });
}

export function initAnalytics(): void {
  startSentry();
  startGA4();
}
