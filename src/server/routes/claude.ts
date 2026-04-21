import { Router } from "express";
import axios from "axios";
import type Anthropic from "@anthropic-ai/sdk";
import { errMsg } from "../../utils/errors";
import {
  ChatBody,
  HighlightsBody,
  ScrapeBody,
  parseOr400,
} from "../validators";

// Router factory for Claude-backed endpoints: scrape, highlights, chat.
// anthropic may be null when ANTHROPIC_API_KEY is missing — each handler
// returns 500 in that case.
export function createClaudeRouter(anthropic: Anthropic | null): Router {
  const router = Router();

  // Scrape: fetch URL, strip noise, let Claude extract pro gamer info
  router.post("/scrape", async (req, res) => {
    const parsed = parseOr400(ScrapeBody, req.body, res);
    if (!parsed) return;
    const { url } = parsed;
    if (!anthropic) return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });

    try {
      const pageResponse = await axios.get(url, {
        timeout: 10000,
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
        maxContentLength: 500000,
      });

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

      // If mouse missing but controller present, mirror into other gear slots
      if (data.gear && !data.gear.mouse && data.gear.controller) {
        data.gear.mouse = data.gear.controller;
        data.gear.keyboard = data.gear.controller;
        data.gear.mousepad = data.gear.controller;
      }

      res.json(data);
    } catch (error: unknown) {
      const msg = errMsg(error);
      console.error("Claude Scrape Error:", msg);
      res.status(500).json({ error: msg });
    }
  });

  // Highlights: ask Claude for 3 YouTube highlight videos for a pro gamer
  router.post("/highlights", async (req, res) => {
    const parsed = parseOr400(HighlightsBody, req.body, res);
    if (!parsed) return;
    const { playerName, game } = parsed;
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
    } catch (error: unknown) {
      const msg = errMsg(error);
      console.error("Claude Highlights Error:", msg);
      res.status(500).json({ error: msg });
    }
  });

  // Generic chat passthrough
  router.post("/chat", async (req, res) => {
    const parsed = parseOr400(ChatBody, req.body, res);
    if (!parsed) return;
    const { messages, system } = parsed;
    if (!anthropic) {
      return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });
    }

    try {
      const response = await anthropic.messages.create({
        model: "claude-opus-4-6",
        max_tokens: 1024,
        system: system || "You are a helpful assistant.",
        messages,
      });
      res.json(response);
    } catch (error: unknown) {
      const msg = errMsg(error);
      console.error("Claude API Error:", error);
      res.status(500).json({ error: msg || "Failed to call Claude API" });
    }
  });

  return router;
}
