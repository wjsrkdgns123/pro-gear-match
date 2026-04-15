import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('service-account.json', 'utf8'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();
db.settings({ databaseId: 'ai-studio-6d824db4-a574-4a12-be39-0476107b494a' });

const snapshot = await db.collection('pro-gamers').get();
let fixed = 0;

for (const docSnap of snapshot.docs) {
  const data = docSnap.data();
  const gear = data.gear || {};
  const gearFields = ['mouse', 'keyboard', 'monitor', 'mousepad', 'controller'];

  const updates = {};
  for (const field of gearFields) {
    const val = gear[field];
    if (val !== undefined && (val === '[object Object]' || val === 'null' || val === 'undefined')) {
      updates[`gear.${field}`] = '';
    }
  }

  if (Object.keys(updates).length > 0) {
    await docSnap.ref.update(updates);
    console.log(`[수정] ${data.name} (${data.game}):`, updates);
    fixed++;
  }
}

console.log(`\n완료: ${fixed}개 문서 정리`);
process.exit(0);
