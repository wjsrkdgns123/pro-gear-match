import { GearSettings, ProGamer } from "../types";
import { db, OperationType, handleFirestoreError, auth } from "../firebase";
import { collection, query, where, getDocs, setDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";

import { PRO_MICE, PRO_KEYBOARDS, PRO_MONITORS, PRO_MOUSEPADS } from "../constants";

/**
 * Scrapes pro gamer information from a URL using server-side Gemini API.
 */
export async function scrapeProGamerInfo(url: string): Promise<Partial<ProGamer> | null> {
  if (!url) return null;
  
  try {
    const response = await fetch("/api/gemini/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });

    if (!response.ok) throw new Error(`Server error: ${response.statusText}`);
    const data = await response.json();
    
    // Logic: If mouse is missing but controller exists, populate mouse, keyboard, mousepad with controller info
    if (data.gear && !data.gear.mouse && data.gear.controller) {
      data.gear.mouse = data.gear.controller;
      data.gear.keyboard = data.gear.controller;
      data.gear.mousepad = data.gear.controller;
    }
    
    return data;
  } catch (error) {
    console.error("Scraping error:", error);
    return null;
  }
}

/**
 * Provides gear suggestions based on a partial query using local constants (No AI).
 */
export async function getGearSuggestions(queryStr: string, category: 'mouse' | 'keyboard' | 'monitor' | 'mousepad' | 'controller'): Promise<string[]> {
  if (!queryStr || queryStr.length < 1) return [];

  const search = queryStr.toLowerCase().replace(/\s+/g, '');
  let source: string[] = [];

  switch (category) {
    case 'mouse': source = PRO_MICE; break;
    case 'keyboard': source = PRO_KEYBOARDS; break;
    case 'monitor': source = PRO_MONITORS; break;
    case 'mousepad': source = PRO_MOUSEPADS; break;
    case 'controller': source = ["DualSense Edge", "DualSense", "Xbox Elite Series 2", "Xbox Wireless Controller", "SCUF Envision Pro", "SCUF Reflex", "Battle Beaver Custom"]; break;
    default: source = [];
  }

  // Filter and sort alphabetically
  const results = source
    .filter(item => item.toLowerCase().replace(/\s+/g, '').includes(search))
    .sort((a, b) => a.localeCompare(b));

  return results.slice(0, 10); // Return top 10 matches
}

const ADMIN_EMAIL = "wjsrkdgns123a@gmail.com";
const VALID_GAMES = ['Valorant', 'CS2', 'Overwatch 2', 'Apex Legends'];

function normalizeGameName(game: string): string {
  if (!game) return "Valorant";
  const found = VALID_GAMES.find(g => g.toLowerCase() === game.toLowerCase());
  return found || game;
}

export function cleanPlayerName(name: string): string {
  if (!name) return "";
  
  // Extract nickname from formats like: Tyson "TenZ" Ngo or Tyson 'TenZ' Ngo
  const quoteMatch = name.match(/["'](.+)["']/);
  if (quoteMatch) return quoteMatch[1].trim();
  
  // Extract from parentheses: Tyson (TenZ) Ngo
  const parenMatch = name.match(/\((.+)\)/);
  if (parenMatch) return parenMatch[1].trim();

  // Extract from brackets: Tyson [TenZ] Ngo
  const bracketMatch = name.match(/\[(.+)\]/);
  if (bracketMatch) return bracketMatch[1].trim();
  
  // If it's a full name without markers, we can't easily guess the nickname.
  // But the scraper prompt now handles this for URL fetches.
  return name.trim();
}

export async function syncProGamerToDb(pro: ProGamer) {
  try {
    // Only attempt sync if logged in as admin
    if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) {
      console.error("Unauthorized: Only admin can sync pro gamer data.");
      throw new Error("Unauthorized: Only admin can perform this action.");
    }

    const cleanedName = cleanPlayerName(pro.name);
    const normalizedGame = normalizeGameName(pro.game);
    
    // Logic: If mouse is missing but controller exists, populate mouse, keyboard, mousepad with controller info
    if (pro.gear && !pro.gear.mouse && pro.gear.controller) {
      pro.gear.mouse = pro.gear.controller;
      pro.gear.keyboard = pro.gear.controller;
      pro.gear.mousepad = pro.gear.controller;
    }

    const gamerId = `${normalizedGame}_${cleanedName}`.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const gamerRef = doc(db, "pro-gamers", gamerId);
    
    console.log(`Syncing pro gamer: ${cleanedName} (${gamerId}) in game: ${normalizedGame}`);
    
    await setDoc(gamerRef, {
      ...pro,
      name: cleanedName,
      game: normalizedGame,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    console.log("Sync successful.");
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `pro-gamers/${pro.name}`);
    throw error;
  }
}

/**
 * Matches pro gamers based on user settings using a deterministic algorithm (No AI).
 */
export async function matchProGamer(settings: GearSettings): Promise<ProGamer[]> {
  // Fetch existing pros from Firestore to provide as context
  let localPros: ProGamer[] = [];
  try {
    const q = query(collection(db, "pro-gamers"), where("game", "==", settings.game));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      localPros = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ProGamer));
    }
  } catch (error) {
    console.error("Firestore fetch error during matchmaking:", error);
  }

  // If no data in DB, use fallback for Valorant or return empty
  if (localPros.length === 0 && settings.game === 'Valorant') {
    localPros = VALORANT_FALLBACK;
  }

  if (localPros.length === 0) {
    throw new Error("No pro gamer data available in the database. Please upload data first.");
  }

  const userEdpi = settings.dpi * settings.sensitivity;

  const scoredPros = localPros.map(pro => {
    let score = 0;
    const reasons: string[] = [];
    const proEdpi = pro.settings.edpi || (pro.settings.dpi * pro.settings.sensitivity);

    // 1. eDPI Similarity (Weight: 60%)
    const edpiDiff = Math.abs(userEdpi - proEdpi);
    const edpiRatio = Math.min(userEdpi, proEdpi) / Math.max(userEdpi, proEdpi);
    const edpiScore = Math.max(0, 1 - (edpiDiff / (userEdpi || 1)));
    score += edpiScore * 60;

    if (edpiRatio > 0.9) {
      reasons.push("eDPI가 거의 일치합니다 (90% 이상)");
    } else if (edpiRatio > 0.8) {
      reasons.push("유사한 eDPI 범위를 사용합니다");
    }

    // 2. Gear Similarity (Weight: 40%)
    let gearMatches = 0;
    const matchedGearNames: string[] = [];
    
    const userGearMap = {
      "마우스": settings.mouse?.toLowerCase().trim(),
      "키보드": settings.keyboard?.toLowerCase().trim(),
      "모니터": settings.monitor?.toLowerCase().trim(),
      "마우스패드": settings.mousepad?.toLowerCase().trim()
    };

    const proGearMap = {
      "마우스": pro.gear.mouse?.toLowerCase().trim() || pro.gear.controller?.toLowerCase().trim(),
      "키보드": pro.gear.keyboard?.toLowerCase().trim(),
      "모니터": pro.gear.monitor?.toLowerCase().trim(),
      "마우스패드": pro.gear.mousepad?.toLowerCase().trim()
    };

    Object.entries(userGearMap).forEach(([label, ug]) => {
      if (!ug) return;
      const pg = proGearMap[label as keyof typeof proGearMap];
      if (pg && (pg.includes(ug) || ug.includes(pg))) {
        gearMatches++;
        matchedGearNames.push(label);
      }
    });

    if (matchedGearNames.length > 0) {
      reasons.push(`${matchedGearNames.join(", ")} 장비가 일치하거나 매우 유사합니다`);
    }

    const gearScore = (gearMatches / 4) * 40;
    score += gearScore;

    return { pro: { ...pro, matchReasons: reasons }, score };
  });

  // Sort by score descending and take top 3
  const topMatches = scoredPros
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => ({
      ...item.pro,
      name: cleanPlayerName(item.pro.name)
    }));

  return topMatches;
}

