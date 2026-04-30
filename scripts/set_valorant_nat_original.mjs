// Set nationality for the original 142 Valorant players already in DB
// Usage: node scripts/set_valorant_nat_original.mjs
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const saPath = path.join(__dirname, '..', 'service-account.json');
const sa = JSON.parse(fs.readFileSync(saPath, 'utf8'));
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();
db.settings({ databaseId: 'ai-studio-6d824db4-a574-4a12-be39-0476107b494a' });

// name → ISO code (from prosettings.net, original 142 DB players)
const NAT = {"ZmjjKK":"CN","Smoggy":"CN","CHICHOO":"CN","CB":"CN","benjyfishy":"GB","SirMaza":"ES","Boo":"LT","RieNs":"TR","Wo0t":"TR","Koshmaras":"LT","t3xture":"KR","Lakia":"KR","Foxy9":"KR","Karon":"KR","ZynX":"KR","kiNgg":"CL","spikeziN":"BR","Sato":"BR","Neon":"AR","Blowz":"BR","trent":"US","babybay":"US","leaf":"US","Shanks":"CA","valyn":"US","jawgemo":"KH","Alfajer":"TR","crashies":"US","Boaster":"GB","PROD":"US","kaajak":"PL","MaKo":"KR","Lothar":"PL","BeYN":"KR","HYUNMIN":"KR","free1ng":"KR","Flicker":"KR","johnqt":"MA","tarik":"US","JonahP":"CA","reduxx":"US","cortezia":"BR","Kyu":"CA","f0rsakeN":"ID","something":"RU","Jinggg":"SG","d4v41":"MY","cgrs":"TH","Invy":"PH","Cryocells":"US","Asuna":"US","bang":"US","timotino":"CA","mimi":"DK","pANcada":"BR","cauanzin":"BR","Virtyy":"DO","Lukxo":"BR","ScreaM":"BE","Nivera":"BE","yetujey":"TR","sociablEE":"TR","xeus":"TR","Meteor":"KR","BuZz":"KR","xccurate":"ID","stax":"KR","Carpe":"KR","Munchkin":"KR","iZu":"KR","Less":"BR","mwzera":"BR","Saadhak":"AR","silentzz":"BR","Dantedeu5":"AR","autimatic":"US","nitr0":"US","Ethan":"US","s0m":"US","Keiko":"GB","mada":"CA","brawk":"US","skuba":"US","Xdll":"JP","SugarZ3ro":"JP","Laz":"JP","eko":"KR","SyouTa":"JP","MiniBoo":"LT","nAts":"RU","ShahZaM":"US","frttt":"BR","kamo":"PL","purp0":"RU","Wayne":"SG","Zekken":"US","aspas":"BR","Sacy":"BR","nzr":"AR","Mazino":"CL","tex":"DE","tteuw":"BR","Verno":"US","Knight":"CN","whzy":"CN","rushia":"CN","Levius":"CN","nephh":"SG","Suygetsu":"RU","Sheydos":"RU","N4RRATE":"US","Lewn":"TR","dos9":"KZ","sScary":"TH","BerLIN":"TW","AAAAY":"CN","Haodong":"CN","Abo":"CN","Chronicle":"RU","Derke":"FI","Jamppi":"FI","Cyvoph":"FR","Sayonara":"MD","PROFEK":"PL","Shao":"RU","ANGE1":"UA","Crazyface":"TW","Filu":"PL","hiro":"NL","ComeBack":"TR","chloric":"US","eeiu":"CA","koalanoob":"CA","artzin":"BR","lucks":"BR","nerve":"US","alym":"US","Zellsis":"US","Xeppaa":"US","penny":"CA","OXY":"US","v1c":"US","Izzy":"TR","nekky":"TR","Chronicle":"RU","Sayf":"SE","yay":"US","mindfreak":"ID","Boostio":"US","NaturE":"TR","Mendo":"SE","MiniBoo":"LT","Moose":"US","supamen":"US","tuyz":"BR","TenZ":"CA","Nadeshot":"US"};

console.log('Fetching Valorant players from DB...');
const snap = await db.collection('pro-gamers').where('game', '==', 'Valorant').get();
console.log(`  ${snap.size} players found`);

let updated = 0, skipped = 0, noMatch = 0;
const batch = db.batch();
let batchCount = 0;

for (const docSnap of snap.docs) {
  const data = docSnap.data();
  const code = NAT[data.name];
  if (!code) { noMatch++; continue; }
  if (data.nationality === code) { skipped++; continue; }
  batch.update(docSnap.ref, { nationality: code });
  batchCount++;
  updated++;
}

if (batchCount > 0) await batch.commit();

console.log(`\nDone. Updated: ${updated}, Skipped: ${skipped}, No match: ${noMatch}`);
process.exit(0);
