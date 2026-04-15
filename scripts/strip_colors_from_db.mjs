import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0120252556",
  appId: "1:431008078257:web:005d747b94fc0bab024590",
  apiKey: "AIzaSyCO6e0Xc-M4ZFdrCvMnSU47AaMOYKLXXjU",
  authDomain: "gen-lang-client-0120252556.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-6d824db4-a574-4a12-be39-0476107b494a",
};

// 제거할 색깔/색상 관련 단어 (단어 단위 매칭)
const COLOR_WORDS = [
  'black', 'white', 'red', 'blue', 'green', 'pink', 'purple',
  'orange', 'yellow', 'grey', 'gray', 'silver', 'gold', 'rose',
  'magenta', 'cyan', 'teal', 'navy', 'coral', 'mint', 'violet',
  'indigo', 'crimson', 'scarlet', 'amber', 'ivory', 'charcoal',
  'glossy', 'matte', 'maroon', 'beige', 'olive', 'lime',
  'fluorescent', 'neon',
];

const colorRegex = new RegExp(
  `\\b(${COLOR_WORDS.join('|')})\\b`,
  'gi'
);

function stripColors(name) {
  if (!name) return name;
  return name
    .replace(colorRegex, '')   // 색깔 단어 제거
    .replace(/\s{2,}/g, ' ')   // 연속 공백 → 한 칸
    .trim();
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const snapshot = await getDocs(collection(db, 'pro-gamers'));
console.log(`총 ${snapshot.size}개 문서 처리 시작...`);

let updated = 0;
let skipped = 0;

for (const docSnap of snapshot.docs) {
  const data = docSnap.data();
  const gear = data.gear || {};

  const newGear = {
    mouse:     stripColors(gear.mouse     || ''),
    keyboard:  stripColors(gear.keyboard  || ''),
    monitor:   stripColors(gear.monitor   || ''),
    mousepad:  stripColors(gear.mousepad  || ''),
    ...(gear.controller != null ? { controller: stripColors(gear.controller || '') } : {}),
  };

  // 실제로 변경된 경우만 업데이트
  const changed =
    newGear.mouse     !== (gear.mouse     || '') ||
    newGear.keyboard  !== (gear.keyboard  || '') ||
    newGear.monitor   !== (gear.monitor   || '') ||
    newGear.mousepad  !== (gear.mousepad  || '') ||
    (gear.controller != null && newGear.controller !== (gear.controller || ''));

  if (changed) {
    await updateDoc(doc(db, 'pro-gamers', docSnap.id), { gear: newGear });
    console.log(`  [업데이트] ${data.name} (${data.game})`);
    if (gear.mouse !== newGear.mouse)       console.log(`    mouse:    "${gear.mouse}" → "${newGear.mouse}"`);
    if (gear.keyboard !== newGear.keyboard) console.log(`    keyboard: "${gear.keyboard}" → "${newGear.keyboard}"`);
    if (gear.monitor !== newGear.monitor)   console.log(`    monitor:  "${gear.monitor}" → "${newGear.monitor}"`);
    if (gear.mousepad !== newGear.mousepad) console.log(`    mousepad: "${gear.mousepad}" → "${newGear.mousepad}"`);
    updated++;
  } else {
    skipped++;
  }
}

console.log(`\n완료: ${updated}개 업데이트, ${skipped}개 변경없음`);
process.exit(0);
