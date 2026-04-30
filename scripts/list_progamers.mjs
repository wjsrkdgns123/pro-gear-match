// Quick read-only dump of the current progamers collection.
// Uses the client SDK (public read rules allow it) — no service account needed.
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { readFileSync } from 'fs';

const cfg = JSON.parse(readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(cfg);
const db = getFirestore(app, cfg.firestoreDatabaseId);

const snap = await getDocs(collection(db, 'pro-gamers'));
const byGame = {};
snap.forEach(d => {
  const v = d.data();
  const g = v.game || '?';
  (byGame[g] = byGame[g] || []).push({ name: v.name, team: v.team });
});

console.log(`TOTAL: ${snap.size}\n`);
for (const g of Object.keys(byGame).sort()) {
  const arr = byGame[g].sort((a, b) => a.name.localeCompare(b.name));
  console.log(`=== ${g} (${arr.length}) ===`);
  console.log(arr.map(x => `${x.name} [${x.team}]`).join(', '));
  console.log();
}
process.exit(0);
