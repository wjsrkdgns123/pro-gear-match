import React, { useState, useEffect } from 'react';
import { Mouse, Keyboard, Monitor, Layers, Target, Search, Loader2, Trophy, ExternalLink, X, Users, RefreshCcw, Shield, Zap, Flame, Sword, Gamepad2, ArrowLeft, LogIn, LogOut, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { GearSettings, ProGamer } from './types';
import { matchProGamer, getProGamerList } from './services/geminiService';
import { translations, getLanguage, Language } from './translations';
import { PRO_MICE, PRO_KEYBOARDS, PRO_MONITORS, PRO_MOUSEPADS } from './constants';
import { auth, googleProvider } from './firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';

const GAMES = [
  { name: 'Valorant', emoji: '🎯' },
  { name: 'CS2', emoji: '🔫' },
  { name: 'Overwatch 2', emoji: '🛡️' },
  { name: 'Apex Legends', emoji: '🏃' },
  { name: 'League of Legends', emoji: '⚔️' }
];

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const t = translations[lang];

  useEffect(() => {
    setLang(getLanguage());
  }, []);

  const [settings, setSettings] = useState<GearSettings>({
    mouse: '',
    keyboard: '',
    monitor: '',
    mousepad: '',
    dpi: 800,
    sensitivity: 0.5,
    game: 'Valorant',
  });

  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<ProGamer[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showList, setShowList] = useState(false);
  const [activePolicy, setActivePolicy] = useState<'privacy' | 'terms' | 'contact' | null>(null);
  const [proList, setProList] = useState<ProGamer[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [excelStatus, setExcelStatus] = useState<{ loading: boolean, success?: boolean, proFound?: boolean, photoFound?: boolean, error?: string } | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'MICROSOFT_AUTH_SUCCESS') {
        checkExcelFile();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const connectMicrosoft = async () => {
    try {
      const response = await fetch('/api/auth/microsoft/url');
      const { url } = await response.json();
      window.open(url, 'microsoft_auth', 'width=600,height=700');
    } catch (err) {
      console.error(err);
    }
  };

  const checkExcelFile = async () => {
    setExcelStatus({ loading: true });
    try {
      const shareUrl = "https://1drv.ms/x/c/8819c799fb366e54/IQCtppRk-l_NT6BEWOmCWoJ1AdpT1oy2DBNq6scY1gfjsrI?e=GdUs8r";
      const response = await fetch(`/api/excel/data?url=${encodeURIComponent(shareUrl)}`);
      if (!response.ok) {
        if (response.status === 401) {
          connectMicrosoft();
          return;
        }
        throw new Error('Failed to fetch data');
      }
      const { data } = await response.json();
      
      // Basic analysis: check for common pro gamer names or image URLs
      const flatData = data.flat().map((v: any) => String(v).toLowerCase());
      const hasPhoto = flatData.some((v: string) => v.includes('http') && (v.includes('.jpg') || v.includes('.png') || v.includes('.jpeg') || v.includes('image')));
      const hasPro = flatData.some((v: string) => 
        ['faker', 's1mple', 'tenz', 'asuna', 'yay', 'shroud', 'bang', 'aspas', 'demon1', 'zywoo'].some(name => v.includes(name))
      );

      setExcelStatus({
        loading: false,
        success: true,
        proFound: hasPro,
        photoFound: hasPhoto
      });
    } catch (err) {
      console.error(err);
      setExcelStatus({ loading: false, error: t.excelError });
    }
  };

  const filteredProList = proList.filter(pro => 
    pro.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pro.team.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pro.gear.mouse.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pro.gear.keyboard.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedProList = [...filteredProList].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    
    let aValue: any = a;
    let bValue: any = b;

    if (key.includes('.')) {
      const keys = key.split('.');
      aValue = keys.reduce((o, i) => o[i], a);
      bValue = keys.reduce((o, i) => o[i], b);
    } else {
      aValue = a[key as keyof ProGamer];
      bValue = b[key as keyof ProGamer];
    }

    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const downloadCSV = () => {
    const headers = ['Name', 'Team', 'Game', 'Mouse', 'Keyboard', 'Monitor', 'Mousepad', 'DPI', 'Sensitivity', 'eDPI', 'Profile URL'];
    const rows = sortedProList.map(pro => [
      pro.name,
      pro.team,
      pro.game,
      pro.gear.mouse,
      pro.gear.keyboard,
      pro.gear.monitor,
      pro.gear.mousepad,
      pro.settings.dpi,
      pro.settings.sensitivity,
      pro.settings.edpi,
      pro.profileUrl
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pro_gamers_${settings.game.toLowerCase()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const results = await matchProGamer(settings);
      setMatches(results);
      // Trigger confetti
      const duration = 1 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    } catch (err) {
      console.error(err);
      setError('Failed to find a match. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProList = async () => {
    setShowList(true);
    
    // Check memory first
    if (proList.length > 0 && proList[0].game === settings.game) return;
    
    setListLoading(true);
    try {
      const list = await getProGamerList(settings.game);
      // Sort by team name alphabetically
      const sortedList = [...list].sort((a, b) => a.team.localeCompare(b.team));
      setProList(sortedList);
    } catch (err) {
      console.error(err);
    } finally {
      setListLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0] font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-2 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent uppercase">
              {t.title}
            </h1>
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <p className="text-[#888] font-mono text-sm uppercase tracking-widest">
                {t.subtitle}
              </p>
              {excelStatus?.success && (
                <div className="flex items-center gap-2 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded text-[10px] text-emerald-400 font-mono uppercase animate-pulse">
                  <FileSpreadsheet size={10} /> Excel Linked
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 self-center md:self-end">
            <button 
              onClick={() => fetchProList()}
              className="flex items-center gap-2 px-4 py-2 bg-[#151619] border border-[#333] rounded-lg text-xs font-mono uppercase tracking-wider hover:border-emerald-500 transition-colors"
            >
              <Users size={14} /> {t.proList}
            </button>
          </div>
        </header>

        {/* Excel Status Card */}
        <AnimatePresence>
          {excelStatus && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="bg-[#151619] border border-[#333] rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-mono text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                    <FileSpreadsheet size={16} /> {t.excelStatus}
                  </h3>
                  <button onClick={() => setExcelStatus(null)} className="text-[#555] hover:text-white">
                    <X size={14} />
                  </button>
                </div>
                
                {excelStatus.loading ? (
                  <div className="flex items-center gap-3 text-[#888] font-mono text-xs">
                    <Loader2 size={14} className="animate-spin" /> {t.excelChecking}
                  </div>
                ) : excelStatus.error ? (
                  <div className="flex items-center gap-3 text-red-400 font-mono text-xs">
                    <AlertCircle size={14} /> {excelStatus.error}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-emerald-400 font-mono text-xs">
                      <CheckCircle2 size={14} /> {t.excelSuccess}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div className={`p-3 rounded-xl border ${excelStatus.proFound ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-400' : 'bg-[#0a0a0a] border-[#333] text-[#555]'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] uppercase tracking-widest">Players</span>
                          <Users size={12} />
                        </div>
                        <p className="text-xs font-bold">{excelStatus.proFound ? t.excelProFound : t.excelNoProFound}</p>
                      </div>
                      <div className={`p-3 rounded-xl border ${excelStatus.photoFound ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-400' : 'bg-[#0a0a0a] border-[#333] text-[#555]'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] uppercase tracking-widest">Photos</span>
                          <Monitor size={12} />
                        </div>
                        <p className="text-xs font-bold">{excelStatus.photoFound ? t.excelPhotoFound : t.excelNoPhotoFound}</p>
                      </div>
                    </div>
                    {excelStatus.success && (
                      <div className="mt-4 pt-4 border-t border-[#333]">
                        <a 
                          href="/valorant_pros.csv" 
                          download="valorant_pros.csv"
                          className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-500 text-black rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-emerald-400 transition-colors"
                        >
                          <FileSpreadsheet size={16} /> {t.downloadExtracted}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 gap-8">
          {/* Input Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#151619] border border-[#333] rounded-2xl p-6 shadow-2xl max-w-2xl mx-auto w-full"
          >
            <form onSubmit={handleMatch} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-mono text-[#888] uppercase tracking-wider mb-3 block">{t.selectGame}</span>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {GAMES.map(game => (
                      <button
                        key={game.name}
                        type="button"
                        onClick={() => setSettings({ ...settings, game: game.name })}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all gap-2 ${
                          settings.game === game.name 
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                            : 'bg-[#0a0a0a] border-[#333] text-[#555] hover:border-[#444]'
                        }`}
                      >
                        <span className={`text-2xl transition-all ${settings.game === game.name ? 'opacity-100' : 'opacity-40 grayscale hover:grayscale-0 hover:opacity-100'}`}>
                          {game.emoji}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-tighter truncate w-full text-center">{game.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputGroup 
                    label={t.mouse} 
                    icon={<Mouse size={18} />} 
                    value={settings.mouse}
                    placeholder="e.g. G Pro X Superlight"
                    hint={t.enterGear}
                    listId="mice-list"
                    options={PRO_MICE}
                    onChange={(val) => setSettings({ ...settings, mouse: val })}
                  />
                  <InputGroup 
                    label={t.keyboard} 
                    icon={<Keyboard size={18} />} 
                    value={settings.keyboard}
                    placeholder="e.g. Wooting 60HE"
                    hint={t.enterGear}
                    listId="keyboards-list"
                    options={PRO_KEYBOARDS}
                    onChange={(val) => setSettings({ ...settings, keyboard: val })}
                  />
                  <InputGroup 
                    label={t.monitor} 
                    icon={<Monitor size={18} />} 
                    value={settings.monitor}
                    placeholder="e.g. Zowie XL2566K"
                    hint={t.enterGear}
                    listId="monitors-list"
                    options={PRO_MONITORS}
                    onChange={(val) => setSettings({ ...settings, monitor: val })}
                  />
                  <InputGroup 
                    label={t.mousepad} 
                    icon={<Layers size={18} />} 
                    value={settings.mousepad}
                    placeholder="e.g. Artisan Zero"
                    hint={t.enterGear}
                    listId="mousepads-list"
                    options={PRO_MOUSEPADS}
                    onChange={(val) => setSettings({ ...settings, mousepad: val })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#333]">
                  <label className="block">
                    <span className="text-xs font-mono text-[#888] uppercase tracking-wider mb-2 block">{t.dpi}</span>
                    <input 
                      type="number"
                      step="100"
                      value={settings.dpi}
                      onChange={(e) => setSettings({ ...settings, dpi: Number(e.target.value) })}
                      className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-mono text-[#888] uppercase tracking-wider mb-2 block">{t.sensitivity}</span>
                    <input 
                      type="number"
                      step="0.1"
                      value={settings.sensitivity}
                      onChange={(e) => setSettings({ ...settings, sensitivity: Number(e.target.value) })}
                      className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500"
                    />
                  </label>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-[#333] text-black font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 group uppercase tracking-widest"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <Search size={20} />
                    {t.findMatch}
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Result Page Overlay */}
      <AnimatePresence>
        {matches && matches.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 z-[60] bg-[#0a0a0a] overflow-y-auto p-4 md:p-8"
          >
            <div className="max-w-6xl mx-auto">
              <button 
                onClick={() => setMatches(null)}
                className="mb-8 flex items-center gap-2 text-[#888] hover:text-emerald-400 transition-colors font-mono text-sm uppercase tracking-widest bg-[#151619] px-4 py-2 rounded-lg border border-[#333]"
              >
                <ArrowLeft size={18} /> {t.back}
              </button>

              <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12">
                {/* Left Runner Up */}
                {matches[1] && (
                  <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 0.6, x: 0 }}
                    whileHover={{ opacity: 1, scale: 1.05 }}
                    className="hidden lg:block w-64 bg-[#151619] border border-[#333] rounded-2xl p-6 space-y-4 flex-shrink-0"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">{t.similarMatch}</span>
                      <Zap size={12} className="text-emerald-400" />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="overflow-hidden">
                        <h3 className="font-black uppercase tracking-tighter truncate">{matches[1].name}</h3>
                        <p className="text-emerald-400 font-mono text-[10px] uppercase tracking-widest truncate">{matches[1].team}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <div className="bg-[#0a0a0a] p-2 rounded-lg border border-[#333]">
                        <span className="text-[#555] block uppercase">eDPI</span>
                        <span className="text-emerald-400">{matches[1].settings.edpi}</span>
                      </div>
                      <div className="bg-[#0a0a0a] p-2 rounded-lg border border-[#333]">
                        <span className="text-[#555] block uppercase">SENS</span>
                        <span className="text-emerald-400">{matches[1].settings.sensitivity}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[10px] text-[#555] font-mono uppercase truncate">
                        <Mouse size={10} className="text-emerald-500/50" />
                        <span className="truncate">{matches[1].gear.mouse}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-[#555] font-mono uppercase truncate">
                        <Keyboard size={10} className="text-emerald-500/50" />
                        <span className="truncate">{matches[1].gear.keyboard}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-[#555] font-mono uppercase truncate">
                        <Monitor size={10} className="text-emerald-500/50" />
                        <span className="truncate">{matches[1].gear.monitor}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-[#555] font-mono uppercase truncate">
                        <Layers size={10} className="text-emerald-500/50" />
                        <span className="truncate">{matches[1].gear.mousepad}</span>
                      </div>
                    </div>
                    <a 
                      href={matches[1].profileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-full py-2 bg-[#0a0a0a] border border-[#333] rounded-lg text-[10px] font-mono text-[#888] hover:text-emerald-400 hover:border-emerald-500/50 flex items-center justify-center gap-2 transition-all uppercase tracking-widest"
                    >
                      {t.viewProfile} <ExternalLink size={10} />
                    </a>
                  </motion.div>
                )}

                {/* Main Match */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full max-w-2xl bg-[#151619] border border-emerald-500/30 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(16,185,129,0.15)] flex-shrink-0"
                >
                  <div className="bg-emerald-500 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-black">
                      <Trophy size={24} />
                      <span className="text-xl font-black uppercase tracking-tighter">{t.perfectMatch}</span>
                    </div>
                    <span className="text-black/60 font-mono text-sm">{matches[0].game}</span>
                  </div>
                  
                  <div className="p-8 space-y-8">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                      <div className="text-center md:text-left">
                        <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none mb-2">{matches[0].name}</h2>
                        <p className="text-emerald-400 font-mono text-xl uppercase tracking-widest">{matches[0].team}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <StatBlock label={t.edpi} value={matches[0].settings.edpi.toString()} />
                      <StatBlock label={t.sensitivity} value={matches[0].settings.sensitivity.toString()} />
                    </div>

                    <div className="space-y-5 pt-8 border-t border-[#333]">
                      <ProGearItem icon={<Mouse size={18} />} label={t.mouse} value={matches[0].gear.mouse} />
                      <ProGearItem icon={<Keyboard size={18} />} label={t.keyboard} value={matches[0].gear.keyboard} />
                      <ProGearItem icon={<Monitor size={18} />} label={t.monitor} value={matches[0].gear.monitor} />
                      <ProGearItem icon={<Layers size={18} />} label={t.mousepad} value={matches[0].gear.mousepad} />
                    </div>

                    <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#555] uppercase tracking-widest border-t border-[#333]">
                      <span>{t.source}: {matches[0].source}</span>
                      <a 
                        href={matches[0].profileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="px-6 py-3 bg-[#0a0a0a] border border-[#333] rounded-xl hover:text-emerald-400 hover:border-emerald-500/50 flex items-center gap-2 transition-all"
                      >
                        {t.viewProfile} <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                </motion.div>

                {/* Right Runner Up */}
                {matches[2] && (
                  <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 0.6, x: 0 }}
                    whileHover={{ opacity: 1, scale: 1.05 }}
                    className="hidden lg:block w-64 bg-[#151619] border border-[#333] rounded-2xl p-6 space-y-4 flex-shrink-0"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">{t.similarMatch}</span>
                      <Zap size={12} className="text-emerald-400" />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="overflow-hidden">
                        <h3 className="font-black uppercase tracking-tighter truncate">{matches[2].name}</h3>
                        <p className="text-emerald-400 font-mono text-[10px] uppercase tracking-widest truncate">{matches[2].team}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <div className="bg-[#0a0a0a] p-2 rounded-lg border border-[#333]">
                        <span className="text-[#555] block uppercase">eDPI</span>
                        <span className="text-emerald-400">{matches[2].settings.edpi}</span>
                      </div>
                      <div className="bg-[#0a0a0a] p-2 rounded-lg border border-[#333]">
                        <span className="text-[#555] block uppercase">SENS</span>
                        <span className="text-emerald-400">{matches[2].settings.sensitivity}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[10px] text-[#555] font-mono uppercase truncate">
                        <Mouse size={10} className="text-emerald-500/50" />
                        <span className="truncate">{matches[2].gear.mouse}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-[#555] font-mono uppercase truncate">
                        <Keyboard size={10} className="text-emerald-500/50" />
                        <span className="truncate">{matches[2].gear.keyboard}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-[#555] font-mono uppercase truncate">
                        <Monitor size={10} className="text-emerald-500/50" />
                        <span className="truncate">{matches[2].gear.monitor}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-[#555] font-mono uppercase truncate">
                        <Layers size={10} className="text-emerald-500/50" />
                        <span className="truncate">{matches[2].gear.mousepad}</span>
                      </div>
                    </div>
                    <a 
                      href={matches[2].profileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-full py-2 bg-[#0a0a0a] border border-[#333] rounded-lg text-[10px] font-mono text-[#888] hover:text-emerald-400 hover:border-emerald-500/50 flex items-center justify-center gap-2 transition-all uppercase tracking-widest"
                    >
                      {t.viewProfile} <ExternalLink size={10} />
                    </a>
                  </motion.div>
                )}
              </div>

              {/* Mobile Runner Ups */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
                {[matches[1], matches[2]].filter(Boolean).map((m, idx) => (
                  <div key={idx} className="bg-[#151619] border border-[#333] rounded-2xl p-4 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">{t.similarMatch}</span>
                      <Zap size={12} className="text-emerald-400" />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 overflow-hidden">
                        <h3 className="font-black uppercase tracking-tighter truncate">{m!.name}</h3>
                        <p className="text-emerald-400 font-mono text-[10px] uppercase tracking-widest truncate">{m!.team}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[#555] font-mono text-[10px] block uppercase">eDPI</span>
                        <span className="text-emerald-400 font-mono text-xs">{m!.settings.edpi}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-1 py-2 border-y border-[#333]/50">
                      <div className="flex items-center gap-2 text-[10px] text-[#555] font-mono uppercase truncate">
                        <Mouse size={10} /> <span className="truncate">{m!.gear.mouse}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-[#555] font-mono uppercase truncate">
                        <Keyboard size={10} /> <span className="truncate">{m!.gear.keyboard}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-[#555] font-mono uppercase truncate">
                        <Monitor size={10} /> <span className="truncate">{m!.gear.monitor}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-[#555] font-mono uppercase truncate">
                        <Layers size={10} /> <span className="truncate">{m!.gear.mousepad}</span>
                      </div>
                    </div>
                    <a 
                      href={m!.profileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-full py-3 bg-[#0a0a0a] border border-[#333] rounded-xl text-xs font-mono text-[#888] hover:text-emerald-400 hover:border-emerald-500/50 flex items-center justify-center gap-2 transition-all uppercase tracking-widest"
                    >
                      {t.viewProfile} <ExternalLink size={12} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-8"
          >
            <Loader2 size={64} className="text-emerald-500 animate-spin mb-6" />
            <p className="text-emerald-500 font-mono text-xl animate-pulse uppercase tracking-[0.2em]">{t.scanning}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm font-mono max-w-2xl mx-auto">
          {error}
        </div>
      )}

      {/* High Quality Content Sections for AdSense */}
      <div className="max-w-4xl mx-auto mt-20 space-y-16 pb-20">
        {/* About Section */}
        <section className="bg-[#151619] border border-[#333] rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-emerald-400 mb-4 uppercase tracking-wider flex items-center gap-2">
            <Shield size={24} /> {t.aboutTitle}
          </h2>
          <p className="text-[#aaa] leading-relaxed">
            {t.aboutDesc}
          </p>
        </section>

        {/* Gear Guide Section */}
        <section className="space-y-8">
          <h2 className="text-2xl font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 px-2">
            <Flame size={24} /> {t.guideTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#151619] border border-[#333] rounded-2xl p-6 hover:border-emerald-500/50 transition-colors">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400 mb-4">
                <Target size={20} />
              </div>
              <h3 className="font-bold mb-2 uppercase text-sm tracking-widest">DPI</h3>
              <p className="text-xs text-[#888] leading-relaxed">{t.guideDpi}</p>
            </div>
            <div className="bg-[#151619] border border-[#333] rounded-2xl p-6 hover:border-emerald-500/50 transition-colors">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400 mb-4">
                <Zap size={20} />
              </div>
              <h3 className="font-bold mb-2 uppercase text-sm tracking-widest">Sensitivity</h3>
              <p className="text-xs text-[#888] leading-relaxed">{t.guideSens}</p>
            </div>
            <div className="bg-[#151619] border border-[#333] rounded-2xl p-6 hover:border-emerald-500/50 transition-colors">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400 mb-4">
                <Layers size={20} />
              </div>
              <h3 className="font-bold mb-2 uppercase text-sm tracking-widest">eDPI</h3>
              <p className="text-xs text-[#888] leading-relaxed">{t.guideEdpi}</p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#333] bg-[#0a0a0a] py-12 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-black text-emerald-400 tracking-tighter uppercase mb-2">Pro Gear Match</h3>
            <p className="text-[#555] text-xs font-mono uppercase tracking-widest">{t.footerRights}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-[10px] font-mono text-[#888] uppercase tracking-widest">
            <button onClick={() => setActivePolicy('privacy')} className="hover:text-emerald-400 transition-colors">{t.privacyPolicy}</button>
            <button onClick={() => setActivePolicy('terms')} className="hover:text-emerald-400 transition-colors">{t.termsOfService}</button>
            <button onClick={() => setActivePolicy('contact')} className="hover:text-emerald-400 transition-colors">{t.contactUs}</button>
          </div>
        </div>
      </footer>

      {/* Policy Modals */}
      <AnimatePresence>
        {activePolicy && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#151619] border border-[#333] w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-[#333] flex items-center justify-between">
                <h2 className="text-xl font-black text-emerald-400 uppercase tracking-tighter">
                  {activePolicy === 'privacy' ? t.privacyPolicy : activePolicy === 'terms' ? t.termsOfService : t.contactUs}
                </h2>
                <button 
                  onClick={() => setActivePolicy(null)}
                  className="p-2 hover:bg-[#333] rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-8">
                <p className="text-[#aaa] leading-relaxed text-sm whitespace-pre-wrap">
                  {activePolicy === 'privacy' ? t.privacyPolicyContent : activePolicy === 'terms' ? t.termsOfServiceContent : t.contactUsContent}
                </p>
                <button 
                  onClick={() => setActivePolicy(null)}
                  className="mt-8 w-full py-3 bg-emerald-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-colors"
                >
                  {t.close}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pro List Modal */}
      <AnimatePresence>
        {showList && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#151619] border border-[#333] rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-[#333] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1a1b1e]">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <Users className="text-emerald-400" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter text-white">{t.proList}</h3>
                    <p className="text-[10px] font-mono text-[#888] uppercase tracking-widest">{settings.game} Athletes</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" size={14} />
                    <input 
                      type="text"
                      placeholder="Search players, teams, gear..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-[#0a0a0a] border border-[#333] rounded-lg pl-10 pr-4 py-2 text-xs font-mono focus:outline-none focus:border-emerald-500 w-full md:w-64 transition-all"
                    />
                  </div>
                  <button 
                    onClick={() => setShowList(false)} 
                    className="p-2 bg-[#0a0a0a] border border-[#333] rounded-lg text-[#888] hover:text-white transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              
              {/* Modal Body - Table */}
              <div className="flex-1 overflow-auto bg-[#0a0a0a]">
                {listLoading ? (
                  <div className="h-64 flex flex-col items-center justify-center gap-4">
                    <Loader2 size={48} className="text-emerald-500 animate-spin" />
                    <p className="font-mono text-sm text-[#888] animate-pulse uppercase tracking-widest">{t.fetching}</p>
                  </div>
                ) : (
                  <div className="min-w-[1000px]">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 z-10 bg-[#151619] border-b border-[#333]">
                        <tr className="text-[10px] font-mono text-[#555] uppercase tracking-widest">
                          <th className="p-4 cursor-pointer hover:text-emerald-400" onClick={() => handleSort('name')}>Player {sortConfig?.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                          <th className="p-4 cursor-pointer hover:text-emerald-400" onClick={() => handleSort('team')}>Team {sortConfig?.key === 'team' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                          <th className="p-4 cursor-pointer hover:text-emerald-400" onClick={() => handleSort('gear.mouse')}>Mouse</th>
                          <th className="p-4 cursor-pointer hover:text-emerald-400" onClick={() => handleSort('gear.keyboard')}>Keyboard</th>
                          <th className="p-4 cursor-pointer hover:text-emerald-400" onClick={() => handleSort('gear.monitor')}>Monitor</th>
                          <th className="p-4 cursor-pointer hover:text-emerald-400" onClick={() => handleSort('settings.edpi')}>eDPI</th>
                          <th className="p-4 text-center">Link</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1a1b1e]">
                        {sortedProList.map((pro, idx) => (
                          <tr key={idx} className="group hover:bg-[#151619] transition-colors">
                            <td className="p-4">
                              <span className="font-bold text-white group-hover:text-emerald-400 transition-colors">{pro.name}</span>
                            </td>
                            <td className="p-4">
                              <span className="text-xs font-mono text-[#888] uppercase">{pro.team}</span>
                            </td>
                            <td className="p-4">
                              <span className="text-xs text-[#aaa] group-hover:text-white transition-colors">{pro.gear.mouse}</span>
                            </td>
                            <td className="p-4">
                              <span className="text-xs text-[#aaa] group-hover:text-white transition-colors">{pro.gear.keyboard}</span>
                            </td>
                            <td className="p-4">
                              <span className="text-xs text-[#aaa] group-hover:text-white transition-colors">{pro.gear.monitor}</span>
                            </td>
                            <td className="p-4">
                              <span className="text-xs font-mono text-emerald-400">{pro.settings.edpi}</span>
                            </td>
                            <td className="p-4 text-center">
                              <a 
                                href={pro.profileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex p-2 bg-[#151619] rounded-lg text-[#555] hover:text-emerald-400 hover:border-emerald-500/50 border border-transparent transition-all"
                              >
                                <ExternalLink size={14} />
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {sortedProList.length === 0 && (
                      <div className="p-20 text-center">
                        <p className="text-[#555] font-mono text-sm uppercase tracking-widest">No players found matching your search.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-[#333] bg-[#1a1b1e] flex items-center justify-between text-[10px] font-mono text-[#555] uppercase tracking-widest">
                <span>{t.showingPlayers.replace('{count}', sortedProList.length.toString())}</span>
                <span className="flex items-center gap-2">
                  <Shield size={10} /> {t.verifiedData}
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InputGroup({ label, icon, value, placeholder, hint, onChange, listId, options }: { label: string, icon: React.ReactNode, value: string, placeholder: string, hint?: string, onChange: (val: string) => void, listId?: string, options?: string[] }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono text-[#888] uppercase tracking-wider flex items-center gap-2">
          {icon} {label}
        </label>
        {hint && <span className="text-[10px] font-sans text-[#777] font-medium italic">{hint}</span>}
      </div>
      <input 
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        list={listId}
        className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-[#444]"
      />
      {listId && options && (
        <datalist id={listId}>
          {options.map(opt => <option key={opt} value={opt} />)}
        </datalist>
      )}
    </div>
  );
}

function StatBlock({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-[#0a0a0a] p-3 rounded-xl border border-[#333]">
      <span className="text-[10px] font-mono text-[#888] uppercase tracking-widest block mb-1">{label}</span>
      <span className="text-2xl font-bold tracking-tighter text-emerald-400">{value}</span>
    </div>
  );
}

function ProGearItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-[#888]">{icon}</div>
      <div className="flex-1">
        <span className="text-[9px] font-mono text-[#555] uppercase tracking-widest block">{label}</span>
        <span className="text-xs font-medium">{value}</span>
      </div>
    </div>
  );
}

