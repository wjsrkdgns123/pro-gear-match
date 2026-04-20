import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cookieSession from "cookie-session";
import dotenv from "dotenv";
import Anthropic from "@anthropic-ai/sdk";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import admin from "firebase-admin";
import fs from "fs";

import { createSeoRouter } from "./src/server/routes/seo";
import { createClaudeRouter } from "./src/server/routes/claude";
import { createMicrosoftRouter } from "./src/server/routes/microsoft";
import { createCheckUrlRouter } from "./src/server/routes/checkUrl";
import { createGearImageRouter } from "./src/server/routes/gearImage";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3010;

  // Security headers — CSP disabled for now (AdSense/Firebase/YouTube compatibility)
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );

  // Rate limiting: stricter cap on Claude, generic cap on everything else under /api
  const claudeLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many AI requests. Please slow down." },
  });
  const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api/claude", claudeLimiter);
  app.use("/api/", apiLimiter);

  app.use(express.json());
  app.use(express.static(path.join(process.cwd(), "public")));
  app.use(
    cookieSession({
      name: "session",
      keys: [process.env.SESSION_SECRET || "pro-gear-match-secret"],
      maxAge: 24 * 60 * 60 * 1000,
      secure: true,
      sameSite: "none",
    }),
  );

  const anthropic = process.env.ANTHROPIC_API_KEY
    ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    : null;

  const SITE_URL = process.env.APP_URL || "https://progear-match.run.app";

  // Lazy-init firebase-admin (used for the dynamic pro-gamer sitemap).
  // Missing credentials fall back to a static sitemap — not a fatal error.
  let firestore: admin.firestore.Firestore | null = null;
  try {
    if (!admin.apps.length) {
      const saPath = path.join(process.cwd(), "service-account.json");
      if (fs.existsSync(saPath)) {
        const sa = JSON.parse(fs.readFileSync(saPath, "utf8"));
        admin.initializeApp({ credential: admin.credential.cert(sa) });
      } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        admin.initializeApp({
          credential: admin.credential.cert(
            JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT),
          ),
        });
      }
    }
    firestore = admin.apps.length ? admin.firestore() : null;
  } catch (e) {
    console.warn("firebase-admin init failed (sitemap will be static only):", e);
  }

  // Health
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Route composition
  app.use("/", createSeoRouter(SITE_URL, firestore));
  app.use("/api/claude", createClaudeRouter(anthropic));
  app.use(
    "/api",
    createMicrosoftRouter({
      clientId: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      redirectUri: `${process.env.APP_URL}/api/auth/microsoft/callback`,
    }),
  );
  app.use("/api", createCheckUrlRouter());
  app.use("/api", createGearImageRouter());

  // Vite middleware for development; static dist for production
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
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
