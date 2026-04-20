import { AMAZON_LINKS_NORMALIZED } from '../amazonLinks';

export const COLOR_WORDS_RE = /\b(black|white|red|blue|green|pink|purple|orange|yellow|grey|gray|silver|gold|rose|magenta|cyan|teal|navy|coral|mint|violet|indigo|crimson|scarlet|amber|ivory|charcoal|glossy|matte|maroon|beige|olive|lime|fluorescent|neon)\b/gi;

export function normalizeGearName(s: string): string {
  return s.replace(COLOR_WORDS_RE, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function getAmazonLink(productName: string): string {
  if (!productName) return '';
  return AMAZON_LINKS_NORMALIZED[normalizeGearName(productName)] || '';
}

export const formatEdpi = (val: number) => {
  if (val === Math.floor(val)) return val.toString();
  return val.toFixed(1);
};
