// Import Apex Legends pros from Liquipedia (team players only)
// Source: https://liquipedia.net/apexlegends/List_of_player_mouse_settings
// Usage: node scripts/import_apex_liquipedia.mjs
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
const dataPath = path.join(process.env.USERPROFILE || process.env.HOME, 'Downloads', 'apex_liquipedia.json');
const players = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
console.log(`Loaded ${players.length} players from JSON`);

// Fetch existing Apex players from DB
console.log('Fetching existing Apex Legends players from DB...');
const snap = await db.collection('pro-gamers').where('game', '==', 'Apex Legends').get();
const existingNames = new Set();
snap.forEach(doc => existingNames.add(doc.data().name));
console.log(`  ${existingNames.size} existing players in DB`);

const newPlayers = players.filter(p => !existingNames.has(p.name));
const updatePlayers = players.filter(p => existingNames.has(p.name));
console.log(`  ${newPlayers.length} new players to import`);
console.log(`  ${updatePlayers.length} existing players to update\n`);

// Import new players
let imported = 0, updated = 0, errors = 0;

for (const p of newPlayers) {
  const playerId = `apex_${p.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  const ref = db.collection('pro-gamers').doc(playerId);
  try {
    await ref.set({
      name: p.name,
      team: p.team,
      game: 'Apex Legends',
      gear: {
        mouse:    p.mouse    || '',
        keyboard: '',
        monitor:  '',
        mousepad: p.mousepad || '',
      },
      settings: {
        dpi:         p.dpi  || 0,
        sensitivity: p.sens || 0,
        edpi:        p.edpi || 0,
      },
      source:    'liquipedia.net',
      updatedAt: new Date().toISOString(),
    });
    console.log(`  ✓ NEW: ${p.name} (${p.team})`);
    imported++;
  } catch (e) {
    console.error(`  ✗ ${p.name}: ${e.message}`);
    errors++;
  }
}

// Update existing players (team + gear + settings)
const BATCH_SIZE = 400;
let batch = db.batch();
let batchCount = 0;

const flush = async () => {
  if (batchCount > 0) {
    await batch.commit();
    batch = db.batch();
    batchCount = 0;
  }
};

for (const docSnap of snap.docs) {
  const data = docSnap.data();
  const p = players.find(x => x.name === data.name);
  if (!p) continue;

  batch.update(docSnap.ref, {
    team: p.team,
    'gear.mouse':    p.mouse    || data.gear?.mouse    || '',
    'gear.mousepad': p.mousepad || data.gear?.mousepad || '',
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
