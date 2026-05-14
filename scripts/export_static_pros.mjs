// Build-time: export all pro-gamers to public/data/pros-{game}.json so the
// site can serve player data without hitting Firestore on every visit.
// Run before vite build. Falls back gracefully if service-account.json is
// missing (e.g. on Cloudflare CI) — uses the previously-exported JSON.
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SA_PATH = path.join(__dirname, '..', 'service-account.json');
const OUT_DIR = path.join(__dirname, '..', 'public', 'data');

const GAMES = ['Valorant', 'CS2', 'Overwatch 2', 'Apex Legends'];

if (!fs.existsSync(SA_PATH)) {
  console.log('[export_static_pros] service-account.json not found — skipping (using existing JSON if any).');
  process.exit(0);
}

const sa = JSON.parse(fs.readFileSync(SA_PATH, 'utf8'));
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();
db.settings({ databaseId: 'ai-studio-6d824db4-a574-4a12-be39-0476107b494a' });

fs.mkdirSync(OUT_DIR, { recursive: true });

const allSnap = await db.collection('pro-gamers').get();
console.log(`[export_static_pros] read ${allSnap.size} docs from Firestore`);

const byGame = new Map();
for (const game of GAMES) byGame.set(game, []);

for (const docSnap of allSnap.docs) {
  const data = docSnap.data();
  const game = data.game;
  if (!byGame.has(game)) continue;
  byGame.get(game).push({
    id: docSnap.id,
    name: data.name || '',
    team: data.team || '',
    country: data.country || '',
    game,
    settings: data.settings || {},
    gear: data.gear || {},
    profileUrl: data.profileUrl || '',
    edpi: data.edpi ?? null,
  });
}

let total = 0;
for (const [game, list] of byGame) {
  const slug = game.toLowerCase().replace(/\s+/g, '-');
  const file = path.join(OUT_DIR, `pros-${slug}.json`);
  fs.writeFileSync(file, JSON.stringify(list));
  console.log(`  wrote ${list.length} ${game} pros → public/data/pros-${slug}.json`);
  total += list.length;
}

// Write a manifest with timestamp so the client can detect staleness.
fs.writeFileSync(
  path.join(OUT_DIR, 'manifest.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), total }, null, 2)
);
console.log(`[export_static_pros] done. ${total} pros exported.`);
process.exit(0);
