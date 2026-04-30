// Import CS2 pros from prosettings.net → Firestore
// Usage: node scripts/import_cs2_prosettings.mjs
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const saPath = path.join(__dirname, '..', 'service-account.json');
const sa = JSON.parse(fs.readFileSync(saPath, 'utf8'));
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();
db.settings({ databaseId: 'ai-studio-6d824db4-a574-4a12-be39-0476107b494a' });

// Load scraped data
const dataPath = path.join(process.env.USERPROFILE || process.env.HOME, 'Downloads', 'cs2_players.json');
const players = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
console.log(`Loaded ${players.length} players from JSON`);

// Fetch existing CS2 players from DB
console.log('Fetching existing CS2 players from DB...');
const snap = await db.collection('pro-gamers').where('game', '==', 'CS2').get();
const existingByName = new Map();
snap.forEach(doc => existingByName.set(doc.data().name, doc));
console.log(`  ${existingByName.size} existing CS2 players in DB`);

const newPlayers   = players.filter(p => !existingByName.has(p.name));
const updatePlayers = players.filter(p => existingByName.has(p.name));
console.log(`  ${newPlayers.length} new | ${updatePlayers.length} to update\n`);

// ── Import new players ────────────────────────────────────────────────────────
let imported = 0, errors = 0;
const BATCH_SIZE = 400;
let batch = db.batch();
let batchCount = 0;

const flush = async () => {
  if (batchCount > 0) {
    await batch.commit();
    console.log(`  Committed ${batchCount} writes`);
    batch = db.batch();
    batchCount = 0;
  }
};

for (const p of newPlayers) {
  const playerId = `cs2_${p.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  const ref = db.collection('pro-gamers').doc(playerId);
  batch.set(ref, {
    name:  p.name,
    team:  p.team,
    game:  'CS2',
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
    nationality: p.country || '',
    source:      'prosettings.net',
    profileUrl:  p.profileUrl || '',
    updatedAt:   new Date().toISOString(),
  });
  batchCount++;
  imported++;
  if (batchCount >= BATCH_SIZE) await flush();
}
await flush();

// ── Update existing players ───────────────────────────────────────────────────
let updated = 0;
for (const p of updatePlayers) {
  const docSnap = existingByName.get(p.name);
  const data = docSnap.data();
  batch.update(docSnap.ref, {
    team:             p.team     || data.team,
    'gear.mouse':     p.mouse    || data.gear?.mouse    || '',
    'gear.keyboard':  p.keyboard || data.gear?.keyboard || '',
    'gear.monitor':   p.monitor  || data.gear?.monitor  || '',
    'gear.mousepad':  p.mousepad || data.gear?.mousepad || '',
    'settings.dpi':         p.dpi  || data.settings?.dpi  || 0,
    'settings.sensitivity': p.sens || data.settings?.sensitivity || 0,
    'settings.edpi':        p.edpi || data.settings?.edpi || 0,
    updatedAt: new Date().toISOString(),
  });
  batchCount++;
  updated++;
  if (batchCount >= BATCH_SIZE) await flush();
}
await flush();

console.log(`\nDone.`);
console.log(`  Imported: ${imported}`);
console.log(`  Updated:  ${updated}`);
console.log(`  Errors:   ${errors}`);
process.exit(0);
