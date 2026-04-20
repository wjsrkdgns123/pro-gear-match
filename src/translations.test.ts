import { describe, it, expect } from 'vitest';
import { translations, getLanguage } from './translations';

describe('translations', () => {
  it('exposes en and ko bundles with the same keys', () => {
    const enKeys = Object.keys(translations.en).sort();
    const koKeys = Object.keys(translations.ko).sort();
    expect(koKeys).toEqual(enKeys);
  });

  it('has string values for every key in both bundles', () => {
    for (const [key, value] of Object.entries(translations.en)) {
      expect(typeof value, `en.${key} should be a string`).toBe('string');
    }
    for (const [key, value] of Object.entries(translations.ko)) {
      expect(typeof value, `ko.${key} should be a string`).toBe('string');
    }
  });
});

describe('getLanguage', () => {
  it('returns a supported language', () => {
    const lang = getLanguage();
    expect(['en', 'ko']).toContain(lang);
  });
});
