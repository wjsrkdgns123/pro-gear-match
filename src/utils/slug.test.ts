import { describe, it, expect } from 'vitest';
import { slugify } from './slug';

describe('slugify', () => {
  it('lowercases and replaces spaces with dashes', () => {
    expect(slugify('TenZ')).toBe('tenz');
    expect(slugify('Pro Player')).toBe('pro-player');
  });

  it('strips diacritics', () => {
    expect(slugify('aspas')).toBe('aspas');
    expect(slugify('Éloïse')).toBe('eloise');
    expect(slugify('Leviatán')).toBe('leviatan');
  });

  it('collapses punctuation and trims edges', () => {
    expect(slugify('s1mple!')).toBe('s1mple');
    expect(slugify('--foo--bar--')).toBe('foo-bar');
    expect(slugify('  spaced  ')).toBe('spaced');
  });

  it('handles empty input', () => {
    expect(slugify('')).toBe('');
    expect(slugify('!!!')).toBe('');
  });

  it('is idempotent', () => {
    const a = slugify('Foo Bar Baz');
    expect(slugify(a)).toBe(a);
  });
});
