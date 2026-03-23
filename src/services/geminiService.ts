import { GoogleGenAI, Type } from "@google/genai";
import { GearSettings, ProGamer } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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

    Search ONLY ProSettings.net (https://prosettings.net) for gear and settings data.
    CRITICAL CONSTRAINTS:
    1. PROSETTINGS.NET DATA ONLY: All gear and settings information MUST be sourced from prosettings.net.
    2. IMAGE SOURCE: For imageUrl and teamLogoUrl, you MUST provide a direct, hotlinkable image URL. 
       - Prioritize Liquipedia (https://liquipedia.net) for player photos and team logos as they are more reliable for hotlinking.
       - If no real image is found, use a high-quality placeholder: https://picsum.photos/seed/{playerName}/200/200
    3. DO NOT hallucinate or make up gear data. If you are not 100% sure about a player's gear or settings on ProSettings.net, do not return them.
    4. Provide a direct URL to their profile on ProSettings.net.
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

  return JSON.parse(response.text);
}

export async function getProGamerList(game: string): Promise<ProGamer[]> {
  const prompt = `
    List at least 100 famous professional gamers for the game: ${game}.
    
    CRITICAL CONSTRAINTS:
    1. PROSETTINGS.NET DATA ONLY: All gear and settings information MUST be sourced from prosettings.net.
    2. IMAGE SOURCE: For imageUrl and teamLogoUrl, you MAY use Liquipedia (https://liquipedia.net) if ProSettings.net does not provide a direct, hotlinkable image URL. This is to ensure images are not broken.
    3. QUANTITY: Provide at least 100 unique professional gamers from ProSettings.net if the data exists.
    4. TEAM PRIORITY: Prioritize active players from famous teams listed on ProSettings.net.
    5. SORTING: Return the list SORTED BY TEAM NAME alphabetically.
    6. NO HALLUCINATION: Do not guess or estimate settings. Use only factual data from the source.
    
    For each gamer, provide:
    - name
    - team
    - game
    - imageUrl (Direct link to profile photo - prioritize Liquipedia for reliability)
    - teamLogoUrl (Direct link to team logo - prioritize Liquipedia for reliability)
    - profileUrl (ProSettings.net profile URL)
    - gear (mouse, keyboard, monitor, mousepad)
    - settings (dpi, sensitivity, edpi)
    - source (MUST be "ProSettings.net")
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

  return JSON.parse(response.text);
}
