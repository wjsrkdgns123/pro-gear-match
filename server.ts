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

  // ── Gear image scraper: Amazon product image ──────────────────────────
  const gearImageCache = new Map<string, string | null>();

  /** media-amazon URL에서 크기 수정자를 제거해 원본 사이즈로 정규화 */
  function cleanAmazonImg(raw: string): string {
    // ._XX_ 형식 modifier 제거 후 _AC_SL500_ 붙이기
    return raw.replace(/\._[A-Z0-9,_]+_\./, '.') // ._SX300_SY300_ etc
              .replace(/\.jpg$/, '._AC_SL500_.jpg');
  }

  /** URL이 실제 상품 이미지인지 확인 (Amazon 로고 등 제외) */
  function isProductImage(imgUrl: string): boolean {
    if (!imgUrl.startsWith('http')) return false;
    if (imgUrl.includes('amazon.com/favicon') || imgUrl.includes('/g/') ) return false;
    if (imgUrl.includes('media-amazon.com/images/I/')) return true;
    if (imgUrl.includes('images-na.ssl-images-amazon.com/images/I/')) return true;
    if (imgUrl.includes('images-eu.ssl-images-amazon.com/images/I/')) return true;
    return false;
  }

  const SCRAPE_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
  };

  /** og:image 메타 태그 추출 */
  function extractOgImage(html: string): string | null {
    const m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    if (!m) return null;
    const url = m[1];
    if (url.startsWith('http') && !url.includes('default-thumbnail') && !url.includes('placeholder')) return url;
    return null;
  }

  /** Newegg 검색으로 상품 이미지 URL 가져오기 */
  async function fetchNeweggImage(productName: string): Promise<string | null> {
    try {
      const r = await axios.get(`https://www.newegg.com/p/pl?d=${encodeURIComponent(productName)}`, {
        timeout: 10000, headers: SCRAPE_HEADERS,
      });
      const html: string = r.data;
      const match640 = html.match(/https:\/\/c1\.neweggimages\.com\/productimage\/nb640\/[A-Za-z0-9._-]+\.(jpg|png)/);
      if (match640) return match640[0];
      const match300 = html.match(/https:\/\/c1\.neweggimages\.com\/productimage\/nb300\/[A-Za-z0-9._-]+\.(jpg|png)/);
      if (match300) return match300[0].replace('/nb300/', '/nb640/');
      return null;
    } catch {
      return null;
    }
  }

  /** 브랜드 공식 사이트에서 og:image 가져오기 */
  const BRAND_DOMAINS: Record<string, string> = {
    'wooting':    'https://wooting.io',
    'finalmouse': 'https://finalmouse.com/products',
    'vaxee':      'https://www.vaxee.com/products',
    'lamzu':      'https://lamzu.com/products',
    'pulsar':     'https://www.pulsargg.com/products',
    'ninjutso':   'https://ninjutso.com/products',
    'gwolves':    'https://www.gwolves.com/products',
    'endgame':    'https://www.endgamegear.com/products',
    'xtrfy':      'https://www.xtrfy.com/products',
    'zaopin':     'https://zaopintech.com/products',
    'vxe':        'https://vxegear.com/products',
    'vgn':        'https://vgnkeys.com/products',
    'scyrox':     'https://scyrox.com/products',
  };

  async function fetchManufacturerImage(productName: string): Promise<string | null> {
    const slug = productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const brand = slug.split('-')[0];
    const domain = BRAND_DOMAINS[brand];
    if (!domain) return null;
    try {
      const url = `${domain}/${slug}`;
      const r = await axios.get(url, { timeout: 8000, headers: SCRAPE_HEADERS });
      return extractOgImage(r.data);
    } catch {
      return null;
    }
  }

  app.get("/api/gear-image", async (req, res) => {
    const url = req.query.url as string;
    const name = req.query.name as string | undefined;
    const cacheKey = name || url;
    if (!cacheKey) return res.json({ image: null });

    if (gearImageCache.has(cacheKey)) {
      return res.json({ image: gearImageCache.get(cacheKey) ?? null });
    }

    // Amazon 스크래핑 시도 (URL이 있을 때)
    if (url) {
      try {
        const response = await axios.get(url, {
          timeout: 8000,
          maxRedirects: 10,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
          },
        });

        const html: string = response.data;
        // CAPTCHA 감지 — 즉시 Newegg로 폴백
        if (html.includes('opfcaptcha.amazon.com') || html.includes('validateCaptcha')) {
          // fall through to Newegg
        } else {
          // 1) data-old-hires
          const oldHiresMatch = html.match(/data-old-hires=["'](https:\/\/[^"']+)["']/i);
          if (oldHiresMatch && isProductImage(oldHiresMatch[1])) {
            const img = cleanAmazonImg(oldHiresMatch[1]);
            gearImageCache.set(cacheKey, img);
            return res.json({ image: img });
          }
          // 2) data-a-dynamic-image
          const dynMatch = html.match(/data-a-dynamic-image=["'](\{[^"']+\})["']/i);
          if (dynMatch) {
            try {
              const decoded = dynMatch[1].replace(/&quot;/g, '"');
              const imgMap = JSON.parse(decoded) as Record<string, [number, number]>;
              const best = Object.entries(imgMap)
                .sort(([, [w1]], [, [w2]]) => w2 - w1)
                .find(([imgUrl]) => isProductImage(imgUrl));
              if (best) {
                const img = cleanAmazonImg(best[0]);
                gearImageCache.set(cacheKey, img);
                return res.json({ image: img });
              }
            } catch { /* ignore */ }
          }
          // 3) landingImage src
          const landingMatch = html.match(/id=["']landingImage["'][^>]*src=["'](https:\/\/[^"']+)["']/i)
            ?? html.match(/id=["']imgBlkFront["'][^>]*src=["'](https:\/\/[^"']+)["']/i);
          if (landingMatch && isProductImage(landingMatch[1])) {
            const img = cleanAmazonImg(landingMatch[1]);
            gearImageCache.set(cacheKey, img);
            return res.json({ image: img });
          }
          // 4) og:image
          const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
            ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
          if (ogMatch && isProductImage(ogMatch[1])) {
            const img = cleanAmazonImg(ogMatch[1]);
            gearImageCache.set(cacheKey, img);
            return res.json({ image: img });
          }
          // 5) media-amazon CDN URL
          const cdnMatch = html.match(/https:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9%+._-]+\.jpg/);
          if (cdnMatch) {
            const img = cleanAmazonImg(cdnMatch[0]);
            gearImageCache.set(cacheKey, img);
            return res.json({ image: img });
          }
        }
      } catch { /* fall through to Newegg */ }
    }

    // Newegg 폴백 → Manufacturer 폴백
    if (name) {
      const neweggImg = await fetchNeweggImage(name);
      if (neweggImg) {
        gearImageCache.set(cacheKey, neweggImg);
        return res.json({ image: neweggImg });
      }
      const mfgImg = await fetchManufacturerImage(name);
      gearImageCache.set(cacheKey, mfgImg);
      return res.json({ image: mfgImg });
    }

    gearImageCache.set(cacheKey, null);
    return res.json({ image: null });
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
