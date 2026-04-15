import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import ExcelJS from 'exceljs';

const firebaseConfig = {
  projectId: "gen-lang-client-0120252556",
  appId: "1:431008078257:web:005d747b94fc0bab024590",
  apiKey: "AIzaSyCO6e0Xc-M4ZFdrCvMnSU47AaMOYKLXXjU",
  authDomain: "gen-lang-client-0120252556.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-6d824db4-a574-4a12-be39-0476107b494a",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

console.log('Firestore에서 선수 데이터 불러오는 중...');
const snapshot = await getDocs(collection(db, 'pro-gamers'));
console.log(`총 ${snapshot.size}개 문서 로드 완료`);

const rows = [];
snapshot.forEach(docSnap => {
  const d = docSnap.data();
  rows.push({
    id:         docSnap.id,
    name:       d.name || '',
    team:       d.team || '',
    game:       d.game || '',
    dpi:        d.settings?.dpi ?? '',
    sensitivity:d.settings?.sensitivity ?? '',
    edpi:       d.settings?.edpi ?? '',
    mouse:      d.gear?.mouse || '',
    keyboard:   d.gear?.keyboard || '',
    monitor:    d.gear?.monitor || '',
    mousepad:   d.gear?.mousepad || '',
    controller: d.gear?.controller || '',
    profileUrl: d.profileUrl || '',
    source:     d.source || '',
    updatedAt:  d.updatedAt || '',
  });
});

// 게임별 정렬
rows.sort((a, b) => {
  const gameOrder = ['Valorant', 'CS2', 'Overwatch 2', 'Apex Legends'];
  const gi = gameOrder.indexOf(a.game) - gameOrder.indexOf(b.game);
  if (gi !== 0) return gi;
  return a.name.localeCompare(b.name);
});

const wb = new ExcelJS.Workbook();
wb.creator = 'ProGear Match';

const borderStyle = {
  top:    { style: 'thin', color: { argb: 'FFCCCCCC' } },
  left:   { style: 'thin', color: { argb: 'FFCCCCCC' } },
  bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
  right:  { style: 'thin', color: { argb: 'FFCCCCCC' } },
};

const GAME_COLORS = {
  'Valorant':    'FFFF4655',
  'CS2':         'FFFF6B35',
  'Overwatch 2': 'FF00B4FF',
  'Apex Legends':'FFDA3F30',
};

// ── 요약 시트 (맨 앞) ─────────────────────────────────
const wsSummary = wb.addWorksheet('요약');
wsSummary.columns = [{ width: 20 }, { width: 12 }];
wsSummary.addRow(['Pro Gear Match - 선수 데이터']).getCell(1).font = { name: 'Arial', bold: true, size: 14 };
wsSummary.addRow([]);
const shRow = wsSummary.addRow(['게임', '선수 수']);
shRow.eachCell(cell => {
  cell.font = { name: 'Arial', bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF37474F' } };
  cell.alignment = { horizontal: 'center', vertical: 'middle' };
  cell.border = borderStyle;
});

// ── 전체 시트 ──────────────────────────────────────────
const wsAll = wb.addWorksheet('전체');
wsAll.columns = [
  { key: 'no',         width: 5  },
  { key: 'game',       width: 14 },
  { key: 'name',       width: 18 },
  { key: 'team',       width: 18 },
  { key: 'dpi',        width: 8  },
  { key: 'sensitivity',width: 10 },
  { key: 'edpi',       width: 10 },
  { key: 'mouse',      width: 32 },
  { key: 'keyboard',   width: 32 },
  { key: 'monitor',    width: 28 },
  { key: 'mousepad',   width: 28 },
  { key: 'controller', width: 20 },
  { key: 'profileUrl', width: 50 },
  { key: 'updatedAt',  width: 14 },
];

const headers = ['#','게임','선수명','팀','DPI','감도','eDPI','마우스','키보드','모니터','마우스패드','컨트롤러','프로필 URL','업데이트'];
const hRow = wsAll.addRow(headers);
hRow.height = 22;
hRow.eachCell(cell => {
  cell.font = { name: 'Arial', bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B5E20' } };
  cell.alignment = { horizontal: 'center', vertical: 'middle' };
  cell.border = borderStyle;
});

rows.forEach((r, i) => {
  const row = wsAll.addRow([
    i + 1, r.game, r.name, r.team,
    r.dpi, r.sensitivity, r.edpi,
    r.mouse, r.keyboard, r.monitor, r.mousepad, r.controller,
    r.profileUrl, r.updatedAt,
  ]);
  row.height = 17;
  const gameColor = GAME_COLORS[r.game] || 'FF333333';
  row.eachCell((cell, col) => {
    cell.font = { name: 'Arial', size: 9 };
    cell.alignment = { horizontal: col <= 7 ? 'center' : 'left', vertical: 'middle' };
    cell.border = borderStyle;
    if (i % 2 === 1) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
    }
  });
  // 게임명 셀 색상
  row.getCell(2).font = { name: 'Arial', size: 9, bold: true, color: { argb: gameColor } };
});

wsAll.autoFilter = { from: 'A1', to: 'N1' };
wsAll.views = [{ state: 'frozen', xSplit: 0, ySplit: 1, topLeftCell: 'A2', activeCell: 'A2' }];

// ── 게임별 시트 ────────────────────────────────────────
const games = ['Valorant', 'CS2', 'Overwatch 2', 'Apex Legends'];
for (const game of games) {
  const gameRows = rows.filter(r => r.game === game);
  if (gameRows.length === 0) continue;

  const ws = wb.addWorksheet(game);
  ws.columns = [
    { key: 'no',         width: 5  },
    { key: 'name',       width: 18 },
    { key: 'team',       width: 18 },
    { key: 'dpi',        width: 8  },
    { key: 'sensitivity',width: 10 },
    { key: 'edpi',       width: 10 },
    { key: 'mouse',      width: 32 },
    { key: 'keyboard',   width: 32 },
    { key: 'monitor',    width: 28 },
    { key: 'mousepad',   width: 28 },
    { key: 'controller', width: 20 },
    { key: 'profileUrl', width: 50 },
    { key: 'updatedAt',  width: 14 },
  ];

  const gameColor = GAME_COLORS[game] || 'FF333333';
  const gh = ws.addRow(['#','선수명','팀','DPI','감도','eDPI','마우스','키보드','모니터','마우스패드','컨트롤러','프로필 URL','업데이트']);
  gh.height = 22;
  gh.eachCell(cell => {
    cell.font = { name: 'Arial', bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: gameColor } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = borderStyle;
  });

  gameRows.forEach((r, i) => {
    const row = ws.addRow([
      i + 1, r.name, r.team,
      r.dpi, r.sensitivity, r.edpi,
      r.mouse, r.keyboard, r.monitor, r.mousepad, r.controller,
      r.profileUrl, r.updatedAt,
    ]);
    row.height = 17;
    row.eachCell((cell, col) => {
      cell.font = { name: 'Arial', size: 9 };
      cell.alignment = { horizontal: col <= 6 ? 'center' : 'left', vertical: 'middle' };
      cell.border = borderStyle;
      if (i % 2 === 1) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
      }
    });
  });

  ws.autoFilter = { from: 'A1', to: 'M1' };
  ws.views = [{ state: 'frozen', xSplit: 0, ySplit: 1, topLeftCell: 'A2', activeCell: 'A2' }];
}

games.forEach((game, i) => {
  const count = rows.filter(r => r.game === game).length;
  const r = wsSummary.addRow([game, count]);
  r.getCell(1).font = { name: 'Arial', bold: true, size: 10, color: { argb: GAME_COLORS[game] } };
  r.getCell(2).font = { name: 'Arial', size: 10 };
  r.getCell(2).alignment = { horizontal: 'center' };
  r.eachCell(cell => { cell.border = borderStyle; });
  if (i % 2 === 0) r.eachCell(cell => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECEFF1' } }; });
});

const totalRow = wsSummary.addRow(['합계', { formula: 'SUM(B4:B7)' }]);
totalRow.eachCell(cell => {
  cell.font = { name: 'Arial', bold: true, size: 11 };
  cell.alignment = { horizontal: 'center' };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB2DFDB' } };
  cell.border = borderStyle;
});

const outputPath = 'data/ProGearMatch_Players.xlsx';
await wb.xlsx.writeFile(outputPath);
console.log(`\n저장 완료: ${outputPath}`);
console.log(`전체: ${rows.length}명`);
games.forEach(g => console.log(`  ${g}: ${rows.filter(r => r.game === g).length}명`));
process.exit(0);
