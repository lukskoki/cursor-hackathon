import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { getFirebaseFirestore } from "@/services/shared/firebaseApp";
import type {
  OrganizerDashboardData,
  OrganizerDashboardStats,
  OrganizerApplication,
  ActiveOrganizerEvent,
  OrganizerEventListRow,
  OrganizerEventListStatus,
} from "@/types/organization/dashboard";

// -- Firestore document shapes --

type FirestoreEvent = {
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
  organizerId: string;
  createdAt: string;
};

type FirestoreApplication = {
  eventId: string;
  userId: string;
  userEmail: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  appliedAt: string;
};

// -- Helpers --

const IN_QUERY_BATCH = 30;

function deriveEventStatus(startsAt: string, durationMinutes: number): OrganizerEventListStatus {
  const now = Date.now();
  const start = new Date(startsAt).getTime();
  const end = start + durationMinutes * 60_000;
  if (now >= start && now < end) return "in_progress";
  if (now >= end) return "completed";
  return "upcoming";
}

function formatRelativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatStartsIn(isoDate: string): string {
  const diffMs = new Date(isoDate).getTime() - Date.now();
  const mins = Math.floor(diffMs / 60_000);
  const time = new Date(isoDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (mins < 60) return `Starts in ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Starts today · ${time}`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return `Starts tomorrow · ${time}`;
  return `Starts in ${days} days`;
}

function formatEventDate(isoDate: string): string {
  const d = new Date(isoDate);
  const date = d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return `${date} · ${time}`;
}

function buildDetailLabel(status: OrganizerEventListStatus, event: FirestoreEvent): string {
  switch (status) {
    case "in_progress":
      return `${event.volunteersApplied} / ${event.volunteersNeeded} volunteers · Now`;
    case "upcoming":
      return `${formatEventDate(event.startsAt)} · ${event.address}`;
    case "completed":
      return `Completed · ${event.volunteersApplied} volunteers`;
    default:
      return event.address;
  }
}

function avatarUrl(email: string): string {
  const name = email.split("@")[0];
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
}

// -- Queries --

async function fetchOrgEvents(organizerId: string): Promise<(FirestoreEvent & { id: string })[]> {
  const db = getFirebaseFirestore();
  const q = query(collection(db, "events"), where("organizerId", "==", organizerId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as FirestoreEvent) }));
}

async function fetchApplicationsForEvents(
  eventIds: string[],
): Promise<(FirestoreApplication & { id: string })[]> {
  if (eventIds.length === 0) return [];

  const db = getFirebaseFirestore();
  const results: (FirestoreApplication & { id: string })[] = [];

  for (let i = 0; i < eventIds.length; i += IN_QUERY_BATCH) {
    const batch = eventIds.slice(i, i + IN_QUERY_BATCH);
    const q = query(collection(db, "applications"), where("eventId", "in", batch));
    const snap = await getDocs(q);
    for (const d of snap.docs) {
      results.push({ id: d.id, ...(d.data() as FirestoreApplication) });
    }
  }

  return results;
}

// -- Build dashboard data --

function buildStats(
  events: (FirestoreEvent & { id: string })[],
  applications: (FirestoreApplication & { id: string })[],
): OrganizerDashboardStats {
  const completedCount = events.filter(
    (e) => deriveEventStatus(e.startsAt, e.durationMinutes) === "completed",
  ).length;
  const pendingCount = events.filter(
    (e) => deriveEventStatus(e.startsAt, e.durationMinutes) === "upcoming",
  ).length;
  const acceptedCount = applications.filter((a) => a.status === "accepted" || a.status === "completed").length;
  const totalApplicants = applications.length;

  return {
    totalVolunteersReached: acceptedCount,
    volunteersTrendPercent: 0,
    eventsHeld: completedCount,
    eventsPending: pendingCount,
    impactScore:
      events.length > 0 ? (acceptedCount / Math.max(events.length, 1)).toFixed(1) : "0",
    impactRankLabel: `${totalApplicants} total applicants`,
  };
}

function buildApplications(
  apps: (FirestoreApplication & { id: string })[],
  eventMap: Map<string, FirestoreEvent & { id: string }>,
): OrganizerApplication[] {
  return apps
    .filter((a) => a.status === "pending")
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
    .map((a) => ({
      id: a.id,
      name: a.userEmail.split("@")[0],
      avatarUrl: avatarUrl(a.userEmail),
      eventName: eventMap.get(a.eventId)?.title ?? "Unknown Event",
      appliedAtLabel: formatRelativeTime(a.appliedAt),
    }));
}

function buildActiveEvents(
  events: (FirestoreEvent & { id: string })[],
  applications: (FirestoreApplication & { id: string })[],
): ActiveOrganizerEvent[] {
  const active: ActiveOrganizerEvent[] = [];

  for (const ev of events) {
    const status = deriveEventStatus(ev.startsAt, ev.durationMinutes);

    if (status === "in_progress") {
      active.push({
        id: ev.id,
        kind: "in_progress",
        title: ev.title,
        joined: ev.volunteersApplied,
        capacity: ev.volunteersNeeded,
        coverImageUrl: null,
      });
    } else if (status === "upcoming") {
      const accepted = applications.filter(
        (a) => a.eventId === ev.id && a.status === "accepted",
      );
      active.push({
        id: ev.id,
        kind: "upcoming",
        title: ev.title,
        startsInLabel: formatStartsIn(ev.startsAt),
        signedUpExtra: Math.max(0, accepted.length - 3),
        participantAvatarUrls: accepted.slice(0, 3).map((a) => avatarUrl(a.userEmail)),
      });
    }
  }

  active.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "in_progress" ? -1 : 1;
    return 0;
  });

  return active;
}

function buildAllEvents(events: (FirestoreEvent & { id: string })[]): OrganizerEventListRow[] {
  const statusOrder: Record<OrganizerEventListStatus, number> = {
    in_progress: 0,
    upcoming: 1,
    draft: 2,
    completed: 3,
    cancelled: 4,
  };

  return events
    .map((ev) => {
      const status = deriveEventStatus(ev.startsAt, ev.durationMinutes);
      return {
        id: ev.id,
        title: ev.title,
        status,
        detailLabel: buildDetailLabel(status, ev),
      };
    })
    .sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
}

// -- Public service --

export const organizationDashboardService = {
  async getDashboard(
    organizerId: string,
    organizationName: string,
    city?: string,
  ): Promise<OrganizerDashboardData> {
    const events = await fetchOrgEvents(organizerId);
    const eventIds = events.map((e) => e.id);
    const applications = await fetchApplicationsForEvents(eventIds);
    const eventMap = new Map(events.map((e) => [e.id, e]));

    return {
      organizationName,
      locationSubtitle: city
        ? `Manage your community impact in ${city}.`
        : "Manage your community impact.",
      stats: buildStats(events, applications),
      applications: buildApplications(applications, eventMap),
      activeEvents: buildActiveEvents(events, applications),
      allEvents: buildAllEvents(events),
    };
  },

  async updateApplicationStatus(
    applicationId: string,
    status: "accepted" | "rejected",
  ): Promise<void> {
    const db = getFirebaseFirestore();
    await updateDoc(doc(db, "applications", applicationId), { status });
  },
};
