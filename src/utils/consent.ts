// Minimal GDPR-style consent gate.
//
// Three states are persisted in localStorage under `pgm.consent`:
//   "granted"  — user clicked Accept; analytics/ads may load
//   "denied"   — user clicked Reject; nothing third-party runs
//   (missing)  — user hasn't answered yet; default to deny + show banner
//
// The app reads `hasConsent()` before wiring GA4/AdSense personalization,
// and listens on `window` for 'pgm:consent-change' to react when the user
// accepts mid-session.

export type ConsentValue = 'granted' | 'denied';

const KEY = 'pgm.consent';
const EVENT = 'pgm:consent-change';

export function readConsent(): ConsentValue | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null;
  }
}

export function hasConsent(): boolean {
  return readConsent() === 'granted';
}

export function setConsent(v: ConsentValue): void {
  try {
    localStorage.setItem(KEY, v);
  } catch {
    /* storage disabled — fall back to session-only behavior */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: v }));
}

export function onConsentChange(cb: (v: ConsentValue) => void): () => void {
  const handler = (e: Event) => cb((e as CustomEvent<ConsentValue>).detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
