import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { getFirebaseFirestore } from "@/services/shared/firebaseApp";
import type { Badge, BadgeId } from "@/types/volunteer/badge";
import type { EventCategory } from "@/types/volunteer/event";

type BadgeDefinition = {
  id: BadgeId;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  category?: EventCategory;
};

const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: "first_event",
    name: "First Volunteer Event",
    description: "Complete your first volunteer event",
    icon: "ribbon",
    requirement: 1,
  },
  {
    id: "community_helper",
    name: "Community Helper",
    description: "Complete 10 volunteer events",
    icon: "people",
    requirement: 10,
  },
  {
    id: "city_hero",
    name: "City Hero",
    description: "Complete 50 volunteer events",
    icon: "trophy",
    requirement: 50,
  },
  {
    id: "eco_warrior",
    name: "Eco Warrior",
    description: "Complete 5 environment events",
    icon: "leaf",
    requirement: 5,
    category: "environment",
  },
  {
    id: "animal_friend",
    name: "Animal Friend",
    description: "Complete 5 animal events",
    icon: "paw",
    requirement: 5,
    category: "animals",
  },
];

async function getBadges(userId: string): Promise<Badge[]> {
  const db = getFirebaseFirestore();

  const applicationsQuery = query(
    collection(db, "applications"),
    where("userId", "==", userId),
    where("status", "==", "accepted"),
  );

  const snapshot = await getDocs(applicationsQuery);

  const eventIds = new Set<string>();
  snapshot.docs.forEach((d) => {
    const data = d.data();
    if (data.eventId) eventIds.add(data.eventId as string);
  });

  const categoryCounts: Partial<Record<EventCategory, number>> = {};
  let totalCompleted = 0;

  await Promise.all(
    Array.from(eventIds).map(async (eventId) => {
      const eventDoc = await getDoc(doc(db, "events", eventId));
      if (!eventDoc.exists()) return;
      totalCompleted++;
      const category = eventDoc.data().category as EventCategory | undefined;
      if (category) {
        categoryCounts[category] = (categoryCounts[category] ?? 0) + 1;
      }
    }),
  );

  return BADGE_DEFINITIONS.map((def) => {
    const progress = def.category
      ? (categoryCounts[def.category] ?? 0)
      : totalCompleted;

    return {
      id: def.id,
      name: def.name,
      description: def.description,
      icon: def.icon,
      requirement: def.requirement,
      category: def.category,
      unlocked: progress >= def.requirement,
      progress,
    };
  });
}

export const volunteerBadgeService = { getBadges };
