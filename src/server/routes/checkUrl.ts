import { Router } from "express";
import axios from "axios";
import { errMsg } from "../../utils/errors";
import { UrlQuery, parseOr400 } from "../validators";

// Lightweight URL status probe — HEAD first, fall back to GET.
// Returns { status: number } even for network errors, so callers can reason
// about whether a gear/link target is reachable.
export function createCheckUrlRouter(): Router {
  const router = Router();

  router.get("/check-url", async (req, res) => {
    const parsed = parseOr400(UrlQuery, req.query, res);
    if (!parsed) return;
    const { url } = parsed;

    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    };

    try {
      let status = 0;
      try {
        const headResponse = await axios.head(url, { timeout: 5000, headers });
        status = headResponse.status;
      } catch (e: unknown) {
        const resp = (e as { response?: { status?: number } })?.response;
        if (resp?.status) {
          status = resp.status;
        } else {
          const getResponse = await axios.get(url, { timeout: 5000, headers });
          status = getResponse.status;
        }
      }
      res.json({ status });
    } catch (error: unknown) {
      const resp = (error as { response?: { status?: number } })?.response;
      if (resp?.status) {
        res.json({ status: resp.status });
      } else {
        res.json({ status: 500, error: errMsg(error) });
      }
    }
  });

  return router;
}
