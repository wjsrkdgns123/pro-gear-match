import { describe, it, expect } from 'vitest';
import { cleanPlayerName, normalizeGameName } from './playerName';

describe('cleanPlayerName', () => {
  it('extracts nickname from double-quoted full name', () => {
    expect(cleanPlayerName('Tyson "TenZ" Ngo')).toBe('TenZ');
  });

  it('extracts nickname from single-quoted full name', () => {
    expect(cleanPlayerName("Tyson 'TenZ' Ngo")).toBe('TenZ');
  });

  it('extracts nickname from parentheses', () => {
    expect(cleanPlayerName('Tyson (TenZ) Ngo')).toBe('TenZ');
  });

  it('extracts nickname from brackets', () => {
    expect(cleanPlayerName('Tyson [TenZ] Ngo')).toBe('TenZ');
  });

  it('returns input trimmed when no markers present', () => {
    expect(cleanPlayerName('  TenZ  ')).toBe('TenZ');
    expect(cleanPlayerName('s1mple')).toBe('s1mple');
  });

  it('returns empty string for falsy input', () => {
    expect(cleanPlayerName('')).toBe('');
  });
});

describe('normalizeGameName', () => {
  it('canonicalizes case variants', () => {
    expect(normalizeGameName('valorant')).toBe('Valorant');
    expect(normalizeGameName('CS2')).toBe('CS2');
    expect(normalizeGameName('overwatch 2')).toBe('Overwatch 2');
    expect(normalizeGameName('APEX LEGENDS')).toBe('Apex Legends');
  });

  it('defaults to Valorant for empty input', () => {
    expect(normalizeGameName('')).toBe('Valorant');
  });

  it('passes through unknown games unchanged', () => {
    expect(normalizeGameName('Fortnite')).toBe('Fortnite');
  });
});
