import React, { lazy, Suspense, useState, useEffect, useRef, useMemo } from 'react';
import { Mouse, Keyboard, Monitor, Layers, Target, Search, Loader2, Trophy, ExternalLink, X, Users, RefreshCcw, Shield, Zap, Flame, Sword, Gamepad2, ArrowLeft, LogIn, LogOut, FileSpreadsheet, CheckCircle2, AlertCircle, Sun, Moon, Languages, Trash2, Wand2, Pencil, Play, MessageCircle, Flag, Send, ShoppingCart, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { GearSettings, ProGamer } from './types';
import { matchProGamer, getProGamerList, deleteProGamer, syncProGamerToDb, cleanPlayerName, scrapeProGamerInfo, getGearSuggestions, seedDatabase, migrateProsToOverwatch, fixOverwatchLinks, revertOverwatchLinks, getHighlightVideos, stripColorsFromAllGear } from './services/aiService';
import { translations, getLanguage, Language } from './translations';
import { PRO_MICE, PRO_KEYBOARDS, PRO_MONITORS, PRO_MOUSEPADS, PLAYER_NATIONALITIES } from './constants';
import { AMAZON_LINKS_NORMALIZED } from './amazonLinks';
import { auth, googleProvider, db } from './firebase';
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, User } from 'firebase/auth';
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc, increment, setDoc, serverTimestamp, query, orderBy, collectionGroup, where } from 'firebase/firestore';
// Admin-only — lazy-loaded so regular users don't pay for it.
const BulkAuditModal = lazy(() =>
  import('./components/BulkAuditModal').then((m) => ({ default: m.BulkAuditModal })),
);
import { GearImage } from './components/GearImage';
import { EdpiDistributionChart } from './components/EdpiDistributionChart';
import { CommentSection } from './components/CommentSection';
import { StaticPageView } from './components/StaticPageView';
import { getAmazonLink } from './utils/gear';
import type { PageType } from './utils/pageType';
import { setSEO, seoForPage } from './utils/seo';
import { errMsg } from './utils/errors';
import { useEscapeKey } from './hooks/useModalA11y';
import { cmPer360, formatCmPer360 } from './utils/sensitivity';
import { GAMES, GAME_COLORS } from './constants/games';
import { ScrollFade } from './components/ScrollFade';
import { GoogleAd } from './components/GoogleAd';
import { InputGroup } from './components/InputGroup';
import { StatBlock } from './components/StatBlock';
import { ProGearItem } from './components/ProGearItem';
import { TodayProCard } from './components/TodayProCard';


const ADMIN_EMAIL = "wjsrkdgns123a@gmail.com";


const formatEdpi = (val: number) => {
  if (!val) return "0";
  if (Number.isInteger(val)) return val.toString();
  return val.toFixed(2);
};


