import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

function env(k: string) {
  // Vite exposes env vars on import.meta.env
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return String((import.meta as any).env?.[k] ?? "");
}

export function firebaseConfigured() {
  const pid = env("VITE_FIREBASE_PROJECT_ID");
  const api = env("VITE_FIREBASE_API_KEY");
  if (!pid || !api) return false;
  if (pid.includes("PASTE_ME") || api.includes("REDACTED")) return false;
  return true;
}

export function getFirebaseApp() {
  const config = {
    apiKey: env("VITE_FIREBASE_API_KEY"),
    authDomain: env("VITE_FIREBASE_AUTH_DOMAIN"),
    projectId: env("VITE_FIREBASE_PROJECT_ID"),
    storageBucket: env("VITE_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: env("VITE_FIREBASE_MESSAGING_SENDER_ID"),
    appId: env("VITE_FIREBASE_APP_ID"),
  };
  return getApps().length ? getApp() : initializeApp(config);
}

export function getDb() {
  return getFirestore(getFirebaseApp());
}
