// Fill missing nationality + edpi by scraping each player's profileUrl
// Usage: node scripts/fill_missing_data.mjs
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sa = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'service-account.json'), 'utf8'));
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();
db.settings({ databaseId: 'ai-studio-6d824db4-a574-4a12-be39-0476107b494a' });

// ── Country name → ISO code ──────────────────────────────────────────────────
const COUNTRY_MAP = {
  'Afghanistan':'AF','Albania':'AL','Algeria':'DZ','Argentina':'AR','Armenia':'AM','Australia':'AU',
  'Austria':'AT','Azerbaijan':'AZ','Belarus':'BY','Belgium':'BE','Bolivia':'BO','Brazil':'BR',
  'Bulgaria':'BG','Canada':'CA','Chile':'CL','China':'CN','Colombia':'CO','Croatia':'HR',
  'Czech Republic':'CZ','Denmark':'DK','Ecuador':'EC','Egypt':'EG','Estonia':'EE',
  'Finland':'FI','France':'FR','Georgia':'GE','Germany':'DE','Greece':'GR','Hong Kong':'HK',
  'Hungary':'HU','Iceland':'IS','India':'IN','Indonesia':'ID','Iran':'IR','Iraq':'IQ',
  'Ireland':'IE','Israel':'IL','Italy':'IT','Japan':'JP','Jordan':'JO','Kazakhstan':'KZ',
  'Kosovo':'XK','Latvia':'LV','Lebanon':'LB','Lithuania':'LT','Luxembourg':'LU',
  'Malaysia':'MY','Mexico':'MX','Moldova':'MD','Mongolia':'MN','Morocco':'MA',
  'Montenegro':'ME','Netherlands':'NL','New Zealand':'NZ','Nigeria':'NG',
  'North Macedonia':'MK','Norway':'NO','Pakistan':'PK','Peru':'PE','Philippines':'PH',
  'Poland':'PL','Portugal':'PT','Romania':'RO','Russia':'RU','Saudi Arabia':'SA',
  'Serbia':'RS','Singapore':'SG','Slovakia':'SK','Slovenia':'SI','South Africa':'ZA',
  'South Korea':'KR','Spain':'ES','Sweden':'SE','Switzerland':'CH','Taiwan':'TW',
  'Thailand':'TH','Tunisia':'TN','Turkey':'TR','Ukraine':'UA',
  'United Arab Emirates':'AE','United Kingdom':'GB','United States':'US',
  'Uruguay':'UY','Venezuela':'VE','Vietnam':'VN',
  // extras
  'USA':'US','UK':'GB','Korea':'KR','Republic of Korea':'KR','Chinese Taipei':'TW',
  'Bosnia and Herzegovina':'BA','North America':'US',
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml',
  'Accept-Language': 'en-US,en;q=0.9',
};

// ── Scrape prosettings.net player page ──────────────────────────────────────
async function scrapeProsettings(url) {
  try {
    const res = await fetch(url, { headers: HEADERS, timeout: 15000 });
    if (!res.ok) return null;
    const html = await res.text();
    const $ = cheerio.load(html);
    let country = '';
    let dpi = 0, sens = 0, edpi = 0;

    // Flag: img[src*="flag"]
    $('img[src*="flag"]').first().each((_, el) => {
      const src = $(el).attr('src') || '';
      const m = src.match(/\/flags\/[^/]+\/([a-z]{2})\.svg/i);
      if (m) country = m[1].toUpperCase();
    });

    // Settings table: look for DPI / Sensitivity rows
    $('table tr, .settings-table tr').each((_, row) => {
      const cells = $(row).find('td');
      if (cells.length >= 2) {
        const label = $(cells[0]).text().trim().toLowerCase();
        const val = $(cells[1]).text().trim().replace(/,/g, '');
        if (label.includes('dpi') && !label.includes('edpi')) {
          const n = parseFloat(val);
          if (n > 0) dpi = n;
        }
        if (label.includes('sensitivity') || label === 'sens' || label === 'in-game sens') {
          const n = parseFloat(val);
          if (n > 0) sens = n;
        }
        if (label.includes('edpi')) {
          const n = parseFloat(val);
          if (n > 0) edpi = n;
        }
      }
    });

    // Also try definition lists / labeled divs
    if (!dpi || !sens) {
      $('[class*="stat"], [class*="setting"], [class*="spec"]').each((_, el) => {
        const text = $(el).text();
        const dpiM = text.match(/DPI[:\s]+([0-9,]+)/i);
        const sensM = text.match(/(?:Sensitivity|Sens)[:\s]+([0-9.]+)/i);
        if (dpiM && !dpi) dpi = parseFloat(dpiM[1].replace(',',''));
        if (sensM && !sens) sens = parseFloat(sensM[1]);
      });
    }

    if (dpi && sens && !edpi) edpi = Math.round(dpi * sens * 100) / 100;
    return { country, dpi, sens, edpi };
  } catch (e) {
    return null;
  }
}

