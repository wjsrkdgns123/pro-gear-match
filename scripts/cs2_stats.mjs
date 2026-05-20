// CS2-specific stats from our DB for blog post enrichment.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(__dirname, '..', 'public', 'data');

const cs2 = JSON.parse(fs.readFileSync(path.join(DATA, 'pros-cs2.json'), 'utf8'));
console.log(`CS2 pros: ${cs2.length}`);

const withSet = cs2.filter(p => p.settings && p.settings.dpi && p.settings.sensitivity);
console.log(`With dpi+sens: ${withSet.length}`);

// eDPI distribution
const edpis = withSet.map(p => p.settings.dpi * p.settings.sensitivity).sort((a, b) => a - b);
console.log(`eDPI mean: ${(edpis.reduce((s, n) => s + n, 0) / edpis.length).toFixed(1)}`);
console.log(`eDPI median: ${edpis[Math.floor(edpis.length / 2)]}`);

// cm/360 estimate: CS2 formula → cm/360 = 2.54 * 360 / (DPI * sens * yaw)
// CS2 uses Source units, yaw=0.022 default
const cm360s = withSet.map(p => 2.54 * 360 / (p.settings.dpi * p.settings.sensitivity * 0.022)).sort((a, b) => a - b);
console.log(`cm/360 mean: ${(cm360s.reduce((s, n) => s + n, 0) / cm360s.length).toFixed(1)}`);
console.log(`cm/360 median: ${cm360s[Math.floor(cm360s.length / 2)].toFixed(1)}`);

// cm/360 distribution buckets
const buckets = { '20cm-': 0, '20-30': 0, '30-40': 0, '40-50': 0, '50-60': 0, '60+': 0 };
cm360s.forEach(c => {
  if (c < 20) buckets['20cm-']++;
  else if (c < 30) buckets['20-30']++;
  else if (c < 40) buckets['30-40']++;
  else if (c < 50) buckets['40-50']++;
  else if (c < 60) buckets['50-60']++;
  else buckets['60+']++;
});
console.log('cm/360 buckets:', buckets);

// DPI distribution
const dpiCounts = {};
withSet.forEach(p => {
  const d = p.settings.dpi;
  dpiCounts[d] = (dpiCounts[d] || 0) + 1;
});
console.log('DPI distribution:', Object.entries(dpiCounts).sort((a, b) => b[1] - a[1]).slice(0, 6));

// Sens distribution (top sens values)
const sensCounts = {};
withSet.forEach(p => {
  const s = p.settings.sensitivity;
  sensCounts[s] = (sensCounts[s] || 0) + 1;
});
console.log('Top sens values:', Object.entries(sensCounts).sort((a, b) => b[1] - a[1]).slice(0, 8));

// Top mice/keyboards/monitors
const COLOR_RE = /\b(black|white|red|blue|green|pink|purple|orange|yellow|grey|gray|silver|gold|rose|magenta|cyan|teal|navy|coral|mint|violet|indigo|crimson|scarlet|amber|ivory|charcoal|glossy|matte|maroon|beige|olive|lime|fluorescent|neon|frost|ghost)\b/gi;
function norm(s) { return s.replace(COLOR_RE, '').replace(/\s{2,}/g, ' ').trim(); }

for (const field of ['mouse', 'keyboard', 'monitor', 'mousepad']) {
  const counts = {};
  cs2.forEach(p => { const v = norm(p.gear?.[field] || ''); if (v) counts[v] = (counts[v] || 0) + 1; });
  const total = Object.values(counts).reduce((s, n) => s + n, 0);
  console.log(`\nTop ${field} (total ${total}):`);
  Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6)
    .forEach(([n, c]) => console.log(`  ${c} (${Math.round(c / total * 100)}%) ${n}`));
}
