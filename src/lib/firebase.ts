import { initializeApp, getApp, getApps } from "firebase/app";
import { getDatabase, Database } from "firebase/database";

const databaseURL =
  process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
  "https://opentrack-os-default-rtdb.europe-west1.firebasedatabase.app";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBq30FaBmNCKu4bd-dFiN9cDZAxuYi7X98",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "opentrack-os.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "opentrack-os",
  databaseURL,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "opentrack-os.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1063209686278",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1063209686278:web:8b2ef35bf26d42c59f3a87",
};

// Check if developer explicitly requested Mock Mode or if Firebase is not enabled
export const isMockMode = process.env.NEXT_PUBLIC_TRACKING_MODE === "mock";

let dbInstance: Database | null = null;

try {
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  dbInstance = getDatabase(app);
} catch (err) {
  console.warn("[Firebase] Initialized in Standalone Fallback Mode:", err);
}

export const db = dbInstance;
