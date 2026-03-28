import {
  collection,
  query,
  orderBy,
  limit as firestoreLimit,
  getDocs,
} from "firebase/firestore";
import { getFirebaseFirestore } from "@/services/shared/firebaseApp";
import type { VolunteerEvent } from "@/types/volunteer/event";

export type { VolunteerEvent };

export async function getUpcomingEvents(
  limit: number = 10,
): Promise<VolunteerEvent[]> {
  const db = getFirebaseFirestore();

  const q = query(
    collection(db, "events"),
    orderBy("startsAt", "asc"),
    firestoreLimit(limit),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<VolunteerEvent, "id">),
  }));
}

export const volunteerHomeService = {
  getUpcomingEvents,
};
