// Compute real average mouse weight per game using gearSpecs entries.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(__dirname, '..', 'public', 'data');

// Load specs from gearSpecs.ts via regex
const specsTxt = fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'gearSpecs.ts'), 'utf8');
const mouseBlock = specsTxt.match(/MOUSE_SPECS[\s\S]*?\n};/)[0];
const re = /'([^']+)':\s*\{\s*weight:\s*(\d+),/g;
const weights = {};
let m;
while ((m = re.exec(mouseBlock)) !== null) weights[m[1].toLowerCase()] = +m[2];

const COLOR_RE = /\b(black|white|red|blue|green|pink|purple|orange|yellow|grey|gray|silver|gold|rose|magenta|cyan|teal|navy|coral|mint|violet|indigo|crimson|scarlet|amber|ivory|charcoal|glossy|matte|maroon|beige|olive|lime|fluorescent|neon|frost|ghost)\b/gi;
function normalize(name) {
  return name.replace(COLOR_RE, '').replace(/\s{2,}/g, ' ').trim().toLowerCase();
}

console.log(`Loaded ${Object.keys(weights).length} mouse specs\n`);

for (const game of ['Valorant', 'CS2', 'Overwatch 2', 'Apex Legends']) {
  const list = JSON.parse(fs.readFileSync(path.join(DATA, `pros-${game.toLowerCase().replace(/\s+/g, '-')}.json`), 'utf8'));
  const matched = [];
  const unmatched = new Set();
  for (const p of list) {
    const name = (p.gear?.mouse || '').trim();
    if (!name) continue;
    const w = weights[normalize(name)];
    if (w != null) matched.push(w);
    else unmatched.add(name);
  }
  const avg = matched.reduce((s, n) => s + n, 0) / matched.length;
  const sorted = matched.slice().sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  console.log(`${game}: ${matched.length}/${list.length} matched, avg ${avg.toFixed(1)}g, median ${median}g`);
}

// Also compute global lighter-than-60g pct
const list = [];
for (const f of ['pros-valorant.json', 'pros-cs2.json', 'pros-overwatch-2.json', 'pros-apex-legends.json']) {
  list.push(...JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8')));
}
const matched = [];
list.forEach(p => {
  const name = (p.gear?.mouse || '').trim();
  if (name) {
    const w = weights[normalize(name)];
    if (w != null) matched.push(w);
  }
});
const under60 = matched.filter(w => w <= 60).length;
const under50 = matched.filter(w => w <= 50).length;
const over70 = matched.filter(w => w >= 70).length;
console.log(`\nGlobal: ${matched.length} mice with specs`);
console.log(`  ≤50g: ${under50} (${Math.round(under50/matched.length*100)}%)`);
console.log(`  ≤60g: ${under60} (${Math.round(under60/matched.length*100)}%)`);
console.log(`  ≥70g: ${over70} (${Math.round(over70/matched.length*100)}%)`);
console.log(`  avg overall: ${(matched.reduce((s,n)=>s+n,0)/matched.length).toFixed(1)}g`);