export const VALORANT_FALLBACK: ProGamer[] = [
  {
    name: "bang", team: "100 Thieves", game: "Valorant",
    imageUrl: "https://prosettings.net/wp-content/uploads/bang.png",
    teamLogoUrl: "https://prosettings.net/wp-content/uploads/100-thieves-logo.png",
    profileUrl: "https://prosettings.net/players/bang/",
    gear: { mouse: "LOGITECH G PRO X SUPERLIGHT", keyboard: "SteelSeries Apex Pro TKL", monitor: "ZOWIE XL2566K", mousepad: "Artisan Hayate Otsu Soft" },
    settings: { dpi: 800, sensitivity: 0.32, edpi: 256 },
    source: "ProSettings.net"
  },
  {
    name: "TenZ", team: "Sentinels", game: "Valorant",
    imageUrl: "https://prosettings.net/wp-content/uploads/tenz.png",
    teamLogoUrl: "https://prosettings.net/wp-content/uploads/sentinels-logo.png",
    profileUrl: "https://prosettings.net/players/tenz/",
    gear: { mouse: "PULSAR TENZ EDITION", keyboard: "Wooting 60HE", monitor: "SONY INZONE M10S", mousepad: "Artisan Ninja FX Zero XSoft" },
    settings: { dpi: 1600, sensitivity: 0.1, edpi: 160 },
    source: "ProSettings.net"
  },
  {
    name: "aspas", team: "Leviatán", game: "Valorant",
    imageUrl: "https://prosettings.net/wp-content/uploads/aspas.png",
    teamLogoUrl: "https://prosettings.net/wp-content/uploads/leviatan-logo.png",
    profileUrl: "https://prosettings.net/players/aspas/",
    gear: { mouse: "LOGITECH G PRO X SUPERLIGHT 2", keyboard: "Wooting 60HE", monitor: "ZOWIE XL2566K", mousepad: "Artisan Ninja FX Zero Soft" },
    settings: { dpi: 800, sensitivity: 0.4, edpi: 320 },
    source: "ProSettings.net"
  }
];

