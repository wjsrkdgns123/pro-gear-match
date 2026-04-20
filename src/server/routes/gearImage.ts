import { Router } from "express";
import axios from "axios";
import fs from "fs";
import path from "path";
import { slugify } from "../../utils/slug";

// Gear product image scraper: Amazon first, then Newegg, then the brand's
// official product page. Images are downloaded once and saved under
// public/gear-images/ so the client can load them straight from our CDN
// without re-hitting the upstream site.
export function createGearImageRouter(): Router {
  const router = Router();

  // Directory where downloaded images live. Served statically from /public.
  const IMAGE_DIR = path.join(process.cwd(), "public", "gear-images");
  const PUBLIC_PREFIX = "/gear-images";
  try {
    fs.mkdirSync(IMAGE_DIR, { recursive: true });
  } catch (e) {
    console.warn("gear-images mkdir failed:", e);
  }

  // key (name or url slug) -> public path or null (tried, nothing found)
  const gearImageCache = new Map<string, string | null>();

  /** Derive an extension from a URL path; default to .jpg for unknowns. */
  function extFromUrl(u: string): string {
    const m = u.split("?")[0].match(/\.(jpe?g|png|webp|gif|avif)$/i);
    if (!m) return ".jpg";
    return "." + m[1].toLowerCase().replace("jpeg", "jpg");
  }

  /** Look for an already-persisted file under any common extension. */
  function existingFileFor(slug: string): string | null {
    for (const ext of [".jpg", ".png", ".webp", ".gif", ".avif"]) {
      const p = path.join(IMAGE_DIR, slug + ext);
      if (fs.existsSync(p)) return `${PUBLIC_PREFIX}/${slug}${ext}`;
    }
    return null;
  }

  /**
   * Download `remoteUrl` to public/gear-images/<slug><ext> and return the
   * public path. On any failure returns the original remote URL so the
   * browser still has a chance to render something.
   */
  async function persistImage(remoteUrl: string, cacheKey: string): Promise<string> {
    const slug = slugify(cacheKey) || "img-" + Date.now().toString(36);
    const ext = extFromUrl(remoteUrl);
    const filename = slug + ext;
    const filePath = path.join(IMAGE_DIR, filename);
    const publicPath = `${PUBLIC_PREFIX}/${filename}`;

    // Already saved — skip the network round-trip
    if (fs.existsSync(filePath)) return publicPath;

    try {
      const resp = await axios.get<ArrayBuffer>(remoteUrl, {
        responseType: "arraybuffer",
        timeout: 10000,
        maxContentLength: 5 * 1024 * 1024,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept: "image/webp,image/avif,image/*,*/*;q=0.8",
          Referer: remoteUrl,
        },
      });
      fs.writeFileSync(filePath, Buffer.from(resp.data));
      return publicPath;
    } catch (e) {
      console.warn("persistImage failed, falling back to remote:", cacheKey, (e as Error).message);
      return remoteUrl;
    }
  }

  /** Normalize media-amazon URLs back to a clean ._AC_SL500_.jpg */
  function cleanAmazonImg(raw: string): string {
    return raw
      .replace(/\._[A-Z0-9,_]+_\./, ".")
      .replace(/\.jpg$/, "._AC_SL500_.jpg");
  }

  /** Exclude Amazon chrome (favicon, sprites) from product-image matches */
  function isProductImage(imgUrl: string): boolean {
    if (!imgUrl.startsWith("http")) return false;
    if (imgUrl.includes("amazon.com/favicon") || imgUrl.includes("/g/")) return false;
    if (imgUrl.includes("media-amazon.com/images/I/")) return true;
    if (imgUrl.includes("images-na.ssl-images-amazon.com/images/I/")) return true;
    if (imgUrl.includes("images-eu.ssl-images-amazon.com/images/I/")) return true;
    return false;
  }

  const SCRAPE_HEADERS = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
  };

  function extractOgImage(html: string): string | null {
    const m =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ??
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    if (!m) return null;
    const url = m[1];
    if (
      url.startsWith("http") &&
      !url.includes("default-thumbnail") &&
      !url.includes("placeholder")
    )
      return url;
    return null;
  }

  async function fetchNeweggImage(productName: string): Promise<string | null> {
    try {
      const r = await axios.get(
        `https://www.newegg.com/p/pl?d=${encodeURIComponent(productName)}`,
        { timeout: 10000, headers: SCRAPE_HEADERS },
      );
      const html: string = r.data;
      const match640 = html.match(
        /https:\/\/c1\.neweggimages\.com\/productimage\/nb640\/[A-Za-z0-9._-]+\.(jpg|png)/,
      );
      if (match640) return match640[0];
      const match300 = html.match(
        /https:\/\/c1\.neweggimages\.com\/productimage\/nb300\/[A-Za-z0-9._-]+\.(jpg|png)/,
      );
      if (match300) return match300[0].replace("/nb300/", "/nb640/");
      return null;
    } catch {
      return null;
    }
  }

  const BRAND_DOMAINS: Record<string, string> = {
    wooting: "https://wooting.io",
    finalmouse: "https://finalmouse.com/products",
    vaxee: "https://www.vaxee.com/products",
    lamzu: "https://lamzu.com/products",
    pulsar: "https://www.pulsargg.com/products",
    ninjutso: "https://ninjutso.com/products",
    gwolves: "https://www.gwolves.com/products",
    endgame: "https://www.endgamegear.com/products",
    xtrfy: "https://www.xtrfy.com/products",
    zaopin: "https://zaopintech.com/products",
    vxe: "https://vxegear.com/products",
    vgn: "https://vgnkeys.com/products",
    scyrox: "https://scyrox.com/products",
  };

  async function fetchManufacturerImage(productName: string): Promise<string | null> {
    const slug = productName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const brand = slug.split("-")[0];
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

  router.get("/gear-image", async (req, res) => {
    const url = req.query.url as string;
    const name = req.query.name as string | undefined;
    const cacheKey = name || url;
    if (!cacheKey) return res.json({ image: null });

    // In-memory cache first
    if (gearImageCache.has(cacheKey)) {
      return res.json({ image: gearImageCache.get(cacheKey) ?? null });
    }

    // Disk cache second — survives process restarts
    const diskHit = existingFileFor(slugify(cacheKey));
    if (diskHit) {
      gearImageCache.set(cacheKey, diskHit);
      return res.json({ image: diskHit });
    }

    // Helper: persist + cache + respond
    const hit = async (remote: string) => {
      const local = await persistImage(remote, cacheKey);
      gearImageCache.set(cacheKey, local);
      return res.json({ image: local });
    };

    // Amazon first (only when URL is supplied)
    if (url) {
      try {
        const response = await axios.get(url, {
          timeout: 8000,
          maxRedirects: 10,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
          },
        });

        const html: string = response.data;
        if (!(html.includes("opfcaptcha.amazon.com") || html.includes("validateCaptcha"))) {
          const oldHiresMatch = html.match(/data-old-hires=["'](https:\/\/[^"']+)["']/i);
          if (oldHiresMatch && isProductImage(oldHiresMatch[1])) {
            return hit(cleanAmazonImg(oldHiresMatch[1]));
          }
          const dynMatch = html.match(/data-a-dynamic-image=["'](\{[^"']+\})["']/i);
          if (dynMatch) {
            try {
              const decoded = dynMatch[1].replace(/&quot;/g, '"');
              const imgMap = JSON.parse(decoded) as Record<string, [number, number]>;
              const best = Object.entries(imgMap)
                .sort(([, [w1]], [, [w2]]) => w2 - w1)
                .find(([imgUrl]) => isProductImage(imgUrl));
              if (best) return hit(cleanAmazonImg(best[0]));
            } catch {
              /* ignore */
            }
          }
          const landingMatch =
            html.match(/id=["']landingImage["'][^>]*src=["'](https:\/\/[^"']+)["']/i) ??
            html.match(/id=["']imgBlkFront["'][^>]*src=["'](https:\/\/[^"']+)["']/i);
          if (landingMatch && isProductImage(landingMatch[1])) {
            return hit(cleanAmazonImg(landingMatch[1]));
          }
          const ogMatch =
            html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ??
            html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
          if (ogMatch && isProductImage(ogMatch[1])) {
            return hit(cleanAmazonImg(ogMatch[1]));
          }
          const cdnMatch = html.match(
            /https:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9%+._-]+\.jpg/,
          );
          if (cdnMatch) return hit(cleanAmazonImg(cdnMatch[0]));
        }
      } catch {
        /* fall through */
      }
    }

    if (name) {
      const neweggImg = await fetchNeweggImage(name);
      if (neweggImg) return hit(neweggImg);
      const mfgImg = await fetchManufacturerImage(name);
      if (mfgImg) return hit(mfgImg);
    }

    gearImageCache.set(cacheKey, null);
    return res.json({ image: null });
  });

  return router;
}
