// Lazy GA4 + Sentry bootstrap.
//
// Both are gated behind `hasConsent()` and behind env-provided IDs:
//   VITE_SENTRY_DSN  — Sentry DSN; empty string disables Sentry entirely
//   VITE_GA4_ID      — GA4 Measurement ID (G-XXXXXXX); empty disables GA4
//
// Called once from main.tsx; listens for consent changes so users who
// accept mid-session still get tagged without a page reload.

import { hasConsent, onConsentChange } from './consent';

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
  // Inject the gtag.js snippet once consent is given
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
  // Sentry runs pre-consent too — catching crashes is arguably a legitimate
  // interest. Flip this to `if (hasConsent())` if a stricter regulator asks.
  startSentry();

  if (hasConsent()) startGA4();

  // If the user accepts later in the session, fire GA4 without reloading.
  onConsentChange((v) => {
    if (v === 'granted') startGA4();
  });
}