export async function seedDatabase() {
  if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) {
    throw new Error("Unauthorized: Only admin can seed database.");
  }
  
  console.log("Seeding database with default Valorant pros...");
  for (const pro of VALORANT_FALLBACK) {
    await syncProGamerToDb(pro);
  }
}

export async function deleteProGamer(pro: ProGamer) {
  console.log("deleteProGamer called for:", pro.name, pro.id);
  try {
    if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) {
      console.warn("Delete attempt by non-admin:", auth.currentUser?.email);
      throw new Error("Unauthorized: Only administrators can delete entries.");
    }
    
    // Use the explicit ID if available
    if (pro.id) {
      console.log("Deleting by ID:", pro.id);
      const gamerRef = doc(db, "pro-gamers", pro.id);
      await deleteDoc(gamerRef);
      return;
    }
    
    // Fallback to name-based ID if no explicit ID
    const cleanedName = cleanPlayerName(pro.name);
    const gamerId = `${pro.game}_${cleanedName}`.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const gamerRef = doc(db, "pro-gamers", gamerId);
    console.log("Deleting by generated ID:", gamerId);
    await deleteDoc(gamerRef);
    
    // Also try with original name ID just in case it was saved differently
    const originalGamerId = `${pro.game}_${pro.name}`.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    if (gamerId !== originalGamerId) {
      console.log("Deleting by original ID:", originalGamerId);
      const originalGamerRef = doc(db, "pro-gamers", originalGamerId);
      await deleteDoc(originalGamerRef);
    }
  } catch (error) {
    console.error("Delete error:", error);
    throw error;
  }
}

