import { initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

/**
 * Firebase setup uses Vite env vars.
 *
 * Add these to .env.local (NOT committed):
 *  VITE_FIREBASE_API_KEY=...
 *  VITE_FIREBASE_AUTH_DOMAIN=...
 *  VITE_FIREBASE_PROJECT_ID=...
 *  VITE_FIREBASE_STORAGE_BUCKET=...
 *  VITE_FIREBASE_MESSAGING_SENDER_ID=...
 *  VITE_FIREBASE_APP_ID=...
 *
 * If env vars are missing, cloud sync is simply disabled.
 */

function env(name: string) {
  // Vite exposes env vars on import.meta.env
  return (import.meta as any)?.env?.[name] as string | undefined;
}

export function isFirebaseConfigured() {
  return Boolean(
    env("VITE_FIREBASE_API_KEY") &&
      env("VITE_FIREBASE_AUTH_DOMAIN") &&
      env("VITE_FIREBASE_PROJECT_ID") &&
      env("VITE_FIREBASE_APP_ID")
  );
}

let _app: FirebaseApp | null = null;
let _db: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;
  if (_app) return _app;

  _app = initializeApp({
    apiKey: env("VITE_FIREBASE_API_KEY"),
    authDomain: env("VITE_FIREBASE_AUTH_DOMAIN"),
    projectId: env("VITE_FIREBASE_PROJECT_ID"),
    storageBucket: env("VITE_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: env("VITE_FIREBASE_MESSAGING_SENDER_ID"),
    appId: env("VITE_FIREBASE_APP_ID"),
  });

  return _app;
}

export function getDb(): Firestore | null {
  const app = getFirebaseApp();
  if (!app) return null;
  if (_db) return _db;
  _db = getFirestore(app);
  return _db;
}
