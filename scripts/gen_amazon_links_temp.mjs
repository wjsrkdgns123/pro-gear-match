import ExcelJS from 'exceljs';
import { writeFileSync } from 'fs';

const wb = new ExcelJS.Workbook();
await wb.xlsx.readFile('data/ProGearMatch_Equipment_List.xlsx');

const result = {};

for (const ws of wb.worksheets) {
  if (ws.name === '요약') continue;
  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const name = row.getCell(2).value;
    const linkCell = row.getCell(3);
    let url = '';
    if (linkCell.hyperlink) {
      url = linkCell.hyperlink;
    } else if (linkCell.value && typeof linkCell.value === 'object' && linkCell.value.hyperlink) {
      url = linkCell.value.hyperlink;
    } else if (typeof linkCell.value === 'string' && linkCell.value.startsWith('http')) {
      url = linkCell.value;
    }
    if (name && url) {
      result[String(name).trim()] = url;
    }
  });
}

const COLOR_WORDS = [
  'black','white','red','blue','green','pink','purple','orange','yellow',
  'grey','gray','silver','gold','rose','magenta','cyan','teal','navy',
  'coral','mint','violet','indigo','crimson','scarlet','amber','ivory',
  'charcoal','glossy','matte','maroon','beige','olive','lime','fluorescent','neon',
];
const colorRegex = new RegExp(`\\b(${COLOR_WORDS.join('|')})\\b`, 'gi');

// 정규화 함수: 색깔 단어 제거 → 소문자 → 영숫자만 남김
const normalize = (s) => s
  .replace(colorRegex, '')
  .toLowerCase()
  .replace(/[^a-z0-9]/g, '');

const entries = Object.entries(result);
const normalizedSeen = new Set();

let out = '// 정규화 키(소문자+영숫자만) → Amazon URL 매핑\n';
out += 'export const AMAZON_LINKS_NORMALIZED: Record<string, string> = {\n';
for (const [name, url] of entries) {
  const key = normalize(name);
  if (!normalizedSeen.has(key)) {
    normalizedSeen.add(key);
    out += `  ${JSON.stringify(key)}: ${JSON.stringify(url)},\n`;
  }
}
out += '};\n';

writeFileSync('src/amazonLinks.ts', out);
console.log(`Written src/amazonLinks.ts with ${normalizedSeen.size} normalized entries`);