export async function migrateProsToOverwatch() {
  if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) {
    throw new Error("Unauthorized: Only admin can perform migration.");
  }

  // Get today's date in YYYY-MM-DD format (UTC)
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  console.log(`Starting migration. Checking for pros added on ${today} or ${yesterday} (UTC)...`);

  try {
    const allSnapshot = await getDocs(collection(db, "pro-gamers"));
    console.log(`Total documents in collection: ${allSnapshot.size}`);
    
    const todayPros = allSnapshot.docs.filter(d => {
      const data = d.data();
      // Check for both today and yesterday to handle timezone overlaps
      const isRecent = data.updatedAt && (data.updatedAt.startsWith(today) || data.updatedAt.startsWith(yesterday));
      const isTargetGame = data.game === "Valorant" || data.game === "CS2";
      
      if (isTargetGame) {
        console.log(`Checking ${data.name}: game=${data.game}, updatedAt=${data.updatedAt}, isRecent=${isRecent}`);
      }
      
      return isRecent && isTargetGame;
    });

    if (todayPros.length === 0) {
      console.log("No matching pros found for migration.");
      return 0;
    }

    console.log(`Found ${todayPros.length} pros to migrate.`);

    for (const docSnap of todayPros) {
      const data = docSnap.data() as ProGamer;
      const oldPro = { ...data, id: docSnap.id };
      
      console.log(`Migrating ${oldPro.name} from ${oldPro.game} to Overwatch 2...`);
      
      // 1. Delete old entry
      await deleteProGamer(oldPro);
      
      // 2. Create new entry in Apex Legends
      const newPro: ProGamer = {
        ...data,
        game: "Apex Legends",
        updatedAt: new Date().toISOString()
      };
      await syncProGamerToDb(newPro);
    }

    console.log("Migration successfully completed.");
    return todayPros.length;
  } catch (error) {
    console.error("Migration error details:", error);
    throw error;
  }
}

export async function revertOverwatchLinks() {
  if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) {
    throw new Error("Unauthorized: Only admin can perform this action.");
  }

  console.log("Reverting Overwatch 2 links (Liquipedia -> ProSettings)...");

  try {
    const q = query(collection(db, "pro-gamers"), where("game", "==", "Overwatch 2"));
    const snapshot = await getDocs(q);
    let count = 0;

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data() as ProGamer;
      const url = data.profileUrl || "";
      
      // If it's a Liquipedia link, try to revert it to ProSettings
      if (url.includes("liquipedia.net")) {
        // ProSettings Overwatch URLs are usually https://prosettings.net/overwatch/playername/
        const slug = data.name.toLowerCase().replace(/\s+/g, '-');
        const originalUrl = `https://prosettings.net/overwatch/${slug}/`;
        
        await updateDoc(doc(db, "pro-gamers", docSnap.id), {
          profileUrl: originalUrl,
          updatedAt: new Date().toISOString()
        });
        count++;
        console.log(`Reverted ${data.name}: ${url} -> ${originalUrl}`);
      }
    }

    console.log(`Revert complete. Restored ${count} players.`);
    return count;
  } catch (error) {
    console.error("Revert error:", error);
    throw error;
  }
}

