// Extract top-N gear per category from exported pros JSON to inform
// which items need spec entries in gearSpecs.ts.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(__dirname, '..', 'public', 'data');

const allPros = [];
for (const f of ['pros-valorant.json', 'pros-cs2.json', 'pros-overwatch-2.json', 'pros-apex-legends.json']) {
  const list = JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8'));
  allPros.push(...list);
}
console.log(`Total pros: ${allPros.length}`);

for (const cat of ['mouse', 'keyboard', 'monitor', 'mousepad']) {
  const counts = {};
  for (const p of allPros) {
    const v = (p.gear?.[cat] || '').trim();
    if (v) counts[v] = (counts[v] || 0) + 1;
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 25);
  console.log(`\n=== ${cat.toUpperCase()} TOP 25 ===`);
  for (const [name, n] of sorted) {
    console.log(`  ${String(n).padStart(4)}  ${name}`);
  }
}
