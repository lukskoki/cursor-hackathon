import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  updateDoc,
  increment,
} from "firebase/firestore";
import { getFirebaseFirestore } from "@/services/shared/firebaseApp";

export type Application = {
  id: string;
  eventId: string;
  userId: string;
  userEmail: string;
  status: "pending" | "accepted" | "rejected";
  appliedAt: string;
};

const APPLICATIONS = "applications";
const EVENTS = "events";

function db() {
  return getFirebaseFirestore();
}

export const volunteerApplicationsService = {
  async applyToEvent(
    eventId: string,
    userId: string,
    userEmail: string,
  ): Promise<string> {
    const docRef = await addDoc(collection(db(), APPLICATIONS), {
      eventId,
      userId,
      userEmail,
      status: "pending",
      appliedAt: new Date().toISOString(),
    });

    await updateDoc(doc(db(), EVENTS, eventId), {
      volunteersApplied: increment(1),
    });

    return docRef.id;
  },

  async getMyApplications(userId: string): Promise<Application[]> {
    const q = query(
      collection(db(), APPLICATIONS),
      where("userId", "==", userId),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Application);
  },

  async cancelApplication(
    applicationId: string,
    eventId: string,
  ): Promise<void> {
    await deleteDoc(doc(db(), APPLICATIONS, applicationId));
    await updateDoc(doc(db(), EVENTS, eventId), {
      volunteersApplied: increment(-1),
    });
  },

  async hasApplied(eventId: string, userId: string): Promise<boolean> {
    const q = query(
      collection(db(), APPLICATIONS),
      where("eventId", "==", eventId),
      where("userId", "==", userId),
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  },
};
