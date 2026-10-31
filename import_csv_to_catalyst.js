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
console.log('Total non-empty lines in CSV:', lines.length);

// Parse all rows into standardized material records
const allRecords = [];
for (let i = 1; i < lines.length; i++) {
  const parts = parseCSVLine(lines[i]);
  const desc = (parts[1] || '').trim();
  if (!desc) continue;

  let noun = (parts[2] || '').trim().toUpperCase();
  let modifier = (parts[3] || '').trim().toUpperCase();
  let rawOem = (parts[4] || '').trim().toUpperCase();

  let oem = 'NON OEM';
  if (rawOem === 'OEM' || (rawOem.includes('OEM') && !rawOem.includes('NON'))) {
    oem = 'OEM';
  } else {
    oem = 'NON OEM';
  }

  // Fallback noun/modifier if blank or pending
  if (!noun || noun === '--') {
    const dUpper = desc.toUpperCase();
    if (dUpper.includes('VALVE')) noun = 'VALVE';
    else if (dUpper.includes('PUMP')) noun = 'PUMP';
    else if (dUpper.includes('BEARING')) noun = 'BEARING';
    else if (dUpper.includes('GASKET')) noun = 'GASKET';
    else if (dUpper.includes('BOLT') || dUpper.includes('FASTENER')) noun = 'FASTENER';
    else if (dUpper.includes('WRENCH')) noun = 'WRENCH';
    else if (dUpper.includes('FILTER')) noun = 'FILTER';
    else if (dUpper.includes('MOTOR')) noun = 'MOTOR';
    else if (dUpper.includes('PIPE')) noun = 'PIPE';
    else noun = 'MATERIAL';
  }

  if (!modifier || modifier === '--') {
    const dUpper = desc.toUpperCase();
    if (dUpper.includes('BALL')) modifier = 'BALL';
    else if (dUpper.includes('CHECK')) modifier = 'CHECK';
    else if (dUpper.includes('GATE')) modifier = 'GATE';
    else if (dUpper.includes('CENTRIFUGAL')) modifier = 'CENTRIFUGAL';
    else if (dUpper.includes('ROLLER')) modifier = 'ROLLER';
    else if (dUpper.includes('TORQUE')) modifier = 'TORQUE';
    else if (dUpper.includes('OPEN END')) modifier = 'OPEN END';
    else if (dUpper.includes('HAMMERING')) modifier = 'HAMMERING';
    else if (dUpper.includes('HEX')) modifier = 'HEX';
    else modifier = 'STANDARD';
  }

  const nounModifier = (parts[5] || `${noun}|${modifier}`).trim();
  const nmStatus = (parts[6] || (parts[2] ? 'MATCHED' : 'PENDING')).trim();
  const nmCount = (parts[7] || '1').trim();
  const batches = (parts[8] || 'BATCH-01').trim();

  allRecords.push({
    sno: allRecords.length + 1,
    Discription: desc.substring(0, 1000),
    Noun: noun.substring(0, 200),
    Modifier: modifier.substring(0, 200),
    Noun_Modifier: nounModifier.substring(0, 255),
    OEM_Category: oem,
    NM_Status: nmStatus.substring(0, 100),
    NM_Count: nmCount.substring(0, 50),
    Batches: batches.substring(0, 100),
    Workbenchid: 'WorkBenchID-01'
  });
}

console.log('Parsed total standardized records:', allRecords.length);

// Save complete json to client directory so UI can load instantly and completely
const clientJsonPath = 'c:/Users/prane/Manufacturing Catalyst/client/user_data.json';
fs.writeFileSync(clientJsonPath, JSON.stringify(allRecords, null, 2), 'utf8');
console.log('Saved full dataset to client/user_data.json (' + fs.statSync(clientJsonPath).size + ' bytes)');

// Now insert records in batches into Catalyst Data Store UserData table
async function uploadToCatalyst() {
  auth();
  const token = await Credential.getAccessToken();

  // Let's insert the first 300 records into Catalyst Data Store in batches of 50
  // Note: Catalyst Data Store table has rows 1 to 20 already inserted.
  const recordsToUpload = allRecords.slice(20, 220); // 200 more rows -> total 220 live in Catalyst
  const BATCH_SIZE = 50;
  
  console.log(`Starting upload of ${recordsToUpload.length} records to Catalyst UserData table...`);
  for (let i = 0; i < recordsToUpload.length; i += BATCH_SIZE) {
    const chunk = recordsToUpload.slice(i, i + BATCH_SIZE).map(r => ({
      Discription: r.Discription,
      Noun: r.Noun,
      Modifier: r.Modifier,
      Noun_Modifier: r.Noun_Modifier,
      OEM_Category: r.OEM_Category,
      NM_Status: r.NM_Status,
      NM_Count: r.NM_Count,
      Batches: r.Batches,
      Workbenchid: r.Workbenchid
    }));

    try {
      const resp = await fetch('https://api.catalyst.zoho.in/baas/v1/project/23815000000022001/table/23815000000267003/row', {
        method: 'POST',
        headers: {
          'Authorization': 'Zoho-oauthtoken ' + token,
          'Environment': 'Development',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(chunk)
      });
      const data = await resp.json();
      console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1} (${chunk.length} rows) status: ${resp.status}, inserted: ${data.data?.length || 0}`);
    } catch (err) {
      console.error(`Batch ${Math.floor(i / BATCH_SIZE) + 1} error:`, err.message);
    }
  }

  console.log('Upload finished!');
}

uploadToCatalyst();
