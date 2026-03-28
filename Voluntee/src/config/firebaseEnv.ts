/**
 * Set these in `.env` (Expo loads EXPO_PUBLIC_* at build time):
 * EXPO_PUBLIC_FIREBASE_API_KEY
 * EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
 * EXPO_PUBLIC_FIREBASE_PROJECT_ID
 * EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
 * EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
 * EXPO_PUBLIC_FIREBASE_APP_ID
 */

export type FirebaseWebConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

function trimEnv(v: string | undefined): string | undefined {
  if (v == null || String(v).trim() === "") {
    return undefined;
  }
  return String(v).trim();
}

export function getFirebaseWebConfig(): FirebaseWebConfig | null {
  const apiKey = trimEnv(process.env.EXPO_PUBLIC_FIREBASE_API_KEY);
  const authDomain = trimEnv(process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN);
  const projectId = trimEnv(process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID);
  const storageBucket = trimEnv(process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET);
  const messagingSenderId = trimEnv(
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  );
  const appId = trimEnv(process.env.EXPO_PUBLIC_FIREBASE_APP_ID);
  if (
    !apiKey ||
    !authDomain ||
    !projectId ||
    !storageBucket ||
    !messagingSenderId ||
    !appId
  ) {
    return null;
  }
  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  };
}

export function isFirebaseConfigured(): boolean {
  return getFirebaseWebConfig() !== null;
}