export default function App() {
  // Initialise from localStorage immediately to avoid flash of wrong language.
  // On first visit (no stored value) default to 'en', then detect by IP once.
  const [lang, setLang] = useState<Language>(() => {
    const stored = localStorage.getItem('lang');
    if (stored === 'en' || stored === 'ko') return stored;
    return 'en';
  });
  const t = translations[lang];

  useEffect(() => {
    // Only run IP detection when there's no stored preference yet
    if (localStorage.getItem('lang')) return;
    fetch('https://ipapi.co/country_code/')
      .then(r => r.text())
      .then(code => {
        const detected: Language = code.trim() === 'KR' ? 'ko' : 'en';
        setLang(detected);
      })
      .catch(() => {
        // fallback: use browser locale
        setLang(getLanguage());
      });
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
  const [selectedMatchIdx, setSelectedMatchIdx] = useState(0);
  const [slideDir, setSlideDir] = useState<1 | -1>(1);
  const [topGearIdx, setTopGearIdx] = useState<Record<string, number>>({ mouse: 0, keyboard: 0, monitor: 0, mousepad: 0 });
  const [topGearDir, setTopGearDir] = useState<Record<string, 1 | -1>>({ mouse: 1, keyboard: 1, monitor: 1, mousepad: 1 });
  const [allProList, setAllProList] = useState<ProGamer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showList, setShowList] = useState(false);
  const [activePolicy, setActivePolicy] = useState<'privacy' | 'terms' | 'contact' | null>(null);

  const [currentPage, setCurrentPage] = useState<PageType>(() => {
    const p = window.location.pathname;
    if (p === '/how-it-works') return 'how-it-works';
    if (p === '/about') return 'about';
    if (p === '/privacy') return 'privacy';
    if (p === '/terms') return 'terms';
    if (p === '/affiliate-disclosure') return 'affiliate';
    return 'home';
  });

  const navigate = (page: PageType) => {
    const pathMap: Record<PageType, string> = {
      home: '/', 'how-it-works': '/how-it-works', about: '/about',
      privacy: '/privacy', terms: '/terms', affiliate: '/affiliate-disclosure',
    };
    history.pushState({}, '', pathMap[page]);
    setCurrentPage(page);
    window.scrollTo(0, 0);
    setSEO(seoForPage(page, lang));
  };
  const [proList, setProList] = useState<ProGamer[]>([]);
  const [highlights, setHighlights] = useState<{ title: string, youtubeId: string, description?: string }[]>([]);
  const [loadingHighlights, setLoadingHighlights] = useState(false);

  const gameStats = useMemo(() => {
    if (proList.length === 0) return null;

    const validDpis = proList.map(p => p.settings.dpi).filter(d => d > 0);
    const avgDpi = validDpis.length > 0 ? Math.round(validDpis.reduce((a, b) => a + b, 0) / validDpis.length) : 0;

    const validSens = proList.map(p => p.settings.sensitivity).filter(s => s > 0);
    const avgSens = validSens.length > 0 ? (validSens.reduce((a, b) => a + b, 0) / validSens.length).toFixed(3) : "0";

    const validEdpis = proList.map(p => p.settings.edpi).filter(e => e > 0);
    const avgEdpi = validEdpis.length > 0 ? Math.round(validEdpis.reduce((a, b) => a + b, 0) / validEdpis.length) : 0;

    const getMostUsed = (items: string[]) => {
      const counts: Record<string, number> = {};
      items.filter(i => {
        if (!i) return false;
        const val = i.toLowerCase().trim();
        return val !== '-' && val !== '' && val !== 'null' && val !== 'none' && val !== 'undefined';
      }).forEach(i => {
        let cleaned = i.trim();
        if (cleaned) counts[cleaned] = (counts[cleaned] || 0) + 1;
      });
      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      return sorted.length > 0 ? sorted[0][0] : '-';
    };

    return {
      avgDpi,
      avgSens,
      avgEdpi,
      mostUsedMouse: getMostUsed(proList.map(p => p.gear.mouse)),
      mostUsedKeyboard: getMostUsed(proList.map(p => p.gear.keyboard)),
      mostUsedMonitor: getMostUsed(proList.map(p => p.gear.monitor)),
      mostUsedMousepad: getMostUsed(proList.map(p => p.gear.mousepad))
    };
  }, [proList]);
  const [listLoading, setListLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [totalProCount, setTotalProCount] = useState(0);
  const [excelStatus, setExcelStatus] = useState<{ loading: boolean, success?: boolean, proFound?: boolean, photoFound?: boolean, error?: string } | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [infoTab, setInfoTab] = useState<'how' | 'edpi' | 'about'>('how');
  const [nationalityFilter, setNationalityFilter] = useState<string>('');
  const [showNationalityDropdown, setShowNationalityDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPro, setEditingPro] = useState<ProGamer | null>(null);
  const [showBulkAuditModal, setShowBulkAuditModal] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ current: number, total: number } | null>(null);
  const [updatingProId, setUpdatingProId] = useState<string | null>(null);
  const [tempUrls, setTempUrls] = useState<{[key: string]: string}>({});
  const [editingNationalityId, setEditingNationalityId] = useState<string | null>(null);
  const [tempNationality, setTempNationality] = useState<string>('');
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const [showTodayPanel, setShowTodayPanel] = useState(true);
  const [showClaudeModal, setShowClaudeModal] = useState(false);
  const [showMigrateConfirm, setShowMigrateConfirm] = useState(false);
  const [showFixLinksConfirm, setShowFixLinksConfirm] = useState(false);
  const [showRevertConfirm, setShowRevertConfirm] = useState(false);
  const [showStripColorsConfirm, setShowStripColorsConfirm] = useState(false);
  // ESC-to-close for all dismissible modals. The loading overlays (z-[70])
  // intentionally don't have ESC — they auto-dismiss on completion.
  useEscapeKey(showList, () => setShowList(false));
  useEscapeKey(showMigrateConfirm, () => setShowMigrateConfirm(false));
  useEscapeKey(showFixLinksConfirm, () => setShowFixLinksConfirm(false));
  useEscapeKey(showRevertConfirm, () => setShowRevertConfirm(false));
  useEscapeKey(showStripColorsConfirm, () => setShowStripColorsConfirm(false));
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [claudeMessages, setClaudeMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [claudeInput, setClaudeInput] = useState('');
  const [claudeLoading, setClaudeLoading] = useState(false);
  const [newPro, setNewPro] = useState<ProGamer>({
    name: '',
    team: '',
    game: 'Valorant',
    profileUrl: '',
    imageUrl: '',
    teamLogoUrl: '',
    gear: {
      mouse: '',
      keyboard: '',
      monitor: '',
      mousepad: '',
      controller: '',
    },
    settings: {
      dpi: 800,
      sensitivity: 0.5,
      edpi: 400,
    },
    source: 'Manual Entry'
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (savedTheme) setTheme(savedTheme);
  }, []);

  // Update SEO meta tags whenever page or language changes
  useEffect(() => {
    setSEO(seoForPage(currentPage, lang));
  }, [currentPage, lang]);

  // Load total pro count from all games on mount
  useEffect(() => {
    const loadTotalProCount = async () => {
      try {
        let total = 0;
        for (const game of GAMES) {
          const list = await getProGamerList(game.name);
          total += list.length;
        }
        setTotalProCount(total);
      } catch (err) {
        console.error("Failed to load total pro count:", err);
      }
    };
    loadTotalProCount();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const toggleLanguage = () => {
    const next: Language = lang === 'en' ? 'ko' : 'en';
    localStorage.setItem('lang', next);
    setLang(next);
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    const handle = () => {
      const p = window.location.pathname;
      if (p === '/how-it-works') setCurrentPage('how-it-works');
      else if (p === '/about') setCurrentPage('about');
      else if (p === '/privacy') setCurrentPage('privacy');
      else if (p === '/terms') setCurrentPage('terms');
      else if (p === '/affiliate-disclosure') setCurrentPage('affiliate');
      else setCurrentPage('home');
      window.scrollTo(0, 0);
    };
    window.addEventListener('popstate', handle);
    return () => window.removeEventListener('popstate', handle);
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // checkExcelFile is defined below; this handler only fires after
      // the user completes OAuth, so the TDZ concern is theoretical.
      if (event.data?.type === 'MICROSOFT_AUTH_SUCCESS') {
        // eslint-disable-next-line react-hooks/immutability
        checkExcelFile();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const flatData = data.flat().map((v: unknown) => String(v).toLowerCase());
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

  const handleDeletePro = async (pro: ProGamer) => {
    console.log("Delete button clicked for:", pro.name, pro.id);
    
    // Optimistic update: remove from UI immediately
    const originalList = [...proList];
    setProList(prev => {
      const filtered = prev.filter(p => {
        // If both have IDs, compare IDs
        if (pro.id && p.id) return p.id !== pro.id;
        // Otherwise fallback to name + team + game comparison for accuracy
        return !(p.name === pro.name && p.team === pro.team && p.game === pro.game);
      });
      console.log(`Filtering: ${prev.length} -> ${filtered.length}`);
      return filtered;
    });

    try {
      await deleteProGamer(pro);
      console.log("Delete successful in database");
    } catch (err: unknown) {
      console.error("Delete failed in database:", err);
      // Rollback if failed
      setProList(originalList);
      alert(`${t.errorDelete}: ${errMsg(err) || t.errorUnknown}`);
    }
  };

  const handleCleanAllNames = async () => {
    if (!window.confirm("Clean all player names (remove full names)?")) return;
    setListLoading(true);
    try {
      for (const pro of proList) {
        // If _rawName is different from name, it means it was a full name
        const rawName = pro._rawName || pro.name;
        const cleanedName = cleanPlayerName(rawName);
        
        if (cleanedName !== rawName) {
          // Delete old one (using ID if available)
          await deleteProGamer(pro);
          // Sync new one (syncProGamerToDb will clean it again and use new ID)
          await syncProGamerToDb({ ...pro, name: cleanedName });
        }
      }
      // Refresh list
      const updatedList = await getProGamerList(settings.game);
      setProList(updatedList);
      alert("Database cleaned successfully!");
    } catch (err) {
      console.error(err);
      alert("An error occurred during cleanup.");
    } finally {
      setListLoading(false);
    }
  };

  const handleSeedDatabase = async () => {
    if (!window.confirm("Initialize database with default pro gamer data? (bang, TenZ, aspas will be saved to DB)")) return;
    setListLoading(true);
    try {
      await seedDatabase();
      // Refresh list
      const updatedList = await getProGamerList(settings.game);
      setProList(updatedList);
      alert("Database initialized successfully! You can now delete or edit these players.");
    } catch (err: unknown) {
      console.error(err);
      alert(`${t.errorInit}: ${errMsg(err) || t.errorUnknown}`);
    } finally {
      setListLoading(false);
    }
  };

  const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
  // Country code → localized name lookup (EN + KO) for nationality search
  const regionNamesEn = (() => { try { return new Intl.DisplayNames(['en'], { type: 'region' }); } catch { return null; } })();
  const regionNamesKo = (() => { try { return new Intl.DisplayNames(['ko'], { type: 'region' }); } catch { return null; } })();
  const nationalityHaystack = (code?: string): string => {
    if (!code) return '';
    const c = code.toUpperCase();
    const en = regionNamesEn?.of(c) ?? '';
    const ko = regionNamesKo?.of(c) ?? '';
    return `${c} ${en} ${ko}`.toLowerCase();
  };
  // Unique nationality codes present in current pro list (for the dropdown)
  const availableNationalities = Array.from(
    new Set(proList.map(p => p.nationality).filter((c): c is string => !!c && c.trim() !== ''))
  ).sort();
  const filteredProList = proList.filter(pro => {
    if (showTodayOnly && !pro.updatedAt?.startsWith(today)) return false;
    if (nationalityFilter && pro.nationality?.toUpperCase() !== nationalityFilter.toUpperCase()) return false;
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      pro.name.toLowerCase().includes(q) ||
      pro.team.toLowerCase().includes(q) ||
      pro.gear.mouse.toLowerCase().includes(q) ||
      (pro.gear.controller && pro.gear.controller.toLowerCase().includes(q)) ||
      pro.gear.keyboard.toLowerCase().includes(q) ||
      nationalityHaystack(pro.nationality).includes(q)
    );
  });
  const todayCount = proList.filter(p => p.updatedAt?.startsWith(today)).length;

  const sortedProList = [...filteredProList].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    
    let aValue: unknown = a;
    let bValue: unknown = b;

    if (key.includes('.')) {
      const keys = key.split('.');
      aValue = keys.reduce<unknown>((o, i) => (o as Record<string, unknown>)?.[i], a);
      bValue = keys.reduce<unknown>((o, i) => (o as Record<string, unknown>)?.[i], b);
    } else {
      aValue = a[key as keyof ProGamer];
      bValue = b[key as keyof ProGamer];
    }

    const av = aValue as number | string;
    const bv = bValue as number | string;
    if (av < bv) return direction === 'asc' ? -1 : 1;
    if (av > bv) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleFetchFromUrl = async () => {
    if (!newPro.profileUrl) {
      alert("Please enter a URL first.");
      return;
    }

    const urls = newPro.profileUrl.split(/\s+/).filter(u => u.trim().startsWith('http'));
    if (urls.length > 1) {
      handleAutoFetchAndSave(newPro.profileUrl);
      return;
    }

    setFetchingData(true);
    try {
      const scraped = await scrapeProGamerInfo(newPro.profileUrl);
      if (scraped) {
        setNewPro(prev => ({
          ...prev,
          name: scraped.name || prev.name,
          team: scraped.team || prev.team,
          game: scraped.game || prev.game,
          gear: {
            ...prev.gear,
            ...scraped.gear
          },
          settings: {
            ...prev.settings,
            ...scraped.settings,
            edpi: Number(((scraped.settings?.dpi || prev.settings.dpi) * (scraped.settings?.sensitivity || prev.settings.sensitivity)).toFixed(1))
          }
        }));
        alert(t.fetchSuccess);
      } else {
        alert(t.fetchError);
      }
    } catch (err) {
      console.error(err);
      alert(t.fetchError);
    } finally {
      setFetchingData(false);
    }
  };

  const handleAutoFetchAndSave = async (pastedText: string) => {
    const urls = pastedText.split(/\s+/).filter(u => u.trim().startsWith('http'));
    if (urls.length === 0) return;
    
    setFetchingData(true);
    setLoading(true);
    setBulkProgress({ current: 0, total: urls.length });
    
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < urls.length; i++) {
      setBulkProgress({ current: i + 1, total: urls.length });
      if (i > 0) await new Promise(r => setTimeout(r, 1500)); // Increased delay between multiple fetches
      
      const url = urls[i];
      // Update the UI immediately so the user sees the URL being processed
      setNewPro(prev => ({ ...prev, profileUrl: `[${i + 1}/${urls.length}] ${url}` }));
      
      try {
        const scraped = await scrapeProGamerInfo(url);
        if (scraped && scraped.name && scraped.team) {
          const edpi = Number(((scraped.settings?.dpi || 800) * (scraped.settings?.sensitivity || 0.5)).toFixed(1));
          const proToSave = {
            ...newPro,
            ...scraped,
            profileUrl: url,
            settings: { 
              ...newPro.settings, 
              ...scraped.settings,
              edpi 
            },
            source: 'Auto-Scraped'
          };
          
          await syncProGamerToDb(proToSave);
          successCount++;
        } else {
          failCount++;
        }
      } catch (err) {
        console.error(`Failed to fetch/save ${url}:`, err);
        failCount++;
      }
    }

    setBulkProgress(null);
    if (successCount > 0) {
      // Success feedback
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#059669']
      });

      alert(
        t.errorAddPlayersSuccess.replace('{count}', String(successCount)) +
          (failCount > 0 ? t.errorAddPlayersMixed.replace('{failed}', String(failCount)) : ''),
      );
    } else if (failCount > 0) {
      alert(t.errorAddPlayers.replace('{count}', String(failCount)));
    }

    // Reset form but keep the game selection
    setNewPro({
      name: '',
      team: '',
      game: newPro.game,
      profileUrl: '',
      gear: { mouse: '', keyboard: '', monitor: '', mousepad: '' },
      settings: { dpi: 800, sensitivity: 0.5, edpi: 400 },
      source: 'Manual Entry'
    });
    
    // Refresh list
    const list = await getProGamerList(settings.game);
    const sortedList = [...list].sort((a, b) => a.team.localeCompare(b.team));
    setProList(sortedList);
    
    setFetchingData(false);
    setLoading(false);
  };

  const handleSaveNationality = async (pro: ProGamer, code: string) => {
    const trimmed = code.trim().toUpperCase();
    if (!pro.id) return;
    try {
      const { doc: fsDoc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('./firebase');
      await updateDoc(fsDoc(db, 'pro-gamers', pro.id), { nationality: trimmed || null });
      setProList(prev => prev.map(p => p.id === pro.id ? { ...p, nationality: trimmed || undefined } : p));
    } catch (e) {
      alert('저장 실패: ' + e);
    }
    setEditingNationalityId(null);
  };

  const handleUpdatePro = async (pro: ProGamer, customUrl?: string) => {
    const urlToUse = customUrl || pro.profileUrl;
    if (!urlToUse) {
      alert("No profile URL available for this player.");
      return;
    }

    setUpdatingProId(pro.id || pro.name);
    try {
      const scraped = await scrapeProGamerInfo(urlToUse);
      if (scraped) {
        const updatedPro = {
          ...pro,
          ...scraped,
          profileUrl: urlToUse, // Update the URL as well
          gear: { ...pro.gear, ...scraped.gear },
          settings: { 
            ...pro.settings, 
            ...scraped.settings,
            edpi: Number(((scraped.settings?.dpi || pro.settings.dpi) * (scraped.settings?.sensitivity || pro.settings.sensitivity)).toFixed(1))
          },
          source: 'Auto-Updated'
        };
        await syncProGamerToDb(updatedPro);
        
        // Refresh the list
        const list = await getProGamerList(settings.game);
        const sortedList = [...list].sort((a, b) => a.team.localeCompare(b.team));
        setProList(sortedList);
        
        alert(t.successUpdate);
      } else {
        alert(t.fetchError);
      }
    } catch (err) {
      console.error(err);
      alert(t.errorUpdate);
    } finally {
      setUpdatingProId(null);
    }
  };

  const handleGearChange = (category: 'mouse' | 'keyboard' | 'monitor' | 'mousepad' | 'controller', value: string) => {
    setNewPro(prev => ({
      ...prev,
      gear: { ...prev.gear, [category]: value }
    }));
  };

  const handleSaveNewPro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPro.name || !newPro.team) {
      alert("Please enter at least name and team.");
      return;
    }

    setLoading(true);
    if (!newPro.name.trim()) {
      alert("Please enter a name for the pro gamer.");
      setLoading(false);
      return;
    }

    try {
      const edpi = Number((newPro.settings.dpi * newPro.settings.sensitivity).toFixed(1));
      const proToSave = {
        ...newPro,
        settings: { ...newPro.settings, edpi }
      };
      
      await syncProGamerToDb(proToSave);
      alert(t.successAdd);
      // Reset form but keep the game selection for convenience
      setNewPro({
        name: '',
        team: '',
        game: newPro.game, // Keep the current game
        profileUrl: '',
        gear: { mouse: '', keyboard: '', monitor: '', mousepad: '' },
        settings: { dpi: 800, sensitivity: 0.5, edpi: 400 },
        source: 'Manual Entry'
      });
      
      // Force refresh the list data in the background if it matches current game
      if (proToSave.game === settings.game) {
        try {
          const list = await getProGamerList(settings.game);
          const sortedList = [...list].sort((a, b) => a.team.localeCompare(b.team));
          setProList(sortedList);
          console.log(`Refreshed pro list for ${settings.game}. New count: ${sortedList.length}`);
        } catch (fetchErr) {
          console.error("Background refresh failed:", fetchErr);
        }
      } else {
        console.log(`Pro added for ${proToSave.game}, but current view is ${settings.game}. Switch game to see the new entry.`);
      }
    } catch (err) {
      console.error("Save error:", err);
      let errorMsg = t.errorAdd;
      if (err instanceof Error) {
        try {
          const parsed = JSON.parse(err.message);
          if (parsed.error) errorMsg = `${t.errorAdd}: ${parsed.error}`;
        } catch {
          errorMsg = `${t.errorAdd}: ${err.message}`;
        }
      }
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEditPro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPro) return;
    
    setLoading(true);
    try {
      const proToSave = {
        ...editingPro,
        settings: {
          ...editingPro.settings
        }
      };
      
      await syncProGamerToDb(proToSave);
      alert(t.successUpdate);
      setShowEditModal(false);
      setEditingPro(null);
      
      // Refresh list
      const list = await getProGamerList(settings.game);
      const sortedList = [...list].sort((a, b) => a.team.localeCompare(b.team));
      setProList(sortedList);
    } catch (err) {
      console.error(err);
      alert(t.errorUpdate);
    } finally {
      setLoading(false);
    }
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

  const exportLinksOnly = () => {
    const headers = ['Name', 'Team', 'Profile URL'];
    const rows = sortedProList.map(pro => [
      pro.name,
      pro.team,
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
    link.setAttribute('download', `pro_links_${settings.game.toLowerCase()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    // Handle redirect result after Google login (for fallback redirect flow)
    getRedirectResult(auth)
      .then(result => {
        if (result?.user) console.log('Redirect login success:', result.user.email);
      })
      .catch(err => console.error('Redirect result error:', err));
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const code = (err as { code?: string } | null)?.code;
      // User closed popup or browser blocked it — silent fallback to redirect
      const silentCodes = [
        'auth/popup-blocked',
        'auth/popup-closed-by-user',
        'auth/cancelled-popup-request',
        'auth/internal-error',
      ];
      if (silentCodes.includes(code ?? '')) {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch {
          // redirect also failed — nothing to do
        }
      } else {
        console.error('Login failed:', code, errMsg(err));
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMigrate = async () => {
    setShowMigrateConfirm(true);
  };

  const executeMigration = async () => {
    setShowMigrateConfirm(false);
    setLoading(true);
    try {
      console.log("Migration started...");
      const count = await migrateProsToOverwatch();
      if (count === 0) {
        setNotification({ message: "오늘 추가된 대상 선수가 없습니다. (날짜 형식을 확인해 주세요)", type: 'error' });
      } else {
        setNotification({ message: `성공적으로 ${count}명의 선수를 Overwatch 2로 옮겼습니다!`, type: 'success' });
        fetchProList(true);
      }
    } catch (err: unknown) {
      console.error("Migration UI Error:", err);
      setNotification({ message: "이전 실패: " + errMsg(err), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleFixLinks = async () => {
    setShowFixLinksConfirm(true);
  };

  const executeFixLinks = async () => {
    setShowFixLinksConfirm(false);
    setLoading(true);
    try {
      const count = await fixOverwatchLinks();
      setNotification({ message: `성공적으로 ${count}명의 링크를 Liquipedia로 수정했습니다!`, type: 'success' });
      fetchProList(true);
    } catch (err: unknown) {
      console.error(err);
      setNotification({ message: "링크 수정 실패: " + errMsg(err), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRevertLinks = async () => {
    setShowRevertConfirm(true);
  };

  const executeRevertLinks = async () => {
    setShowRevertConfirm(false);
    setLoading(true);
    try {
      const count = await revertOverwatchLinks();
      setNotification({ message: `성공적으로 ${count}명의 링크를 ProSettings로 복구했습니다!`, type: 'success' });
      fetchProList(true);
    } catch (err: unknown) {
      console.error(err);
      setNotification({ message: "링크 복구 실패: " + errMsg(err), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const executeStripColors = async () => {
    setShowStripColorsConfirm(false);
    setLoading(true);
    try {
      const { updated, skipped } = await stripColorsFromAllGear();
      setNotification({ message: `색깔 단어 제거 완료: ${updated}개 업데이트, ${skipped}개 변경없음`, type: 'success' });
      fetchProList(true);
    } catch (err: unknown) {
      setNotification({ message: "색깔 제거 실패: " + errMsg(err), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setHighlights([]);
    try {
      const results = await matchProGamer(settings, lang);
      setMatches(results);
      setSelectedMatchIdx(0);

      if (results.length > 0) {
        setLoadingHighlights(true);
        try {
          const vids = await getHighlightVideos(results[0].name, results[0].game);
          setHighlights(vids);
        } catch (e) {
          console.error("Failed to fetch highlights:", e);
        } finally {
          setLoadingHighlights(false);
        }
      }

      // Trigger confetti
      const duration = 1 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: ReturnType<typeof setInterval> = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = errMsg(err) || 'Failed to find a match. Please try again.';
      setError(errorMessage.includes('Empty response') ? 'The AI returned an empty response. Please try again.' : errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClaudeChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claudeInput.trim() || claudeLoading) return;

    const userMsg = { role: 'user' as const, content: claudeInput };
    setClaudeMessages(prev => [...prev, userMsg]);
    setClaudeInput('');
    setClaudeLoading(true);

    try {
      const response = await fetch('/api/claude/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...claudeMessages, userMsg].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const assistantMsg = { 
        role: 'assistant' as const, 
        content: data.content[0].text 
      };
      setClaudeMessages(prev => [...prev, assistantMsg]);
    } catch (err: unknown) {
      console.error(err);
      const em = errMsg(err);
      let errorMsg = `Error: ${em}`;

      // Handle specific Claude low balance error
      if (em && em.includes('credit balance is too low')) {
        errorMsg = "Claude API credit balance is too low. Please top up your Anthropic account (Plans & Billing).";
      }
      
      setClaudeMessages(prev => [...prev, { 
        role: 'assistant', 
        content: errorMsg
      }]);
    } finally {
      setClaudeLoading(false);
    }
  };

  useEffect(() => {
    const updateStats = async () => {
      try {
        const list = await getProGamerList(settings.game);
        setProList(list);
      } catch (err) {
        console.error("Failed to update stats for", settings.game, err);
      }
    };
    updateStats();
  }, [settings.game]);

  // 전 게임 합산 Top Gear 계산용 — 최초 1회 로드
  useEffect(() => {
    const loadAllPros = async () => {
      try {
        const results = await Promise.all(GAMES.map(g => getProGamerList(g.name)));
        setAllProList(results.flat());
      } catch (err) {
        console.error("Failed to load all pros:", err);
      }
    };
    loadAllPros();
  }, []);

  const fetchProList = async (force = false) => {
    setShowList(true);
    setSearchTerm(''); // Reset search when opening
    
    // Check if we need to fetch: 
    // 1. Forced refresh
    // 2. List is empty
    // 3. List is for a different game
    const needsFetch = force || proList.length === 0 || (proList.length > 0 && proList[0].game !== settings.game);
    
    if (!needsFetch) {
      console.log("Using cached pro list for", settings.game);
      return;
    }
    
    setListLoading(true);
    try {
      console.log(`Fetching fresh pro list for ${settings.game} (force=${force})`);
      const list = await getProGamerList(settings.game);
      // Sort by team name alphabetically
      const sortedList = [...list].sort((a, b) => a.team.localeCompare(b.team));
      setProList(sortedList);
    } catch (err) {
      console.error("Failed to fetch pro list:", err);
    } finally {
      setListLoading(false);
    }
  };

  if (currentPage !== 'home') {
    return <StaticPageView page={currentPage} theme={theme} lang={lang} t={t} onNavigate={navigate} />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-[#050507] text-[#e0e0e0]' : 'bg-[#f0f2f5] text-[#1a1a1a]'} font-sans relative overflow-hidden`}>
      {theme === 'dark' && (
        <div className="fixed inset-0 pointer-events-none" style={{backgroundImage: 'linear-gradient(rgba(16,185,129,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.028) 1px, transparent 1px)', backgroundSize: '44px 44px'}} />
      )}
      {theme === 'dark' && (
        <>
          <div className="fixed top-[-10%] left-[10%] w-[900px] h-[900px] rounded-full pointer-events-none" style={{background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 60%)'}} />
          <div className="fixed bottom-[5%] right-[0%] w-[600px] h-[600px] rounded-full pointer-events-none" style={{background: 'radial-gradient(circle, rgba(6,182,212,0.03) 0%, transparent 65%)'}} />
        </>
      )}
      <div className="relative max-w-5xl mx-auto px-4 md:px-8 py-4 md:py-8">
        {/* Hero Section */}
        <section className="relative mb-8 overflow-hidden">
          {/* Background esports scene images — dark mode only */}
          {theme === 'dark' && (
            <div className="absolute inset-0 pointer-events-none select-none" style={{ zIndex: 0 }} aria-hidden="true">
              {/* 좌측 — esports arena */}
              <img
                src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&q=60&auto=format"
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute object-cover"
                style={{
                  width: '100%', height: '100%',
                  top: 0, left: 0,
                  opacity: 0.22,
                  filter: 'grayscale(15%)',
                  maskImage: 'radial-gradient(ellipse 55% 80% at 8% 50%, black 0%, black 25%, transparent 75%)',
                  WebkitMaskImage: 'radial-gradient(ellipse 55% 80% at 8% 50%, black 0%, black 25%, transparent 75%)',
                }}
              />
              {/* 우측 — gaming LED setup */}
              <img
                src="https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=1200&q=60&auto=format"
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute object-cover"
                style={{
                  width: '100%', height: '100%',
                  top: 0, left: 0,
                  opacity: 0.18,
                  filter: 'grayscale(15%)',
                  maskImage: 'radial-gradient(ellipse 55% 80% at 92% 50%, black 0%, black 25%, transparent 75%)',
                  WebkitMaskImage: 'radial-gradient(ellipse 55% 80% at 92% 50%, black 0%, black 25%, transparent 75%)',
                }}
              />
            </div>
          )}

          {/* Nav strip */}
          <motion.nav
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative flex items-center justify-between py-5 mb-4"
            style={{ zIndex: 1 }}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                {theme === 'dark' && <div className="absolute inset-0 bg-emerald-500/25 rounded-lg blur-md" />}
                <img src="/favicon.svg" alt="PGM" referrerPolicy="no-referrer" className="relative w-8 h-8" />
              </div>
              <div className="hidden sm:block">
                <div className="text-[11px] font-mono font-bold text-emerald-500 uppercase tracking-[0.2em]">Pro Gear Match</div>
                <div className={`text-[9px] font-mono uppercase tracking-widest ${theme === 'dark' ? 'text-[#444]' : 'text-[#9ca3af]'}`}>Find Your Pro Twin</div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-end">
              <div className={`flex items-center gap-0.5 p-1 rounded-xl ${theme === 'dark' ? 'bg-white/[0.04] border border-white/[0.06]' : 'bg-black/[0.04] border border-black/[0.06]'}`}>
                <button
                  onClick={toggleLanguage}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all ${theme === 'dark' ? 'hover:bg-white/10 text-[#555] hover:text-white' : 'hover:bg-black/10 text-[#4b5563] hover:text-black'}`}
                  title={t.toggleLanguage}
                >
                  <Languages size={12} /> {lang.toUpperCase()}
                </button>
              </div>

              <button
                onClick={() => fetchProList()}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${theme === 'dark' ? 'bg-white/[0.04] border border-white/[0.08] text-[#777] hover:border-emerald-500/40 hover:text-emerald-400' : 'bg-white border border-[#e5e7eb] text-[#374151] hover:border-emerald-500 hover:text-emerald-600'}`}
              >
                <Users size={13} /> {t.proList}
              </button>

              {user?.email === ADMIN_EMAIL && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                >
                  <Zap size={13} /> {t.addPro}
                </button>
              )}

              {user && (
                <button
                  onClick={handleLogout}
                  className={`p-2 rounded-xl transition-all ${theme === 'dark' ? 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20' : 'bg-red-50 border border-red-100 text-red-500 hover:bg-red-100'}`}
                  title={user.email || ''}
                >
                  <LogOut size={13} />
                </button>
              )}
            </div>
          </motion.nav>

          {/* Hero content */}
          <div className="relative text-center py-6 md:py-14" style={{ zIndex: 1 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.08, duration: 0.4 }}
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-mono uppercase tracking-[0.25em] mb-8 ${theme === 'dark' ? 'bg-emerald-500/8 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              Live Pro Database
              {totalProCount > 0 && (
                <span className={`ml-1 ${theme === 'dark' ? 'text-emerald-600' : 'text-emerald-400'}`}>· {totalProCount >= 100 ? Math.floor(totalProCount / 100) * 100 + '+' : totalProCount} players</span>
              )}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14, type: 'spring', stiffness: 70, damping: 18 }}
              className="font-black tracking-tighter uppercase leading-[0.88] mb-5 select-none"
            >
              <span className={`block text-[3rem] sm:text-[4rem] md:text-[5rem] lg:text-[5.5rem] ${theme === 'dark' ? 'bg-gradient-to-b from-white to-emerald-200/80 bg-clip-text text-transparent' : 'text-[#0f172a]'}`}>
                PRO GEAR
              </span>
              <span className="block text-[3rem] sm:text-[4rem] md:text-[5rem] lg:text-[5.5rem] bg-gradient-to-b from-emerald-300 to-emerald-500 bg-clip-text text-transparent">
                MATCH
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`text-sm md:text-base tracking-wide mb-10 ${theme === 'dark' ? 'text-[#888]' : 'text-[#6b7280]'}`}
            >
              {t.subtitle}
            </motion.p>

          </div>
        </section>

        {/* Excel Status Card */}
        <AnimatePresence>
          {excelStatus && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className={`${theme === 'dark' ? 'bg-[#0c0c0e] border-[#1e1e22]' : 'bg-white border-[#e5e7eb]'} border rounded-2xl p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-sm font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'} flex items-center gap-2`}>
                    <FileSpreadsheet size={16} /> {t.excelStatus}
                  </h3>
                  <button onClick={() => setExcelStatus(null)} className={`${theme === 'dark' ? 'text-[#555]' : 'text-[#6b7280]'} hover:text-emerald-500`}>
                    <X size={14} />
                  </button>
                </div>
                
                {excelStatus.loading ? (
                  <div className={`flex items-center gap-3 ${theme === 'dark' ? 'text-[#888]' : 'text-[#4b5563]'} font-mono text-xs`}>
                    <Loader2 size={14} className="animate-spin" /> {t.excelChecking}
                  </div>
                ) : excelStatus.error ? (
                  <div className="flex items-center gap-3 text-red-400 font-mono text-xs">
                    <AlertCircle size={14} /> {excelStatus.error}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className={`flex items-center gap-3 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'} font-mono text-xs`}>
                      <CheckCircle2 size={14} /> {t.excelSuccess}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div className={`p-3 rounded-xl border ${excelStatus.proFound ? (theme === 'dark' ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-400' : 'bg-emerald-600/5 border-emerald-600/30 text-emerald-600') : (theme === 'dark' ? 'bg-[#0a0a0a] border-[#333] text-[#555]' : 'bg-white border-[#d1d5db] text-[#6b7280]')}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] uppercase tracking-widest">Players</span>
                          <Users size={12} />
                        </div>
                        <p className="text-xs font-bold">{excelStatus.proFound ? t.excelProFound : t.excelNoProFound}</p>
                      </div>
                      <div className={`p-3 rounded-xl border ${excelStatus.photoFound ? (theme === 'dark' ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-400' : 'bg-emerald-600/5 border-emerald-600/30 text-emerald-600') : (theme === 'dark' ? 'bg-[#0a0a0a] border-[#333] text-[#555]' : 'bg-white border-[#d1d5db] text-[#6b7280]')}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] uppercase tracking-widest">Photos</span>
                          <Monitor size={12} />
                        </div>
                        <p className="text-xs font-bold">{excelStatus.photoFound ? t.excelPhotoFound : t.excelNoPhotoFound}</p>
                      </div>
                    </div>
                    {excelStatus.success && (
                      <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-[#333]' : 'border-[#e5e7eb]'}`}>
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
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`relative ${theme === 'dark' ? 'bg-[#0c0c0e] border-[#1e1e22]' : 'bg-white border-[#e5e7eb]'} border rounded-3xl p-6 md:p-8 shadow-2xl max-w-3xl mx-auto w-full overflow-hidden`}
          >
            {theme === 'dark' && <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent pointer-events-none" />}
            <form id="match-form" onSubmit={handleMatch} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <span className={`text-xs font-mono ${theme === 'dark' ? 'text-[#888]' : 'text-[#4b5563]'} uppercase tracking-wider mb-3 block`}>{t.selectGame}</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {GAMES.map(game => {
                      const colors = GAME_COLORS[game.name];
                      const isActive = settings.game === game.name;
                      const gameGlow: Record<string, string> = {
                        'Valorant': '#f43f5e',
                        'CS2': '#f97316',
                        'Overwatch 2': '#38bdf8',
                        'Apex Legends': '#ef4444',
                      };
                      const glow = gameGlow[game.name] || '#10b981';
                      return (
                        <motion.button
                          key={game.name}
                          type="button"
                          onClick={() => setSettings({ ...settings, game: game.name })}
                          style={{ width: '100%', height: '90px', ...(isActive ? { boxShadow: `0 0 0 1.5px ${glow}` } : {}) }}
                          className={`relative group rounded-2xl border transition-all duration-300 ${
                            isActive
                              ? `${colors.bg} border-transparent ${colors.text}`
                              : (theme === 'dark'
                                ? 'bg-[#0a0a0c] border-[#1e1e22] text-[#3a3a3a] hover:border-[#2e2e36] hover:text-[#666] hover:bg-[#0e0e12]'
                                : 'bg-[#f9fafb] border-[#e5e7eb] text-[#c4c9d4] hover:border-[#cbd5e1] hover:text-[#94a3b8] hover:bg-white')
                          }`}
                          whileHover={{ scale: 1.05, y: -3 }}
                          whileTap={{ scale: 0.96 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        >
                          {/* 게임 로고 이미지 — 세로 중앙 고정 */}
                          <div className="absolute inset-0 flex items-center justify-center" style={{ top: '6px', bottom: '22px' }}>
                            <img
                              src={game.logo}
                              alt={game.name}
                              className={`object-contain transition-all duration-300 ${game.name === 'CS2' ? 'w-14 h-14' : 'w-8 h-8'} ${isActive ? 'opacity-100' :'opacity-25 grayscale group-hover:opacity-60 group-hover:grayscale-[40%]'}`}
                            />
                          </div>
                          {/* 게임명 — 하단 고정 */}
                          <span className={`absolute bottom-2 left-0 right-0 text-[9px] font-bold uppercase tracking-widest text-center leading-tight transition-all duration-300 px-1 ${isActive ? 'opacity-100' : 'opacity-50'}`}>
                            {game.name}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Game Statistics Section */}
                {gameStats && (
                  <ScrollFade delay={0.1}>
                  <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-[#0a0a0a] border-[#333]' : 'bg-white border-[#e5e7eb]'} space-y-4`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'} uppercase tracking-widest font-bold`}>{t.gameStats}</span>
                      <div className="flex items-center gap-1 text-[10px] font-mono text-[#888] uppercase">
                        <Users size={10} /> {proList.length} Pros
                      </div>
                    </div>
                    
                    {gameStats.avgEdpi > 0 && (
                      <div className="space-y-1 flex flex-col items-center">
                        <div className={`text-[10px] font-mono ${theme === 'dark' ? 'text-[#555]' : 'text-[#888]'} flex items-center gap-1`}>
                          <span className={theme === 'dark' ? 'text-[#aaa]' : 'text-[#374151]'}>평균 EDPI</span>
                          <span>=</span>
                          <span>DPI</span>
                          <span>×</span>
                          <span>인게임 감도</span>
                        </div>
                        <div className={`text-sm font-mono flex items-center gap-1.5`}>
                          <span className={`font-black ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{gameStats.avgEdpi}</span>
                          <span className={theme === 'dark' ? 'text-[#444]' : 'text-[#d1d5db]'}>=</span>
                          <span className={theme === 'dark' ? 'text-[#666]' : 'text-[#9ca3af]'}>{gameStats.avgDpi}</span>
                          <span className={theme === 'dark' ? 'text-[#444]' : 'text-[#d1d5db]'}>×</span>
                          <span className={theme === 'dark' ? 'text-[#666]' : 'text-[#9ca3af]'}>{gameStats.avgSens}</span>
                        </div>
                      </div>
                    )}

                    <div className={`pt-3 border-t ${theme === 'dark' ? 'border-[#333]' : 'border-[#f3f4f6]'} space-y-2`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] ${theme === 'dark' ? 'text-[#555]' : 'text-[#888]'} uppercase font-mono block`}>{t.mostUsed}</span>
                        <span className="text-[8px] font-mono text-emerald-500/50 uppercase tracking-tighter">Click to apply</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                        <div 
                          onClick={() => setSettings({ ...settings, mouse: gameStats.mostUsedMouse })}
                          className="flex items-center gap-2 text-[10px] font-mono cursor-pointer hover:text-emerald-400 transition-colors group"
                          title="Click to apply to your settings"
                        >
                          <Mouse size={12} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                          <span className={`truncate ${theme === 'dark' ? 'text-[#aaa]' : 'text-[#4b5563]'}`}>{gameStats.mostUsedMouse}</span>
                        </div>
                        <div 
                          onClick={() => setSettings({ ...settings, keyboard: gameStats.mostUsedKeyboard })}
                          className="flex items-center gap-2 text-[10px] font-mono cursor-pointer hover:text-emerald-400 transition-colors group"
                          title="Click to apply to your settings"
                        >
                          <Keyboard size={12} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                          <span className={`truncate ${theme === 'dark' ? 'text-[#aaa]' : 'text-[#4b5563]'}`}>{gameStats.mostUsedKeyboard}</span>
                        </div>
                        <div 
                          onClick={() => setSettings({ ...settings, monitor: gameStats.mostUsedMonitor })}
                          className="flex items-center gap-2 text-[10px] font-mono cursor-pointer hover:text-emerald-400 transition-colors group"
                          title="Click to apply to your settings"
                        >
                          <Monitor size={12} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                          <span className={`truncate ${theme === 'dark' ? 'text-[#aaa]' : 'text-[#4b5563]'}`}>{gameStats.mostUsedMonitor}</span>
                        </div>
                        <div 
                          onClick={() => setSettings({ ...settings, mousepad: gameStats.mostUsedMousepad })}
                          className="flex items-center gap-2 text-[10px] font-mono cursor-pointer hover:text-emerald-400 transition-colors group"
                          title="Click to apply to your settings"
                        >
                          <Layers size={12} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                          <span className={`truncate ${theme === 'dark' ? 'text-[#aaa]' : 'text-[#4b5563]'}`}>{gameStats.mostUsedMousepad}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  </ScrollFade>
                )}

                <ScrollFade delay={0.1}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputGroup
                    label={t.mouse} 
                    icon={<Mouse size={18} />} 
                    value={settings.mouse}
                    placeholder="e.g. G Pro X Superlight"
                    hint={t.enterGear}
                    listId="mice-list"
                    options={PRO_MICE}
                    theme={theme}
                    category="mouse"
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
                    theme={theme}
                    category="keyboard"
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
                    theme={theme}
                    category="monitor"
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
                    theme={theme}
                    category="mousepad"
                    onChange={(val) => setSettings({ ...settings, mousepad: val })}
                  />
                </div>
                </ScrollFade>

                <ScrollFade delay={0.15}>
                <div className={`grid grid-cols-2 gap-4 pt-4 border-t ${theme === 'dark' ? 'border-[#333]' : 'border-[#e5e7eb]'}`}>
                  <label className="block">
                    <span className={`text-xs font-mono ${theme === 'dark' ? 'text-[#888]' : 'text-[#4b5563]'} uppercase tracking-wider mb-2 block`}>{t.dpi}</span>
                    <input 
                      type="number"
                      step="100"
                      value={settings.dpi}
                      onChange={(e) => setSettings({ ...settings, dpi: Number(e.target.value) })}
                      className={`w-full ${theme === 'dark' ? 'bg-[#0a0a0a] border-[#333]' : 'bg-white border-[#d1d5db]'} border rounded-lg px-4 py-2 focus:outline-none ${theme === 'dark' ? 'focus:border-[#555]' : 'focus:border-[#9ca3af]'}`}
                    />
                  </label>
                  <label className="block">
                    <span className={`text-xs font-mono ${theme === 'dark' ? 'text-[#888]' : 'text-[#4b5563]'} uppercase tracking-wider mb-2 block`}>{t.sensitivity}</span>
                    <input
                      type="number"
                      step="0.1"
                      value={settings.sensitivity}
                      onChange={(e) => setSettings({ ...settings, sensitivity: Number(e.target.value) })}
                      className={`w-full ${theme === 'dark' ? 'bg-[#0a0a0a] border-[#333]' : 'bg-white border-[#d1d5db]'} border rounded-lg px-4 py-2 focus:outline-none ${theme === 'dark' ? 'focus:border-[#555]' : 'focus:border-[#9ca3af]'}`}
                    />
                  </label>
                </div>
                <div className="mt-2 flex justify-end items-center gap-2 px-1">
                  <span className={`text-[10px] font-mono ${theme === 'dark' ? 'text-[#555]' : 'text-[#9ca3af]'} uppercase tracking-widest`}>eDPI</span>
                  <span className="text-sm font-bold text-emerald-500 font-mono">{(settings.dpi * settings.sensitivity).toFixed(1)}</span>
                </div>
                </ScrollFade>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                className={`w-full relative overflow-hidden font-black py-4 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 uppercase tracking-widest text-sm ${
                  loading
                    ? (theme === 'dark' ? 'bg-[#141416] text-[#333] cursor-not-allowed' : 'bg-[#f3f4f6] text-[#9ca3af] cursor-not-allowed')
                    : 'bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-black shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40'
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                {!loading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                )}
                {loading ? (
                  <><Loader2 className="animate-spin" size={17} /> Matching...</>
                ) : (
                  <>
                    <Target size={17} />
                    {t.findMatch}
                  </>
                )}
              </motion.button>
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
            className={`fixed inset-0 z-[60] ${theme === 'dark' ? 'bg-[#0a0a0a] text-[#e0e0e0]' : 'bg-[#f0f2f5] text-[#1a1a1a]'} overflow-y-auto p-4 md:p-8`}
          >
            <div className="max-w-6xl mx-auto">
              <button 
                onClick={() => { setMatches(null); setHighlights([]); setSelectedMatchIdx(0); }}
                className={`mb-8 flex items-center gap-2 ${theme === 'dark' ? 'text-[#888] bg-[#151619] border-[#333]' : 'text-[#4b5563] bg-white border-[#d1d5db]'} hover:text-emerald-400 transition-colors font-mono text-sm uppercase tracking-widest px-4 py-2 rounded-lg border`}
              >
                <ArrowLeft size={18} /> {t.back}
              </button>

              {/* Carousel dot indicators (mobile) */}
              {matches.length > 1 && (
                <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
                  {matches.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setSlideDir(idx > selectedMatchIdx ? 1 : -1); setSelectedMatchIdx(idx); }}
                      className={`rounded-full transition-all ${selectedMatchIdx === idx ? 'w-6 h-2 bg-emerald-500' : 'w-2 h-2 bg-[#333]'}`}
                    />
                  ))}
                </div>
              )}

              <div className="flex flex-row items-center justify-center gap-4 lg:gap-6 w-full">

                {/* Left side card — 이전 매칭 (순환) */}
                {matches.length > 1 && (() => {
                  const prevIdx = (selectedMatchIdx - 1 + matches.length) % matches.length;
                  const m = matches[prevIdx];
                  return (
                    <div className="hidden lg:block w-56 flex-shrink-0">
                      <motion.button
                        key={`left-${prevIdx}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 0.6, x: 0 }}
                        whileHover={{ opacity: 1, scale: 1.03, x: 4 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => { setSlideDir(-1); setSelectedMatchIdx(prevIdx); }}
                        className={`w-full text-left ${theme === 'dark' ? 'bg-[#151619] border-[#1e1e22]' : 'bg-white border-[#e5e7eb]'} border rounded-2xl p-4 space-y-3 cursor-pointer relative`}
                      >
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                          <ChevronLeft size={12} className="text-emerald-400" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-mono ${theme === 'dark' ? 'text-[#555]' : 'text-[#aaa]'} uppercase tracking-widest`}>{prevIdx === 0 ? t.perfectMatch : t.similarMatch}</span>
                          {prevIdx === 0 ? <Trophy size={11} className="text-emerald-500" /> : <Zap size={11} className={theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'} />}
                        </div>
                        <div>
                          <h3 className="font-black uppercase tracking-tighter text-sm flex items-center gap-1.5 min-w-0">
                            <span className="truncate">{m.name}</span>
                            {PLAYER_NATIONALITIES[m.name] && (
                              <img
                                src={`https://flagcdn.com/20x15/${PLAYER_NATIONALITIES[m.name].toLowerCase()}.png`}
                                srcSet={`https://flagcdn.com/40x30/${PLAYER_NATIONALITIES[m.name].toLowerCase()}.png 2x`}
                                width="20" height="15"
                                alt={PLAYER_NATIONALITIES[m.name]}
                                className="inline-block align-middle rounded-sm flex-shrink-0"
                              />
                            )}
                          </h3>
                          <p className={`${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'} font-mono text-[9px] uppercase tracking-widest truncate`}>{m.team}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-[9px] font-mono">
                          {[['DPI', m.settings.dpi], ['eDPI', formatEdpi(m.settings.edpi)], ['SENS', m.settings.sensitivity]].map(([label, val]) => (
                            <div key={String(label)} className={`${theme === 'dark' ? 'bg-[#0a0a0a] border-[#1e1e22]' : 'bg-[#f9fafb] border-[#e5e7eb]'} p-1.5 rounded-lg border`}>
                              <span className={`${theme === 'dark' ? 'text-[#444]' : 'text-[#aaa]'} block uppercase text-[7px]`}>{label}</span>
                              <span className={`${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>{val}</span>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-1">
                          {[
                            { icon: m.gear.mouse ? <Mouse size={9} /> : <Gamepad2 size={9} />, val: m.gear.mouse || m.gear.controller },
                            { icon: <Keyboard size={9} />, val: m.gear.keyboard },
                            { icon: <Monitor size={9} />, val: m.gear.monitor },
                            { icon: <Layers size={9} />, val: m.gear.mousepad },
                          ].filter(g => g.val).slice(0, 3).map((g, gi) => (
                            <div key={gi} className={`flex items-center gap-1.5 text-[9px] ${theme === 'dark' ? 'text-[#444]' : 'text-[#aaa]'} font-mono truncate`}>
                              <span className={theme === 'dark' ? 'text-emerald-500/40' : 'text-emerald-600/50'}>{g.icon}</span>
                              <span className="truncate">{g.val}</span>
                            </div>
                          ))}
                        </div>
                      </motion.button>
                    </div>
                  );
                })()}

                {/* Main Match */}
                <div className="w-full overflow-hidden">
                <AnimatePresence mode="wait" custom={slideDir}>
                <motion.div
                  key={selectedMatchIdx}
                  custom={slideDir}
                  variants={{
                    enter: (dir: number) => ({ x: dir * 60, opacity: 0 }),
                    center: { x: 0, opacity: 1 },
                    exit: (dir: number) => ({ x: dir * -60, opacity: 0 }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className={`w-full ${theme === 'dark' ? 'bg-[#151619] border-emerald-500/30' : 'bg-[#f8f9fa] border-emerald-500/50'} border rounded-3xl overflow-hidden`}
                >
                  <div className={`p-6 flex items-center justify-between ${selectedMatchIdx === 0 ? 'bg-emerald-500' : theme === 'dark' ? 'bg-[#1e2a22]' : 'bg-emerald-100'}`}>
                    <div className={`flex items-center gap-3 ${selectedMatchIdx === 0 ? 'text-black' : theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'}`}>
                      {selectedMatchIdx === 0 ? <Trophy size={24} /> : <Zap size={24} />}
                      <span className="text-xl font-black uppercase tracking-tighter">{selectedMatchIdx === 0 ? t.perfectMatch : (lang === 'ko' ? '비슷한 매칭' : 'Similar Match')}</span>
                    </div>
                    <span className={`font-mono text-sm ${selectedMatchIdx === 0 ? 'text-black/60' : theme === 'dark' ? 'text-emerald-400/60' : 'text-emerald-700/60'}`}>{matches[selectedMatchIdx].game}</span>
                  </div>
                  
                  <div className="p-8 space-y-8">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                      <div className="text-center md:text-left flex-1">
                        <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-4 mb-2">
                          <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none flex items-center gap-3 flex-wrap">
                            {matches[selectedMatchIdx].name}
                            {PLAYER_NATIONALITIES[matches[selectedMatchIdx].name] && (
                              <img
                                src={`https://flagcdn.com/32x24/${PLAYER_NATIONALITIES[matches[selectedMatchIdx].name].toLowerCase()}.png`}
                                srcSet={`https://flagcdn.com/64x48/${PLAYER_NATIONALITIES[matches[selectedMatchIdx].name].toLowerCase()}.png 2x`}
                                width="32" height="24"
                                alt={PLAYER_NATIONALITIES[matches[selectedMatchIdx].name]}
                                className="inline-block align-middle rounded-sm shadow-sm"
                              />
                            )}
                          </h2>
                          <a 
                            href={matches[selectedMatchIdx].profileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className={`inline-flex items-center gap-2 px-3 py-1.5 ${theme === 'dark' ? 'bg-[#0a0a0a] border-[#333] text-[#888]' : 'bg-white border-[#d1d5db] text-[#4b5563]'} border rounded-lg text-[10px] font-mono hover:text-emerald-400 hover:border-emerald-500/50 transition-all uppercase tracking-widest mb-1 md:mb-2`}
                          >
                            {t.viewProfile} <ExternalLink size={10} />
                          </a>
                        </div>
                        <p className={`${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'} font-mono text-xl uppercase tracking-widest mb-4`}>{matches[selectedMatchIdx].team}</p>
                        
                        {matches[selectedMatchIdx].matchReasons && matches[selectedMatchIdx].matchReasons.length > 0 && (
                          <div className={`mt-4 p-4 rounded-xl ${theme === 'dark' ? 'bg-[#0a0a0a] border-[#333]' : 'bg-white border-[#e5e7eb]'} border`}>
                            <p className="text-[10px] font-mono text-[#555] uppercase tracking-widest mb-2 flex items-center gap-2">
                              <Zap size={10} className="text-emerald-500" /> {t.matchPoints}
                            </p>
                            <ul className="space-y-1">
                              {matches[selectedMatchIdx].matchReasons.map((reason, idx) => (
                                <li key={idx} className="text-xs font-sans text-emerald-500 flex items-start gap-2">
                                  <span className="mt-1.5 w-1 h-1 rounded-full bg-emerald-500 flex-shrink-0" />
                                  {reason}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
 
                      <div className="grid grid-cols-3 gap-6">
                        <StatBlock label="DPI" value={matches[selectedMatchIdx].settings.dpi.toString()} theme={theme} />
                        <StatBlock label={t.edpi} value={formatEdpi(matches[selectedMatchIdx].settings.edpi)} theme={theme} />
                        <StatBlock label={t.sensitivity} value={matches[selectedMatchIdx].settings.sensitivity.toString()} theme={theme} />
                      </div>

                      {/* cm/360 comparison — physical mouse travel, grip-independent */}
                      {(() => {
                        const userCm = cmPer360(settings.game, settings.dpi, settings.sensitivity);
                        const proCm = cmPer360(
                          settings.game,
                          matches[selectedMatchIdx].settings.dpi,
                          matches[selectedMatchIdx].settings.sensitivity,
                        );
                        if (!userCm || !proCm) return null;
                        const diff = Math.abs(userCm - proCm);
                        const pct = Math.round((diff / Math.max(userCm, proCm)) * 100);
                        const isClose = pct <= 10;
                        return (
                          <div className={`mt-4 p-4 rounded-xl border ${theme === 'dark' ? 'bg-[#0a0a0a] border-[#1e1e22]' : 'bg-[#f9fafb] border-[#e5e7eb]'}`}>
                            <div className="flex items-center justify-between mb-2">
                              <p className={`text-[10px] font-mono uppercase tracking-widest ${theme === 'dark' ? 'text-[#555]' : 'text-[#888]'}`}>
                                {lang === 'ko' ? '360° 회전 거리 (cm/360)' : 'cm per 360° turn'}
                              </p>
                              <span className={`text-[10px] font-mono font-bold ${isClose ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {isClose
                                  ? (lang === 'ko' ? `${pct}% 차이 · 매우 유사` : `${pct}% apart · very close`)
                                  : (lang === 'ko' ? `${pct}% 차이` : `${pct}% apart`)}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-emerald-50 border border-emerald-200'}`}>
                                <span className={`text-[9px] font-mono uppercase tracking-widest block mb-1 ${theme === 'dark' ? 'text-emerald-300/70' : 'text-emerald-700/70'}`}>
                                  {lang === 'ko' ? '나' : 'You'}
                                </span>
                                <span className={`text-lg font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                  {formatCmPer360(userCm)}
                                </span>
                              </div>
                              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-[#0f1013] border border-[#1e1e22]' : 'bg-white border border-[#d1d5db]'}`}>
                                <span className={`text-[9px] font-mono uppercase tracking-widest block mb-1 ${theme === 'dark' ? 'text-[#555]' : 'text-[#888]'}`}>
                                  {matches[selectedMatchIdx].name}
                                </span>
                                <span className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                                  {formatCmPer360(proCm)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                    {/* eDPI Distribution Chart */}
                    <EdpiDistributionChart
                      proList={proList}
                      userEdpi={settings.dpi * settings.sensitivity}
                      proEdpi={matches[selectedMatchIdx].settings.edpi}
                      proName={matches[selectedMatchIdx].name}
                      game={settings.game}
                      theme={theme}
                      lang={lang}
                    />


                    {/* Pro Gear Showcase */}
                    {(() => {
                      const proGear = matches[selectedMatchIdx].gear;
                      const gearItems = [
                        { key: 'mouse', label: lang === 'ko' ? '마우스' : 'Mouse', name: proGear.mouse || proGear.controller || '', icon: 'mouse' },
                        { key: 'keyboard', label: lang === 'ko' ? '키보드' : 'Keyboard', name: proGear.keyboard || '', icon: 'keyboard' },
                        { key: 'monitor', label: lang === 'ko' ? '모니터' : 'Monitor', name: proGear.monitor || '', icon: 'monitor' },
                        { key: 'mousepad', label: lang === 'ko' ? '마우스패드' : 'Mousepad', name: proGear.mousepad || '', icon: 'mousepad' },
                      ].filter(g => g.name);
                      if (gearItems.length === 0) return null;
                      return (
                        <div className={`pt-8 border-t ${theme === 'dark' ? 'border-[#333]' : 'border-[#e5e7eb]'}`}>
                          <p className={`text-[10px] font-mono ${theme === 'dark' ? 'text-[#555]' : 'text-[#888]'} uppercase tracking-widest mb-4 flex items-center gap-2`}>
                            <ShoppingCart size={12} className="text-emerald-500" />
                            {lang === 'ko' ? `${matches[selectedMatchIdx].name}의 사용 장비` : `${matches[selectedMatchIdx].name}'s Gear`}
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {gearItems.map(item => {
                              const amazonLink = getAmazonLink(item.name);
                              return (
                                <div key={item.key} className={`flex flex-col rounded-xl overflow-hidden border ${theme === 'dark' ? 'bg-[#0d0d0f] border-[#1e1e22]' : 'bg-white border-[#e5e7eb]'}`}>
                                  {/* Image area — 서버에서 아마존 og:image 스크랩 */}
                                  <GearImage
                                    productName={item.name}
                                    icon={item.icon as 'mouse' | 'keyboard' | 'monitor' | 'mousepad'}
                                    theme={theme}
                                  />
                                  {/* Info area */}
                                  <div className="p-2.5 flex flex-col gap-2 flex-1">
                                    <span className={`text-[8px] font-mono uppercase tracking-widest ${theme === 'dark' ? 'text-emerald-500/70' : 'text-emerald-600/70'}`}>{item.label}</span>
                                    <span className={`text-[11px] font-semibold leading-tight ${theme === 'dark' ? 'text-[#ddd]' : 'text-[#222]'}`}>{item.name}</span>
                                    {amazonLink ? (
                                      <a
                                        href={amazonLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`mt-auto flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${theme === 'dark' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20' : 'bg-amber-50 border border-amber-200 text-amber-600 hover:bg-amber-100'}`}
                                      >
                                        <ShoppingCart size={10} /> {lang === 'ko' ? '아마존 구매' : 'Buy on Amazon'}
                                      </a>
                                    ) : (
                                      <a
                                        href={`https://www.amazon.com/s?k=${encodeURIComponent(item.name)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`mt-auto flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${theme === 'dark' ? 'bg-[#1a1a1a] border border-[#333] text-[#555] hover:text-[#777]' : 'bg-[#f9f9f9] border border-[#e5e7eb] text-[#aaa] hover:text-[#888]'}`}
                                      >
                                        <ExternalLink size={10} /> {lang === 'ko' ? '검색' : 'Search'}
                                      </a>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}

                    {loadingHighlights && (
                      <div className={`pt-8 border-t ${theme === 'dark' ? 'border-[#333]' : 'border-[#e5e7eb]'} flex flex-col items-center justify-center py-8`}>
                        <Loader2 size={24} className="text-emerald-500 animate-spin mb-2" />
                        <p className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest animate-pulse">하이라이트 불러오는 중...</p>
                      </div>
                    )}

                    {highlights.length > 0 && (
                      <div className={`pt-8 border-t ${theme === 'dark' ? 'border-[#333]' : 'border-[#e5e7eb]'}`}>
                        <p className={`text-[10px] font-mono ${theme === 'dark' ? 'text-[#555]' : 'text-[#888]'} uppercase tracking-widest mb-4 flex items-center gap-2`}>
                          <Play size={12} className="text-emerald-500" /> 추천 하이라이트
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {highlights.map((vid, idx) => (
                            <a 
                              key={idx}
                              href={`https://www.youtube.com/watch?v=${vid.youtubeId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group block space-y-2"
                            >
                              <div className="relative aspect-video rounded-xl overflow-hidden border border-transparent group-hover:border-emerald-500/50 transition-all">
                                <img
                                  src={`https://img.youtube.com/vi/${vid.youtubeId}/mqdefault.jpg`}
                                  alt={vid.title}
                                  loading="lazy"
                                  decoding="async"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors flex items-center justify-center">
                                  <div className="w-8 h-8 bg-emerald-500 text-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                                    <Play size={16} fill="currentColor" />
                                  </div>
                                </div>
                              </div>
                              <p className={`text-[10px] font-medium leading-tight line-clamp-2 ${theme === 'dark' ? 'text-[#aaa]' : 'text-[#4b5563]'} group-hover:text-emerald-500 transition-colors`}>
                                {vid.title}
                              </p>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className={`pt-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-mono ${theme === 'dark' ? 'text-[#555]' : 'text-[#6b7280]'} uppercase tracking-widest border-t ${theme === 'dark' ? 'border-[#333]' : 'border-[#e5e7eb]'}`}>
                      <a
                        href={`https://www.youtube.com/results?search_query=${matches[selectedMatchIdx].name}+${matches[selectedMatchIdx].game}+highlights`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-500 hover:text-emerald-400 flex items-center gap-2 transition-colors px-6 py-3 border border-emerald-500/20 rounded-xl bg-emerald-500/5"
                      >
                        <Play size={14} fill="currentColor" /> 하이라이트 영상 보기
                      </a>
                    </div>

                    {/* Comments */}
                    <CommentSection
                      proId={matches[selectedMatchIdx].id || matches[selectedMatchIdx].name}
                      theme={theme}
                      t={t}
                      isAdmin={user?.email === ADMIN_EMAIL}
                    />
                  </div>
                </motion.div>
                </AnimatePresence>
                </div>

                {/* Right side card — 다음 매칭 (순환) */}
                {matches.length > 1 && (() => {
                  const nextIdx = (selectedMatchIdx + 1) % matches.length;
                  const m = matches[nextIdx];
                  return (
                    <div className="hidden lg:block w-56 flex-shrink-0">
                      <motion.button
                        key={`right-${nextIdx}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 0.6, x: 0 }}
                        whileHover={{ opacity: 1, scale: 1.03, x: -4 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => { setSlideDir(1); setSelectedMatchIdx(nextIdx); }}
                        className={`w-full text-left ${theme === 'dark' ? 'bg-[#151619] border-[#1e1e22]' : 'bg-white border-[#e5e7eb]'} border rounded-2xl p-4 space-y-3 cursor-pointer relative`}
                      >
                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                          <ChevronRight size={12} className="text-emerald-400" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-mono ${theme === 'dark' ? 'text-[#555]' : 'text-[#aaa]'} uppercase tracking-widest`}>{nextIdx === 0 ? t.perfectMatch : t.similarMatch}</span>
                          {nextIdx === 0 ? <Trophy size={11} className="text-emerald-500" /> : <Zap size={11} className={theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'} />}
                        </div>
                        <div>
                          <h3 className="font-black uppercase tracking-tighter text-sm flex items-center gap-1.5 min-w-0">
                            <span className="truncate">{m.name}</span>
                            {PLAYER_NATIONALITIES[m.name] && (
                              <img
                                src={`https://flagcdn.com/20x15/${PLAYER_NATIONALITIES[m.name].toLowerCase()}.png`}
                                srcSet={`https://flagcdn.com/40x30/${PLAYER_NATIONALITIES[m.name].toLowerCase()}.png 2x`}
                                width="20" height="15"
                                alt={PLAYER_NATIONALITIES[m.name]}
                                className="inline-block align-middle rounded-sm flex-shrink-0"
                              />
                            )}
                          </h3>
                          <p className={`${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'} font-mono text-[9px] uppercase tracking-widest truncate`}>{m.team}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-[9px] font-mono">
                          {[['DPI', m.settings.dpi], ['eDPI', formatEdpi(m.settings.edpi)], ['SENS', m.settings.sensitivity]].map(([label, val]) => (
                            <div key={String(label)} className={`${theme === 'dark' ? 'bg-[#0a0a0a] border-[#1e1e22]' : 'bg-[#f9fafb] border-[#e5e7eb]'} p-1.5 rounded-lg border`}>
                              <span className={`${theme === 'dark' ? 'text-[#444]' : 'text-[#aaa]'} block uppercase text-[7px]`}>{label}</span>
                              <span className={`${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>{val}</span>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-1">
                          {[
                            { icon: m.gear.mouse ? <Mouse size={9} /> : <Gamepad2 size={9} />, val: m.gear.mouse || m.gear.controller },
                            { icon: <Keyboard size={9} />, val: m.gear.keyboard },
                            { icon: <Monitor size={9} />, val: m.gear.monitor },
                            { icon: <Layers size={9} />, val: m.gear.mousepad },
                          ].filter(g => g.val).slice(0, 3).map((g, gi) => (
                            <div key={gi} className={`flex items-center gap-1.5 text-[9px] ${theme === 'dark' ? 'text-[#444]' : 'text-[#aaa]'} font-mono truncate`}>
                              <span className={theme === 'dark' ? 'text-emerald-500/40' : 'text-emerald-600/50'}>{g.icon}</span>
                              <span className="truncate">{g.val}</span>
                            </div>
                          ))}
                        </div>
                      </motion.button>
                    </div>
                  );
                })()}

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
            role="dialog"
            aria-modal="true"
            className={`fixed inset-0 z-[70] ${theme === 'dark' ? 'bg-black/90' : 'bg-white/90'} backdrop-blur-md flex flex-col items-center justify-center text-center p-8`}
          >
            {/* 로고 스핀 애니메이션 */}
            <style>{`
              @keyframes pgm-spin {
                from { transform: rotate(0deg); }
                to   { transform: rotate(360deg); }
              }
              @keyframes pgm-ring-pulse {
                0%, 100% { opacity: 0.3; transform: scale(1); }
                50%       { opacity: 0.7; transform: scale(1.06); }
              }
            `}</style>

            <div className="relative flex items-center justify-center mb-10" style={{ width: 140, height: 140 }}>
              {/* 배경 글로우 */}
              <div className="absolute inset-0 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)' }} />

              {/* 외부 펄스 링 */}
              <div className="absolute rounded-full border border-emerald-500/30"
                style={{ width: 130, height: 130, animation: 'pgm-ring-pulse 2s ease-in-out infinite' }} />

              {/* 중간 링 */}
              <div className="absolute rounded-full border border-dashed border-emerald-500/15"
                style={{ width: 108, height: 108 }} />

              {/* 로고 스핀 */}
              <img
                src="/favicon.svg"
                alt="PGM"
                style={{
                  width: 72,
                  height: 72,
                  animation: 'pgm-spin 1.8s linear infinite',
                }}
              />
            </div>

            <p className="text-emerald-500 font-mono text-sm animate-pulse uppercase tracking-[0.3em]">{t.scanning}</p>
            
            {bulkProgress && (
              <div className="mt-8 w-full max-w-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest">
                    {t.processingBulk}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-500">
                    [{bulkProgress.current}/{bulkProgress.total}]
                  </span>
                </div>
                <div className={`h-1.5 w-full rounded-full ${theme === 'dark' ? 'bg-emerald-500/10' : 'bg-emerald-600/10'} overflow-hidden`}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                    className="h-full bg-emerald-500"
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm font-mono max-w-2xl mx-auto">
          {error}
        </div>
      )}

      {/* ── Top Pro Gear Section ── */}
      {allProList.length > 0 && (() => {
        const getTopGear = (field: 'mouse' | 'keyboard' | 'monitor' | 'mousepad', n = 5) => {
          const counts: Record<string, number> = {};
          allProList.forEach(p => {
            const val = field === 'mouse'
              ? (p.gear.mouse || p.gear.controller || '')
              : (p.gear[field] || '');
            const trimmed = val.trim();
            if (trimmed) counts[trimmed] = (counts[trimmed] || 0) + 1;
          });
          return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, n)
            .map(([name, count], i) => ({ name, count, rank: i + 1 }));
        };

        const categories: { key: 'mouse' | 'keyboard' | 'monitor' | 'mousepad'; label: string; icon: React.ReactNode }[] = [
          { key: 'mouse',    label: lang === 'ko' ? '마우스'    : 'Mouse',     icon: <Mouse    size={14} /> },
          { key: 'keyboard', label: lang === 'ko' ? '키보드'    : 'Keyboard',  icon: <Keyboard size={14} /> },
          { key: 'monitor',  label: lang === 'ko' ? '모니터'    : 'Monitor',   icon: <Monitor  size={14} /> },
          { key: 'mousepad', label: lang === 'ko' ? '마우스패드' : 'Mousepad',  icon: <Layers   size={14} /> },
        ];

        const goGear = (key: string, dir: 1 | -1, len: number) => {
          setTopGearDir(prev => ({ ...prev, [key]: dir }));
          setTopGearIdx(prev => {
            const next = (prev[key] ?? 0) + dir;
            return { ...prev, [key]: Math.max(0, Math.min(len - 1, next)) };
          });
        };

        return (
          <div className="max-w-5xl mx-auto mt-16 px-4">
            <div className="mb-6 flex items-center gap-3">
              <Trophy size={20} className="text-emerald-500" />
              <h2 className={`text-2xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-[#111]'}`}>
                {lang === 'ko' ? '프로게이머 TOP 5 장비' : 'Pro Gamer Top 5 Gear'}
              </h2>
              <span className={`text-[10px] font-mono ${theme === 'dark' ? 'text-[#444]' : 'text-[#aaa]'} uppercase tracking-widest ml-1`}>
                {lang === 'ko' ? `전 게임 ${allProList.length}명 기준` : `all games · ${allProList.length} pros`}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map(cat => {
                const items = getTopGear(cat.key);
                const idx = topGearIdx[cat.key] ?? 0;
                const dir = topGearDir[cat.key] ?? 1;
                const item = items[idx];
                if (!item) return null;
                const amazonLink = getAmazonLink(item.name);
                return (
                  <div key={cat.key} className={`flex flex-col rounded-2xl border overflow-hidden ${theme === 'dark' ? 'bg-[#0c0c0e] border-[#1e1e22]' : 'bg-white border-[#e5e7eb]'}`}>

                    {/* Category header */}
                    <div className={`flex items-center justify-between px-3 py-2 border-b ${theme === 'dark' ? 'border-[#1e1e22] bg-[#111]' : 'border-[#f0f0f0] bg-[#fafafa]'}`}>
                      <span className={`flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        {cat.icon}{cat.label}
                      </span>
                      {/* dot indicators */}
                      <div className="flex items-center gap-1">
                        {items.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => { setTopGearDir(prev => ({ ...prev, [cat.key]: (i > idx ? 1 : -1) as 1 | -1 })); setTopGearIdx(prev => ({ ...prev, [cat.key]: i })); }}
                            className={`rounded-full transition-all ${i === idx ? 'w-3.5 h-1.5 bg-emerald-500' : `w-1.5 h-1.5 ${theme === 'dark' ? 'bg-[#333]' : 'bg-[#ddd]'}`}`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Up button */}
                    <button
                      onClick={() => goGear(cat.key, -1, items.length)}
                      disabled={idx === 0}
                      className={`flex items-center justify-center py-1 transition-colors border-b ${theme === 'dark' ? 'border-[#1a1a1a]' : 'border-[#f0f0f0]'} ${idx === 0 ? 'opacity-20 cursor-not-allowed' : theme === 'dark' ? 'hover:bg-[#151515] text-[#555]' : 'hover:bg-[#f5f5f5] text-[#bbb]'}`}
                    >
                      <ChevronUp size={14} />
                    </button>

                    {/* Rank badge + image + info — 세로 슬라이드 */}
                    <div className="overflow-hidden">
                      <AnimatePresence mode="wait" custom={dir}>
                        <motion.div
                          key={`${cat.key}-${idx}`}
                          custom={dir}
                          variants={{
                            enter: (d: number) => ({ y: d * 40, opacity: 0 }),
                            center: { y: 0, opacity: 1 },
                            exit: (d: number) => ({ y: d * -40, opacity: 0 }),
                          }}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
                        >
                          {/* Image with rank badge */}
                          <div className="relative">
                            <div className={`absolute top-2 left-2 z-10 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-lg
                              ${idx === 0 ? 'bg-amber-400 text-black' : idx === 1 ? 'bg-[#c0c0c0] text-black' : idx === 2 ? 'bg-amber-700 text-white' : theme === 'dark' ? 'bg-[#222] text-[#777]' : 'bg-[#e5e7eb] text-[#888]'}`}>
                              {item.rank}
                            </div>
                            <GearImage productName={item.name} icon={cat.key} theme={theme} />
                          </div>

                          {/* Info */}
                          <div className="p-3 flex flex-col gap-2">
                            <div>
                              <p className={`text-[11px] font-bold leading-tight ${theme === 'dark' ? 'text-[#ddd]' : 'text-[#222]'}`}>{item.name}</p>
                              <p className={`text-[9px] font-mono mt-0.5 ${theme === 'dark' ? 'text-[#444]' : 'text-[#bbb]'}`}>
                                {lang === 'ko' ? `${item.count}명 사용` : `${item.count} pros`}
                              </p>
                            </div>
                            {amazonLink ? (
                              <a href={amazonLink} target="_blank" rel="noopener noreferrer"
                                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${theme === 'dark' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20' : 'bg-amber-50 border border-amber-200 text-amber-600 hover:bg-amber-100'}`}>
                                <ShoppingCart size={10} /> {lang === 'ko' ? '아마존' : 'Amazon'}
                              </a>
                            ) : (
                              <a href={`https://www.amazon.com/s?k=${encodeURIComponent(item.name)}`} target="_blank" rel="noopener noreferrer"
                                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${theme === 'dark' ? 'bg-[#1a1a1a] border border-[#333] text-[#555] hover:text-[#777]' : 'bg-[#f9f9f9] border border-[#e5e7eb] text-[#aaa] hover:text-[#888]'}`}>
                                <ExternalLink size={10} /> {lang === 'ko' ? '검색' : 'Search'}
                              </a>
                            )}
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* Down button */}
                    <button
                      onClick={() => goGear(cat.key, 1, items.length)}
                      disabled={idx >= items.length - 1}
                      className={`flex items-center justify-center py-1 transition-colors border-t mt-auto ${theme === 'dark' ? 'border-[#1a1a1a]' : 'border-[#f0f0f0]'} ${idx >= items.length - 1 ? 'opacity-20 cursor-not-allowed' : theme === 'dark' ? 'hover:bg-[#151515] text-[#555]' : 'hover:bg-[#f5f5f5] text-[#bbb]'}`}
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Main page comment section — hidden */}

      {/* ── Info Tabs (How / eDPI / About) ── */}
      <div className="max-w-5xl mx-auto mt-20 pb-20 px-4">
        <div className={`rounded-2xl border overflow-hidden ${theme === 'dark' ? 'bg-[#0c0c0e] border-[#1e1e22]' : 'bg-white border-[#e5e7eb]'}`}>
          {/* Tab buttons */}
          <div className={`flex border-b ${theme === 'dark' ? 'border-[#1e1e22]' : 'border-[#e5e7eb]'}`}>
            {([
              { id: 'how' as const, icon: <Target size={16} />, label: lang === 'ko' ? '작동 방식' : 'How It Works' },
              { id: 'edpi' as const, icon: <Zap size={16} />, label: lang === 'ko' ? 'eDPI란?' : 'What is eDPI?' },
              { id: 'about' as const, icon: <Shield size={16} />, label: lang === 'ko' ? '소개' : 'About' },
            ]).map(tab => {
              const active = infoTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setInfoTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 text-sm font-semibold transition-colors ${
                    active
                      ? (theme === 'dark' ? 'text-emerald-400 bg-emerald-500/5 border-b-2 border-emerald-500' : 'text-emerald-600 bg-emerald-50 border-b-2 border-emerald-500')
                      : (theme === 'dark' ? 'text-[#666] hover:text-[#aaa] border-b-2 border-transparent' : 'text-[#6b7280] hover:text-[#111] border-b-2 border-transparent')
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div className="p-6 md:p-8">
            {infoTab === 'how' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { step: '01', icon: <Keyboard size={20} />, title: lang === 'ko' ? '장비 & 감도 입력' : 'Enter Your Setup', body: lang === 'ko' ? 'DPI, 인게임 감도, 마우스·키보드·모니터·마우스패드를 입력하세요. 일부 항목을 몰라도 DPI와 감도만으로 매칭 가능합니다.' : 'Enter your DPI, in-game sensitivity, and gear. Even with just DPI and sensitivity, we can find your match.' },
                  { step: '02', icon: <Target size={20} />, title: lang === 'ko' ? 'eDPI 기반 매칭' : 'eDPI Matching', body: lang === 'ko' ? 'eDPI(DPI × 감도)를 기준으로 전체 프로 DB와 비교합니다. 동일 장비 사용 여부도 매칭 점수에 반영됩니다.' : 'We calculate your eDPI (DPI × Sensitivity) and compare it against our full pro database, factoring in gear overlap.' },
                  { step: '03', icon: <Trophy size={20} />, title: lang === 'ko' ? '프로 트윈 확인' : 'Meet Your Pro Twin', body: lang === 'ko' ? '가장 가까운 프로와 eDPI 분포 상 위치, 사용 장비 및 아마존 구매 링크를 확인하세요.' : "See your closest pro match, your position in the eDPI distribution, gear comparison, and Amazon links." },
                ].map((s, i) => (
                  <div key={i} className="relative">
                    <span className={`absolute -top-1 right-0 text-4xl font-black ${theme === 'dark' ? 'text-[#15171a]' : 'text-[#f0f0f0]'} select-none`}>{s.step}</span>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>{s.icon}</div>
                    <h3 className={`font-bold tracking-tight text-base mb-2 ${theme === 'dark' ? 'text-white' : 'text-[#111]'}`}>{s.title}</h3>
                    <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-[#888]' : 'text-[#6b7280]'}`}>{s.body}</p>
                  </div>
                ))}
              </div>
            )}

            {infoTab === 'edpi' && (
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-[#aaa]' : 'text-[#4b5563]'}`}>
                    {lang === 'ko'
                      ? 'eDPI(Effective DPI, 유효 DPI)는 마우스 DPI와 인게임 감도를 곱한 값으로, 서로 다른 설정을 동일한 기준으로 비교할 수 있게 해주는 지표입니다.'
                      : 'eDPI (Effective DPI) is calculated by multiplying your mouse DPI by your in-game sensitivity. It allows fair comparison of setups across different hardware configurations.'}
                  </p>
                  <div className={`p-4 rounded-xl font-mono text-center ${theme === 'dark' ? 'bg-[#111] border border-[#1e1e22]' : 'bg-[#f9fafb] border border-[#e5e7eb]'}`}>
                    <span className={`text-lg font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>eDPI = DPI × Sensitivity</span>
                  </div>
                  <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-[#666]' : 'text-[#6b7280]'}`}>
                    {lang === 'ko'
                      ? '예) DPI 800 × 감도 0.35 = eDPI 280 (Valorant 상위권 프로 평균대)'
                      : 'Example: DPI 800 × Sensitivity 0.35 = eDPI 280 (around the top-end pro average in Valorant)'}
                  </p>
                </div>
                <div className="space-y-2">
                  {[
                    { game: 'Valorant', range: '200 – 400' },
                    { game: 'CS2',      range: '600 – 1000' },
                    { game: 'Overwatch 2', range: '1200 – 2400' },
                    { game: 'Apex Legends', range: '800 – 1600' },
                  ].map(g => (
                    <div key={g.game} className={`flex items-center justify-between py-3 px-4 rounded-lg ${theme === 'dark' ? 'bg-[#111]' : 'bg-[#f9fafb]'}`}>
                      <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-[#ddd]' : 'text-[#111]'}`}>{g.game}</span>
                      <span className={`text-xs font-mono font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>{lang === 'ko' ? `평균 eDPI ${g.range}` : `Avg eDPI ${g.range}`}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {infoTab === 'about' && (
              <div>
                <div className="grid md:grid-cols-3 gap-3 mb-6">
                  {[
                    { val: totalProCount > 0 ? String(totalProCount) : '—', label: lang === 'ko' ? '프로 선수 DB' : 'Pro Players' },
                    { val: '4',    label: lang === 'ko' ? '지원 게임'    : 'Games Covered' },
                    { val: '100%', label: lang === 'ko' ? '무료 서비스'  : 'Free to Use' },
                  ].map(s => (
                    <div key={s.val} className={`p-4 rounded-xl text-center ${theme === 'dark' ? 'bg-[#111]' : 'bg-[#f9fafb]'}`}>
                      <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>{s.val}</p>
                      <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-[#888]' : 'text-[#6b7280]'}`}>{s.label}</p>
                    </div>
                  ))}
                </div>
                <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-[#aaa]' : 'text-[#4b5563]'}`}>
                  {lang === 'ko'
                    ? `Pro Gear Match는 e스포츠 팬과 FPS 게이머를 위한 무료 매칭 도구입니다. Valorant, CS2, Overwatch 2, Apex Legends 4개 게임의 프로 선수 ${totalProCount > 0 ? `${totalProCount}명` : '수백 명'}의 감도·장비 데이터를 분석해, 당신과 가장 설정이 비슷한 프로를 찾아드립니다. 데이터는 ProSettings.net, Liquipedia 등 공개 검증된 출처에서 수집되며 정기적으로 업데이트됩니다.`
                    : `Pro Gear Match is a free matching tool for esports fans and FPS gamers. We analyze sensitivity and gear data from ${totalProCount > 0 ? totalProCount : 'hundreds of'} professional players across Valorant, CS2, Overwatch 2, and Apex Legends to find the pro whose setup most closely matches yours. Data is sourced from publicly verified sources including ProSettings.net and Liquipedia, and is regularly updated.`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ad Section */}
      <div className="max-w-4xl mx-auto px-4">
        <GoogleAd />
      </div>

      {/* Footer */}
      <footer className={`border-t ${theme === 'dark' ? 'border-[#333] bg-[#0a0a0a]' : 'border-[#d1d5db] bg-[#f8f9fa]'} py-12 px-4`}>
        {/* Amazon Associates Disclosure */}
        <div className={`max-w-4xl mx-auto mb-8 px-4 py-3 rounded-lg text-center text-[11px] ${theme === 'dark' ? 'bg-[#111] text-[#666] border border-[#1e1e22]' : 'bg-[#f0fdf4] text-[#6b7280] border border-[#d1fae5]'}`}>
          <span className={`${theme === 'dark' ? 'text-emerald-500' : 'text-emerald-600'} font-semibold`}>Amazon Associates</span>
          {' '}— {t.affiliateDisclosure}
        </div>
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h3 className={`text-xl font-black ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'} tracking-tighter uppercase mb-2`}>Pro Gear Match</h3>
            <p className={`${theme === 'dark' ? 'text-[#555]' : 'text-[#6b7280]'} text-xs font-mono uppercase tracking-widest`}>{t.footerRights}</p>
          </div>
          <div className={`flex flex-wrap justify-center gap-6 text-[10px] font-mono ${theme === 'dark' ? 'text-[#888]' : 'text-[#4b5563]'} uppercase tracking-widest`}>
            <button onClick={() => navigate('how-it-works')} className={`hover:${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'} transition-colors`}>{lang === 'ko' ? '작동 방식' : 'How It Works'}</button>
            <button onClick={() => navigate('about')} className={`hover:${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'} transition-colors`}>{lang === 'ko' ? '소개' : 'About'}</button>
            <button onClick={() => navigate('privacy')} className={`hover:${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'} transition-colors`}>{t.privacyPolicy}</button>
            <button onClick={() => navigate('terms')} className={`hover:${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'} transition-colors`}>{t.termsOfService}</button>
            <button onClick={() => navigate('affiliate')} className={`hover:${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'} transition-colors`}>{lang === 'ko' ? '제휴 공시' : 'Affiliate'}</button>
            <a href="mailto:wjsrkdgns123a@gmail.com?subject=ProGear%20Match%20Feedback" className={`hover:${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'} transition-colors`}>{lang === 'ko' ? '문의' : 'Contact'}</a>
            {user ? (
              <button onClick={handleLogout} className="flex items-center gap-1 text-red-500 hover:text-red-400 transition-colors">
                <LogOut size={10} /> {t.logout}
              </button>
            ) : (
              <button onClick={handleLogin} className={`flex items-center gap-1 hover:${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'} transition-colors`}>
                <LogIn size={10} /> {t.login}
              </button>
            )}
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
              className={`${theme === 'dark' ? 'bg-[#151619] border-[#333]' : 'bg-[#f8f9fa] border-[#d1d5db]'} border w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl`}
            >
              <div className={`p-6 border-b ${theme === 'dark' ? 'border-[#333]' : 'border-[#e5e7eb]'} flex items-center justify-between`}>
                <h2 className={`text-xl font-black ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'} uppercase tracking-tighter`}>
                  {activePolicy === 'privacy' ? t.privacyPolicy : activePolicy === 'terms' ? t.termsOfService : t.contactUs}
                </h2>
                <button 
                  onClick={() => setActivePolicy(null)}
                  className={`p-2 ${theme === 'dark' ? 'hover:bg-[#333]' : 'hover:bg-[#e5e7eb]'} rounded-full transition-colors`}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-8">
                <p className={`${theme === 'dark' ? 'text-[#aaa]' : 'text-[#4b5563]'} leading-relaxed text-sm whitespace-pre-wrap`}>
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

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] w-full max-w-md px-4"
          >
            <div className={`p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 ${notification.type === 'success' ? 'bg-emerald-500 text-black' : 'bg-red-500 text-white'}`}>
              <div className="flex items-center gap-3">
                {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                <p className="text-xs font-bold uppercase tracking-wider">{notification.message}</p>
              </div>
              <button onClick={() => setNotification(null)} className="p-1 hover:bg-black/10 rounded-full transition-colors">
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Revert Links Confirm Modal */}
      <AnimatePresence>
        {showRevertConfirm && (
          <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`${theme === 'dark' ? 'bg-[#151619] border-[#333]' : 'bg-white border-[#d1d5db]'} border p-8 rounded-3xl max-w-md w-full shadow-2xl text-center`}
            >
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <RefreshCcw size={32} />
              </div>
              <h2 className={`text-2xl font-black uppercase tracking-tighter mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                링크 복구 확인
              </h2>
              <p className={`text-sm mb-8 leading-relaxed ${theme === 'dark' ? 'text-[#888]' : 'text-[#4b5563]'}`}>
                Overwatch 2 선수들의 Liquipedia 링크를 다시 ProSettings 링크로 복구하시겠습니까?
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowRevertConfirm(false)}
                  className={`py-3 border ${theme === 'dark' ? 'border-[#333] text-[#888]' : 'border-[#d1d5db] text-[#4b5563]'} rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-white/5 transition-all`}
                >
                  취소
                </button>
                <button 
                  onClick={executeRevertLinks}
                  className="py-3 bg-red-500 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-red-400 transition-all"
                >
                  복구 실행
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Strip Colors Confirm Modal */}
      <AnimatePresence>
        {showStripColorsConfirm && (
          <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`${theme === 'dark' ? 'bg-[#151619] border-[#333]' : 'bg-white border-[#d1d5db]'} border p-8 rounded-3xl max-w-md w-full shadow-2xl text-center`}
            >
              <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Wand2 size={32} />
              </div>
              <h2 className={`text-2xl font-black uppercase tracking-tighter mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                색깔 단어 일괄 제거
              </h2>
              <p className={`text-sm mb-2 leading-relaxed ${theme === 'dark' ? 'text-[#888]' : 'text-[#4b5563]'}`}>
                모든 프로게이머의 장비명에서 색상 관련 단어를 제거합니다.
              </p>
              <p className={`text-xs mb-8 font-mono ${theme === 'dark' ? 'text-[#555]' : 'text-[#9ca3af]'}`}>
                black · white · red · blue · green · pink · silver · gray ...
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setShowStripColorsConfirm(false)}
                  className={`py-3 border ${theme === 'dark' ? 'border-[#333] text-[#888]' : 'border-[#d1d5db] text-[#4b5563]'} rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-white/5 transition-all`}
                >
                  취소
                </button>
                <button
                  onClick={executeStripColors}
                  className="py-3 bg-amber-500 text-black rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-amber-400 transition-all"
                >
                  실행
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fix Links Confirm Modal */}
      <AnimatePresence>
        {showFixLinksConfirm && (
          <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`${theme === 'dark' ? 'bg-[#151619] border-[#333]' : 'bg-white border-[#d1d5db]'} border p-8 rounded-3xl max-w-md w-full shadow-2xl text-center`}
            >
              <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <ExternalLink size={32} />
              </div>
              <h2 className={`text-2xl font-black uppercase tracking-tighter mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                링크 자동 수정 확인
              </h2>
              <p className={`text-sm mb-8 leading-relaxed ${theme === 'dark' ? 'text-[#888]' : 'text-[#4b5563]'}`}>
                Overwatch 2 선수들의 잘못된 링크(ProSettings 등)를 Liquipedia 링크로 일괄 수정하시겠습니까?
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowFixLinksConfirm(false)}
                  className={`py-3 border ${theme === 'dark' ? 'border-[#333] text-[#888]' : 'border-[#d1d5db] text-[#4b5563]'} rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-white/5 transition-all`}
                >
                  취소
                </button>
                <button 
                  onClick={executeFixLinks}
                  className="py-3 bg-blue-500 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-blue-400 transition-all"
                >
                  수정 실행
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Migration Confirm Modal */}
      <AnimatePresence>
        {showMigrateConfirm && (
          <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`${theme === 'dark' ? 'bg-[#151619] border-[#333]' : 'bg-white border-[#d1d5db]'} border p-8 rounded-3xl max-w-md w-full shadow-2xl text-center`}
            >
              <div className="w-16 h-16 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sword size={32} />
              </div>
              <h2 className={`text-2xl font-black uppercase tracking-tighter mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                데이터 이전 확인
              </h2>
              <p className={`text-sm mb-8 leading-relaxed ${theme === 'dark' ? 'text-[#888]' : 'text-[#4b5563]'}`}>
                오늘 추가된 모든 Valorant 및 CS2 선수 데이터를 Apex Legends 목록으로 옮기시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowMigrateConfirm(false)}
                  className={`py-3 border ${theme === 'dark' ? 'border-[#333] text-[#888]' : 'border-[#d1d5db] text-[#4b5563]'} rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-white/5 transition-all`}
                >
                  취소
                </button>
                <button 
                  onClick={executeMigration}
                  className="py-3 bg-orange-500 text-black rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-orange-400 transition-all"
                >
                  이전 실행
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pro List Modal */}
      <AnimatePresence>
        {showList && (
          <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`${theme === 'dark' ? 'bg-[#151619] border-[#333]' : 'bg-white border-[#d1d5db]'} border rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl`}
            >
              {/* Modal Header */}
              <div className={`p-6 border-b ${theme === 'dark' ? 'border-[#333] bg-[#1a1b1e]' : 'border-[#e5e7eb] bg-[#f3f4f6]'} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
                <div className="flex items-center gap-4">
                  <div className={`p-2 ${theme === 'dark' ? 'bg-emerald-500/10' : 'bg-emerald-600/10'} rounded-lg`}>
                    <Users className={`${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`} size={24} />
                  </div>
                  <div>
                    <h3 className={`text-xl font-black uppercase tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{t.proList}</h3>
                    <p className={`text-[10px] font-mono ${theme === 'dark' ? 'text-[#888]' : 'text-[#4b5563]'} uppercase tracking-widest`}>{settings.game} Athletes</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {user?.email === ADMIN_EMAIL && (
                    <button 
                      onClick={handleSeedDatabase}
                      className={`flex items-center gap-2 px-3 py-2 ${theme === 'dark' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20' : 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100'} border rounded-lg text-[10px] font-mono uppercase tracking-widest transition-all`}
                      title={t.seedData}
                    >
                      <Shield size={12} /> {t.seedData}
                    </button>
                  )}
                  {user?.email === ADMIN_EMAIL && (
                    <button 
                      onClick={() => setShowBulkAuditModal(true)}
                      className={`flex items-center gap-2 px-3 py-2 ${theme === 'dark' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20' : 'bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-100'} border rounded-lg text-[10px] font-mono uppercase tracking-widest transition-all`}
                      title={t.bulkAudit}
                    >
                      <Target size={12} /> {t.bulkAudit}
                    </button>
                  )}
                  {user?.email === ADMIN_EMAIL && (
                    <button
                      onClick={handleCleanAllNames}
                      className={`flex items-center gap-2 px-3 py-2 ${theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' : 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100'} border rounded-lg text-[10px] font-mono uppercase tracking-widest transition-all`}
                      title="Clean all names (remove full names)"
                    >
                      <Wand2 size={12} /> Clean All
                    </button>
                  )}
                  {user?.email === ADMIN_EMAIL && (
                    <button
                      onClick={() => setShowStripColorsConfirm(true)}
                      className={`flex items-center gap-2 px-3 py-2 ${theme === 'dark' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20' : 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100'} border rounded-lg text-[10px] font-mono uppercase tracking-widest transition-all`}
                      title="장비명에서 색깔 단어 일괄 제거"
                    >
                      <Wand2 size={12} /> Strip Colors
                    </button>
                  )}
                  {/* 오늘 추가된 선수 패널 토글 - admin only */}
                  {user?.email === ADMIN_EMAIL && (
                    <button
                      onClick={() => setShowTodayPanel(v => !v)}
                      className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-[10px] font-mono uppercase tracking-widest transition-all whitespace-nowrap ${
                        showTodayPanel
                          ? 'bg-blue-500 border-blue-500 text-black font-bold'
                          : theme === 'dark'
                            ? 'bg-[#0a0a0a] border-[#333] text-[#888] hover:text-blue-400 hover:border-blue-500/50'
                            : 'bg-white border-[#d1d5db] text-[#6b7280] hover:text-blue-600 hover:border-blue-400'
                      }`}
                      title="오늘 추가된 선수 패널 토글"
                    >
                      <span>📋</span>
                      Panel
                    </button>
                  )}
                  {/* 오늘 추가된 선수만 보기 토글 */}
                  <button
                    onClick={() => setShowTodayOnly(v => !v)}
                    className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-[10px] font-mono uppercase tracking-widest transition-all whitespace-nowrap ${
                      showTodayOnly
                        ? 'bg-emerald-500 border-emerald-500 text-black font-bold'
                        : theme === 'dark'
                          ? 'bg-[#0a0a0a] border-[#333] text-[#888] hover:text-emerald-400 hover:border-emerald-500/50'
                          : 'bg-white border-[#d1d5db] text-[#6b7280] hover:text-emerald-600 hover:border-emerald-400'
                    }`}
                    title="오늘 추가된 선수만 보기"
                  >
                    <span>🆕</span>
                    Today
                    {todayCount > 0 && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${showTodayOnly ? 'bg-black/20 text-black' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        {todayCount}
                      </span>
                    )}
                  </button>

                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-[#555]' : 'text-[#6b7280]'} `} size={14} />
                    <input
                      type="text"
                      placeholder={lang === 'ko' ? '선수, 팀, 장비 검색...' : 'Search players, teams, gear...'}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full md:w-56 ${theme === 'dark' ? 'bg-[#0a0a0a] border-[#333]' : 'bg-white border-[#d1d5db]'} border rounded-lg pl-10 pr-4 py-2 text-xs font-mono focus:outline-none ${theme === 'dark' ? 'focus:border-emerald-500' : 'focus:border-emerald-600'} transition-all`}
                    />
                  </div>

                  {/* Nationality filter dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowNationalityDropdown(v => !v)}
                      className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-[10px] font-mono uppercase tracking-widest transition-all whitespace-nowrap ${
                        nationalityFilter
                          ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                          : theme === 'dark'
                            ? 'bg-[#0a0a0a] border-[#333] text-[#888] hover:text-emerald-400 hover:border-emerald-500/50'
                            : 'bg-white border-[#d1d5db] text-[#6b7280] hover:text-emerald-600 hover:border-emerald-400'
                      }`}
                      title={lang === 'ko' ? '국적 필터' : 'Filter by nationality'}
                    >
                      {nationalityFilter ? (
                        <>
                          <img
                            src={`https://flagcdn.com/20x15/${nationalityFilter.toLowerCase()}.png`}
                            srcSet={`https://flagcdn.com/40x30/${nationalityFilter.toLowerCase()}.png 2x`}
                            alt={nationalityFilter}
                            className="w-5 h-[15px] object-cover rounded-sm"
                          />
                          <span>{nationalityFilter}</span>
                          <span
                            role="button"
                            onClick={(e) => { e.stopPropagation(); setNationalityFilter(''); }}
                            className="ml-1 hover:text-red-400 cursor-pointer"
                          >
                            <X size={12} />
                          </span>
                        </>
                      ) : (
                        <>
                          <Flag size={12} />
                          <span>{lang === 'ko' ? '모든 국가' : 'All Countries'}</span>
                          <ChevronDown size={12} />
                        </>
                      )}
                    </button>
                    {showNationalityDropdown && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowNationalityDropdown(false)}
                        />
                        <div
                          className={`absolute right-0 mt-2 w-64 max-h-80 overflow-y-auto rounded-lg border shadow-xl z-50 ${
                            theme === 'dark' ? 'bg-[#0c0c0e] border-[#1e1e22]' : 'bg-white border-[#e5e7eb]'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => { setNationalityFilter(''); setShowNationalityDropdown(false); }}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-mono uppercase tracking-wider transition-colors ${
                              !nationalityFilter
                                ? (theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600')
                                : (theme === 'dark' ? 'text-[#888] hover:bg-white/5 hover:text-white' : 'text-[#6b7280] hover:bg-black/5 hover:text-black')
                            }`}
                          >
                            <Flag size={12} />
                            <span>{lang === 'ko' ? '모든 국가' : 'All Countries'}</span>
                            <span className="ml-auto opacity-60">{proList.length}</span>
                          </button>
                          {availableNationalities.map(code => {
                            const count = proList.filter(p => p.nationality?.toUpperCase() === code.toUpperCase()).length;
                            const enName = regionNamesEn?.of(code.toUpperCase()) ?? code;
                            const koName = regionNamesKo?.of(code.toUpperCase()) ?? code;
                            const displayName = lang === 'ko' ? koName : enName;
                            return (
                              <button
                                key={code}
                                type="button"
                                onClick={() => { setNationalityFilter(code); setShowNationalityDropdown(false); }}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                                  nationalityFilter === code
                                    ? (theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600')
                                    : (theme === 'dark' ? 'text-[#aaa] hover:bg-white/5 hover:text-white' : 'text-[#374151] hover:bg-black/5 hover:text-black')
                                }`}
                              >
                                <img
                                  src={`https://flagcdn.com/20x15/${code.toLowerCase()}.png`}
                                  srcSet={`https://flagcdn.com/40x30/${code.toLowerCase()}.png 2x`}
                                  alt={code}
                                  className="w-5 h-[15px] object-cover rounded-sm flex-shrink-0"
                                />
                                <span className="truncate">{displayName}</span>
                                <span className="ml-auto opacity-60 font-mono">{count}</span>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                  <button 
                    onClick={() => fetchProList(true)} 
                    className={`p-2 ${theme === 'dark' ? 'bg-[#0a0a0a] border-[#333] text-[#888] hover:text-emerald-400' : 'bg-white border-[#d1d5db] text-[#4b5563] hover:text-emerald-600'} border rounded-lg transition-all`}
                    title={t.refresh}
                    disabled={listLoading}
                  >
                    <RefreshCcw size={18} className={listLoading ? 'animate-spin' : ''} />
                  </button>
                  <button 
                    onClick={() => setShowList(false)} 
                    className={`p-2 ${theme === 'dark' ? 'bg-[#0a0a0a] border-[#333] text-[#888] hover:text-white' : 'bg-white border-[#d1d5db] text-[#4b5563] hover:text-black'} border rounded-lg transition-all`}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              
              {/* Today's Added Players - Admin Only */}
              {user?.email === ADMIN_EMAIL && showTodayPanel && (() => {
                const today = new Date().toISOString().split('T')[0];
                const todayPros = proList.filter(p => p.updatedAt?.startsWith(today));
                if (todayPros.length === 0) return null;
                return (
                  <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-[#333] bg-[#12131a]' : 'border-[#e5e7eb] bg-[#eef2ff]'}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      <span className={`text-[10px] font-mono uppercase tracking-widest font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'}`}>
                        오늘 추가된 선수 ({todayPros.length}명)
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {todayPros.map((pro: ProGamer) => (
                        <React.Fragment key={pro.id || pro.name}>
                          <TodayProCard
                            pro={pro}
                            theme={theme}
                            currentGame={settings.game}
                            onMove={async (targetGame) => {
                              try {
                                await deleteProGamer(pro);
                                await syncProGamerToDb({ ...pro, game: targetGame, updatedAt: new Date().toISOString() });
                                const list = await getProGamerList(settings.game);
                                setProList([...list].sort((a, b) => a.team.localeCompare(b.team)));
                              } catch (err) {
                                console.error('Move failed:', err);
                                alert('이동 실패: ' + (err instanceof Error ? err.message : String(err)));
                              }
                            }}
                          />
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Modal Body - Table */}
              <div className={`flex-1 overflow-auto ${theme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-[#f8f9fa]'}`}>
                {listLoading ? (
                  <div className="h-64 flex flex-col items-center justify-center gap-4">
                    <Loader2 size={48} className="text-emerald-500 animate-spin" />
                    <p className={`font-mono text-sm ${theme === 'dark' ? 'text-[#888]' : 'text-[#4b5563]'} animate-pulse uppercase tracking-widest`}>{t.fetching}</p>
                  </div>
                ) : (
                  <div className="min-w-[1000px]">
                    <table className="w-full text-left border-collapse">
                      <thead className={`sticky top-0 z-10 ${theme === 'dark' ? 'bg-[#151619] border-[#333]' : 'bg-[#f3f4f6] border-[#e5e7eb]'} border-b`}>
                        <tr className={`text-[10px] font-mono ${theme === 'dark' ? 'text-[#555]' : 'text-[#6b7280]'} uppercase tracking-widest`}>
                          <th className={`p-4 cursor-pointer hover:${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`} onClick={() => handleSort('name')}>Player {sortConfig?.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                          <th className={`p-4 cursor-pointer hover:${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`} onClick={() => handleSort('team')}>Team {sortConfig?.key === 'team' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                          <th className={`p-4 cursor-pointer hover:${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`} onClick={() => handleSort('gear.mouse')}>Mouse</th>
                          <th className={`p-4 cursor-pointer hover:${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`} onClick={() => handleSort('gear.keyboard')}>Keyboard</th>
                          <th className={`p-4 cursor-pointer hover:${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`} onClick={() => handleSort('gear.monitor')}>Monitor</th>
                          <th className={`p-4 cursor-pointer hover:${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`} onClick={() => handleSort('settings.edpi')}>eDPI</th>
                          <th className="p-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${theme === 'dark' ? 'divide-[#1a1b1e]' : 'divide-[#e5e7eb]'}`}>
                        {sortedProList.map((pro) => (
                          <tr key={pro.id || pro.name} className={`group ${theme === 'dark' ? 'hover:bg-[#151619]' : 'hover:bg-[#f3f4f6]'} transition-colors`}>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                {(() => { const code = pro.nationality || PLAYER_NATIONALITIES[pro.name]; return code ? (
                                  <img
                                    src={`https://flagcdn.com/20x15/${code.toLowerCase()}.png`}
                                    srcSet={`https://flagcdn.com/40x30/${code.toLowerCase()}.png 2x`}
                                    width="20" height="15"
                                    alt={code}
                                    className="rounded-sm flex-shrink-0"
                                  />
                                ) : null; })()}
                                <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-black'} group-hover:text-emerald-500 transition-colors`}>{pro.name}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`text-xs font-mono ${theme === 'dark' ? 'text-[#888]' : 'text-[#4b5563]'} uppercase`}>{pro.team}</span>
                            </td>
                            <td className="p-4">
                              <span className={`text-xs ${theme === 'dark' ? 'text-[#aaa]' : 'text-[#444]'} group-hover:text-emerald-500 transition-colors`}>
                                {pro.gear.mouse || pro.gear.controller || '-'}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`text-xs ${theme === 'dark' ? 'text-[#aaa]' : 'text-[#444]'} group-hover:text-emerald-500 transition-colors`}>{pro.gear.keyboard}</span>
                            </td>
                            <td className="p-4">
                              <span className={`text-xs ${theme === 'dark' ? 'text-[#aaa]' : 'text-[#444]'} group-hover:text-emerald-500 transition-colors`}>{pro.gear.monitor}</span>
                            </td>
                            <td className="p-4">
                              <span className={`text-xs font-mono ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>{formatEdpi(pro.settings.edpi)}</span>
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <a
                                  href={pro.profileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`inline-flex p-2 ${theme === 'dark' ? 'bg-[#151619] border-[#333] text-[#555]' : 'bg-white border-[#d1d5db] text-[#6b7280]'} rounded-lg hover:text-emerald-400 hover:border-emerald-500/50 border transition-all`}
                                  title={t.viewProfile}
                                >
                                  <ExternalLink size={14} />
                                </a>
                                  {user?.email === ADMIN_EMAIL && (
                                    <div className="flex items-center gap-1">
                                      <input 
                                        type="text"
                                        placeholder="URL"
                                        value={tempUrls[pro.id || pro.name] ?? pro.profileUrl ?? ''}
                                        onChange={(e) => setTempUrls(prev => ({ ...prev, [pro.id || pro.name]: e.target.value }))}
                                        className={`w-32 text-[10px] font-mono ${theme === 'dark' ? 'bg-[#0a0a0a] border-[#333]' : 'bg-white border-[#d1d5db]'} border rounded px-2 py-1 focus:outline-none focus:border-emerald-500 transition-all`}
                                      />
                                      <button 
                                        onClick={() => {
                                          setEditingPro(pro);
                                          setShowEditModal(true);
                                        }}
                                        className={`p-1.5 ${theme === 'dark' ? 'bg-[#151619] border-[#333] text-[#555]' : 'bg-white border-[#d1d5db] text-[#6b7280]'} rounded hover:text-blue-400 hover:border-blue-500/50 border transition-all`}
                                        title={t.edit}
                                      >
                                        <Pencil size={12} />
                                      </button>
                                      <button 
                                        onClick={() => handleUpdatePro(pro, tempUrls[pro.id || pro.name])}
                                      disabled={updatingProId === (pro.id || pro.name)}
                                      className={`p-1.5 ${theme === 'dark' ? 'bg-[#151619] border-[#333] text-[#555]' : 'bg-white border-[#d1d5db] text-[#6b7280]'} rounded hover:text-emerald-400 hover:border-emerald-500/50 border transition-all disabled:opacity-50`}
                                      title={t.update}
                                    >
                                      <RefreshCcw size={12} className={updatingProId === (pro.id || pro.name) ? 'animate-spin' : ''} />
                                    </button>
                                    <button
                                      onClick={() => handleDeletePro(pro)}
                                      className={`p-1.5 ${theme === 'dark' ? 'bg-[#151619] border-[#333] text-[#555]' : 'bg-white border-[#d1d5db] text-[#6b7280]'} rounded hover:text-red-400 hover:border-red-500/50 border transition-all`}
                                      title="Delete"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                    {/* 국적 편집 */}
                                    {editingNationalityId === (pro.id || pro.name) ? (
                                      <div className="flex items-center gap-1">
                                        <input
                                          type="text"
                                          maxLength={2}
                                          placeholder="KR"
                                          value={tempNationality}
                                          onChange={(e) => setTempNationality(e.target.value.toUpperCase())}
                                          onKeyDown={(e) => { if (e.key === 'Enter') handleSaveNationality(pro, tempNationality); if (e.key === 'Escape') setEditingNationalityId(null); }}
                                          autoFocus
                                          className={`w-10 text-[10px] font-mono text-center uppercase ${theme === 'dark' ? 'bg-[#0a0a0a] border-[#333]' : 'bg-white border-[#d1d5db]'} border rounded px-1 py-1 focus:outline-none focus:border-emerald-500`}
                                        />
                                        <button
                                          onClick={() => handleSaveNationality(pro, tempNationality)}
                                          className={`p-1.5 ${theme === 'dark' ? 'bg-[#151619] border-[#333]' : 'bg-white border-[#d1d5db]'} rounded hover:text-emerald-400 hover:border-emerald-500/50 border text-emerald-500 transition-all text-[10px] font-bold`}
                                          title="저장"
                                        >✓</button>
                                        <button
                                          onClick={() => setEditingNationalityId(null)}
                                          className={`p-1.5 ${theme === 'dark' ? 'bg-[#151619] border-[#333] text-[#555]' : 'bg-white border-[#d1d5db] text-[#6b7280]'} rounded hover:text-red-400 border transition-all text-[10px]`}
                                          title="취소"
                                        >✕</button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => { setEditingNationalityId(pro.id || pro.name); setTempNationality(pro.nationality || PLAYER_NATIONALITIES[pro.name] || ''); }}
                                        className={`p-1.5 ${theme === 'dark' ? 'bg-[#151619] border-[#333] text-[#555]' : 'bg-white border-[#d1d5db] text-[#6b7280]'} rounded hover:text-yellow-400 hover:border-yellow-500/50 border transition-all`}
                                        title="국적 편집"
                                      >🏳️</button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {sortedProList.length === 0 && (
                      <div className="p-20 text-center">
                        <p className={`font-mono text-sm ${theme === 'dark' ? 'text-[#555]' : 'text-[#6b7280]'} uppercase tracking-widest`}>No players found matching your search.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className={`p-4 border-t ${theme === 'dark' ? 'border-[#333] bg-[#1a1b1e]' : 'border-[#e5e7eb] bg-[#f9fafb]'} flex items-center justify-between text-[10px] font-mono ${theme === 'dark' ? 'text-[#555]' : 'text-[#6b7280]'} uppercase tracking-widest`}>
                <span>{t.showingPlayers.replace('{count}', sortedProList.length.toString())}</span>
                <span className="flex items-center gap-2">
                  <Shield size={10} /> {t.verifiedData}
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBulkAuditModal && (
          <Suspense fallback={null}>
          <BulkAuditModal
            theme={theme}
            t={t}
            proList={proList}
            onClose={() => setShowBulkAuditModal(false)}
            onAddPlayer={async (val) => {
              const isUrl = val.startsWith('http');
              const initialPro = {
                name: isUrl ? '' : val,
                team: '',
                game: settings.game,
                profileUrl: isUrl ? val : '',
                imageUrl: '',
                teamLogoUrl: '',
                gear: { mouse: '', keyboard: '', monitor: '', mousepad: '' },
                settings: { dpi: 800, sensitivity: 0.5, edpi: 400 },
                source: 'Manual Entry'
              };
              setNewPro(initialPro);
              setShowBulkAuditModal(false);
              setShowAddModal(true);

              if (isUrl) {
                setFetchingData(true);
                try {
                  const scraped = await scrapeProGamerInfo(val);
                  if (scraped) {
                    setNewPro(prev => ({
                      ...prev,
                      name: scraped.name || prev.name,
                      team: scraped.team || prev.team,
                      game: scraped.game || prev.game,
                      gear: { ...prev.gear, ...scraped.gear },
                      settings: {
                        ...prev.settings,
                        ...scraped.settings,
                        edpi: Number(((scraped.settings?.dpi || prev.settings.dpi) * (scraped.settings?.sensitivity || prev.settings.sensitivity)).toFixed(1))
                      }
                    }));
                  }
                } catch (err) {
                  console.error("Auto-fetch failed:", err);
                } finally {
                  setFetchingData(false);
                }
              }
            }}
            onRefreshList={() => fetchProList(true)}
          />
          </Suspense>
        )}
      </AnimatePresence>

      {/* Edit Pro Modal */}
      <AnimatePresence>
        {showEditModal && editingPro && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`${theme === 'dark' ? 'bg-[#151619] border-[#333]' : 'bg-white border-[#d1d5db]'} border rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-black uppercase tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                  {t.editPro || 'Edit Pro Profile'}
                </h2>
                <button onClick={() => setShowEditModal(false)} className={`${theme === 'dark' ? 'text-[#555]' : 'text-[#6b7280]'} hover:text-emerald-500`}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSaveEditPro} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={`text-[10px] font-mono uppercase tracking-widest ${theme === 'dark' ? 'text-[#888]' : 'text-[#4b5563]'}`}>{t.playerName}</label>
                    <input 
                      required
                      type="text"
                      value={editingPro.name || ''}
                      onChange={(e) => setEditingPro({...editingPro, name: e.target.value})}
                      className={`w-full ${theme === 'dark' ? 'bg-[#0a0a0a] border-[#333]' : 'bg-white border-[#d1d5db]'} border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-emerald-500 transition-all`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={`text-[10px] font-mono uppercase tracking-widest ${theme === 'dark' ? 'text-[#888]' : 'text-[#4b5563]'}`}>{t.teamName}</label>
                    <input 
                      required
                      type="text"
                      value={editingPro.team || ''}
                      onChange={(e) => setEditingPro({...editingPro, team: e.target.value})}
                      className={`w-full ${theme === 'dark' ? 'bg-[#0a0a0a] border-[#333]' : 'bg-white border-[#d1d5db]'} border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-emerald-500 transition-all`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={`text-[10px] font-mono uppercase tracking-widest ${theme === 'dark' ? 'text-[#888]' : 'text-[#4b5563]'}`}>{t.gameName}</label>
                    <select 
                      value={editingPro.game || 'Valorant'}
                      onChange={(e) => setEditingPro({...editingPro, game: e.target.value})}
                      className={`w-full ${theme === 'dark' ? 'bg-[#0a0a0a] border-[#333]' : 'bg-white border-[#d1d5db]'} border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-emerald-500 transition-all`}
                    >
                      {GAMES.map(g => <option key={g.name} value={g.name}>{g.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className={`text-[10px] font-mono uppercase tracking-widest ${theme === 'dark' ? 'text-[#888]' : 'text-[#4b5563]'}`}>{t.profileUrl}</label>
                    <input 
                      type="url"
                      value={editingPro.profileUrl || ''}
                      onChange={(e) => setEditingPro({...editingPro, profileUrl: e.target.value})}
                      className={`w-full ${theme === 'dark' ? 'bg-[#0a0a0a] border-[#333]' : 'bg-white border-[#d1d5db]'} border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-emerald-500 transition-all`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={`text-[10px] font-mono uppercase tracking-widest ${theme === 'dark' ? 'text-[#888]' : 'text-[#4b5563]'}`}>{t.imageUrl}</label>
                    <input 
                      type="url"
                      value={editingPro.imageUrl || ''}
                      onChange={(e) => setEditingPro({...editingPro, imageUrl: e.target.value})}
                      className={`w-full ${theme === 'dark' ? 'bg-[#0a0a0a] border-[#333]' : 'bg-white border-[#d1d5db]'} border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-emerald-500 transition-all`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={`text-[10px] font-mono uppercase tracking-widest ${theme === 'dark' ? 'text-[#888]' : 'text-[#4b5563]'}`}>{t.teamLogoUrl}</label>
                    <input 
                      type="url"
                      value={editingPro.teamLogoUrl || ''}
                      onChange={(e) => setEditingPro({...editingPro, teamLogoUrl: e.target.value})}
                      className={`w-full ${theme === 'dark' ? 'bg-[#0a0a0a] border-[#333]' : 'bg-white border-[#d1d5db]'} border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-emerald-500 transition-all`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#333]">
                  <div className="space-y-2">
                    <label className={`text-[10px] font-mono uppercase tracking-widest ${theme === 'dark' ? 'text-[#888]' : 'text-[#4b5563]'}`}>{t.mouse}</label>
                    <input 
                      type="text"
                      value={editingPro.gear.mouse || ''}
                      onChange={(e) => setEditingPro({...editingPro, gear: {...editingPro.gear, mouse: e.target.value}})}
                      className={`w-full ${theme === 'dark' ? 'bg-[#0a0a0a] border-[#333]' : 'bg-white border-[#d1d5db]'} border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-emerald-500 transition-all`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={`text-[10px] font-mono uppercase tracking-widest ${theme === 'dark' ? 'text-[#888]' : 'text-[#4b5563]'}`}>{t.keyboard}</label>
                    <input 
                      type="text"
                      value={editingPro.gear.keyboard || ''}
                      onChange={(e) => setEditingPro({...editingPro, gear: {...editingPro.gear, keyboard: e.target.value}})}
                      className={`w-full ${theme === 'dark' ? 'bg-[#0a0a0a] border-[#333]' : 'bg-white border-[#d1d5db]'} border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-emerald-500 transition-all`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={`text-[10px] font-mono uppercase tracking-widest ${theme === 'dark' ? 'text-[#888]' : 'text-[#4b5563]'}`}>{t.monitor}</label>
                    <input 
                      type="text"
                      value={editingPro.gear.monitor || ''}
                      onChange={(e) => setEditingPro({...editingPro, gear: {...editingPro.gear, monitor: e.target.value}})}
                      className={`w-full ${theme === 'dark' ? 'bg-[#0a0a0a] border-[#333]' : 'bg-white border-[#d1d5db]'} border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-emerald-500 transition-all`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={`text-[10px] font-mono uppercase tracking-widest ${theme === 'dark' ? 'text-[#888]' : 'text-[#4b5563]'}`}>{t.mousepad}</label>
                    <input 
                      type="text"
                      value={editingPro.gear.mousepad || ''}
                      onChange={(e) => setEditingPro({...editingPro, gear: {...editingPro.gear, mousepad: e.target.value}})}
                      className={`w-full ${theme === 'dark' ? 'bg-[#0a0a0a] border-[#333]' : 'bg-white border-[#d1d5db]'} border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-emerald-500 transition-all`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={`text-[10px] font-mono uppercase tracking-widest ${theme === 'dark' ? 'text-[#888]' : 'text-[#4b5563]'}`}>Controller</label>
                    <input 
                      type="text"
                      value={editingPro.gear.controller || ''}
                      onChange={(e) => setEditingPro({...editingPro, gear: {...editingPro.gear, controller: e.target.value}})}
                      className={`w-full ${theme === 'dark' ? 'bg-[#0a0a0a] border-[#333]' : 'bg-white border-[#d1d5db]'} border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-emerald-500 transition-all`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-[#333]">
                  <div className="space-y-2">
                    <label className={`text-[10px] font-mono uppercase tracking-widest ${theme === 'dark' ? 'text-[#888]' : 'text-[#4b5563]'}`}>{t.dpi}</label>
                    <input 
                      type="number"
                      value={editingPro.settings.dpi || 0}
                      onChange={(e) => {
                        const dpi = Number(e.target.value);
                        const edpi = Number((dpi * editingPro.settings.sensitivity).toFixed(1));
                        setEditingPro({...editingPro, settings: {...editingPro.settings, dpi, edpi}});
                      }}
                      className={`w-full ${theme === 'dark' ? 'bg-[#0a0a0a] border-[#333]' : 'bg-white border-[#d1d5db]'} border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-emerald-500 transition-all`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={`text-[10px] font-mono uppercase tracking-widest ${theme === 'dark' ? 'text-[#888]' : 'text-[#4b5563]'}`}>{t.sensitivity}</label>
                    <input 
                      type="number"
                      step="0.001"
                      value={editingPro.settings.sensitivity || 0}
                      onChange={(e) => {
                        const sensitivity = Number(e.target.value);
                        const edpi = Number((editingPro.settings.dpi * sensitivity).toFixed(1));
                        setEditingPro({...editingPro, settings: {...editingPro.settings, sensitivity, edpi}});
                      }}
                      className={`w-full ${theme === 'dark' ? 'bg-[#0a0a0a] border-[#333]' : 'bg-white border-[#d1d5db]'} border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-emerald-500 transition-all`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={`text-[10px] font-mono uppercase tracking-widest ${theme === 'dark' ? 'text-[#888]' : 'text-[#4b5563]'}`}>{t.edpi}</label>
                    <input 
                      type="number"
                      step="0.1"
                      value={editingPro.settings.edpi || 0}
                      onChange={(e) => {
                        const edpi = Number(e.target.value);
                        const sensitivity = editingPro.settings.dpi > 0 ? Number((edpi / editingPro.settings.dpi).toFixed(4)) : 0;
                        setEditingPro({...editingPro, settings: {...editingPro.settings, edpi, sensitivity}});
                      }}
                      className={`w-full ${theme === 'dark' ? 'bg-[#0a0a0a] border-[#333]' : 'bg-white border-[#d1d5db]'} border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-emerald-500 transition-all`}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button 
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-xs ${theme === 'dark' ? 'bg-[#0a0a0a] text-[#555] hover:text-white' : 'bg-gray-100 text-gray-500 hover:text-black'} transition-all`}
                  >
                    {t.cancel}
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-xs bg-emerald-500 text-black hover:bg-emerald-400 transition-all disabled:opacity-50"
                  >
                    {loading ? t.updating : t.save}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Pro Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`${theme === 'dark' ? 'bg-[#151619] border-[#333]' : 'bg-white border-[#d1d5db]'} border rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-black uppercase tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                  {t.addPro}
                </h2>
                {bulkProgress && (
                  <div className="flex-1 mx-8">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest animate-pulse">
                        {t.processingBulk}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-500">
                        [{bulkProgress.current}/{bulkProgress.total}]
                      </span>
                    </div>
                    <div className={`h-1.5 w-full rounded-full ${theme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-gray-100'} overflow-hidden`}>
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                        className="h-full bg-emerald-500"
                      />
                    </div>
                  </div>
                )}
                <button onClick={() => setShowAddModal(false)} className={`${theme === 'dark' ? 'text-[#555]' : 'text-[#6b7280]'} hover:text-emerald-500`}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSaveNewPro} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={`text-[10px] font-mono uppercase tracking-widest ${theme === 'dark' ? 'text-[#888]' : 'text-[#4b5563]'}`}>{t.playerName}</label>
                    <input 
                      required
                      type="text"
                      value={newPro.name || ''}
                      onChange={(e) => setNewPro({...newPro, name: e.target.value})}
                      className={`w-full ${theme === 'dark' ? 'bg-[#0a0a0a] border-[#333]' : 'bg-white border-[#d1d5db]'} border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-emerald-500 transition-all`}
                      placeholder="e.g. TenZ"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={`text-[10px] font-mono uppercase tracking-widest ${theme === 'dark' ? 'text-[#888]' : 'text-[#4b5563]'}`}>{t.teamName}</label>
                    <input 
                      required
                      type="text"
                      value={newPro.team || ''}
                      onChange={(e) => setNewPro({...newPro, team: e.target.value})}
                      className={`w-full ${theme === 'dark' ? 'bg-[#0a0a0a] border-[#333]' : 'bg-white border-[#d1d5db]'} border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-emerald-500 transition-all`}
                      placeholder="e.g. Sentinels"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={`text-[10px] font-mono uppercase tracking-widest ${theme === 'dark' ? 'text-[#888]' : 'text-[#4b5563]'}`}>{t.gameName}</label>
                    <select 
                      value={newPro.game || 'Valorant'}
                      onChange={(e) => setNewPro({...newPro, game: e.target.value})}
                      className={`w-full ${theme === 'dark' ? 'bg-[#0a0a0a] border-[#333]' : 'bg-white border-[#d1d5db]'} border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-emerald-500 transition-all`}
                    >
                      {GAMES.map(g => <option key={g.name} value={g.name}>{g.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className={`text-[10px] font-mono uppercase tracking-widest ${theme === 'dark' ? 'text-[#888]' : 'text-[#4b5563]'}`}>{t.profileUrl}</label>
                    <div className="flex gap-2">
                      <input 
                        type="url"
                        value={newPro.profileUrl || ''}
                        onChange={(e) => setNewPro({...newPro, profileUrl: e.target.value})}
                        className={`flex-1 ${theme === 'dark' ? 'bg-[#0a0a0a] border-[#333]' : 'bg-white border-[#d1d5db]'} border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-emerald-500 transition-all`}
                        placeholder={t.autoFetchPlaceholder}
                      />
                      <button 
                        type="button"
                        onClick={handleFetchFromUrl}
                        disabled={fetchingData || !newPro.profileUrl}
                        className={`px-4 py-3 ${theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-600/10 border-emerald-600/30 text-emerald-600'} border rounded-xl text-[10px] font-mono uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
                      >
                        {fetchingData ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
                        {fetchingData ? '...' : t.autoFetch}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className={`text-[10px] font-mono uppercase tracking-widest ${theme === 'dark' ? 'text-[#888]' : 'text-[#4b5563]'}`}>{t.imageUrl}</label>
                    <input 
                      type="url"
                      value={newPro.imageUrl || ''}
                      onChange={(e) => setNewPro({...newPro, imageUrl: e.target.value})}
                      className={`w-full ${theme === 'dark' ? 'bg-[#0a0a0a] border-[#333]' : 'bg-white border-[#d1d5db]'} border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-emerald-500 transition-all`}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={`text-[10px] font-mono uppercase tracking-widest ${theme === 'dark' ? 'text-[#888]' : 'text-[#4b5563]'}`}>{t.teamLogoUrl}</label>
                    <input 
                      type="url"
                      value={newPro.teamLogoUrl || ''}
                      onChange={(e) => setNewPro({...newPro, teamLogoUrl: e.target.value})}
                      className={`w-full ${theme === 'dark' ? 'bg-[#0a0a0a] border-[#333]' : 'bg-white border-[#d1d5db]'} border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-emerald-500 transition-all`}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-[#0a0a0a] border-[#333]' : 'bg-[#f8f9fa] border-[#d1d5db]'}`}>
                  <h3 className={`text-xs font-mono uppercase tracking-widest mb-4 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>{t.gearSettings}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputGroup 
                      label={t.mouse} 
                      icon={<Mouse size={18} />} 
                      value={newPro.gear.mouse}
                      placeholder="e.g. G Pro X Superlight"
                      hint={t.enterGear}
                      listId="pro-mice-list"
                      options={PRO_MICE}
                      theme={theme}
                      category="mouse"
                      onChange={(val) => handleGearChange('mouse', val)}
                    />
                    <InputGroup 
                      label={t.keyboard} 
                      icon={<Keyboard size={18} />} 
                      value={newPro.gear.keyboard}
                      placeholder="e.g. Wooting 60HE"
                      hint={t.enterGear}
                      listId="pro-keyboards-list"
                      options={PRO_KEYBOARDS}
                      theme={theme}
                      category="keyboard"
                      onChange={(val) => handleGearChange('keyboard', val)}
                    />
                    <InputGroup 
                      label={t.monitor} 
                      icon={<Monitor size={18} />} 
                      value={newPro.gear.monitor}
                      placeholder="e.g. Zowie XL2566K"
                      hint={t.enterGear}
                      listId="pro-monitors-list"
                      options={PRO_MONITORS}
                      theme={theme}
                      category="monitor"
                      onChange={(val) => handleGearChange('monitor', val)}
                    />
                    <InputGroup 
                      label={t.mousepad} 
                      icon={<Layers size={18} />} 
                      value={newPro.gear.mousepad}
                      placeholder="e.g. Artisan Zero"
                      hint={t.enterGear}
                      listId="pro-mousepads-list"
                      options={PRO_MOUSEPADS}
                      theme={theme}
                      category="mousepad"
                      onChange={(val) => handleGearChange('mousepad', val)}
                    />
                    <InputGroup 
                      label="Controller" 
                      icon={<Gamepad2 size={18} />} 
                      value={newPro.gear.controller || ''}
                      placeholder="e.g. DualSense Edge"
                      hint="Enter controller model"
                      listId="pro-controllers-list"
                      options={[]}
                      theme={theme}
                      category="controller"
                      onChange={(val) => handleGearChange('controller', val)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono uppercase tracking-widest text-[#888]">{t.dpi}</label>
                      <input 
                        type="number"
                        value={newPro.settings.dpi || 0}
                        onChange={(e) => {
                          const dpi = Number(e.target.value);
                          const edpi = Number((dpi * newPro.settings.sensitivity).toFixed(1));
                          setNewPro({...newPro, settings: {...newPro.settings, dpi, edpi}});
                        }}
                        className={`w-full ${theme === 'dark' ? 'bg-[#151619] border-[#333]' : 'bg-white border-[#d1d5db]'} border rounded-xl px-4 py-2 text-xs font-mono focus:outline-none focus:border-emerald-500 transition-all`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono uppercase tracking-widest text-[#888]">{t.sensitivity}</label>
                      <input 
                        type="number"
                        step="0.001"
                        value={newPro.settings.sensitivity || 0}
                        onChange={(e) => {
                          const sensitivity = Number(e.target.value);
                          const edpi = Number((newPro.settings.dpi * sensitivity).toFixed(1));
                          setNewPro({...newPro, settings: {...newPro.settings, sensitivity, edpi}});
                        }}
                        className={`w-full ${theme === 'dark' ? 'bg-[#151619] border-[#333]' : 'bg-white border-[#d1d5db]'} border rounded-xl px-4 py-2 text-xs font-mono focus:outline-none focus:border-emerald-500 transition-all`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono uppercase tracking-widest text-[#888]">{t.edpi}</label>
                      <input 
                        type="number"
                        step="0.1"
                        value={newPro.settings.edpi || 0}
                        onChange={(e) => {
                          const edpi = Number(e.target.value);
                          const sensitivity = newPro.settings.dpi > 0 ? Number((edpi / newPro.settings.dpi).toFixed(4)) : 0;
                          setNewPro({...newPro, settings: {...newPro.settings, edpi, sensitivity}});
                        }}
                        className={`w-full ${theme === 'dark' ? 'bg-[#151619] border-[#333]' : 'bg-white border-[#d1d5db]'} border rounded-xl px-4 py-2 text-xs font-mono focus:outline-none focus:border-emerald-500 transition-all`}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className={`flex-1 py-4 border ${theme === 'dark' ? 'border-[#333] text-[#888]' : 'border-[#d1d5db] text-[#4b5563]'} rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-red-500/10 hover:text-red-400 transition-all`}
                  >
                    {t.cancel}
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-4 bg-emerald-500 text-black rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    {loading ? t.adding : t.save}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Claude Chat Modal */}
      <AnimatePresence>
        {showClaudeModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`${theme === 'dark' ? 'bg-[#151619] border-[#333]' : 'bg-white border-[#d1d5db]'} border rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Wand2 className="text-purple-500" size={24} />
                  <h2 className={`text-2xl font-black uppercase tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    Claude Chat
                  </h2>
                </div>
                <button onClick={() => setShowClaudeModal(false)} className={`${theme === 'dark' ? 'text-[#555]' : 'text-[#6b7280]'} hover:text-purple-500`}>
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 scrollbar-thin scrollbar-thumb-purple-500/20">
                {claudeMessages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-4">
                      <Wand2 className="text-purple-500" size={32} />
                    </div>
                    <p className={`text-sm font-mono ${theme === 'dark' ? 'text-[#888]' : 'text-[#4b5563]'} uppercase tracking-widest max-w-xs`}>
                      Ask Claude anything about pro gamer gear or settings.
                    </p>
                  </div>
                )}
                {claudeMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-sans leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-purple-600 text-white rounded-tr-none' 
                        : theme === 'dark' 
                          ? 'bg-[#0a0a0a] border border-[#333] text-[#aaa] rounded-tl-none' 
                          : 'bg-[#f3f4f6] text-[#1a1a1a] rounded-tl-none'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {claudeLoading && (
                  <div className="flex justify-start">
                    <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-[#0a0a0a] border border-[#333]' : 'bg-[#f3f4f6]'} rounded-tl-none`}>
                      <Loader2 size={16} className="animate-spin text-purple-500" />
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleClaudeChat} className="flex gap-2">
                <input 
                  type="text"
                  value={claudeInput}
                  onChange={(e) => setClaudeInput(e.target.value)}
                  placeholder="Type your message..."
                  className={`flex-1 ${theme === 'dark' ? 'bg-[#0a0a0a] border-[#333]' : 'bg-white border-[#d1d5db]'} border rounded-xl px-4 py-3 text-sm font-sans focus:outline-none focus:border-purple-500 transition-all`}
                />
                <button 
                  type="submit"
                  disabled={claudeLoading || !claudeInput.trim()}
                  className="px-6 bg-purple-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}










// ── 댓글 섹션 ─────────────────────────────────────────────────────



