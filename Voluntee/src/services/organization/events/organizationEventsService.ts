import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { getFirebaseFirestore } from "@/services/shared/firebaseApp";
import type { VolunteerEvent } from "@/types/volunteer/event";

const EVENTS_COLLECTION = "events";

function eventsRef() {
  return collection(getFirebaseFirestore(), EVENTS_COLLECTION);
}

function eventDocRef(eventId: string) {
  return doc(getFirebaseFirestore(), EVENTS_COLLECTION, eventId);
}

export type CreateEventInput = Omit<VolunteerEvent, "id">;

export const organizationEventsService = {
  async createEvent(data: CreateEventInput): Promise<string> {
    const docRef = await addDoc(eventsRef(), {
      ...data,
      volunteersApplied: data.volunteersApplied ?? 0,
      createdAt: data.createdAt ?? new Date().toISOString(),
    });
    return docRef.id;
  },

  async updateEvent(
    eventId: string,
    data: Partial<Omit<VolunteerEvent, "id">>,
  ): Promise<void> {
    await updateDoc(eventDocRef(eventId), data);
  },

  async deleteEvent(eventId: string): Promise<void> {
    await deleteDoc(eventDocRef(eventId));
  },

  async getEventById(eventId: string): Promise<VolunteerEvent | null> {
    const snap = await getDoc(eventDocRef(eventId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as VolunteerEvent;
  },

  async getOrgEvents(organizerId: string): Promise<VolunteerEvent[]> {
    const q = query(
      eventsRef(),
      where("organizerId", "==", organizerId),
      orderBy("createdAt", "desc"),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as VolunteerEvent);
  },
};
