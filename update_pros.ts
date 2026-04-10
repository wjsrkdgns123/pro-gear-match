import Anthropic from "@anthropic-ai/sdk";
import axios from "axios";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import firebaseConfig from "./firebase-applet-config.json";
import dotenv from "dotenv";

dotenv.config();

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" });

async function updatePlayer(url: string) {
  console.log(`Processing ${url}...`);

  const pageResponse = await axios.get(url, {
    timeout: 10000,
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
    maxContentLength: 500000,
  });
  const html = String(pageResponse.data).slice(0, 80000);

  const message = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Extract pro gamer information from this page HTML.
Return ONLY a valid JSON object with this exact shape (no explanation, no markdown):
{
  "name": "<player nickname only>",
  "team": "<team name>",
  "game": "<game name>",
  "imageUrl": "<player image URL or null>",
  "teamLogoUrl": "<team logo URL or null>",
  "profileUrl": "${url}",
  "gear": {
    "mouse": "<mouse model or null>",
    "keyboard": "<keyboard model or null>",
    "monitor": "<monitor model or null>",
    "mousepad": "<mousepad model or null>"
  },
  "settings": {
    "dpi": <number or null>,
    "sensitivity": <number or null>
  }
}

PAGE HTML:
${html}`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.warn(`No JSON found for ${url}`);
    return;
  }

  const data = JSON.parse(jsonMatch[0]);
  if (!data.name) {
    console.warn(`No name found for ${url}`);
    return;
  }

  const normalizedGame =
    data.game && data.game.toUpperCase() === "VALORANT" ? "Valorant" : data.game || "Valorant";

  let cleanedName = data.name;
  const quoteMatch = data.name.match(/["'](.+)["']/);
  if (quoteMatch) cleanedName = quoteMatch[1].trim();

  const gamerId = `${normalizedGame}_${cleanedName}`.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();

  const proData = {
    ...data,
    name: cleanedName,
    game: normalizedGame,
    settings: {
      ...data.settings,
      edpi: (data.settings?.dpi || 0) * (data.settings?.sensitivity || 0),
    },
    updatedAt: new Date().toISOString(),
    source: "ProSettings Scraper",
  };

  await setDoc(doc(db, "pro-gamers", gamerId), proData, { merge: true });
  console.log(`Updated ${cleanedName} (${gamerId}) in ${normalizedGame}`);
}

async function main() {
  const urls = [
    "https://prosettings.net/players/boostio/",
    "https://prosettings.net/players/cryocells/",
    "https://prosettings.net/players/eeiu/",
  ];
  for (const url of urls) {
    await updatePlayer(url);
  }
}

main().catch(console.error);
