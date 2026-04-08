import { GoogleGenAI, Type } from "@google/genai";
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

async function updatePlayer(url: string) {
  console.log(`Processing ${url}...`);
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Extract pro gamer information from ${url}. 
    Return a JSON object with: name, team, game, gear (mouse, keyboard, monitor, mousepad), and settings (dpi, sensitivity).
    Include imageUrl, teamLogoUrl, and profileUrl.`,
    config: {
      tools: [{ urlContext: {} }],
      responseMimeType: "application/json",
      responseSchema: {
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
            }
          },
          settings: {
            type: Type.OBJECT,
            properties: {
              dpi: { type: Type.NUMBER },
              sensitivity: { type: Type.NUMBER },
            }
          }
        }
      }
    }
  });

  const data = JSON.parse(response.text || "{}");
  if (!data.name) {
    console.warn(`No name found for ${url}`);
    return;
  }

  // Normalize game name
  const normalizedGame = (data.game && data.game.toUpperCase() === 'VALORANT') ? 'Valorant' : (data.game || 'Valorant');
  
  // Extract nickname from formats like: Tyson "TenZ" Ngo
  let cleanedName = data.name;
  const quoteMatch = data.name.match(/["'](.+)["']/);
  if (quoteMatch) cleanedName = quoteMatch[1].trim();
  
  const gamerId = `${normalizedGame}_${cleanedName}`.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  
  const proData = {
    ...data,
    name: cleanedName,
    game: normalizedGame,
    settings: {
      ...data.settings,
      edpi: (data.settings?.dpi || 0) * (data.settings?.sensitivity || 0)
    },
    updatedAt: new Date().toISOString(),
    source: 'ProSettings Scraper'
  };

  await setDoc(doc(db, "pro-gamers", gamerId), proData, { merge: true });
  console.log(`Updated ${cleanedName} (${gamerId}) in ${normalizedGame}`);
}

async function main() {
  const urls = [
    "https://prosettings.net/players/boostio/",
    "https://prosettings.net/players/cryocells/",
    "https://prosettings.net/players/eeiu/"
  ];
  for (const url of urls) {
    await updatePlayer(url);
  }
}

main().catch(console.error);
