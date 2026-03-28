import {
  collection,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  getDocs,
} from "firebase/firestore";
import { getFirebaseFirestore } from "@/services/shared/firebaseApp";

export type VolunteerEvent = {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  address: string;
  latitude: number;
  longitude: number;
  startsAt: string;
  durationMinutes: number;
  volunteersNeeded: number;
  volunteersApplied: number;
  points: number;
  organizerName: string;
};

export async function getUpcomingEvents(
  limit: number = 10,
): Promise<VolunteerEvent[]> {
  const db = getFirebaseFirestore();
  const now = new Date().toISOString();

  const q = query(
    collection(db, "events"),
    where("startsAt", ">", now),
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
