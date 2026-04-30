// Import Valorant pros from prosettings.net → Firestore
// Usage: node scripts/import_valorant_prosettings.mjs
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Firebase init ────────────────────────────────────────────────────────────
const saPath = path.join(__dirname, '..', 'service-account.json');
const sa = JSON.parse(fs.readFileSync(saPath, 'utf8'));
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(sa) });
}
const db = admin.firestore();
db.settings({ databaseId: 'ai-studio-6d824db4-a574-4a12-be39-0476107b494a' });

// ── Load player data (scraped via browser from prosettings.net) ──────────────
const dataPath = path.join(process.env.USERPROFILE || process.env.HOME, 'Downloads', 'valorant_players.json');
const players = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
console.log(`Loaded ${players.length} players from JSON`);

// ── Fetch existing DB players ────────────────────────────────────────────────
console.log('Fetching existing Valorant players from DB...');
const snap = await db.collection('pro-gamers').where('game', '==', 'Valorant').get();
const DB_PLAYERS = new Set();
snap.forEach(doc => DB_PLAYERS.add(doc.data().name));
console.log(`  ${DB_PLAYERS.size} existing players in DB`);

const newPlayers = players.filter(p => p.name && p.team && !DB_PLAYERS.has(p.name));
console.log(`  ${newPlayers.length} new players to import\n`);

// ── Import to Firestore ──────────────────────────────────────────────────────
let imported = 0, skipped = 0, errors = 0;

for (const p of newPlayers) {
  const playerId = `valorant_${p.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  const ref = db.collection('pro-gamers').doc(playerId);
  const existing = await ref.get();
  if (existing.exists) {
    skipped++;
    continue;
  }
  try {
    await ref.set({
      name: p.name,
      team: p.team,
      game: 'Valorant',
      gear: {
        mouse:    p.mouse    || '',
        keyboard: p.keyboard || '',
        monitor:  p.monitor  || '',
        mousepad: p.mousepad || '',
      },
      settings: {
        dpi:         p.dpi  || 0,
        sensitivity: p.sens || 0,
        edpi:        p.edpi || 0,
      },
      source:     'prosettings.net',
      profileUrl: p.profileUrl || '',
      updatedAt:  new Date().toISOString(),
    });
    console.log(`  ✓ ${p.name} (${p.team})`);
    imported++;
  } catch (e) {
    console.error(`  ✗ ${p.name}: ${e.message}`);
    errors++;
  }
}

console.log(`\nDone. Imported: ${imported}, Skipped: ${skipped}, Errors: ${errors}`);
process.exit(0);
