
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

async function scrape(url: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Extract pro gamer information from " + url + ". Return a JSON object with: name, team, game, gear (mouse, keyboard, monitor, mousepad), settings (dpi, sensitivity), imageUrl, teamLogoUrl, profileUrl.",
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

    if (response.text) {
      return JSON.parse(response.text);
    }
  } catch (error) {
    console.error("Error scraping " + url + ":", error);
  }
  return null;
}

async function main() {
  const urls = [
    "https://prosettings.net/players/boostio/",
    "https://prosettings.net/players/cryocells/",
    "https://prosettings.net/players/eeiu/"
  ];

  const results = [];
  for (const url of urls) {
    const data = await scrape(url);
    if (data) results.push(data);
  }
  console.log(JSON.stringify(results, null, 2));
}

main();
