import { doc, getDoc } from "firebase/firestore";
import type { VolunteerProfileDetail } from "@/types/volunteer/profile";
import { getFirebaseAuth, getFirebaseFirestore } from "@/services/shared/firebaseApp";

const USERS = "users";

function readNumber(data: Record<string, unknown>, key: string): number {
  const v = data[key];
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  return 0;
}

function readString(data: Record<string, unknown>, key: string, fallback: string): string {
  const v = data[key];
  if (v == null) return fallback;
  const s = String(v).trim();
  return s.length > 0 ? s : fallback;
}

function avatarUrlForUser(
  data: Record<string, unknown>,
  displayName: string,
  firebasePhotoUrl: string | null,
): string {
  const fromDoc = data.avatarUrl;
  if (typeof fromDoc === "string" && fromDoc.startsWith("http")) {
    return fromDoc;
  }
  if (firebasePhotoUrl) {
    return firebasePhotoUrl;
  }
  const name = encodeURIComponent(displayName || "User");
  return `https://ui-avatars.com/api/?name=${name}&background=208AEF&color=fff&size=256`;
}

/**
 * Profil volontera iz Firestore `users/{uid}` + Firebase Auth (photo, displayName).
 * Statistike i liste (badges, aktivnosti…) opcionalno iz istog dokumenta kad ih dodate u shemu.
 */
export const volunteerProfileService = {
  async getProfile(): Promise<VolunteerProfileDetail> {
    const auth = getFirebaseAuth();
    const u = auth.currentUser;
    if (!u) {
      throw new Error("Not signed in");
    }

    const db = getFirebaseFirestore();
    const snap = await getDoc(doc(db, USERS, u.uid));
    if (!snap.exists()) {
      throw new Error("Profile not found");
    }

    const data = snap.data() as Record<string, unknown>;
    if (data.role !== "volunteer") {
      throw new Error("Not a volunteer profile");
    }

    const displayName = readString(
      data,
      "displayName",
      u.displayName?.trim() || u.email?.split("@")[0] || "Volunteer",
    );
    const location = readString(data, "location", "—");
    const bio = readString(
      data,
      "bio",
      "No bio yet. Tell others what drives you to volunteer.",
    );

    const avatarUrl = avatarUrlForUser(data, displayName, u.photoURL ?? null);

    return {
      appName: "Voluntee",
      displayName,
      location,
      bio,
      avatarUrl,
      totalPoints: readNumber(data, "totalPoints"),
      eventsCompleted: readNumber(data, "eventsCompleted"),
      impactHours: readNumber(data, "impactHours"),
      badges: [],
      pastActivities: [],
      reviews: [],
      interests: [],
    };
  },
};
