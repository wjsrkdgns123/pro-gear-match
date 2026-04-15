import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import ExcelJS from 'exceljs';

// 서비스 계정 키 로드
const serviceAccount = JSON.parse(readFileSync('service-account.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
});

const db = admin.firestore();
db.settings({ databaseId: 'ai-studio-6d824db4-a574-4a12-be39-0476107b494a' });

// ── Excel 읽기 ──────────────────────────────────────────
const wb = new ExcelJS.Workbook();
await wb.xlsx.readFile('data/ProGearMatch_Players.xlsx');

const wsAll = wb.getWorksheet('전체');
if (!wsAll) { console.error('전체 시트를 찾을 수 없습니다.'); process.exit(1); }

const excelRows = [];
wsAll.eachRow((row, rowNumber) => {
  if (rowNumber === 1) return;
  const vals = row.values; // 1-indexed
  const name = String(vals[3] || '').trim();
  const game = String(vals[2] || '').trim();
  if (!name || !game) return;
  excelRows.push({
    game,
    name,
    team:        String(vals[4]  || '').trim(),
    dpi:         Number(vals[5])  || 0,
    sensitivity: Number(vals[6])  || 0,
    edpi:        Number(vals[7])  || 0,
    mouse:       String(vals[8]  || '').trim(),
    keyboard:    String(vals[9]  || '').trim(),
    monitor:     String(vals[10] || '').trim(),
    mousepad:    String(vals[11] || '').trim(),
    controller:  String(vals[12] || '').trim(),
    profileUrl:  String(vals[13] || '').trim(),
  });
});
console.log(`Excel에서 ${excelRows.length}개 행 로드`);

// ── Firestore 현재 데이터 읽기 ──────────────────────────
const snapshot = await db.collection('pro-gamers').get();
const dbMap = new Map();
snapshot.forEach(d => dbMap.set(d.id, d.data()));
console.log(`Firestore에서 ${dbMap.size}개 문서 로드`);

// ── 비교 및 업데이트 ─────────────────────────────────────
function makeId(game, name) {
  return `${game}_${name}`.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
}

function normalizeGame(g) {
  const map = { 'valorant': 'Valorant', 'cs2': 'CS2', 'overwatch 2': 'Overwatch 2', 'apex legends': 'Apex Legends' };
  return map[g.toLowerCase()] || g;
}

let updated = 0, added = 0, skipped = 0;

for (const row of excelRows) {
  const game = normalizeGame(row.game);
  const id = makeId(game, row.name);
  const existing = dbMap.get(id);

  const newGear = {
    mouse:    row.mouse,
    keyboard: row.keyboard,
    monitor:  row.monitor,
    mousepad: row.mousepad,
    ...(row.controller ? { controller: row.controller } : {}),
  };
  const newSettings = {
    dpi:         row.dpi,
    sensitivity: row.sensitivity,
    edpi:        row.edpi || Math.round(row.dpi * row.sensitivity * 100) / 100,
  };

  if (!existing) {
    await db.collection('pro-gamers').doc(id).set({
      name: row.name, team: row.team, game,
      gear: newGear, settings: newSettings,
      profileUrl: row.profileUrl,
      source: 'excel_import',
      updatedAt: new Date().toISOString().split('T')[0],
    });
    console.log(`  [추가] ${row.name} (${game})`);
    added++;
    continue;
  }

  const eg = existing.gear || {};
  const es = existing.settings || {};
  const changed =
    row.team        !== (existing.team       || '') ||
    row.profileUrl  !== (existing.profileUrl || '') ||
    row.mouse       !== (eg.mouse    || '') ||
    row.keyboard    !== (eg.keyboard || '') ||
    row.monitor     !== (eg.monitor  || '') ||
    row.mousepad    !== (eg.mousepad || '') ||
    row.controller  !== (eg.controller || '') ||
    row.dpi         !== (es.dpi         || 0) ||
    row.sensitivity !== (es.sensitivity || 0);

  if (changed) {
    await db.collection('pro-gamers').doc(id).update({
      team: row.team, gear: newGear, settings: newSettings,
      profileUrl: row.profileUrl,
      updatedAt: new Date().toISOString().split('T')[0],
    });
    const changes = [];
    if (row.team       !== (existing.team    || '')) changes.push(`team: "${existing.team}" → "${row.team}"`);
    if (row.mouse      !== (eg.mouse    || ''))      changes.push(`mouse: "${eg.mouse}" → "${row.mouse}"`);
    if (row.keyboard   !== (eg.keyboard || ''))      changes.push(`keyboard: "${eg.keyboard}" → "${row.keyboard}"`);
    if (row.monitor    !== (eg.monitor  || ''))      changes.push(`monitor: "${eg.monitor}" → "${row.monitor}"`);
    if (row.mousepad   !== (eg.mousepad || ''))      changes.push(`mousepad: "${eg.mousepad}" → "${row.mousepad}"`);
    if (row.dpi        !== (es.dpi || 0))            changes.push(`dpi: ${es.dpi} → ${row.dpi}`);
    if (row.sensitivity !== (es.sensitivity || 0))   changes.push(`sens: ${es.sensitivity} → ${row.sensitivity}`);
    console.log(`  [수정] ${row.name} (${game})`);
    changes.forEach(c => console.log(`    ${c}`));
    updated++;
  } else {
    skipped++;
  }
}

console.log(`\n완료: 추가 ${added}명, 수정 ${updated}명, 변경없음 ${skipped}명`);
process.exit(0);
