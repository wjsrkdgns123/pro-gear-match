// Fill missing OW2 nationality from prosettings.net (fill missing only)
// Usage: node scripts/set_ow2_ps_nationality.mjs
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

const dataPath = path.join(process.env.USERPROFILE || process.env.HOME, 'Downloads', 'ow2_ps_nationality.json');
const natList = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const natMap = {};
for (const p of natList) {
  if (p.name && p.country) natMap[p.name] = p.country;
}
console.log(`Map: ${Object.keys(natMap).length} players`);

console.log('Fetching Overwatch 2 players from DB...');
const snap = await db.collection('pro-gamers').where('game', '==', 'Overwatch 2').get();
console.log(`  ${snap.size} players found\n`);

const BATCH_SIZE = 400;
let batch = db.batch();
let batchCount = 0;
let updated = 0, skipped = 0, noMatch = 0;

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
  if (data.nationality) { skipped++; continue; } // 이미 있으면 스킵
  const code = natMap[data.name];
  if (!code) { noMatch++; continue; }
  batch.update(docSnap.ref, { nationality: code });
  batchCount++;
  updated++;
  if (batchCount >= BATCH_SIZE) await flush();
}
await flush();

console.log(`\nDone.`);
console.log(`  Updated:  ${updated}`);
console.log(`  Skipped (already set): ${skipped}`);
console.log(`  No match: ${noMatch}`);
process.exit(0);
