import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cookieSession from "cookie-session";
import axios from "axios";
import dotenv from "dotenv";
import Anthropic from "@anthropic-ai/sdk";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3010;

  app.use(express.json());
  app.use(express.static(path.join(process.cwd(), "public")));
  app.use(
    cookieSession({
      name: "session",
      keys: [process.env.SESSION_SECRET || "pro-gear-match-secret"],
      maxAge: 24 * 60 * 60 * 1000,
      secure: true,
      sameSite: "none",
    })
  );

  // Anthropic (Claude) Client
  const anthropic = process.env.ANTHROPIC_API_KEY
    ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    : null;

  // Microsoft OAuth Config
  const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID;
  const MICROSOFT_CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET;
  const REDIRECT_URI = `${process.env.APP_URL}/api/auth/microsoft/callback`;

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Claude Scrape Endpoint — fetch URL content and extract pro gamer info
  app.post("/api/claude/scrape", async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "No URL provided" });
    if (!anthropic) return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });

    try {
      // Fetch the page HTML server-side to avoid CORS
      const pageResponse = await axios.get(url, {
        timeout: 10000,
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
        maxContentLength: 500000,
      });

      // Strip noise from HTML: remove scripts, styles, nav, images, SVGs to keep only content
      let html = String(pageResponse.data);
      html = html.replace(/<script[\s\S]*?<\/script>/gi, "");
      html = html.replace(/<style[\s\S]*?<\/style>/gi, "");
      html = html.replace(/<nav[\s\S]*?<\/nav>/gi, "");
      html = html.replace(/<footer[\s\S]*?<\/footer>/gi, "");
      html = html.replace(/<svg[\s\S]*?<\/svg>/gi, "");
      html = html.replace(/<picture[\s\S]*?<\/picture>/gi, "");
      html = html.replace(/<img[^>]*>/gi, "");
      html = html.replace(/\s+/g, " ");
      html = html.slice(0, 60000);

      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `Extract pro gamer gear and settings from this ProSettings.net page.

IMPORTANT HINTS for parsing ProSettings.net HTML:
- Gear sections have classes like "section--mouse", "section--keyboard", "section--monitor", "section--mousepad"
- Gear names are in <h4><a>...</a></h4> inside each section
- Settings like DPI and sensitivity are in <tr data-field="dpi">, <tr data-field="sensitivity"> with values in <td> tags
- The first game section (usually VALORANT) is the primary one

Return ONLY a valid JSON object:
{
  "name": "<player nickname only, e.g. TenZ not Tyson Ngo>",
  "team": "<team name>",
  "game": "<primary game>",
  "gear": {
    "mouse": "<mouse model or null>",
    "keyboard": "<keyboard model or null>",
    "monitor": "<monitor model or null>",
    "mousepad": "<mousepad model or null>",
    "controller": "<controller model or null>"
  },
  "settings": {
    "dpi": <number or null>,
    "sensitivity": <number or null>
  }
}

PAGE URL: ${url}

PAGE HTML:
${html}`,
          },
        ],
      });

      const text = message.content[0].type === "text" ? message.content[0].text : "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in Claude response");

      const data = JSON.parse(jsonMatch[0]);

      // If mouse is missing but controller exists, populate from controller
      if (data.gear && !data.gear.mouse && data.gear.controller) {
        data.gear.mouse = data.gear.controller;
        data.gear.keyboard = data.gear.controller;
        data.gear.mousepad = data.gear.controller;
      }

      res.json(data);
    } catch (error: any) {
      console.error("Claude Scrape Error:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // Claude Highlights Endpoint — find YouTube highlight videos for a pro gamer
  app.post("/api/claude/highlights", async (req, res) => {
    const { playerName, game } = req.body;
    if (!playerName || !game) return res.status(400).json({ error: "Missing playerName or game" });
    if (!anthropic) return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });

    try {
      const message = await anthropic.messages.create({
        model: "claude-opus-4-6",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `List 3 popular YouTube highlight videos for the pro gamer "${playerName}" in the game "${game}".
Return ONLY a valid JSON array with this exact shape:
[
  { "title": "<video title>", "youtubeId": "<11-char YouTube video ID>", "description": "<brief description>" }
]
Use real, well-known highlight videos if you know them. Do not include any explanation or markdown.`,
          },
        ],
      });

      const text = message.content[0].type === "text" ? message.content[0].text : "";
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("No JSON array found in Claude response");

      res.json(JSON.parse(jsonMatch[0]));
    } catch (error: any) {
      console.error("Claude Highlights Error:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // Claude Chat Endpoint
  app.post("/api/claude/chat", async (req, res) => {
    const { messages, system } = req.body;

    if (!anthropic) {
      return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });
    }

    try {
      const response = await anthropic.messages.create({
        model: "claude-opus-4-6",
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
      const base64Url = Buffer.from(shareUrl)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
      const shareId = `u!${base64Url}`;

      const driveItemResponse = await axios.get(
        `https://graph.microsoft.com/v1.0/shares/${shareId}/driveItem`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const driveId = driveItemResponse.data.parentReference.driveId;
      const itemId = driveItemResponse.data.id;

      const worksheetsResponse = await axios.get(
        `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/workbook/worksheets`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const firstSheetName = worksheetsResponse.data.value[0].name;

      const rangeResponse = await axios.get(
        `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/workbook/worksheets/${firstSheetName}/usedRange`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      res.json({
        fileName: driveItemResponse.data.name,
        data: rangeResponse.data.values,
      });
    } catch (error: any) {
      console.error("Excel Data Error:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to fetch Excel data" });
    }
  });

  // URL Status Checker
  app.get("/api/check-url", async (req, res) => {
    const url = req.query.url as string;
    if (!url) return res.status(400).json({ error: "No URL provided" });

    try {
      let status = 0;
      try {
        const headResponse = await axios.head(url, {
          timeout: 5000,
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
        });
        status = headResponse.status;
      } catch (e: any) {
        if (e.response) {
          status = e.response.status;
        } else {
          const getResponse = await axios.get(url, {
            timeout: 5000,
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
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

  // ── Gear image scraper: Amazon og:image ──────────────────────────
  const gearImageCache = new Map<string, string | null>();

  app.get("/api/gear-image", async (req, res) => {
    const url = req.query.url as string;
    if (!url) return res.json({ image: null });

    if (gearImageCache.has(url)) {
      return res.json({ image: gearImageCache.get(url) ?? null });
    }

    try {
      const response = await axios.get(url, {
        timeout: 8000,
        maxRedirects: 5,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          "Cache-Control": "no-cache",
          "Pragma": "no-cache",
        },
      });

      const html: string = response.data;

      // 1) og:image
      let match = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
        ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);

      // 2) landingImage (Amazon main product img)
      if (!match) {
        const landingMatch = html.match(/["']landingImage["'][^>]*data-old-hires=["']([^"']+)["']/i)
          ?? html.match(/id=["']landingImage["'][^>]*src=["']([^"']+)["']/i);
        if (landingMatch) match = landingMatch;
      }

      // 3) media-amazon CDN fallback
      if (!match) {
        const cdnMatch = html.match(/https:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9%+._-]+\.jpg/);
        if (cdnMatch) {
          const clean = cdnMatch[0].split('._')[0] + '._AC_SL500_.jpg';
          gearImageCache.set(url, clean);
          return res.json({ image: clean });
        }
      }

      if (match && match[1] && match[1].startsWith('http')) {
        // Resize to reasonable size
        const img = match[1].replace(/\._[^.]+_\./, '._AC_SL500_.');
        gearImageCache.set(url, img);
        return res.json({ image: img });
      }

      gearImageCache.set(url, null);
      return res.json({ image: null });
    } catch {
      gearImageCache.set(url, null);
      return res.json({ image: null });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { port: 24679 },
        watch: null,
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
