// Fix Apex Legends players with abnormal DPI values (e.g. Phony dpi=16000)
// Sets dpi/sensitivity/edpi to 0 for players where dpi > 4000 (unrealistic)
// Usage: node scripts/fix_apex_abnormal_dpi.mjs
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

console.log('Fetching Apex Legends players from DB...');
const snap = await db.collection('pro-gamers').where('game', '==', 'Apex Legends').get();
console.log(`  ${snap.size} players found\n`);

// Print all DPI values for inspection
const abnormal = [];
for (const docSnap of snap.docs) {
  const data = docSnap.data();
  const dpi = data.settings?.dpi || 0;
  const sens = data.settings?.sensitivity || 0;
  const edpi = data.settings?.edpi || 0;
  if (dpi > 4000 || edpi > 10000) {
    abnormal.push({ name: data.name, dpi, sens, edpi, ref: docSnap.ref });
    console.log(`  ABNORMAL: ${data.name} — dpi=${dpi}, sens=${sens}, edpi=${edpi}`);
  }
}

if (abnormal.length === 0) {
  console.log('No abnormal players found!');
  process.exit(0);
}

console.log(`\nFound ${abnormal.length} abnormal player(s). Zeroing dpi/sensitivity/edpi...`);
const batch = db.batch();
for (const p of abnormal) {
  batch.update(p.ref, {
    'settings.dpi': 0,
    'settings.sensitivity': 0,
    'settings.edpi': 0,
  });
}
await batch.commit();
console.log(`Done. Zeroed out ${abnormal.length} player(s).`);
process.exit(0);
