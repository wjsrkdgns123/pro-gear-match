// Pure helpers for pro-gamer name/handle normalization.
// Extracted from aiService.ts so they can be unit-tested without pulling in
// Firebase or any network-side imports.

/**
 * Extracts the in-game handle from a full or decorated name.
 * Examples:
 *   "Tyson \"TenZ\" Ngo" → "TenZ"
 *   "Tyson 'TenZ' Ngo"   → "TenZ"
 *   "Tyson (TenZ) Ngo"   → "TenZ"
 *   "Tyson [TenZ] Ngo"   → "TenZ"
 *   "TenZ"               → "TenZ"
 */
export function cleanPlayerName(name: string): string {
  if (!name) return '';

  const quoteMatch = name.match(/["'](.+)["']/);
  if (quoteMatch) return quoteMatch[1].trim();

  const parenMatch = name.match(/\((.+)\)/);
  if (parenMatch) return parenMatch[1].trim();

  const bracketMatch = name.match(/\[(.+)\]/);
  if (bracketMatch) return bracketMatch[1].trim();

  return name.trim();
}

const VALID_GAMES = ['Valorant', 'CS2', 'Overwatch 2', 'Apex Legends'] as const;

/**
 * Canonicalizes a game name to one of the supported titles (case-insensitive),
 * falling back to "Valorant" for empty input and passing through unknowns.
 */
export function normalizeGameName(game: string): string {
  if (!game) return 'Valorant';
  const found = VALID_GAMES.find((g) => g.toLowerCase() === game.toLowerCase());
  return found || game;
}
