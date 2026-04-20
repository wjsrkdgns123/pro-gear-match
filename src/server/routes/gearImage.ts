import { Router } from "express";
import axios from "axios";

// Gear product image scraper: Amazon first, then Newegg, then the brand's
// official product page. Results are cached in-process by name|url.
export function createGearImageRouter(): Router {
  const router = Router();
  const gearImageCache = new Map<string, string | null>();

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

    if (gearImageCache.has(cacheKey)) {
      return res.json({ image: gearImageCache.get(cacheKey) ?? null });
    }

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
        // CAPTCHA — fall through to Newegg below
        if (!(html.includes("opfcaptcha.amazon.com") || html.includes("validateCaptcha"))) {
          const oldHiresMatch = html.match(/data-old-hires=["'](https:\/\/[^"']+)["']/i);
          if (oldHiresMatch && isProductImage(oldHiresMatch[1])) {
            const img = cleanAmazonImg(oldHiresMatch[1]);
            gearImageCache.set(cacheKey, img);
            return res.json({ image: img });
          }
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
            } catch {
              /* ignore */
            }
          }
          const landingMatch =
            html.match(/id=["']landingImage["'][^>]*src=["'](https:\/\/[^"']+)["']/i) ??
            html.match(/id=["']imgBlkFront["'][^>]*src=["'](https:\/\/[^"']+)["']/i);
          if (landingMatch && isProductImage(landingMatch[1])) {
            const img = cleanAmazonImg(landingMatch[1]);
            gearImageCache.set(cacheKey, img);
            return res.json({ image: img });
          }
          const ogMatch =
            html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ??
            html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
          if (ogMatch && isProductImage(ogMatch[1])) {
            const img = cleanAmazonImg(ogMatch[1]);
            gearImageCache.set(cacheKey, img);
            return res.json({ image: img });
          }
          const cdnMatch = html.match(
            /https:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9%+._-]+\.jpg/,
          );
          if (cdnMatch) {
            const img = cleanAmazonImg(cdnMatch[0]);
            gearImageCache.set(cacheKey, img);
            return res.json({ image: img });
          }
        }
      } catch {
        /* fall through */
      }
    }

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

  return router;
}
