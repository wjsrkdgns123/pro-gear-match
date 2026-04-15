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

const entries = Object.entries(result);

// 원본 키 맵 + 소문자 키 맵 동시 생성 (대소문자 무관 매칭용)
let out = 'export const AMAZON_LINKS: Record<string, string> = {\n';
for (const [name, url] of entries) {
  out += `  ${JSON.stringify(name)}: ${JSON.stringify(url)},\n`;
}
out += '};\n\n';

// 소문자 버전도 함께 export (fallback 조회용)
out += 'export const AMAZON_LINKS_LOWER: Record<string, string> = {\n';
for (const [name, url] of entries) {
  out += `  ${JSON.stringify(name.toLowerCase())}: ${JSON.stringify(url)},\n`;
}
out += '};\n';

writeFileSync('src/amazonLinks.ts', out);
console.log(`Written src/amazonLinks.ts with ${entries.length} entries`);
