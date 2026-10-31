const fs = require('fs');
const auth = require('C:/Users/prane/AppData/Roaming/npm/node_modules/zcatalyst-cli/lib/command_needs/auth.js').default;
const Credential = require('C:/Users/prane/AppData/Roaming/npm/node_modules/zcatalyst-cli/lib/authentication/credential.js').default;

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

const csvPath = 'C:/vid/Copy of IRR-MATERIAL-MASTER-NM_ASSIGNMENT file 01 - IIH_Material_Master.csv';
const content = fs.readFileSync(csvPath, 'utf8');
const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
console.log('Total lines in CSV:', lines.length);

const testBatch = [];
for (let i = 1; i <= 20; i++) {
  const parts = parseCSVLine(lines[i]);
  const desc = parts[1] || 'Material Specification';
  let noun = parts[2] ? parts[2].trim() : '';
  let modifier = parts[3] ? parts[3].trim() : '';
  let oem = parts[4] ? parts[4].trim() : 'NON-OEM';

  if (!noun) noun = 'MATERIAL';
  if (!modifier) modifier = 'STANDARD';
  if (oem.includes('NON')) oem = 'NON OEM';
  else if (oem.toUpperCase() === 'OEM') oem = 'OEM';
  else oem = 'NON OEM';

  testBatch.push({
    Discription: desc.substring(0, 1000),
    Noun: noun.substring(0, 200),
    Modifier: modifier.substring(0, 200),
    Noun_Modifier: (parts[5] || `${noun} ${modifier}`).substring(0, 255),
    OEM_Category: oem,
    NM_Status: (parts[6] || '').substring(0, 100),
    NM_Count: (parts[7] || '').substring(0, 50),
    Batches: (parts[8] || '').substring(0, 100),
    Workbenchid: 'WorkBenchID-01'
  });
}

async function run() {
  auth();
  const token = await Credential.getAccessToken();
  console.log('Got token, sending 20 test rows to UserData table...');
  const resp = await fetch('https://api.catalyst.zoho.in/baas/v1/project/23815000000022001/table/23815000000267003/row', {
    method: 'POST',
    headers: {
      'Authorization': 'Zoho-oauthtoken ' + token,
      'Environment': 'Development',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(testBatch)
  });
  const data = await resp.json();
  console.log('Response status:', resp.status);
  console.log('Inserted rows count:', data.data ? data.data.length : 0);
  if (data.data && data.data[0]) {
    console.log('First inserted ROWID:', data.data[0].ROWID);
  } else {
    console.log('Response body:', JSON.stringify(data, null, 2));
  }
}

run();
