// Update OW2 profileUrl → Liquipedia URLs (overwrite prosettings URLs)
// Usage: node scripts/set_ow2_liquipedia_profileurl.mjs
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sa = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'service-account.json'), 'utf8'));
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();
db.settings({ databaseId: 'ai-studio-6d824db4-a574-4a12-be39-0476107b494a' });

const B = 'https://liquipedia.net/overwatch/';
const LIQ_MAP = {"ANJ":"ANJ","AV2RY":"AV2RY","Ackyyy":"Ackyyy","Ado":"Ado","AimGod":"AimGod","AlphaYi":"AlphaYi","Amity":"Amity","Ashh":"Ashh","AutumnSouls":"AutumnSouls","Bernar":"Bernar","birdring":"Birdring","BrightSide":"BrightSide","Farway1987":"Cao_Jiale","Carpe":"Carpe","Checkmate":"Checkmate","ChiYo":"ChiYo","Colourhex":"Colourhex","Crimzo":"Crimzo","DarthMurloc":"DarthMurloc","Dior":"Dior","divine":"Divine","Domlyy":"Domlyy","Dreamer":"Dreamer","EFF0RT":"EFF0RT","EgS":"EgS","emongg":"Emongg","Escanor":"Escanor","Exrai":"Exrai","F4zE":"F4zE","FDGod":"FDGod","FakeJake":"FakeJake","Fearless":"Fearless","FiNN":"FiNN","Fielder":"Fielder","FodCarry":"FodCarry","FunnyAstro":"FunnyAstro","Gass":"Gass","gcb":"Gcb","Glister":"Glister","Hafficool":"Hafficool","Haksal":"Haksal","HanBin":"Hanbin","HaydenRHN":"HaydenRHN","HeeSang":"HeeSang","Heesu":"Heesu","HyVision":"HyVision","Hybrid":"Hybrid_(British_player)","Hydron":"Hydron","Hyouka":"Hyouka","iCy":"ICy","icav":"Icav","infekted":"Infekted","Izayaki":"Izayaki","JJoNaK":"JJoNak","JaeWoo":"JaeWoo","JayCo":"JayCo","Jonte":"Jonte","KORZ":"KORZ","Ksaa":"KSAA","KariV":"KariV","Kawhi":"Kawhi","kevster":"Kevster","Kresnik":"Kresnik","Kronik":"Kronik","LBBD7":"LBBD7","LCŠ":"LC%C5%A0","LIP":"LIP","Lars":"Lars","Lastro":"Lastro","LeeJaeGon":"LeeJaeGon","Legendary":"Legendary","Lep":"Lep","Lethal":"Lethal","LhCloudy":"LhCloudy","Kaneki":"Liu_Nian","Diya":"Lu_Weida","Lynrax":"Lynrax","Lyric":"Lyric","Mer1t":"MER1T","LateYoung":"Ma_Tianbin","Mag":"Mag","Maksal":"Maksal","Masaa":"Masaa","McGravy":"McGravy","Mellun":"Mellun","Mine":"Minefan006","Myunb0ng":"Myunb0ng","NenWhy":"NenWhy","nero":"Nero","Eileen":"Ou_Yiliang","p0int":"P0int","PGE":"PGE","Patiphan":"Patiphan","Pelican":"Pelican","Proper":"Proper","Prophet":"Prophet","Prota":"Prota","proud":"Proud","Qlm":"Qlm","Quartz":"Quartz","Raikker":"Raikker","rakattack":"Rakattack","Rawkus":"Rawkus","Rokit":"Rokit","Rupal":"Rupal","sHockWave":"SHockWave","Sayaplayer":"Sayaplayer","seeker":"Seeker","Shax":"Shax","DuFan":"Shi_Shuaishuai","Shu":"Shu","SirMajed":"SirMajed","Sky5niper":"Sky5niper","snappe":"Snappe","SoOn":"SoOn","Soax":"Soax","sonder":"Sonder","SP9RK1E":"Sp9rk1e","SparkR":"SparkR","Stalk3r":"Stalk3r","sugarfree":"Sugarfree","sunset":"Sunset","Surefour":"Surefour","TR33":"TR33","ta1yo":"Ta1yo","teksol":"Teksol","tunder":"Tunder","Vega":"Vega","Vigilante":"Vigilante","Viol2t":"Viol2t","Void":"Void","VoltsA":"VoltsA","Willys07":"Willys07","XepheR":"XepheR","xomba":"Xomba","Guxue":"Xu_Qiulin","Xzi":"Xzi","YZNSA":"YZNSA","Yaki":"Yaki","JinMu":"Yi_Hu","Yimitra":"Yimitra","Youbi":"Youbi","Zest":"ZEST","zPanthr":"ZPanthr","zeruhh":"Zeruhh","Shy":"Zheng_Yangjie","Mmonk":"Zhou_Xiang","Zinnia":"Zinnia","Zoey":"Zoey","zox":"Zox","GAP":"GAP","Glitch":"Glitch","HanBin":"Hanbin","Harbleu":"Harbleu","Yoshinori2k":"Yoshinori2k","Performance":"Performance","Ostrix":"Ostrix","Paolette":"Paolette","Nyohl":"Nyohl","Dalca":"Dalca","Chorong":"Chorong","Noxious":"Noxious_(Canadian_player)","Eden":"Eden","PaLee":"PaLee","Rajeem":"Rajeem","Shinigami":"Shinigami","Castled":"Castled","Wed":"Wed","CLEAR":"CLEAR"};

// Build full URL map
const urlMap = {};
for (const [name, slug] of Object.entries(LIQ_MAP)) {
  urlMap[name] = B + slug;
}

const snap = await db.collection('pro-gamers').where('game', '==', 'Overwatch 2').get();
let batch = db.batch();
let cnt = 0, updated = 0, skipped = 0;

const flush = async () => {
  if (cnt > 0) { await batch.commit(); console.log(`  Committed ${cnt}`); batch = db.batch(); cnt = 0; }
};

for (const docSnap of snap.docs) {
  const data = docSnap.data();
  const liqUrl = urlMap[data.name];
  if (!liqUrl) { skipped++; continue; }
  // Always overwrite with Liquipedia URL
  if (data.profileUrl === liqUrl) { skipped++; continue; }
  batch.update(docSnap.ref, { profileUrl: liqUrl });
  cnt++; updated++;
  if (cnt >= 400) await flush();
}
await flush();

console.log(`\n완료: Updated=${updated}, Skipped=${skipped}`);
process.exit(0);
