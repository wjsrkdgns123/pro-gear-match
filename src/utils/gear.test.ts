import { describe, it, expect } from 'vitest';
import { normalizeGearName, formatEdpi, COLOR_WORDS_RE } from './gear';

describe('normalizeGearName', () => {
  it('lowercases and strips non-alphanumerics', () => {
    expect(normalizeGearName('Logitech G Pro X Superlight')).toBe('logitechgproxsuperlight');
  });

  it('strips color words', () => {
    expect(normalizeGearName('Razer Viper V2 Pro Black')).toBe('razerviperv2pro');
    expect(normalizeGearName('Zowie EC2-A White')).toBe('zowieec2a');
  });

  it('handles empty and punctuation-only input', () => {
    expect(normalizeGearName('')).toBe('');
    expect(normalizeGearName('---')).toBe('');
  });

  it('COLOR_WORDS_RE matches common color terms', () => {
    expect('red'.match(COLOR_WORDS_RE)).not.toBeNull();
    expect('fluorescent'.match(COLOR_WORDS_RE)).not.toBeNull();
    // non-color word should not match
    COLOR_WORDS_RE.lastIndex = 0;
    expect('mouse'.match(COLOR_WORDS_RE)).toBeNull();
  });
});

describe('formatEdpi', () => {
  it('renders integers without decimals', () => {
    expect(formatEdpi(800)).toBe('800');
    expect(formatEdpi(0)).toBe('0');
  });

  it('renders fractional values with 1 decimal', () => {
    expect(formatEdpi(312.5)).toBe('312.5');
    expect(formatEdpi(399.99)).toBe('400.0');
  });
});
