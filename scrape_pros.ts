import Anthropic from "@anthropic-ai/sdk";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" });

async function scrape(url: string) {
  try {
    const pageResponse = await axios.get(url, {
      timeout: 10000,
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      maxContentLength: 500000,
    });
    const html = String(pageResponse.data).slice(0, 80000);

    const message = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Extract pro gamer information from this page HTML.
Return ONLY a valid JSON object with this exact shape (no explanation, no markdown):
{
  "name": "<player nickname only>",
  "team": "<team name>",
  "game": "<game name>",
  "imageUrl": "<player image URL or null>",
  "teamLogoUrl": "<team logo URL or null>",
  "profileUrl": "${url}",
  "gear": {
    "mouse": "<mouse model or null>",
    "keyboard": "<keyboard model or null>",
    "monitor": "<monitor model or null>",
    "mousepad": "<mousepad model or null>"
  },
  "settings": {
    "dpi": <number or null>,
    "sensitivity": <number or null>
  }
}

PAGE HTML:
${html}`,
        },
      ],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Error scraping " + url + ":", error);
  }
  return null;
}

async function main() {
  const urls = [
    "https://prosettings.net/players/boostio/",
    "https://prosettings.net/players/cryocells/",
    "https://prosettings.net/players/eeiu/",
  ];

  const results = [];
  for (const url of urls) {
    const data = await scrape(url);
    if (data) results.push(data);
  }
  console.log(JSON.stringify(results, null, 2));
}

main();
