import type { VolunteerEvent, EventCategory } from "@/types/volunteer/event";
import { MOCK_MAP_EVENTS, ZAGREB_CENTER } from "./mockMapData";

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

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

export const volunteerMapService = {
  getNearby: async (opts: {
    category?: EventCategory | null;
    search?: string;
    radiusKm?: number;
  }): Promise<MapEvent[]> => {
    await delay(200);

    const { category, search, radiusKm = 10 } = opts;
    const userLat = ZAGREB_CENTER.latitude;
    const userLon = ZAGREB_CENTER.longitude;
    const q = (search ?? "").toLowerCase().trim();

    let events: VolunteerEvent[] = MOCK_MAP_EVENTS;

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
