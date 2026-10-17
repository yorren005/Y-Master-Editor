import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function run() {
  const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  await db.collection('app_meta').doc('desktop_release').set({
    version: pkg.version,
    releaseNotes: `Automated Desktop Release v${pkg.version}`,
    publishedAt: FieldValue.serverTimestamp()
  });
  console.log(`Broadcasted Desktop v${pkg.version} to Firebase`);
}
run().catch((e) => { console.error(e); process.exit(1); });
