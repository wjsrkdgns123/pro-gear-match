import ExcelJS from 'exceljs';

const wb = new ExcelJS.Workbook();
await wb.xlsx.readFile('C:/Users/wjsrk/Desktop/ProGearMatch_Equipment_List.xlsx');

const result = {};

for (const ws of wb.worksheets) {
  if (ws.name === '요약') continue;
  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // header
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

console.log(JSON.stringify(result, null, 2));
