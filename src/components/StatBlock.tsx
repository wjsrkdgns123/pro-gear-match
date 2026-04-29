import { memo } from 'react';
import { motion } from 'motion/react';

function StatBlockImpl({ label, value, theme }: { label: string; value: string; theme: 'dark' | 'light' }) {
  return (
    <motion.div
      whileHover={{ scale: 1.04, y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={`${theme === 'dark' ? 'bg-[#0a0a0a] border-[#333]' : 'bg-white border-[#d1d5db]'} border p-3 rounded-none`}
    >
      <span className={`text-[10px] font-mono ${theme === 'dark' ? 'text-[#888]' : 'text-[#4b5563]'} uppercase tracking-widest block mb-1`}>{label}</span>
      <span className={`text-2xl font-bold tracking-tighter ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>{value}</span>
    </motion.div>
  );
}

export const StatBlock = memo(StatBlockImpl);
