// Extract real statistics from pro JSON for use in blog post enrichment.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(__dirname, '..', 'public', 'data');

const all = [];
for (const f of ['pros-valorant.json', 'pros-cs2.json', 'pros-overwatch-2.json', 'pros-apex-legends.json']) {
  all.push(...JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8')));
}

function statsByGame(game) {
  const list = all.filter(p => p.game === game && p.settings && p.settings.edpi);
  const edpis = list.map(p => p.settings.edpi).sort((a, b) => a - b);
  const dpis = list.map(p => p.settings.dpi).filter(Boolean);
  const median = edpis[Math.floor(edpis.length / 2)];
  const avg = edpis.reduce((s, n) => s + n, 0) / edpis.length;
  const dpi800 = dpis.filter(d => d === 800).length;
  const dpi1600 = dpis.filter(d => d === 1600).length;
  const dpi400 = dpis.filter(d => d === 400).length;
  return {
    game, total: list.length,
    edpiMin: edpis[0], edpiMax: edpis[edpis.length - 1],
    edpiAvg: Math.round(avg), edpiMedian: Math.round(median),
    dpi800Pct: Math.round((dpi800 / dpis.length) * 100),
    dpi1600Pct: Math.round((dpi1600 / dpis.length) * 100),
    dpi400Pct: Math.round((dpi400 / dpis.length) * 100),
  };
}

function topItems(field) {
  const counts = {};
  all.forEach(p => {
    const v = (p.gear?.[field] || '').trim();
    if (v) counts[v] = (counts[v] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);
}

console.log('=== eDPI by game ===');
for (const g of ['Valorant', 'CS2', 'Overwatch 2', 'Apex Legends']) {
  console.log(statsByGame(g));
}

console.log('\n=== Top mice (1,861 pros) ===');
topItems('mouse').forEach(([n, c]) => console.log(`  ${String(c).padStart(4)} ${n}`));

console.log('\n=== Top keyboards ===');
topItems('keyboard').slice(0, 8).forEach(([n, c]) => console.log(`  ${String(c).padStart(4)} ${n}`));

console.log('\n=== Top monitors ===');
topItems('monitor').slice(0, 8).forEach(([n, c]) => console.log(`  ${String(c).padStart(4)} ${n}`));

console.log('\n=== Country distribution top 10 ===');
const countries = {};
all.forEach(p => { if (p.nationality) countries[p.nationality] = (countries[p.nationality] || 0) + 1; });
Object.entries(countries).sort((a, b) => b[1] - a[1]).slice(0, 10).forEach(([c, n]) => console.log(`  ${c}: ${n}`));
