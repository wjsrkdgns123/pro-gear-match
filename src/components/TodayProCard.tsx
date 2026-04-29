import { useState } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import { ProGamer } from '../types';
import { GAMES } from '../constants/games';

export function TodayProCard({ pro, theme, currentGame, onMove }: {
  pro: ProGamer;
  theme: 'dark' | 'light';
  currentGame: string;
  onMove: (targetGame: string) => Promise<void>;
}) {
  const [moving, setMoving] = useState(false);
  const [selectedGame, setSelectedGame] = useState('');

  const otherGames = GAMES.filter(g => g.name !== currentGame);

  const handleMove = async () => {
    if (!selectedGame) return;
    setMoving(true);
    await onMove(selectedGame);
    setMoving(false);
    setSelectedGame('');
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-none border text-xs font-mono ${theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
      <span className="font-bold">{pro.name}</span>
      <span className={`${theme === 'dark' ? 'text-[#555]' : 'text-[#9ca3af]'}`}>·</span>
      <span className={`${theme === 'dark' ? 'text-[#888]' : 'text-[#6b7280]'}`}>{pro.team}</span>
      <select
        value={selectedGame}
        onChange={e => setSelectedGame(e.target.value)}
        className={`ml-1 text-[10px] font-mono rounded-none px-1 py-0.5 border ${theme === 'dark' ? 'bg-[#1a1b1e] border-[#444] text-[#aaa]' : 'bg-white border-[#d1d5db] text-[#374151]'} outline-none`}
      >
        <option value="">이동...</option>
        {otherGames.map(g => (
          <option key={g.name} value={g.name}>{g.emoji} {g.name}</option>
        ))}
      </select>
      {selectedGame && (
        <button
          onClick={handleMove}
          disabled={moving}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-none text-[10px] font-bold transition-all ${theme === 'dark' ? 'bg-blue-500/20 border border-blue-500/40 text-blue-300 hover:bg-blue-500/30' : 'bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100'} disabled:opacity-50`}
        >
          {moving ? <Loader2 size={10} className="animate-spin" /> : <ArrowLeft size={10} className="rotate-180" />}
          이동
        </button>
      )}
    </div>
  );
}
