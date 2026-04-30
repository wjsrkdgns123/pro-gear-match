// Fix Valorant DPI values — Hz was mistakenly stored as DPI
// Correct values from prosettings.net with proper column mapping (col[5]=DPI)
// Usage: node scripts/fix_valorant_dpi.mjs
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

// Correct DPI/sens/eDPI from browser scrape with fixed column mapping
const fixedPath = path.join(process.env.USERPROFILE || process.env.HOME, 'Downloads', 'valorant_fixed.json');
const fixedMap = JSON.parse(fs.readFileSync(fixedPath, 'utf8'));
console.log(`Loaded ${Object.keys(fixedMap).length} corrected entries`);

console.log('Fetching Valorant players from DB...');
const snap = await db.collection('pro-gamers').where('game', '==', 'Valorant').get();
console.log(`  ${snap.size} players found\n`);

let updated = 0, skipped = 0, noMatch = 0;
const BATCH_SIZE = 400;
let batch = db.batch();
let batchCount = 0;

const flush = async () => {
  if (batchCount > 0) {
    await batch.commit();
    console.log(`  Committed ${batchCount} updates`);
    batch = db.batch();
    batchCount = 0;
  }
};

for (const docSnap of snap.docs) {
  const data = docSnap.data();
  const fixed = fixedMap[data.name];

  if (!fixed) { noMatch++; continue; }

  const newDpi  = fixed.dpi  || 0;
  const newSens = fixed.sens || 0;
  const newEdpi = fixed.edpi || 0;

  // Skip if already correct
  if (data.settings?.dpi === newDpi &&
      data.settings?.sensitivity === newSens &&
      data.settings?.edpi === newEdpi) {
    skipped++;
    continue;
  }

  batch.update(docSnap.ref, {
    'settings.dpi': newDpi,
    'settings.sensitivity': newSens,
    'settings.edpi': newEdpi,
  });
  batchCount++;
  updated++;

  if (batchCount >= BATCH_SIZE) await flush();
}
await flush();

console.log(`\nDone. Updated: ${updated}, Skipped: ${skipped}, No match: ${noMatch}`);
process.exit(0);
