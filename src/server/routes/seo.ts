import { Router } from "express";
import type admin from "firebase-admin";
import { slugify } from "../../utils/slug";

// Router factory for robots.txt + sitemap.xml
// siteUrl: base canonical URL
// firestore: optional admin Firestore instance; when null, sitemap is static only
export function createSeoRouter(
  siteUrl: string,
  firestore: admin.firestore.Firestore | null,
): Router {
  const router = Router();

  // Simple in-memory cache for the sitemap (rebuild every 6h)
  let sitemapCache: { xml: string; ts: number } | null = null;
  const SITEMAP_TTL_MS = 6 * 60 * 60 * 1000;

  router.get("/robots.txt", (_req, res) => {
    res.type("text/plain").send(
      [
        "User-agent: *",
        "Allow: /",
        "Disallow: /api/",
        "",
        `Sitemap: ${siteUrl}/sitemap.xml`,
        "",
      ].join("\n"),
    );
  });

  router.get("/sitemap.xml", async (_req, res) => {
    if (sitemapCache && Date.now() - sitemapCache.ts < SITEMAP_TTL_MS) {
      return res.type("application/xml").send(sitemapCache.xml);
    }

    const staticPaths = [
      { loc: "/", changefreq: "daily", priority: "1.0" },
      { loc: "/how-it-works", changefreq: "monthly", priority: "0.8" },
      { loc: "/about", changefreq: "monthly", priority: "0.6" },
      { loc: "/affiliate-disclosure", changefreq: "yearly", priority: "0.4" },
      { loc: "/privacy", changefreq: "yearly", priority: "0.3" },
      { loc: "/terms", changefreq: "yearly", priority: "0.3" },
    ];
    const today = new Date().toISOString().slice(0, 10);
    const rows: string[] = staticPaths.map(
      (p) =>
        `  <url><loc>${siteUrl}${p.loc}</loc><lastmod>${today}</lastmod><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`,
    );

    if (firestore) {
      try {
        const games = ["Valorant", "CS2", "Overwatch 2", "Apex Legends"];
        const seen = new Set<string>();
        for (const game of games) {
          const snap = await firestore
            .collection("progamers")
            .where("game", "==", game)
            .get();
          snap.forEach((d) => {
            const data = d.data() as { name?: string };
            if (!data.name) return;
            const slug = slugify(data.name);
            if (!slug || seen.has(slug)) return;
            seen.add(slug);
            rows.push(
              `  <url><loc>${siteUrl}/pro/${slug}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`,
            );
          });
        }
      } catch (e) {
        console.warn("Dynamic sitemap pro fetch failed:", e);
      }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rows.join("\n")}
</urlset>`;
    sitemapCache = { xml, ts: Date.now() };
    res.type("application/xml").send(xml);
  });

  return router;
}
