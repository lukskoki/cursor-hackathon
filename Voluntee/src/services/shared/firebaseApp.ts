import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getFirebaseWebConfig, isFirebaseConfigured } from "@/config/firebaseEnv";

/**
 * Uses `getAuth` so TypeScript matches the web typings bundle.
 * For stronger session persistence on device, you can switch to
 * `initializeAuth` + `getReactNativePersistence` from the React Native
 * Firebase Auth build (see Firebase Expo guide) once typings are wired.
 */
export class FirebaseNotConfiguredError extends Error {
  constructor() {
    super("Firebase is not configured. Set EXPO_PUBLIC_FIREBASE_* environment variables.");
    this.name = "FirebaseNotConfiguredError";
  }
}

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured()) {
    throw new FirebaseNotConfiguredError();
  }
  if (appInstance) {
    return appInstance;
  }
  const config = getFirebaseWebConfig()!;
  appInstance =
    getApps().length === 0 ? initializeApp(config) : getApp();
  return appInstance;
}

export function getFirebaseAuth(): Auth {
  if (!isFirebaseConfigured()) {
    throw new FirebaseNotConfiguredError();
  }
  if (authInstance) {
    return authInstance;
  }
  authInstance = getAuth(getFirebaseApp());
  return authInstance;
}

export function getFirebaseFirestore(): Firestore {
  if (!isFirebaseConfigured()) {
    throw new FirebaseNotConfiguredError();
  }
  if (!dbInstance) {
    dbInstance = getFirestore(getFirebaseApp());
  }
  return dbInstance;
}
