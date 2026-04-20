import { describe, it, expect } from 'vitest';
import {
  cmPer360,
  sensFromCmPer360,
  fovScale,
  matchScore,
  formatCmPer360,
  GAME_YAW,
  GAME_FOV,
} from './sensitivity';

describe('cmPer360', () => {
  it('computes a known Valorant baseline (800 DPI @ 0.5 sens ≈ 32.65 cm/360)', () => {
    const cm = cmPer360('Valorant', 800, 0.5);
    expect(cm).toBeGreaterThan(32);
    expect(cm).toBeLessThan(33.5);
  });

  it('halves when DPI doubles', () => {
    const a = cmPer360('Valorant', 400, 0.5);
    const b = cmPer360('Valorant', 800, 0.5);
    expect(b).toBeCloseTo(a / 2, 4);
  });

  it('returns 0 for invalid inputs', () => {
    expect(cmPer360('Valorant', 0, 0.5)).toBe(0);
    expect(cmPer360('Valorant', 800, 0)).toBe(0);
    expect(cmPer360('UnknownGame', 800, 0.5)).toBe(0);
  });
});

describe('sensFromCmPer360 — inverse relationship', () => {
  it('round-trips cmPer360', () => {
    const cm = cmPer360('CS2', 1600, 1.2);
    const sens = sensFromCmPer360('CS2', 1600, cm);
    expect(sens).toBeCloseTo(1.2, 3);
  });
});

describe('fovScale', () => {
  it('returns 1 for same game', () => {
    expect(fovScale('Valorant', 'Valorant')).toBeCloseTo(1, 5);
  });

  it('Apex (110 FOV) has different scale than Valorant (103 FOV)', () => {
    const s = fovScale('Valorant', 'Apex Legends');
    expect(s).not.toBe(1);
    expect(s).toBeGreaterThan(0.8);
    expect(s).toBeLessThan(1.0);
  });

  it('is reciprocal', () => {
    const a = fovScale('Valorant', 'CS2');
    const b = fovScale('CS2', 'Valorant');
    expect(a * b).toBeCloseTo(1, 4);
  });
});

describe('matchScore', () => {
  const me = { game: 'Valorant', dpi: 800, sensitivity: 0.5, edpi: 400 };

  it('returns 1 for identical setups', () => {
    expect(matchScore(me, { ...me })).toBeCloseTo(1, 4);
  });

  it('returns a lower score for very different cm/360', () => {
    const far = { game: 'Valorant', dpi: 800, sensitivity: 2.0, edpi: 1600 };
    const s = matchScore(me, far);
    expect(s).toBeLessThan(0.5);
  });

  it('stays in [0,1]', () => {
    const s = matchScore(me, { game: 'Valorant', dpi: 10, sensitivity: 0.001, edpi: 0.01 });
    expect(s).toBeGreaterThanOrEqual(0);
    expect(s).toBeLessThanOrEqual(1);
  });
});

describe('formatCmPer360', () => {
  it('renders with unit', () => {
    expect(formatCmPer360(32.65)).toMatch(/^32\.[67] cm\/360$/);
  });
  it('handles invalid', () => {
    expect(formatCmPer360(0)).toBe('—');
    expect(formatCmPer360(NaN)).toBe('—');
  });
});

describe('game constants', () => {
  it('every yawed game has a FOV entry', () => {
    for (const g of Object.keys(GAME_YAW)) {
      expect(GAME_FOV[g]).toBeDefined();
    }
  });
});
