
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function updateCryocells() {
  const proData = {
    name: "Cryocells",
    team: "100 Thieves",
    game: "Valorant",
    profileUrl: "https://prosettings.net/players/cryocells/",
    imageUrl: "https://prosettings.net/wp-content/uploads/cryocells.png",
    teamLogoUrl: "https://prosettings.net/wp-content/uploads/100-thieves-logo.png",
    gear: {
      mouse: "LAMZU MAYA X PURPLE SHADOW",
      keyboard: "Wooting 80HE Zinc White",
      monitor: "ZOWIE XL2566X+",
      mousepad: "Pulsar eS Saturn Pro Black"
    },
    settings: {
      dpi: 800,
      sensitivity: 0.16,
      edpi: 128
    },
    updatedAt: new Date().toISOString(),
    source: "Image-based Standardized Update"
  };

  const gamerId = "valorant_cryocells";
  await setDoc(doc(db, "pro-gamers", gamerId), proData, { merge: true });
  console.log(`Successfully updated Cryocells (${gamerId}) based on image data.`);
}

updateCryocells().catch(console.error);
