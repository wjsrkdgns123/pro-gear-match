// Set nationality field on all Valorant pro-gamers in Firestore
// Source: prosettings.net country data (scraped via browser → valorant_players.json)
// Usage: node scripts/set_valorant_nationality.mjs
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Firebase init ────────────────────────────────────────────────────────────
const saPath = path.join(__dirname, '..', 'service-account.json');
const sa = JSON.parse(fs.readFileSync(saPath, 'utf8'));
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(sa) });
}
const db = admin.firestore();
db.settings({ databaseId: 'ai-studio-6d824db4-a574-4a12-be39-0476107b494a' });

// ── Country name → ISO code ──────────────────────────────────────────────────
const c2c = {
  'Afghanistan':'AF','Argentina':'AR','Australia':'AU','Austria':'AT',
  'Belarus':'BY','Belgium':'BE','Bosnia & Herzegovina':'BA','Brazil':'BR',
  'Brunei':'BN','Bulgaria':'BG','Cambodia':'KH','Canada':'CA','Chile':'CL',
  'China':'CN','Colombia':'CO','Croatia':'HR','Czechia':'CZ','Denmark':'DK',
  'Dominican Republic':'DO','Egypt':'EG','Estonia':'EE','Finland':'FI',
  'France':'FR','Germany':'DE','Hong Kong SAR China':'HK','Hungary':'HU',
  'Indonesia':'ID','Israel':'IL','Italy':'IT','Japan':'JP','Kazakhstan':'KZ',
  'Latvia':'LV','Lithuania':'LT','Malaysia':'MY','Mexico':'MX','Moldova':'MD',
  'Morocco':'MA','Netherlands':'NL','North Macedonia':'MK','Philippines':'PH',
  'Poland':'PL','Portugal':'PT','Romania':'RO','Russia':'RU','Serbia':'RS',
  'Singapore':'SG','South Korea':'KR','Spain':'ES','Sweden':'SE',
  'Switzerland':'CH','Taiwan':'TW','Thailand':'TH','Turkey':'TR',
  'Ukraine':'UA','United Kingdom':'GB','United States':'US','Vietnam':'VN',
};

// ── Load scraped data ────────────────────────────────────────────────────────
const dataPath = path.join(process.env.USERPROFILE || process.env.HOME, 'Downloads', 'valorant_players.json');
const scraped = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// name → ISO code map
const natMap = {};
for (const p of scraped) {
  if (p.name && p.country) {
    const code = c2c[p.country];
    if (code) natMap[p.name] = code;
  }
}
console.log(`Nationality map: ${Object.keys(natMap).length} players`);

// ── Fetch all Valorant players from DB ───────────────────────────────────────
console.log('Fetching Valorant players from DB...');
const snap = await db.collection('pro-gamers').where('game', '==', 'Valorant').get();
console.log(`  ${snap.size} players found\n`);

// ── Batch update ─────────────────────────────────────────────────────────────
let updated = 0, skipped = 0, noMatch = 0;
const BATCH_SIZE = 400;
let batch = db.batch();
let batchCount = 0;

for (const docSnap of snap.docs) {
  const data = docSnap.data();
  const name = data.name;
  const code = natMap[name];

  if (!code) {
    noMatch++;
    continue;
  }
  // Skip if already correct
  if (data.nationality === code) {
    skipped++;
    continue;
  }

  batch.update(docSnap.ref, { nationality: code });
  batchCount++;
  updated++;

  if (batchCount >= BATCH_SIZE) {
    await batch.commit();
    console.log(`  Committed batch of ${batchCount}`);
    batch = db.batch();
    batchCount = 0;
  }
}

if (batchCount > 0) {
  await batch.commit();
  console.log(`  Committed final batch of ${batchCount}`);
}

console.log(`\nDone.`);
console.log(`  Updated:  ${updated}`);
console.log(`  Skipped (already set): ${skipped}`);
console.log(`  No match: ${noMatch}`);
process.exit(0);
