// Multi-axis sensitivity math beyond eDPI.
//
// Two pro players can share the same eDPI yet feel completely different because
// each game has its own sensitivity scalar ("yaw") and default FOV. The helpers
// below convert between eDPI and the two axes pros actually talk about:
//   1) cm/360 — physical mouse travel for a full rotation (grip-agnostic)
//   2) FOV-normalized sensitivity — comparable across games

/** Default yaw (degrees rotated per 1.0 sens per 1 mouse count) by game. */
export const GAME_YAW: Record<string, number> = {
  Valorant: 0.07,
  'CS2': 0.022,
  'CS:GO': 0.022,
  'Overwatch 2': 0.0066,
  'Apex Legends': 0.022,
};

/** Default horizontal FOV (degrees) each title ships with at 16:9. */
export const GAME_FOV: Record<string, number> = {
  Valorant: 103,
  'CS2': 106.26,
  'CS:GO': 106.26,
  'Overwatch 2': 103,
  'Apex Legends': 110,
};

/** 1 inch = 2.54 cm */
const INCH_TO_CM = 2.54;

/**
 * cm/360 — centimeters of mouse travel required to rotate 360° in-game.
 * Lower = faster/flicky, higher = slower/controlled.
 *
 * Formula: 360 / (dpi * sens * yaw) inches, converted to cm.
 */
export function cmPer360(game: string, dpi: number, sensitivity: number): number {
  const yaw = GAME_YAW[game];
  if (!yaw || !dpi || !sensitivity) return 0;
  const inches = 360 / (dpi * sensitivity * yaw);
  return inches * INCH_TO_CM;
}

/**
 * Convert cm/360 back into in-game sensitivity for a given DPI + game.
 * Useful for "what sens do I set to match pro X's cm/360?"
 */
export function sensFromCmPer360(game: string, dpi: number, cm360: number): number {
  const yaw = GAME_YAW[game];
  if (!yaw || !dpi || !cm360) return 0;
  const inches = cm360 / INCH_TO_CM;
  return 360 / (dpi * yaw * inches);
}

/**
 * FOV-normalized sensitivity comparison.
 * When games ship different FOVs, the same cm/360 feels different because the
 * visual sweep is different. This returns a scalar multiplier that maps one
 * game's effective sens into another's visual equivalent.
 */
export function fovScale(fromGame: string, toGame: string): number {
  const a = GAME_FOV[fromGame];
  const b = GAME_FOV[toGame];
  if (!a || !b) return 1;
  // Tangent-based monitor-match for horizontal FOV (the de-facto standard used
  // by mouse-sensitivity.com and pro community calculators).
  return Math.tan((a * Math.PI) / 360) / Math.tan((b * Math.PI) / 360);
}

/**
 * Multi-axis match score (0..1, higher = better) between two setups.
 * Combines cm/360 closeness (weight 0.7) and raw eDPI (weight 0.3).
 *
 * The 0.7 bias toward cm/360 reflects that physical travel distance is a
 * stronger predictor of muscle-memory compatibility than eDPI alone.
 */
export function matchScore(
  a: { game: string; dpi: number; sensitivity: number; edpi: number },
  b: { game: string; dpi: number; sensitivity: number; edpi: number },
): number {
  const cmA = cmPer360(a.game, a.dpi, a.sensitivity);
  const cmB = cmPer360(b.game, b.dpi, b.sensitivity);
  const cmMax = Math.max(cmA, cmB) || 1;
  const cmCloseness = 1 - Math.abs(cmA - cmB) / cmMax;

  const edpiMax = Math.max(a.edpi, b.edpi) || 1;
  const edpiCloseness = 1 - Math.abs(a.edpi - b.edpi) / edpiMax;

  return Math.max(0, Math.min(1, 0.7 * cmCloseness + 0.3 * edpiCloseness));
}

/** Human-friendly cm/360 formatter — 1 decimal, with unit. */
export function formatCmPer360(cm: number): string {
  if (!cm || !isFinite(cm)) return '—';
  return `${cm.toFixed(1)} cm/360`;
}
