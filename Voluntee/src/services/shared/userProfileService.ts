import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import type { UserProfile, UserRole } from "@/types/shared/user";
import { getFirebaseFirestore } from "./firebaseApp";

const USERS_COLLECTION = "users";

function parseProfile(uid: string, data: Record<string, unknown>): UserProfile | null {
  const role = data.role as UserRole | undefined;
  const email = String(data.email ?? "");

  if (role === "volunteer") {
    return {
      id: uid,
      role: "volunteer",
      email,
      displayName: String(data.displayName ?? ""),
    };
  }

  if (role === "organization") {
    return {
      id: uid,
      role: "organization",
      email,
      organizationName: String(data.organizationName ?? ""),
      oib: String(data.oib ?? "").replace(/\s/g, ""),
      contactPersonName: data.contactPersonName
        ? String(data.contactPersonName)
        : undefined,
      city: data.city ? String(data.city) : undefined,
      description: data.description ? String(data.description) : undefined,
    };
  }

  return null;
}

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const db = getFirebaseFirestore();
  const snap = await getDoc(doc(db, USERS_COLLECTION, uid));
  if (!snap.exists()) {
    return null;
  }
  return parseProfile(uid, snap.data() as Record<string, unknown>);
}

/** Handles brief race right after signup before Firestore write is visible. */
export async function fetchUserProfileWithRetry(
  uid: string,
  opts: { attempts?: number; delayMs?: number } = {},
): Promise<UserProfile | null> {
  const attempts = opts.attempts ?? 6;
  const delayMs = opts.delayMs ?? 350;
  for (let i = 0; i < attempts; i++) {
    const profile = await fetchUserProfile(uid);
    if (profile) {
      return profile;
    }
    if (i < attempts - 1) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  return null;
}

export async function createVolunteerProfile(
  uid: string,
  email: string,
  displayName: string,
): Promise<void> {
  const db = getFirebaseFirestore();
  await setDoc(doc(db, USERS_COLLECTION, uid), {
    role: "volunteer",
    email,
    displayName: displayName.trim(),
    createdAt: serverTimestamp(),
  });
}

export async function createOrganizationProfile(
  uid: string,
  payload: {
    email: string;
    organizationName: string;
    oib: string;
    contactPersonName?: string;
  },
): Promise<void> {
  const db = getFirebaseFirestore();
  await setDoc(doc(db, USERS_COLLECTION, uid), {
    role: "organization",
    email: payload.email,
    organizationName: payload.organizationName.trim(),
    oib: payload.oib.replace(/\s/g, ""),
    contactPersonName: payload.contactPersonName?.trim() || null,
    createdAt: serverTimestamp(),
  });
}