// ── Scrape Liquipedia player page ────────────────────────────────────────────
async function scrapeLiquipedia(url) {
  try {
    const res = await fetch(url, { headers: { ...HEADERS, 'Accept-Encoding': 'gzip' }, timeout: 15000 });
    if (!res.ok) return null;
    const html = await res.text();
    const $ = cheerio.load(html);
    let country = '';
    let dpi = 0, sens = 0, edpi = 0;

    // Nationality from infobox: .infobox-cell-2 or flag img alt
    $('.infobox-description').each((_, el) => {
      if ($(el).text().trim().toLowerCase() === 'nationality') {
        const flagImg = $(el).next().find('img').first();
        const alt = flagImg.attr('alt') || '';
        if (alt) country = COUNTRY_MAP[alt] || alt;
      }
    });
    if (!country) {
      $('img[alt]').each((_, el) => {
        const src = $(el).attr('src') || '';
        if (src.includes('Flag_of') || src.includes('_flag') || src.match(/\/[A-Z]{2}(_[a-z]+)?\.svg/)) {
          const alt = $(el).attr('alt') || '';
          if (alt && COUNTRY_MAP[alt]) { country = COUNTRY_MAP[alt]; return false; }
        }
      });
    }

    // Mouse settings table
    $('table tr').each((_, row) => {
      const ths = $(row).find('th');
      const tds = $(row).find('td');
      if (ths.length >= 3) {
        // header row - check column order
      }
      if (tds.length >= 3) {
        // Try: Player | Team | DPI | Poll | Windows | Sens
        const texts = tds.map((i, td) => $(td).text().trim()).get();
        texts.forEach((t, i) => {
          const num = parseFloat(t.replace(/,/g,''));
          if (!isNaN(num) && num > 100 && num <= 32000 && !dpi) dpi = num;
          if (!isNaN(num) && num > 0 && num < 50 && !sens) sens = num;
        });
      }
    });

    if (dpi && sens && !edpi) edpi = Math.round(dpi * sens * 100) / 100;
    return { country, dpi, sens, edpi };
  } catch (e) {
    return null;
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────
// Get all players needing work
const snap = await db.collection('pro-gamers').get();
const toProcess = [];
snap.forEach(d => {
  const data = d.data();
  const edpi = data.settings?.edpi || 0;
  const hasNat = data.nationality && data.nationality.trim() !== '';
  const hasProfile = data.profileUrl && data.profileUrl.trim() !== '';
  if ((edpi === 0 || !hasNat) && hasProfile) {
    toProcess.push({ ref: d.ref, data, missingNat: !hasNat, missingEdpi: edpi === 0 });
  }
});

console.log(`Processing ${toProcess.length} players...`);

let batch = db.batch();
let batchCount = 0, updated = 0, failed = 0;

const flush = async () => {
  if (batchCount > 0) {
    await batch.commit();
    console.log(`  Committed ${batchCount} updates`);
    batch = db.batch();
    batchCount = 0;
  }
};

for (let i = 0; i < toProcess.length; i++) {
  const { ref, data, missingNat, missingEdpi } = toProcess[i];
  const url = data.profileUrl.trim();
  process.stdout.write(`[${i+1}/${toProcess.length}] ${data.name} (${data.game}) ... `);

  let result = null;
  if (url.includes('prosettings.net')) {
    result = await scrapeProsettings(url);
  } else if (url.includes('liquipedia.net')) {
    result = await scrapeLiquipedia(url);
  }

  if (!result) { console.log('FAIL'); failed++; await sleep(500); continue; }

  const updates = {};
  if (missingNat && result.country) updates.nationality = result.country;
  if (missingEdpi && result.edpi > 0) {
    updates['settings.dpi'] = result.dpi;
    updates['settings.sensitivity'] = result.sens;
    updates['settings.edpi'] = result.edpi;
  }

  if (Object.keys(updates).length === 0) {
    console.log(`skip (no new data: country=${result.country}, edpi=${result.edpi})`);
    failed++;
  } else {
    console.log(`OK nat=${result.country||'-'} edpi=${result.edpi||'-'}`);
    batch.update(ref, updates);
    batchCount++;
    updated++;
    if (batchCount >= 400) await flush();
  }

  await sleep(300); // polite delay
}

await flush();
console.log(`\nDone. Updated: ${updated}, Failed/skipped: ${failed}`);
process.exit(0);