export async function fixOverwatchLinks() {
  if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) {
    throw new Error("Unauthorized: Only admin can perform this action.");
  }

  console.log("Starting precision Overwatch 2 link fix (404 detection)...");

  try {
    const q = query(collection(db, "pro-gamers"), where("game", "==", "Overwatch 2"));
    const snapshot = await getDocs(q);
    let count = 0;

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data() as ProGamer;
      const url = data.profileUrl || "";
      
      // Only target prosettings.net links for validation
      if (url.includes("prosettings.net")) {
        let isInvalid = false;
        
        // Heuristic 1: Generic list URL (Doesn't point to a specific player)
        if (url.endsWith("/overwatch-pro-settings-list/") || 
            url.endsWith("/overwatch-pro-settings-list") ||
            url.endsWith("/overwatch/") ||
            url.endsWith("/overwatch")) {
          isInvalid = true;
        }

        // Heuristic 2: Check for 404 via server-side proxy
        if (!isInvalid) {
          try {
            const response = await fetch(`/api/check-url?url=${encodeURIComponent(url)}`);
            const result = await response.json();
            
            if (result.status === 404) {
              console.log(`404 detected for ${data.name}: ${url}`);
              isInvalid = true;
            }
          } catch (e) {
            console.warn(`Failed to check URL status for ${data.name}:`, e);
          }
        }

        if (isInvalid) {
          const newUrl = `https://liquipedia.net/overwatch/${data.name.replace(/\s+/g, '_')}`;
          await updateDoc(doc(db, "pro-gamers", docSnap.id), {
            profileUrl: newUrl,
            updatedAt: new Date().toISOString()
          });
          count++;
          console.log(`Fixed broken link for ${data.name}: ${url} -> ${newUrl}`);
        }
      }
    }

    console.log(`Precision link fix complete. Updated ${count} players.`);
    return count;
  } catch (error) {
    console.error("Link fix error:", error);
    throw error;
  }
}

export async function getHighlightVideos(playerName: string, game: string): Promise<{ title: string, youtubeId: string, description?: string }[]> {
  if (!playerName || !game) return [];
  
  try {
    const response = await fetch("/api/gemini/highlights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerName, game })
    });

    if (!response.ok) throw new Error(`Server error: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error("Highlights fetch error:", error);
    return [];
  }
}

export async function getProGamerList(game: string): Promise<ProGamer[]> {
  try {
    const normalizedGame = normalizeGameName(game);
    console.log(`Fetching ${normalizedGame} pros from Firestore...`);
    
    // Diagnostic: Log all docs in the collection to see if anything is "lost"
    if (auth.currentUser?.email === ADMIN_EMAIL) {
      const allSnapshot = await getDocs(collection(db, "pro-gamers"));
      const allPros = allSnapshot.docs.map(d => ({ id: d.id, game: d.data().game, name: d.data().name }));
      console.log("DIAGNOSTIC: All pro-gamers in DB:", allPros);
      
      const asuna = allSnapshot.docs.find(d => 
        (d.data().name && d.data().name.toLowerCase().includes("asuna")) || 
        d.id.toLowerCase().includes("asuna")
      );
      if (asuna) {
        console.log("DIAGNOSTIC: Found 'Asuna' entry:", asuna.data());
        console.log("DIAGNOSTIC: Entry game is:", asuna.data().game, "Requested game is:", normalizedGame);
      } else {
        console.log("DIAGNOSTIC: 'Asuna' NOT found in entire collection.");
      }
    }

    const q = query(collection(db, "pro-gamers"), where("game", "==", normalizedGame));
    const querySnapshot = await getDocs(q);
    
    console.log(`Fetched ${querySnapshot.size} docs from Firestore for ${normalizedGame}`);
    
    let dbList: ProGamer[] = [];
    if (!querySnapshot.empty) {
      dbList = querySnapshot.docs.map(doc => {
        const data = doc.data() as ProGamer;
        const cleanedName = cleanPlayerName(data.name);
        return {
          ...data,
          id: doc.id, // Store the Firestore document ID
          name: cleanedName,
          _rawName: data.name // Store original name for cleanup logic
        };
      });
    }
    
    // If it's Valorant, merge fallback data with DB data to avoid "disappearing" pros
    if (normalizedGame === 'Valorant') {
      const merged = [...dbList];
      VALORANT_FALLBACK.forEach(fallbackPro => {
        // Only add fallback if not already in DB (by name)
        if (!merged.some(p => p.name.toLowerCase() === fallbackPro.name.toLowerCase())) {
          merged.push(fallbackPro);
        }
      });
      return merged;
    }
    
    return dbList;
  } catch (error) {
    console.error("Firestore fetch error:", error);
    if (game === 'Valorant') return VALORANT_FALLBACK;
    return [];
  }
}
