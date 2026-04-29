import { ProGamer } from '../types';
import { Language } from '../translations';
import { formatEdpi } from '../utils/gear';

export function EdpiDistributionChart({ proList, userEdpi, proEdpi, proName, game, theme, lang }: {
  proList: ProGamer[];
  userEdpi: number;
  proEdpi: number;
  proName: string;
  game: string;
  theme: 'dark' | 'light';
  lang: Language;
}) {
  const edpiValues = proList.map(p => p.settings.edpi).filter(e => e > 0);
  if (edpiValues.length < 3) return null;

  const GAME_MAX: Record<string, number> = {
    'Valorant':    1200,
    'CS2':         1400,
    'Overwatch 2': 3200,
    'Apex Legends':2400,
  };
  const chartMax = GAME_MAX[game] ?? Math.ceil(Math.max(...edpiValues, userEdpi, proEdpi, 400) / 200) * 200;

  const binSize = 200;
  const numBins = chartMax / binSize;

  const bins = Array(numBins).fill(0);
  edpiValues.forEach(e => {
    const idx = Math.floor(e / binSize);
    if (idx >= 0 && idx < numBins) bins[idx]++;
  });
  const maxCount = Math.max(...bins, 1);

  const userPercentile = Math.round((edpiValues.filter(e => e < userEdpi).length / edpiValues.length) * 100);
  const topPercent = 100 - userPercentile;

  const gameHex: Record<string, string> = {
    'Valorant': '#f43f5e',
    'CS2': '#f97316',
    'Overwatch 2': '#38bdf8',
    'Apex Legends': '#ef4444',
  };
  const gColor = gameHex[game] || '#10b981';

  const SW = 500, SH = 136;
  const PL = 28, PR = 16, PT = 18, PB = 30;
  const CW = SW - PL - PR;
  const CH = SH - PT - PB;

  const toX = (val: number) => PL + (val / chartMax) * CW;
  const barW = Math.max(CW / numBins - 1, 1);

  const userX = toX(userEdpi);
  const proX = toX(proEdpi);
  const tooClose = Math.abs(userX - proX) < 20;

  return (
    <div className={`mt-6 p-4 rounded-none border ${theme === 'dark' ? 'bg-[#0a0a0a] border-[#1e1e1e]' : 'bg-[#f9fafb] border-[#e5e7eb]'}`}>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <p className={`text-xs font-mono uppercase tracking-widest ${theme === 'dark' ? 'text-[#555]' : 'text-[#888]'}`}>
          {game} eDPI {lang === 'ko' ? '분포' : 'Distribution'} · {edpiValues.length}{lang === 'ko' ? '명' : ' pros'}
        </p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className={`text-xs font-mono font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
              {lang === 'ko' ? '나' : 'You'} {formatEdpi(userEdpi)} · {lang === 'ko' ? `상위 ${topPercent}%` : `Top ${topPercent}%`}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: gColor }} />
            <span className={`text-xs font-mono ${theme === 'dark' ? 'text-[#aaa]' : 'text-[#555]'}`}>
              {proName} {formatEdpi(proEdpi)}
            </span>
          </div>
        </div>
      </div>

      <svg viewBox={`0 0 ${SW} ${SH}`} className="w-full" style={{ height: '136px' }}>
        {[0.25, 0.5, 0.75, 1].map(r => (
          <line key={r} x1={PL} y1={PT + CH * (1 - r)} x2={PL + CW} y2={PT + CH * (1 - r)}
            stroke={theme === 'dark' ? '#161616' : '#f3f4f6'} strokeWidth={1} />
        ))}

        {bins.map((count, idx) => {
          if (count === 0) return null;
          const bh = Math.max((count / maxCount) * CH, 2);
          const bx = PL + (idx / numBins) * CW;
          const by = PT + CH - bh;
          const isUserBin = Math.floor(userEdpi / binSize) === idx;
          const isProBin = Math.floor(proEdpi / binSize) === idx;
          const fill = isUserBin ? '#10b98133' : isProBin ? `${gColor}33` : theme === 'dark' ? '#1e2a22' : '#d1fae5';
          return <rect key={idx} x={bx} y={by} width={barW} height={bh} fill={fill} rx={1} />;
        })}

        <line x1={PL} y1={PT + CH} x2={PL + CW} y2={PT + CH}
          stroke={theme === 'dark' ? '#2a2a2a' : '#e5e7eb'} strokeWidth={1} />

        <rect x={proX - 1} y={PT} width={2} height={CH} fill={gColor} opacity={0.15} />
        <line x1={proX} y1={PT} x2={proX} y2={PT + CH}
          stroke={gColor} strokeWidth={2} strokeDasharray="5,3" opacity={1} />
        <polygon points={`${proX},${PT + CH + 2} ${proX - 5},${PT + CH + 11} ${proX + 5},${PT + CH + 11}`}
          fill={gColor} />
        {!tooClose && (
          <>
            <rect x={proX - 20} y={PT - 16} width={40} height={14} rx={3} fill={gColor} opacity={0.9} />
            <text x={proX} y={PT - 5} textAnchor="middle" fontSize={9}
              fill="#000" fontFamily="monospace" fontWeight="bold">{proName.split(' ')[0]}</text>
          </>
        )}

        <line x1={userX} y1={PT} x2={userX} y2={PT + CH}
          stroke="#10b981" strokeWidth={2.5} strokeDasharray="5,3" />
        <polygon points={`${userX},${PT + CH + 2} ${userX - 5},${PT + CH + 11} ${userX + 5},${PT + CH + 11}`}
          fill="#10b981" />
        <text x={userX} y={PT - 5} textAnchor="middle" fontSize={10}
          fill="#10b981" fontFamily="monospace" fontWeight="bold">
          {lang === 'ko' ? '나' : 'You'}
        </text>

        {Array.from({ length: numBins + 1 }, (_, i) => i * binSize)
          .filter(v => v <= chartMax)
          .filter(v => {
            const step = chartMax <= 1400 ? 200 : chartMax <= 2400 ? 400 : 600;
            return v % step === 0;
          })
          .map(v => (
            <text key={v} x={toX(v)} y={PT + CH + 22} textAnchor="middle" fontSize={11}
              fill={theme === 'dark' ? '#777' : '#9ca3af'} fontFamily="monospace">
              {v}
            </text>
          ))}
      </svg>
    </div>
  );
}
