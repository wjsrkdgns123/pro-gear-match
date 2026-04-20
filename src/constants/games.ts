export const GAMES = [
  { name: 'Valorant',     emoji: '🎯', logo: '/logos/valorant.png' },
  { name: 'CS2',          emoji: '🔫', logo: '/logos/cs2.svg' },
  { name: 'Overwatch 2',  emoji: '🛡️', logo: '/logos/overwatch.png' },
  { name: 'Apex Legends', emoji: '🏃', logo: '/logos/apexlegends.png' },
];

export const GAME_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  'Valorant':     { bg: 'bg-rose-500/10',   border: 'border-rose-500',   text: 'text-rose-400' },
  'CS2':          { bg: 'bg-orange-500/10', border: 'border-orange-500', text: 'text-orange-400' },
  'Overwatch 2':  { bg: 'bg-sky-500/10',    border: 'border-sky-500',    text: 'text-sky-400' },
  'Apex Legends': { bg: 'bg-red-600/10',    border: 'border-red-500',    text: 'text-red-400' },
};
