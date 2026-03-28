import type { Timestamp } from "firebase/firestore";

/** Root: `organizations/{organizationId}` */
export type OrganizationDoc = {
  ownerId?: string | null;
  name: string;
  city: string;
  avatarUrl?: string | null;
  dashboardSubtitle?: string | null;
  statTotalVolunteersReached: number;
  statVolunteersTrendPercent: number;
  statEventsHeld: number;
  statEventsPending: number;
  statImpactScore: string;
  statImpactRankLabel?: string | null;
};

/** Root: `events/{eventId}` */
export type EventDoc = {
  organizationId: string;
  title: string;
  description?: string | null;
  status: "draft" | "upcoming" | "in_progress" | "completed" | "cancelled";
  startsAt: Timestamp;
  endsAt?: Timestamp | null;
  capacity: number;
  coverImageUrl?: string | null;
};

/** Root: `applications/{applicationId}` */
export type ApplicationDoc = {
  eventId: string;
  volunteerId: string;
  status: "pending" | "approved" | "rejected" | "completed";
  createdAt: Timestamp;
};

/** Root: `profiles/{userId}` (same id as Firebase Auth uid) */
export type ProfileDoc = {
  fullName?: string | null;
  avatarUrl?: string | null;
  role?: string | null;
};
