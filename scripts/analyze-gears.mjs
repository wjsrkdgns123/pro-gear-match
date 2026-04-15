import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { PRO_MICE, PRO_KEYBOARDS, PRO_MONITORS, PRO_MOUSEPADS } from '../src/constants.ts';

const firebaseConfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const snapshot = await getDocs(collection(db, 'pro-gamers'));

const usedGear = { mice: new Set(), keyboards: new Set(), monitors: new Set(), mousepads: new Set() };
const gameStats = {};

snapshot.forEach(doc => {
  const d = doc.data();
  gameStats[d.game] = (gameStats[d.game] || 0) + 1;
  if (d.gear?.mouse) usedGear.mice.add(d.gear.mouse);
  if (d.gear?.keyboard) usedGear.keyboards.add(d.gear.keyboard);
  if (d.gear?.monitor) usedGear.monitors.add(d.gear.monitor);
  if (d.gear?.mousepad) usedGear.mousepads.add(d.gear.mousepad);
});

const normalize = s => s?.toLowerCase().trim() ?? '';

function findMissing(used, list, label) {
  const missing = [];
  for (const item of used) {
    const n = normalize(item);
    const found = list.some(l => normalize(l) === n || normalize(l).includes(n) || n.includes(normalize(l)));
    if (!found) missing.push(item);
  }
  return missing;
}

console.log('\n=== Game Stats ===');
Object.entries(gameStats).forEach(([g, c]) => console.log(`  ${g}: ${c}명`));
console.log(`  총 프로게이머: ${snapshot.size}명\n`);

console.log('=== 마우스 ===');
console.log(`DB에서 사용 중: ${usedGear.mice.size}개`);
const missingMice = findMissing(usedGear.mice, PRO_MICE, 'mouse');
if (missingMice.length === 0) console.log('✅ 모두 constants에 포함됨');
else { console.log(`❌ ${missingMice.length}개 누락:`); missingMice.forEach(m => console.log(`   - ${m}`)); }

console.log('\n=== 키보드 ===');
console.log(`DB에서 사용 중: ${usedGear.keyboards.size}개`);
const missingKBs = findMissing(usedGear.keyboards, PRO_KEYBOARDS, 'keyboard');
if (missingKBs.length === 0) console.log('✅ 모두 constants에 포함됨');
else { console.log(`❌ ${missingKBs.length}개 누락:`); missingKBs.forEach(m => console.log(`   - ${m}`)); }

console.log('\n=== 모니터 ===');
console.log(`DB에서 사용 중: ${usedGear.monitors.size}개`);
const missingMons = findMissing(usedGear.monitors, PRO_MONITORS, 'monitor');
if (missingMons.length === 0) console.log('✅ 모두 constants에 포함됨');
else { console.log(`❌ ${missingMons.length}개 누락:`); missingMons.forEach(m => console.log(`   - ${m}`)); }

console.log('\n=== 마우스패드 ===');
console.log(`DB에서 사용 중: ${usedGear.mousepads.size}개`);
const missingPads = findMissing(usedGear.mousepads, PRO_MOUSEPADS, 'mousepad');
if (missingPads.length === 0) console.log('✅ 모두 constants에 포함됨');
else { console.log(`❌ ${missingPads.length}개 누락:`); missingPads.forEach(m => console.log(`   - ${m}`)); }

process.exit(0);
