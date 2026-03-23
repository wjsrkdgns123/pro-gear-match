import { GoogleGenAI, Type } from "@google/genai";
import { GearSettings, ProGamer } from "../types";
import { db, OperationType, handleFirestoreError, auth, googleProvider } from "../firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { collection, query, where, getDocs, setDoc, doc } from "firebase/firestore";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const ADMIN_EMAIL = "wjsrkdgns123a@gmail.com";

async function syncProGamerToDb(pro: ProGamer) {
  try {
    // Only attempt sync if logged in as admin
    if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) {
      return;
    }

    const gamerId = `${pro.game}_${pro.name}`.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const gamerRef = doc(db, "pro-gamers", gamerId);
    await setDoc(gamerRef, {
      ...pro,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    // Silently fail for regular users, log for admin
    if (auth.currentUser?.email === ADMIN_EMAIL) {
      console.error("Admin Sync error:", error);
    }
  }
}

export async function matchProGamer(settings: GearSettings): Promise<ProGamer[]> {
  const prompt = `
    Based on the following gaming gear and settings, find 3 professional gamers (from games like Valorant, CS2, Overwatch 2, etc.) who use similar equipment or have a similar sensitivity profile (DPI * Sensitivity = eDPI).
    
    The first gamer should be the BEST match. The other two should be the next closest matches.
    If multiple pro gamers have the same or very similar settings, prioritize the most famous and well-known players.
    
    User Settings:
    - Game: ${settings.game}
    - Mouse: ${settings.mouse}
    - Keyboard: ${settings.keyboard}
    - Monitor: ${settings.monitor}
    - Mousepad: ${settings.mousepad}
    - DPI: ${settings.dpi}
    - Sensitivity: ${settings.sensitivity}
    - eDPI: ${settings.dpi * settings.sensitivity}

    CRITICAL CONSTRAINTS:
    1. EXISTENCE CHECK: Every pro gamer returned MUST have a valid, existing profile on ProSettings.net (https://prosettings.net). If a player is not on ProSettings.net, DO NOT include them.
    2. DATA SOURCE: While the player must exist on ProSettings.net, you MUST search the ENTIRE INTERNET (Liquipedia, Twitter/X, official team announcements, etc.) to provide the ABSOLUTE LATEST gear and settings. ProSettings.net can sometimes be outdated; your goal is to provide the most current information available as of today.
    3. NO HALLUCINATION: If the latest information for a specific gear item or setting cannot be found anywhere, use the data from ProSettings.net. If even that is missing, use an empty string ("") or 0.
    4. IMAGE SOURCE: Use the best available high-quality image URLs from the internet (Liquipedia is often best). If no image is found, use: https://picsum.photos/seed/{playerName}/200/200
    5. Provide a direct URL to their profile on ProSettings.net for reference.
    6. SOURCE FIELD: In the "source" field, list the primary sources used (e.g., "ProSettings.net, Liquipedia, Twitter").
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            team: { type: Type.STRING },
            game: { type: Type.STRING },
            imageUrl: { type: Type.STRING, description: "Direct URL to player's profile image. Empty string if not found." },
            teamLogoUrl: { type: Type.STRING, description: "Direct URL to the team's logo image. Empty string if not found." },
            profileUrl: { type: Type.STRING, description: "Direct URL to player's profile page on ProSettings.net" },
            gear: {
              type: Type.OBJECT,
              properties: {
                mouse: { type: Type.STRING },
                keyboard: { type: Type.STRING },
                monitor: { type: Type.STRING },
                mousepad: { type: Type.STRING },
              },
              required: ["mouse", "keyboard", "monitor", "mousepad"],
            },
            settings: {
              type: Type.OBJECT,
              properties: {
                dpi: { type: Type.NUMBER },
                sensitivity: { type: Type.NUMBER },
                edpi: { type: Type.NUMBER },
              },
              required: ["dpi", "sensitivity", "edpi"],
            },
            source: { type: Type.STRING, description: "The source of this information (e.g., ProSettings.net)" },
          },
          required: ["name", "team", "game", "profileUrl", "gear", "settings", "source"],
        },
      },
    },
  });

  if (!response.text) {
    throw new Error("Failed to get match from AI");
  }

  const results = JSON.parse(response.text);
  // Sync matches to DB in background
  results.forEach((pro: ProGamer) => syncProGamerToDb(pro));
  
  return results;
}

export async function getProGamerList(game: string): Promise<ProGamer[]> {
  try {
    const q = query(collection(db, "pro-gamers"), where("game", "==", game));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs.map(doc => doc.data() as ProGamer);
    }
  } catch (error) {
    console.error("Firestore fetch error:", error);
  }

  const prompt = `
    List at least 100 famous professional gamers for the game: ${game}.
    
    CRITICAL CONSTRAINTS:
    1. EXISTENCE CHECK: Every pro gamer returned MUST have a valid, existing profile on ProSettings.net (https://prosettings.net). If a player is not on ProSettings.net, DO NOT include them.
    2. DATA SOURCE: While the player must exist on ProSettings.net, you MUST search the ENTIRE INTERNET (Liquipedia, Twitter/X, official team announcements, etc.) to provide the ABSOLUTE LATEST gear and settings. ProSettings.net can sometimes be outdated; your goal is to provide the most current information available as of today.
    3. NO HALLUCINATION: If the latest information for a specific gear item or setting cannot be found anywhere, use the data from ProSettings.net. If even that is missing, use an empty string ("") or 0.
    4. IMAGE SOURCE: Use the best available high-quality image URLs from the internet (Liquipedia is often best). If no image is found, use: https://picsum.photos/seed/{playerName}/200/200
    5. QUANTITY: Provide at least 100 unique professional gamers who meet the existence criteria.
    6. TEAM PRIORITY: Prioritize active players from famous teams.
    7. SORTING: Return the list SORTED BY TEAM NAME alphabetically.
    8. SOURCE FIELD: In the "source" field, list the primary sources used (e.g., "ProSettings.net, Liquipedia, Twitter").
    
    For each gamer, provide:
    - name
    - team
    - game
    - imageUrl (Direct link to profile photo)
    - teamLogoUrl (Direct link to team logo)
    - profileUrl (ProSettings.net profile URL)
    - gear (mouse, keyboard, monitor, mousepad)
    - settings (dpi, sensitivity, edpi)
    - source (e.g., "ProSettings.net, Liquipedia")
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            team: { type: Type.STRING },
            game: { type: Type.STRING },
            imageUrl: { type: Type.STRING },
            teamLogoUrl: { type: Type.STRING },
            profileUrl: { type: Type.STRING },
            gear: {
              type: Type.OBJECT,
              properties: {
                mouse: { type: Type.STRING },
                keyboard: { type: Type.STRING },
                monitor: { type: Type.STRING },
                mousepad: { type: Type.STRING },
              },
              required: ["mouse", "keyboard", "monitor", "mousepad"],
            },
            settings: {
              type: Type.OBJECT,
              properties: {
                dpi: { type: Type.NUMBER },
                sensitivity: { type: Type.NUMBER },
                edpi: { type: Type.NUMBER },
              },
              required: ["dpi", "sensitivity", "edpi"],
            },
            source: { type: Type.STRING },
          },
          required: ["name", "team", "game", "profileUrl", "gear", "settings", "source"],
        },
      },
    },
  });

  if (!response.text) {
    throw new Error("Failed to get list from AI");
  }

  const list = JSON.parse(response.text);
  // Sync list to DB in background
  list.forEach((pro: ProGamer) => syncProGamerToDb(pro));

  return list;
}
