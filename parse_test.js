const fs = require('fs');
const path = 'C:/vid/Copy of IRR-MATERIAL-MASTER-NM_ASSIGNMENT file 01 - IIH_Material_Master.csv';

function parseCSVLine(text) {
  let row = [''], inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    let c = text[i];
    if (c === '"') {
      if (inQuotes && text[i+1] === '"') { row[row.length - 1] += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (c === ',' && !inQuotes) {
      row.push('');
    } else {
      row[row.length - 1] += c;
    }
  }
  return row;
}

const content = fs.readFileSync(path, 'utf8');
const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
console.log('Total non-empty lines:', lines.length);
const headers = parseCSVLine(lines[0]);
console.log('Headers:', headers);

let nonBlankNounCount = 0;
let nonBlankModCount = 0;
let oemCategories = {};
let sampleRows = [];

for (let i = 1; i < lines.length; i++) {
  const row = parseCSVLine(lines[i]);
  const noun = row[2]?.trim();
  const mod = row[3]?.trim();
  const oem = row[4]?.trim();
  if (noun) nonBlankNounCount++;
  if (mod) nonBlankModCount++;
  if (oem) oemCategories[oem] = (oemCategories[oem] || 0) + 1;
  if (noun && sampleRows.length < 5) {
    sampleRows.push({ i, row });
  }
}

console.log('Rows with non-blank NOUN:', nonBlankNounCount);
console.log('Rows with non-blank MODIFIER:', nonBlankModCount);
console.log('OEM Categories:', JSON.stringify(oemCategories, null, 2));
console.log('Sample rows with NOUN:');
sampleRows.forEach(s => console.log(s.i, JSON.stringify(s.row)));
