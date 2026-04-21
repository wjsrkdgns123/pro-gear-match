import { z } from "zod";
import type { Request, Response, NextFunction } from "express";

// Shared input validation for server routes.
//
// Goals:
// - Reject malformed payloads with a consistent 400 shape {error, issues}
// - Block SSRF: disallow non-http(s) schemes + RFC1918 / loopback / link-local
//   hosts for any URL a handler will itself fetch from
// - Constrain AI inputs so a hostile caller can't burn tokens with huge prompts

const PRIVATE_IP_RE =
  /^(?:10\.|127\.|0\.|169\.254\.|172\.(?:1[6-9]|2\d|3[01])\.|192\.168\.|::1|fc|fd|fe80)/i;

const BLOCKED_HOSTS = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata.google.internal",
  "metadata.goog",
]);

/** Public http(s) URL, with SSRF blocklist on host. */
export const safeUrl = z
  .string()
  .trim()
  .min(1)
  .max(2048)
  .url()
  .refine(
    (s) => {
      try {
        const u = new URL(s);
        if (u.protocol !== "http:" && u.protocol !== "https:") return false;
        const host = u.hostname.toLowerCase();
        if (BLOCKED_HOSTS.has(host)) return false;
        if (PRIVATE_IP_RE.test(host)) return false;
        return true;
      } catch {
        return false;
      }
    },
    { message: "URL must be a public http(s) address" },
  );

export const GameEnum = z.enum([
  "Valorant",
  "CS2",
  "Overwatch 2",
  "Apex Legends",
]);

// Claude routes
export const ScrapeBody = z.object({ url: safeUrl });

export const HighlightsBody = z.object({
  playerName: z.string().trim().min(1).max(100),
  game: z.string().trim().min(1).max(50),
});

export const ChatBody = z.object({
  system: z.string().max(4000).optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(8000),
      }),
    )
    .min(1)
    .max(30),
});

// Microsoft
export const MsCallbackQuery = z.object({
  code: z.string().min(1).max(4096),
});

export const ExcelQuery = z.object({ url: safeUrl });

// check-url / gear-image
export const UrlQuery = z.object({ url: safeUrl });

export const GearImageQuery = z
  .object({
    url: safeUrl.optional(),
    name: z.string().trim().min(1).max(200).optional(),
  })
  .refine((v) => !!(v.url || v.name), {
    message: "Either url or name is required",
  });

/** Run a Zod schema against a source; on failure send 400 and return null. */
export function parseOr400<T>(
  schema: z.ZodType<T>,
  source: unknown,
  res: Response,
): T | null {
  const r = schema.safeParse(source);
  if (r.success) return r.data;
  // Include a stable `code` per issue so the client can translate while
  // still surfacing the raw message for server-side logs.
  res.status(400).json({
    error: "Invalid request",
    code: "invalid_request",
    issues: r.error.issues.map((i) => ({
      path: i.path.join("."),
      code: i.code, // e.g. "invalid_type", "too_small", "custom"
      message: i.message,
    })),
  });
  return null;
}

// Unused — kept for future middleware-style usage
export function _validateBody<T>(schema: z.ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const r = schema.safeParse(req.body);
    if (!r.success) {
      return res.status(400).json({ error: "Invalid request", issues: r.error.issues });
    }
    req.body = r.data;
    next();
  };
}
