import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBq30FaBmNCKu4bd-dFiN9cDZAxuYi7X98",
  authDomain: "opentrack-os.firebaseapp.com",
  projectId: "opentrack-os",
  databaseURL: "https://opentrack-os-default-rtdb.europe-west1.firebasedatabase.app",
  storageBucket: "opentrack-os.firebasestorage.app",
  messagingSenderId: "1063209686278",
  appId: "1:1063209686278:web:8b2ef35bf26d42c59f3a87",
  measurementId: "G-CK26F1WJED"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function simulate() {
  let lat = 30.0444; 
  let lng = 31.2357;

  console.log("🚀 OpenTrack OS Simulator Started");
  console.log("📍 Target URL:", firebaseConfig.databaseURL);
  console.log("📍 Path: drivers/driver_1/location");

  while (true) {
    try {
      lat += (Math.random() - 0.4) * 0.0005;
      lng += (Math.random() - 0.4) * 0.0005;

      const timestamp = new Date().toISOString();
      
      await set(ref(db, "drivers/driver_1/location"), {
        lat,
        lng,
        updated_at: timestamp
      });

      await set(ref(db, "stats/active_couriers"), 1);

      console.log(`[${timestamp}] ✅ Signal Sent: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } catch (err: any) {
      console.error("❌ Firebase Error:", err.message);
      if (err.code) console.error("Code:", err.code);
    }
    
    await new Promise(r => setTimeout(r, 2000));
  }
}

simulate().catch(err => {
  console.error("💥 Critical Failure:", err);
  process.exit(1);
});
