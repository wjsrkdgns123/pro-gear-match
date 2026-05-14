import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sa = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'service-account.json'), 'utf8'));
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();
db.settings({ databaseId: 'ai-studio-6d824db4-a574-4a12-be39-0476107b494a' });

const APPLY = process.argv.includes('--apply');

const COLOR_WORDS = [
  'black', 'white', 'red', 'blue', 'green', 'pink', 'purple',
  'orange', 'yellow', 'grey', 'gray', 'silver', 'gold', 'rose',
  'magenta', 'cyan', 'teal', 'navy', 'coral', 'mint', 'violet',
  'indigo', 'crimson', 'scarlet', 'amber', 'ivory', 'charcoal',
  'glossy', 'matte', 'maroon', 'beige', 'olive', 'lime',
  'fluorescent', 'neon',
];
const colorRegex = new RegExp(`\\b(${COLOR_WORDS.join('|')})\\b`, 'gi');

// 토큰 단위 케이스 처리:
// - 숫자 포함 → 원본 유지 (V3, EC2A, MX518, 240Hz)
// - 1글자 → 원본 유지 ("x" 콜라보 표기, "A" 모델 등)
// - 전체 대문자 + 길이 ≤ 4 → 약자로 보고 원본 유지 (RGB, TKL, XL, SONY, ASUS)
// - 이미 mixed case (첫 글자 외에 대문자 존재, 전체 대문자 아님) → 원본 유지
//   (DeathAdder, SteelSeries, HyperX, DualSense, TenZ, SkyPAD, QcK, BlackWidow)
// - 그 외 (전체 소문자, 첫 글자만 대문자, 5자+ 전체 대문자) → Title Case
function titleCaseToken(tok) {
  if (!tok) return tok;
  if (/\d/.test(tok)) return tok;
  if (tok.length === 1) return tok;
  const alpha = (tok.match(/[A-Za-z]+/g) || []).join('');
  if (!alpha) return tok;
  // 전체 대문자
  if (/^[A-Z]+$/.test(alpha)) {
    if (alpha.length <= 4) return tok;
    return tok.replace(/[A-Za-z]+/, (m) => m[0] + m.slice(1).toLowerCase());
  }
  // mixed case (첫 글자 빼고 대문자 존재) → 원본 유지
  if (/[A-Z]/.test(alpha.slice(1))) return tok;
  // 일반 토큰: 첫 알파벳을 대문자로
  return tok.replace(/[A-Za-z]+/, (m) => m[0].toUpperCase() + m.slice(1).toLowerCase());
}

// 하이픈으로 연결된 토큰은 각 sub-token에 같은 규칙 적용 후 하이픈으로 다시 연결
function titleCaseWord(word) {
  if (word.includes('-')) {
    return word.split('-').map(titleCaseToken).join('-');
  }
  return titleCaseToken(word);
}

function normalizeName(name) {
  if (!name) return name;
  // "-" 또는 "--" 같은 placeholder는 원본 유지
  if (/^[-\s–—]+$/.test(name)) return name;
  return name
    // en-dash, em-dash → 하이픈
    .replace(/[–—]/g, '-')
    // 색깔 단어 제거
    .replace(colorRegex, '')
    // 하이픈 주변 공백 제거 (단어 단위 하이픈 유지)
    .replace(/\s*-\s*/g, '-')
    // 연속 공백 1칸으로
    .replace(/\s+/g, ' ')
    .trim()
    // 시작/끝의 고아 하이픈 제거
    .replace(/^-+|-+$/g, '')
    // 토큰 단위 케이스 적용
    .split(' ')
    .map(titleCaseWord)
    .join(' ');
}

const snapshot = await db.collection('pro-gamers').get();
console.log(`\n${APPLY ? '🔴 APPLY 모드' : '🟢 DRY-RUN 모드'} — 총 ${snapshot.size}개 문서 처리\n`);

let willChange = 0;
let unchanged = 0;
const samples = [];

for (const docSnap of snapshot.docs) {
  const data = docSnap.data();
  const gear = data.gear || {};

  const fields = ['mouse', 'keyboard', 'monitor', 'mousepad', 'headset', 'controller'];
  const newGear = { ...gear };
  let docChanged = false;
  const docDiffs = [];

  for (const f of fields) {
    if (gear[f] == null) continue;
    const orig = gear[f] || '';
    const next = normalizeName(orig);
    if (next !== orig) {
      newGear[f] = next;
      docChanged = true;
      docDiffs.push(`    ${f.padEnd(10)} "${orig}" → "${next}"`);
    }
  }

  if (docChanged) {
    willChange++;
    samples.push(`  [${data.name} / ${data.game}]\n${docDiffs.join('\n')}`);
    if (APPLY) {
      await db.collection('pro-gamers').doc(docSnap.id).update({ gear: newGear });
    }
  } else {
    unchanged++;
  }
}

console.log(samples.join('\n\n'));
console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`변경 예정: ${willChange}개 / 변경 없음: ${unchanged}개`);
console.log(`${APPLY ? '✅ Firestore 업데이트 완료' : '💡 실제 반영하려면: node scripts/normalize_gear_names.mjs --apply'}`);
process.exit(0);
