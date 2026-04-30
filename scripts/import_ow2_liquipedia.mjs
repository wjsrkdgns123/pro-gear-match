// One-off script: scrape Liquipedia OW2 hardware list → import to Firestore
// Usage: node scripts/import_ow2_liquipedia.mjs
import * as cheerio from 'cheerio';
import admin from 'firebase-admin';
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// ── Firebase init ───────────────────────────────────────────────────────────
const saPath = path.join(__dirname, '..', 'service-account.json');
const sa = JSON.parse(fs.readFileSync(saPath, 'utf8'));
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(sa) });
}
const db = admin.firestore();
db.settings({ databaseId: 'ai-studio-6d824db4-a574-4a12-be39-0476107b494a' });

// ── DB players already present (skip these) ─────────────────────────────────
const DB_PLAYERS = new Set([
  'AimGod','AlphaYi','Aspire','Backbone','BenBest','birdring','cal','Carpe','chase',
  'Checkmate','ChiYo','Chorong','Crimzo','Donghun','Fearless','Fielder','Flora',
  'FunnyAstro','Glister','Guxue','Hadi','HanBin','Harbleu','Hawk','HeeSang','Heesu',
  'Hybrid','Hydron','infekted','Infekted','IR1S','Izayaki','JinMu','JJoNaK','Junbin',
  'Kai','kevster','knife','Ksaa','Landon','Lastro','LBBD7','leave','Leave','LeeJaeGon',
  'Lengsa','Lethal','LIP','Lyar','Mag','Masaa','max','Mer1t','Mmonk','MuZe','nero',
  'Patiphan','Pelican','pge','Piggy','Proper','Prophet','proud','Quartz','rakattack',
  'Rakattack','Rawkus','Rupal','sauceror','Sayaplayer','seeker','Shax','Shu','shu',
  'Shy','SirMajed','Skairipa','skewed','Someone','SoOn','SP9RK1E','SparkR','Stalk3r',
  'sugarfree','Sugarfree','ta1yo','UV','Vega','Vigilante','vigilante','Viol2t','Viper',
  'Void','XepheR','Xzi','Xzite','Yaki','Youbi','Zest',
]);

// ── Fetch & parse ────────────────────────────────────────────────────────────
console.log('Fetching Liquipedia hardware list...');
const res = await fetch('https://liquipedia.net/overwatch/List_of_player_hardware', {
  headers: { 'User-Agent': 'ProGearMatch-Research-Bot/1.0' }
});
const html = await res.text();
const $ = cheerio.load(html);

const players = [];
$('table.wikitable tbody tr').each((_, row) => {
  const cells = $(row).find('td');
  if (cells.length < 11) return;

  const nameEl = $(cells[1]).find('a').first();
  const name = nameEl.text().trim();
  const profileSlug = nameEl.attr('href')?.split('/overwatch/')?.[1] || encodeURIComponent(name);

  const teamImg = $(cells[2]).find('img').first().attr('alt')?.trim();
  const teamLink = $(cells[2]).find('a').first().attr('title')?.trim();
  const team = teamImg || teamLink || '';

  if (!name || !team) return;
  if (DB_PLAYERS.has(name)) return;

  const mouse    = $(cells[4]).text().trim();
  const mousepad = $(cells[6]).text().trim();
  const keyboard = $(cells[8]).text().trim();
  const monitor  = $(cells[10]).text().trim();

  if (!mouse && !keyboard) return;

  players.push({
    name,
    team,
    game: 'Overwatch 2',
    gear: { mouse, keyboard, monitor, mousepad },
    settings: { dpi: 0, sensitivity: 0, edpi: 0 },
    source: 'liquipedia.net',
    profileUrl: `https://liquipedia.net/overwatch/${profileSlug}`,
  });
});

console.log(`Found ${players.length} new players to import.`);

// ── Import to Firestore ──────────────────────────────────────────────────────
let imported = 0;
let skipped = 0;

for (const player of players) {
  const gameId = player.game.toLowerCase().replace(/\s+/g, '_');
  const playerId = `${gameId}_${player.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  const ref = db.collection('pro-gamers').doc(playerId);
  const snap = await ref.get();
  if (snap.exists) {
    console.log(`  SKIP (already exists): ${player.name}`);
    skipped++;
    continue;
  }
  await ref.set({
    ...player,
    updatedAt: new Date().toISOString(),
  });
  console.log(`  ✓ ${player.name} (${player.team})`);
  imported++;
}

console.log(`\nDone. Imported: ${imported}, Skipped: ${skipped}`);
process.exit(0);
