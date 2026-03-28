import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getFirebaseFirestore } from "@/services/shared/firebaseApp";

export type OrgProfileData = {
  email: string;
  role: string;
  organizationName?: string;
  description?: string;
  website?: string;
  phone?: string;
  city?: string;
  address?: string;
  logoUrl?: string;
  points?: number;
  displayName?: string;
};

export type OrgProfileUpdate = Partial<
  Pick<
    OrgProfileData,
    "organizationName" | "description" | "website" | "phone" | "city" | "address" | "logoUrl"
  >
>;

export const organizationProfileService = {
  async getProfile(uid: string): Promise<OrgProfileData | null> {
    const db = getFirebaseFirestore();
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) return null;
    return snap.data() as OrgProfileData;
  },

  async updateProfile(uid: string, data: OrgProfileUpdate): Promise<void> {
    const db = getFirebaseFirestore();
    await updateDoc(doc(db, "users", uid), { ...data });
  },
};
