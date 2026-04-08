import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cookieSession from "cookie-session";
import axios from "axios";
import dotenv from "dotenv";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.static(path.join(process.cwd(), "public")));
  app.use(
    cookieSession({
      name: "session",
      keys: [process.env.SESSION_SECRET || "pro-gear-match-secret"],
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: true,
      sameSite: "none",
    })
  );

  // Anthropic (Claude) Client
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || "",
  });

  // Gemini Client
  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

  // Microsoft OAuth Config
  const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID;
  const MICROSOFT_CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET;
  const REDIRECT_URI = `${process.env.APP_URL}/api/auth/microsoft/callback`;

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Gemini Scrape Endpoint
  app.post("/api/gemini/scrape", async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "No URL provided" });
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "GEMINI_API_KEY not configured" });

    try {
      const result = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: `Extract pro gamer information from ${url}. 
        Return a JSON object with: name (use ONLY the player's nickname/in-game name, e.g., 'TenZ' instead of 'Tyson Ngo'), team, game, gear (mouse, keyboard, monitor, mousepad, controller), and settings (dpi, sensitivity).
        If a field is not found, leave it empty or null.` }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              team: { type: Type.STRING },
              game: { type: Type.STRING },
              gear: {
                type: Type.OBJECT,
                properties: {
                  mouse: { type: Type.STRING },
                  keyboard: { type: Type.STRING },
                  monitor: { type: Type.STRING },
                  mousepad: { type: Type.STRING },
                  controller: { type: Type.STRING },
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
          },
          tools: [{ urlContext: {} }] as any
        }
      });

      res.json(JSON.parse(result.text || "{}"));
    } catch (error: any) {
      console.error("Gemini Scrape Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Gemini Suggestions Endpoint
  app.post("/api/gemini/suggestions", async (req, res) => {
    const { query, category } = req.body;
    if (!query || !category) return res.status(400).json({ error: "Missing query or category" });
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "GEMINI_API_KEY not configured" });

    try {
      const result = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: `Provide 5 popular ${category} models that match or are similar to "${query}". 
        Return only a JSON array of strings.` }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });

      res.json(JSON.parse(result.text || "[]"));
    } catch (error: any) {
      console.error("Gemini Suggestion Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Gemini Match Endpoint
  app.post("/api/gemini/match", async (req, res) => {
    const { settings, localPros } = req.body;
    if (!settings || !localPros) return res.status(400).json({ error: "Missing settings or localPros" });
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "GEMINI_API_KEY not configured" });

    const prompt = `
      Match 3 professional gamers for the game: ${settings.game} from the provided list.
      User settings:
      - Mouse: ${settings.mouse}
      - Keyboard: ${settings.keyboard}
      - Monitor: ${settings.monitor}
      - Mousepad: ${settings.mousepad}
      - DPI: ${settings.dpi}
      - Sensitivity: ${settings.sensitivity}
      - eDPI: ${(settings.dpi * settings.sensitivity).toFixed(1)}

      DATA SOURCE (ONLY USE THIS DATA):
      ${JSON.stringify(localPros)}

      MATCHING LOGIC:
      1. eDPI TOLERANCE: Identify players whose eDPI is within a +/- 15% range of the user's eDPI.
      2. GEAR PRIORITY: Prioritize matching those who use the SAME or VERY SIMILAR gear.
      3. RANKING: The first result should be the best match.

      CRITICAL: DO NOT use Google Search. DO NOT invent new players. ONLY use the players provided in the DATA SOURCE above.
      IMPORTANT: Use ONLY the player's nickname for the 'name' field (e.g., 'TenZ' instead of 'Tyson "TenZ" Ngo').
      
      Return the data in the specified JSON format.
    `;

    try {
      const result = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
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
          }
        }
      });

      res.json(JSON.parse(result.text || "[]"));
    } catch (error: any) {
      console.error("Gemini Match Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Claude API Endpoint
  app.post("/api/claude/chat", async (req, res) => {
    const { messages, system } = req.body;

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured in Secrets" });
    }

    try {
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        system: system || "You are a helpful assistant.",
        messages: messages || [],
      });

      res.json(response);
    } catch (error: any) {
      console.error("Claude API Error:", error);
      res.status(500).json({ error: error.message || "Failed to call Claude API" });
    }
  });

  // Microsoft OAuth URL
  app.get("/api/auth/microsoft/url", (req, res) => {
    if (!MICROSOFT_CLIENT_ID) {
      return res.status(500).json({ error: "MICROSOFT_CLIENT_ID not configured" });
    }
    const params = new URLSearchParams({
      client_id: MICROSOFT_CLIENT_ID,
      response_type: "code",
      redirect_uri: REDIRECT_URI,
      scope: "offline_access Files.Read Files.Read.All",
      response_mode: "query",
    });
    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params}`;
    res.json({ url: authUrl });
  });

  // Microsoft OAuth Callback
  app.get("/api/auth/microsoft/callback", async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).send("No code provided");

    try {
      const response = await axios.post(
        "https://login.microsoftonline.com/common/oauth2/v2.0/token",
        new URLSearchParams({
          client_id: MICROSOFT_CLIENT_ID!,
          client_secret: MICROSOFT_CLIENT_SECRET!,
          code: code as string,
          redirect_uri: REDIRECT_URI,
          grant_type: "authorization_code",
        }).toString(),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      req.session!.microsoftToken = response.data.access_token;
      
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'MICROSOFT_AUTH_SUCCESS' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (error: any) {
      console.error("Microsoft Auth Error:", error.response?.data || error.message);
      res.status(500).send("Authentication failed");
    }
  });

  // Get Excel Data from sharing link
  app.get("/api/excel/data", async (req, res) => {
    const token = req.session!.microsoftToken;
    const shareUrl = req.query.url as string;

    if (!token) return res.status(401).json({ error: "Not authenticated with Microsoft" });
    if (!shareUrl) return res.status(400).json({ error: "No URL provided" });

    try {
      // 1. Encode the sharing URL
      const base64Url = Buffer.from(shareUrl).toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
      const shareId = `u!${base64Url}`;

      // 2. Get the drive item
      const driveItemResponse = await axios.get(
        `https://graph.microsoft.com/v1.0/shares/${shareId}/driveItem`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const driveId = driveItemResponse.data.parentReference.driveId;
      const itemId = driveItemResponse.data.id;

      // 3. Get worksheets
      const worksheetsResponse = await axios.get(
        `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/workbook/worksheets`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const firstSheetName = worksheetsResponse.data.value[0].name;

      // 4. Get table/range data
      const rangeResponse = await axios.get(
        `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/workbook/worksheets/${firstSheetName}/usedRange`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      res.json({
        fileName: driveItemResponse.data.name,
        data: rangeResponse.data.values
      });
    } catch (error: any) {
      console.error("Excel Data Error:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to fetch Excel data" });
    }
  });

  // URL Status Checker (to detect 404s on third-party sites)
  app.get("/api/check-url", async (req, res) => {
    const url = req.query.url as string;
    if (!url) return res.status(400).json({ error: "No URL provided" });

    try {
      // We use a HEAD request first as it's faster and uses less bandwidth
      // If HEAD fails or isn't supported, we fall back to GET
      let status = 0;
      try {
        const headResponse = await axios.head(url, { 
          timeout: 5000,
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });
        status = headResponse.status;
      } catch (e: any) {
        if (e.response) {
          status = e.response.status;
        } else {
          // Fallback to GET if HEAD is blocked or fails
          const getResponse = await axios.get(url, { 
            timeout: 5000,
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
          });
          status = getResponse.status;
        }
      }
      res.json({ status });
    } catch (error: any) {
      if (error.response) {
        res.json({ status: error.response.status });
      } else {
        res.json({ status: 500, error: error.message });
      }
    }
  });

  // Gemini Highlights Endpoint
  app.post("/api/gemini/highlights", async (req, res) => {
    const { playerName, game } = req.body;
    if (!playerName || !game) return res.status(400).json({ error: "Missing playerName or game" });
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "GEMINI_API_KEY not configured" });

    try {
      const result = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: `Find 3 popular YouTube highlight videos for the pro gamer "${playerName}" in the game "${game}". 
        Return a JSON array of objects, each with: title, youtubeId (the 11-char ID from the URL), and description.` }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                youtubeId: { type: Type.STRING },
                description: { type: Type.STRING },
              },
              required: ["title", "youtubeId"]
            }
          }
        }
      });

      res.json(JSON.parse(result.text || "[]"));
    } catch (error: any) {
      console.error("Gemini Highlights Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false,
        watch: null
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
