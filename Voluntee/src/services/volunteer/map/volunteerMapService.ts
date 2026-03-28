import {
  collection,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { getFirebaseFirestore } from "@/services/shared/firebaseApp";
import type { VolunteerEvent, EventCategory } from "@/types/volunteer/event";

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export type MapEvent = VolunteerEvent & { distanceKm: number };

const EVENTS_COLLECTION = "events";

function docToEvent(id: string, data: Record<string, unknown>): VolunteerEvent {
  return {
    id,
    title: data.title as string,
    description: data.description as string,
    category: data.category as EventCategory,
    tags: data.tags as string[],
    address: data.address as string,
    latitude: data.latitude as number,
    longitude: data.longitude as number,
    startsAt: data.startsAt as string,
    durationMinutes: data.durationMinutes as number,
    volunteersNeeded: data.volunteersNeeded as number,
    volunteersApplied: data.volunteersApplied as number,
    points: data.points as number,
    organizerName: data.organizerName as string,
    organizerId: (data.organizerId as string) ?? "",
    createdAt: (data.createdAt as string) ?? "",
  };
}

export const volunteerMapService = {
  getById: async (id: string): Promise<VolunteerEvent | null> => {
    const db = getFirebaseFirestore();
    const snap = await getDoc(doc(db, EVENTS_COLLECTION, id));
    if (!snap.exists()) return null;
    return docToEvent(snap.id, snap.data() as Record<string, unknown>);
  },

  getNearby: async (opts: {
    userLat: number;
    userLon: number;
    category?: EventCategory | null;
    search?: string;
    radiusKm?: number;
  }): Promise<MapEvent[]> => {
    const { userLat, userLon, category, search, radiusKm = 10 } = opts;
    const q = (search ?? "").toLowerCase().trim();

    const db = getFirebaseFirestore();
    const snap = await getDocs(collection(db, EVENTS_COLLECTION));

    let events: VolunteerEvent[] = snap.docs.map((d) =>
      docToEvent(d.id, d.data() as Record<string, unknown>),
    );

    if (category) {
      events = events.filter((e) => e.category === category);
    }

    if (q) {
      events = events.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.address.toLowerCase().includes(q) ||
          e.organizerName.toLowerCase().includes(q) ||
          e.category.includes(q),
      );
    }

    return events
      .map((e) => ({
        ...e,
        distanceKm: haversineKm(userLat, userLon, e.latitude, e.longitude),
      }))
      .filter((e) => e.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  },
};
