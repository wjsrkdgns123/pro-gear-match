import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cookieSession from "cookie-session";
import axios from "axios";
import dotenv from "dotenv";

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

  // Microsoft OAuth Config
  const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID;
  const MICROSOFT_CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET;
  const REDIRECT_URI = `${process.env.APP_URL}/api/auth/microsoft/callback`;

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
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
