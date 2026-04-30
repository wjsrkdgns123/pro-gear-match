import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sa = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'service-account.json'), 'utf8'));
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();
db.settings({ databaseId: 'ai-studio-6d824db4-a574-4a12-be39-0476107b494a' });

const snap = await db.collection('pro-gamers').where('game', '==', 'Apex Legends').get();
const dpis = snap.docs.map(d => d.data().settings?.dpi || 0).filter(x => x > 0);
dpis.sort((a,b) => b - a);
console.log('Top 10 DPIs:', dpis.slice(0, 10));
console.log('Total with DPI data:', dpis.length);
const avg = Math.round(dpis.reduce((a,b)=>a+b,0)/dpis.length);
console.log('Avg DPI:', avg);

// Show players with dpi > 3600
for (const d of snap.docs) {
  const data = d.data();
  const dpi = data.settings?.dpi || 0;
  if (dpi > 3600) console.log(`  HIGH: ${data.name} dpi=${dpi} edpi=${data.settings?.edpi||0}`);
}
process.exit(0);
