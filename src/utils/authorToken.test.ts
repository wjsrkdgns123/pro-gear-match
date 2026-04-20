import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getAuthorToken } from './authorToken';

describe('getAuthorToken', () => {
  beforeEach(() => {
    const store: Record<string, string> = {};
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => { store[k] = v; },
      removeItem: (k: string) => { delete store[k]; },
      clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    });
  });

  it('creates and persists a token on first call', () => {
    const t1 = getAuthorToken();
    expect(t1).toBeTruthy();
    const t2 = getAuthorToken();
    expect(t2).toBe(t1);
  });

  it('returns a non-trivial length token', () => {
    const t = getAuthorToken();
    expect(t.length).toBeGreaterThan(8);
  });
});
