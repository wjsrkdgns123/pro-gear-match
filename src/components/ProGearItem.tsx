import { ReactNode, memo } from 'react';
import { ExternalLink } from 'lucide-react';

function ProGearItemImpl({ icon, label, value, theme, amazonUrl, priceCheckLabel = '가격 확인' }: {
  icon: ReactNode;
  label: string;
  value: string;
  theme: 'dark' | 'light';
  amazonUrl?: string;
  priceCheckLabel?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={`${theme === 'dark' ? 'text-[#888]' : 'text-[#4b5563]'}`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <span className={`text-[9px] font-mono ${theme === 'dark' ? 'text-[#555]' : 'text-[#6b7280]'} uppercase tracking-widest block`}>{label}</span>
        <span className={`text-xs font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{value}</span>
      </div>
      {amazonUrl && value && (
        <a
          href={amazonUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-mono uppercase tracking-wider border transition-all
            ${theme === 'dark'
              ? 'bg-[#0a0a0a] border-[#333] text-[#888] hover:text-amber-400 hover:border-amber-500/50'
              : 'bg-white border-[#d1d5db] text-[#6b7280] hover:text-amber-600 hover:border-amber-400'}`}
        >
          {priceCheckLabel} <ExternalLink size={8} />
        </a>
      )}
    </div>
  );
}

export const ProGearItem = memo(ProGearItemImpl);
