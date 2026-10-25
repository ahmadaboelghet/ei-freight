/**
 * @file src/config/firebase.ts
 * @description Initializes the Firebase App, Auth, and Functions.
 *              This is the SINGLE source of truth for all Firebase client SDK instances.
 *              Import `auth` and `functions` from here — never re-initialize elsewhere.
 */

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator, Auth } from "firebase/auth";
import {
  getFunctions,
  connectFunctionsEmulator,
  Functions,
} from "firebase/functions";
import { getFirestore, connectFirestoreEmulator, Firestore } from "firebase/firestore";

// ─────────────────────────────────────────────────────────────
// CONFIG — pulled from Vite's env variables (.env.local)
// ─────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// ── Guard: prevent double initialization in React StrictMode / HMR ──
const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// ─────────────────────────────────────────────────────────────
// SERVICE INSTANCES
// ─────────────────────────────────────────────────────────────

export const auth: Auth = getAuth(app);

/**
 * Functions instance scoped to the backend region.
 * Must match the `region` set in your Cloud Functions `onCall` config.
 * Step 1 uses "europe-west1" — change to match your deployment.
 */
export const functions: Functions = getFunctions(app, "europe-west1");

export const db: Firestore = getFirestore(app);

// ─────────────────────────────────────────────────────────────
// EMULATOR — active only during local development
// ─────────────────────────────────────────────────────────────
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === "true") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  console.info("[Firebase] 🔧 Connected to local emulators");
}

export default app;
