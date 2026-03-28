export type EventCategory =
  | "environment"
  | "social"
  | "animals"
  | "community"
  | "education";

export type VolunteerEvent = {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
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

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  environment: "Environment",
  social: "Social",
  animals: "Animals",
  community: "Community",
  education: "Education",
};

export const ALL_CATEGORIES: EventCategory[] = [
  "environment",
  "social",
  "animals",
  "community",
  "education",
];
