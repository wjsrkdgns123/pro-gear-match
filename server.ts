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
import { createProOgRouter } from "./src/server/routes/proOg";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3010;

  // Security headers.
  //
  // CSP is intentionally allowlist-based rather than nonce/strict-dynamic:
  // AdSense + Firebase Auth popup + YouTube embed all inject inline scripts
  // we don't control, so a strict policy would break them. The explicit
  // host list still blocks arbitrary third-party scripts and data exfil
  // (connect-src), which is the 90%-of-the-value part of CSP.
  const GOOGLE_SCRIPTS = [
    "https://pagead2.googlesyndication.com",
    "https://googleads.g.doubleclick.net",
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://apis.google.com",
    "https://accounts.google.com",
    "https://www.gstatic.com",
  ];
  const FIREBASE_CONNECT = [
    "https://*.googleapis.com",
    "https://*.firebaseio.com",
    "https://*.firebaseinstallations.googleapis.com",
    "https://identitytoolkit.googleapis.com",
    "https://securetoken.googleapis.com",
    "https://firestore.googleapis.com",
  ];
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            // AdSense + GA4 + Firebase Auth inject inline scripts at runtime
            "'unsafe-inline'",
            // AdSense's pagead uses eval inside its anti-abuse checks
            "'unsafe-eval'",
            ...GOOGLE_SCRIPTS,
          ],
          scriptSrcAttr: ["'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
          imgSrc: [
            "'self'",
            "data:",
            "blob:",
            "https:", // gear images come from many CDNs (amazon, newegg, brand sites)
          ],
          connectSrc: [
            "'self'",
            ...FIREBASE_CONNECT,
            "https://www.google-analytics.com",
            "https://region1.google-analytics.com",
            "https://pagead2.googlesyndication.com",
            "https://*.ingest.sentry.io",
            "https://*.ingest.us.sentry.io",
            "https://*.ingest.de.sentry.io",
          ],
          frameSrc: [
            "'self'",
            "https://www.youtube.com",
            "https://youtube.com",
            "https://googleads.g.doubleclick.net",
            "https://accounts.google.com",
            "https://*.firebaseapp.com",
          ],
          workerSrc: ["'self'", "blob:"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          frameAncestors: ["'self'"],
          reportUri: ["/api/csp-report"],
          upgradeInsecureRequests: [],
        },
      },
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
  // CSP violation reports. Browsers POST application/csp-report
  // (sometimes application/reports+json). Accept both shapes and log to
  // stderr so Sentry/Cloud Logging can pick them up.
  app.use(
    "/api/csp-report",
    express.json({ type: ["application/csp-report", "application/reports+json", "application/json"], limit: "64kb" }),
    (req, res) => {
      try {
        const body = req.body;
        const report = body?.["csp-report"] ?? body;
        console.warn("[CSP] violation", JSON.stringify(report));
      } catch {
        /* ignore malformed */
      }
      res.status(204).end();
    },
  );
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
    // Per-pro OG meta rewrite — must come before the SPA catch-all so
    // crawlers get rich previews for shared /pro/:slug URLs.
    app.use("/", createProOgRouter(SITE_URL, firestore, distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
