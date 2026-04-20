import { useState } from 'react';
import { motion } from 'motion/react';
import { Target, X, Loader2, Search, CheckCircle2 } from 'lucide-react';
import { ProGamer } from '../types';
import { translations } from '../translations';

type TranslationBundle = typeof translations['en'];

export function BulkAuditModal({ theme, t, proList, onClose, onAddPlayer }: {
  theme: 'dark' | 'light';
  t: TranslationBundle;
  proList: ProGamer[];
  onClose: () => void;
  onAddPlayer: (name: string) => void;
  onRefreshList: () => void;
}) {
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState<{ missing: string[], existing: string[] } | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  const performAudit = () => {
    setIsAuditing(true);
    const items = inputText.split(/[,\n]/).map(n => n.trim()).filter(n => n.length > 0);
    const existingNames = proList.map(p => p.name.toLowerCase());
    const existingUrls = proList.map(p => p.profileUrl?.toLowerCase()).filter(Boolean);

    const missing: string[] = [];
    const existing: string[] = [];

    items.forEach(item => {
      const lowerItem = item.toLowerCase();
      const isUrl = item.startsWith('http');

      if (isUrl) {
        if (existingUrls.includes(lowerItem)) existing.push(item);
        else missing.push(item);
      } else {
        if (existingNames.includes(lowerItem)) existing.push(item);
        else missing.push(item);
      }
    });

    setResults({ missing, existing });
    setIsAuditing(false);
  };

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className={`${theme === 'dark' ? 'bg-[#151619] border-[#333]' : 'bg-white border-[#d1d5db]'} border rounded-3xl p-8 max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Target className="text-emerald-500" size={24} />
            <h2 className={`text-2xl font-black uppercase tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
              {t.bulkAuditTitle}
            </h2>
          </div>
          <button onClick={onClose} className={`${theme === 'dark' ? 'text-[#555]' : 'text-[#6b7280]'} hover:text-emerald-500`}>
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          <div className="space-y-2">
            <label className={`text-[10px] font-mono uppercase tracking-widest ${theme === 'dark' ? 'text-[#888]' : 'text-[#4b5563]'}`}>
              {t.pastePlayerNames}
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className={`w-full h-32 ${theme === 'dark' ? 'bg-[#0a0a0a] border-[#333]' : 'bg-white border-[#d1d5db]'} border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-emerald-500 transition-all resize-none`}
              placeholder="Asuna, TenZ, https://liquipedia.net/valorant/Aspas..."
            />
            <button
              onClick={performAudit}
              disabled={!inputText.trim() || isAuditing}
              className="w-full py-3 bg-emerald-500 text-black rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
            >
              {isAuditing ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              {t.checkMissing}
            </button>
          </div>

          {results && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xs font-mono uppercase tracking-widest text-red-400 flex items-center gap-2">
                  <X size={14} /> {t.missing} ({results.missing.length})
                </h3>
                <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-[#0a0a0a] border-[#333]' : 'bg-[#fff5f5] border-red-100'} max-h-64 overflow-y-auto space-y-2`}>
                  {results.missing.length === 0 ? (
                    <p className="text-xs text-[#555] italic">{t.noMissing}</p>
                  ) : (
                    results.missing.map((name, i) => (
                      <div key={i} className="flex items-center justify-between group gap-2">
                        <span className={`text-xs font-mono truncate flex-1 ${theme === 'dark' ? 'text-[#aaa]' : 'text-[#4b5563]'}`} title={name}>{name}</span>
                        <button
                          onClick={() => onAddPlayer(name)}
                          className="text-[9px] font-mono uppercase tracking-widest text-emerald-500 hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                        >
                          {t.add}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-mono uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 size={14} /> {t.existing} ({results.existing.length})
                </h3>
                <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-[#0a0a0a] border-[#333]' : 'bg-[#f0fff4] border-emerald-100'} max-h-64 overflow-y-auto space-y-2`}>
                  {results.existing.map((name, i) => (
                    <div key={i} className="text-xs font-mono text-[#555] truncate" title={name}>{name}</div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-[#333] flex justify-end">
          <button
            onClick={onClose}
            className={`px-8 py-3 border ${theme === 'dark' ? 'border-[#333] text-[#888]' : 'border-[#d1d5db] text-[#4b5563]'} rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-emerald-500/10 hover:text-emerald-400 transition-all`}
          >
            {t.close}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
