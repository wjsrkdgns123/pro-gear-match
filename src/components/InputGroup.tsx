import { ReactNode, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { getGearSuggestions } from '../services/aiService';

export function InputGroup({ label, icon, value, placeholder, hint, onChange, theme, category }: {
  label: string;
  icon: ReactNode;
  value: string;
  placeholder: string;
  hint?: string;
  onChange: (val: string) => void;
  listId?: string;
  options?: string[];
  theme: 'dark' | 'light';
  category?: 'mouse' | 'keyboard' | 'monitor' | 'mousepad' | 'controller';
}) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInputChange = (val: string) => {
    onChange(val);

    if (!category) return;

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (val.length < 1) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await getGearSuggestions(val, category);
        setSuggestions(results);
        setShowDropdown(results.length > 0);
      } catch (err) {
        console.error('Failed to fetch suggestions:', err);
      } finally {
        setLoading(false);
      }
    }, 100);
  };

  return (
    <div className="space-y-2 relative">
      <div className="flex items-center justify-between">
        <label className={`text-xs font-mono ${theme === 'dark' ? 'text-[#888]' : 'text-[#4b5563]'} uppercase tracking-wider flex items-center gap-2`}>
          {icon} {label}
        </label>
        {hint && <span className={`text-[10px] font-sans ${theme === 'dark' ? 'text-[#777]' : 'text-[#999]'} font-medium italic`}>{hint}</span>}
      </div>
      <div className="relative">
        <input
          type="text"
          value={value || ''}
          placeholder={placeholder}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          className={`w-full ${theme === 'dark' ? 'bg-[#0a0a0a] border-[#333]' : 'bg-white border-[#d1d5db]'} border rounded-none px-4 py-2 focus:outline-none ${theme === 'dark' ? 'focus:border-[#555]' : 'focus:border-[#9ca3af]'} transition-colors placeholder:text-[#9ca3af]`}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 size={14} className="animate-spin text-emerald-500" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {showDropdown && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute z-50 left-0 right-0 mt-1 ${theme === 'dark' ? 'bg-[#151619] border-[#333]' : 'bg-white border-[#d1d5db]'} border rounded-none shadow-xl overflow-y-auto max-h-60`}
          >
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onChange(suggestion);
                  setSuggestions([]);
                  setShowDropdown(false);
                }}
                className={`w-full text-left px-4 py-2 text-xs font-mono ${theme === 'dark' ? 'hover:bg-[#1e1e22] text-[#aaa] hover:text-[#ccc]' : 'hover:bg-[#f3f4f6] text-[#4b5563] hover:text-[#1f2937]'} transition-colors border-b last:border-0 ${theme === 'dark' ? 'border-[#333]' : 'border-[#f3f4f6]'}`}
              >
                {suggestion}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
