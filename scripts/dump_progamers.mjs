// Dump the entire pro-gamers collection to data/progamers_dump.json
// so we can analyze locally without hammering Firestore.
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const cfg = JSON.parse(readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(cfg);
const db = getFirestore(app, cfg.firestoreDatabaseId);

const snap = await getDocs(collection(db, 'pro-gamers'));
const out = [];
snap.forEach(d => out.push({ id: d.id, ...d.data() }));
mkdirSync('data', { recursive: true });
writeFileSync('data/progamers_dump.json', JSON.stringify(out, null, 2));
console.log(`Wrote ${out.length} docs to data/progamers_dump.json`);
process.exit(0);
