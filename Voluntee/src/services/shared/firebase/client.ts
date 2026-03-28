import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey?.trim() &&
      firebaseConfig.projectId?.trim() &&
      firebaseConfig.appId?.trim(),
  );
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

function getOrInitApp(): FirebaseApp {
  if (app) return app;
  const existing = getApps()[0];
  if (existing) {
    app = existing;
    return app;
  }
  if (!isFirebaseConfigured()) {
    throw new Error(
      "Firebase is not configured. Set EXPO_PUBLIC_FIREBASE_* keys in .env (see .env.example).",
    );
  }
  app = initializeApp({
    apiKey: firebaseConfig.apiKey,
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId,
    appId: firebaseConfig.appId,
  });
  return app;
}

export function getFirebaseFirestore(): Firestore {
  if (db) return db;
  db = getFirestore(getOrInitApp());
  return db;
}

/**
 * Firebase Auth. When you add Google Sign-In, use the same instance after `signInWithCredential`.
 * For AsyncStorage-backed session persistence on native, wire `initializeAuth` + `getReactNativePersistence`
 * from the React Native build of `@firebase/auth` (see Firebase RN docs) if `getAuth` alone is not enough.
 */
export function getFirebaseAuth(): Auth {
  if (auth) return auth;
  auth = getAuth(getOrInitApp());
  return auth;
}
