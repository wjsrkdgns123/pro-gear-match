import { Router } from "express";
import type admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { slugify } from "../../utils/slug";
import { seoForPro } from "../../utils/seo";

// Server-side OG meta injection for /pro/:slug in production.
//
// Crawlers (Slack, Discord, Twitter, Facebook, Googlebot) don't execute our
// client-side setSEO() on mount, so without this handler they'd see the
// generic index.html OG tags for every shared pro link. This loads the
// built index.html once, rewrites the <title> + og:* + twitter:* per pro,
// and streams it back. Browsers still render the full React app — the
// rewritten meta is purely for scrapers.
export function createProOgRouter(
  siteUrl: string,
  firestore: admin.firestore.Firestore | null,
  distPath: string,
): Router {
  const router = Router();

  const indexPath = path.join(distPath, "index.html");

  // Cache the base HTML — rebuilt per deploy so no TTL needed, but
  // re-read on miss so dev rebuilds don't stale-serve.
  let baseHtml: string | null = null;
  function loadHtml(): string {
    if (baseHtml) return baseHtml;
    try {
      baseHtml = fs.readFileSync(indexPath, "utf8");
      return baseHtml;
    } catch {
      return "";
    }
  }

  // Per-slug OG cache so crawler storms don't hammer Firestore.
  const metaCache = new Map<string, { html: string; ts: number }>();
  const META_TTL_MS = 30 * 60 * 1000;

  function escapeHtml(s: string): string {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function replaceOrInsertHead(html: string, newTags: string): string {
    // Strip any existing meta/link/title we're about to re-inject so we don't
    // end up with duplicates that crawlers read inconsistently.
    let out = html
      .replace(/<title>[\s\S]*?<\/title>/i, "")
      .replace(
        /<meta\s+(?:name|property)=["'](?:description|og:[^"']+|twitter:[^"']+)["'][^>]*>\s*/gi,
        "",
      )
      .replace(/<link\s+rel=["']canonical["'][^>]*>\s*/gi, "");
    return out.replace(/<\/head>/i, `${newTags}\n</head>`);
  }

  router.get("/pro/:slug", async (req, res, next) => {
    if (!firestore) return next();
    const { slug } = req.params;
    if (!slug) return next();

    const now = Date.now();
    const cached = metaCache.get(slug);
    if (cached && now - cached.ts < META_TTL_MS) {
      return res.type("html").send(cached.html);
    }

    const html = loadHtml();
    if (!html) return next();

    try {
      // Match client-side logic: slug is slugify(name), but Firestore stores
      // name not slug, so scan per game (small, cached by Firestore driver).
      const games = ["Valorant", "CS2", "Overwatch 2", "Apex Legends"];
      let pro: {
        name: string;
        team?: string;
        game?: string;
        settings?: { edpi?: number };
        gear?: { mouse?: string };
      } | null = null;
      for (const game of games) {
        const snap = await firestore
          .collection("progamers")
          .where("game", "==", game)
          .get();
        snap.forEach((d) => {
          if (pro) return;
          const data = d.data() as { name?: string };
          if (data.name && slugify(data.name) === slug) {
            pro = { ...(d.data() as Record<string, unknown>), name: data.name } as typeof pro;
          }
        });
        if (pro) break;
      }

      if (!pro) return next();

      // Accept-Language header → rough lang heuristic for the meta copy.
      const accept = String(req.headers["accept-language"] || "").toLowerCase();
      const lang: "en" | "ko" = accept.startsWith("ko") ? "ko" : "en";

      const p = pro as {
        name: string;
        team?: string;
        game?: string;
        settings?: { edpi?: number };
        gear?: { mouse?: string };
      };
      const meta = seoForPro(
        p.name,
        p.team || "",
        p.game || "",
        p.settings?.edpi || 0,
        p.gear?.mouse || "",
        lang,
      );
      const fullTitle = `${meta.title} | ProGear Match`;
      const canonical = `${siteUrl}/pro/${slug}`;
      const image = `${siteUrl}/favicon-512.png`;

      const tags = [
        `<title>${escapeHtml(fullTitle)}</title>`,
        `<link rel="canonical" href="${escapeHtml(canonical)}">`,
        meta.description
          ? `<meta name="description" content="${escapeHtml(meta.description)}">`
          : "",
        `<meta property="og:title" content="${escapeHtml(fullTitle)}">`,
        meta.description
          ? `<meta property="og:description" content="${escapeHtml(meta.description)}">`
          : "",
        `<meta property="og:type" content="profile">`,
        `<meta property="og:url" content="${escapeHtml(canonical)}">`,
        `<meta property="og:site_name" content="ProGear Match">`,
        `<meta property="og:image" content="${escapeHtml(image)}">`,
        `<meta name="twitter:card" content="summary_large_image">`,
        `<meta name="twitter:title" content="${escapeHtml(fullTitle)}">`,
        meta.description
          ? `<meta name="twitter:description" content="${escapeHtml(meta.description)}">`
          : "",
        `<meta name="twitter:image" content="${escapeHtml(image)}">`,
      ]
        .filter(Boolean)
        .join("\n    ");

      const out = replaceOrInsertHead(html, `    ${tags}`);
      metaCache.set(slug, { html: out, ts: now });
      res.type("html").send(out);
    } catch (e) {
      console.warn("proOg: lookup failed for", slug, e);
      next();
    }
  });

  return router;
}
