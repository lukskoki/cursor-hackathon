import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { getFirebaseAuth, getFirebaseFirestore } from "@/services/shared/firebase/client";
import { formatRelativeTime, formatStartsInLabel } from "@/utils/shared/date";
import type {
  ActiveOrganizerEvent,
  OrganizerApplication,
  OrganizerDashboardData,
  OrganizerDashboardStats,
} from "@/types/organization/dashboard";
import type { ApplicationDoc, EventDoc, OrganizationDoc, ProfileDoc } from "@/types/shared/firestore";

type EventRow = EventDoc & { id: string };

const PLACEHOLDER_AVATAR = "https://i.pravatar.cc/128?img=1";

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function tsToIso(v: ApplicationDoc["createdAt"] | EventDoc["startsAt"] | undefined | null): string {
  if (!v) return new Date().toISOString();
  if (typeof (v as { toDate?: () => Date }).toDate === "function") {
    return (v as { toDate: () => Date }).toDate().toISOString();
  }
  return new Date().toISOString();
}

async function resolveOrganizationId(explicit?: string): Promise<string> {
  if (explicit) return explicit;
  const dev = process.env.EXPO_PUBLIC_DEV_ORGANIZATION_ID?.trim();
  if (dev) return dev;
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error(
      "No organization context: sign in (e.g. with Google) or set EXPO_PUBLIC_DEV_ORGANIZATION_ID for local development.",
    );
  }
  const db = getFirebaseFirestore();
  const q = query(collection(db, "organizations"), where("ownerId", "==", user.uid), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) {
    throw new Error("No organization found for this account (organizations.ownerId).");
  }
  return snap.docs[0].id;
}

async function fetchProfilesMap(userIds: string[]): Promise<Map<string, ProfileDoc>> {
  const map = new Map<string, ProfileDoc>();
  const unique = [...new Set(userIds)].filter(Boolean);
  const db = getFirebaseFirestore();
  for (const part of chunk(unique, 10)) {
    if (part.length === 0) continue;
    await Promise.all(
      part.map(async (uid) => {
        const ref = doc(db, "profiles", uid);
        const snap = await getDoc(ref);
        if (snap.exists()) map.set(uid, snap.data() as ProfileDoc);
      }),
    );
  }
  return map;
}

function mapStats(org: OrganizationDoc): OrganizerDashboardStats {
  return {
    totalVolunteersReached: org.statTotalVolunteersReached,
    volunteersTrendPercent: org.statVolunteersTrendPercent,
    eventsHeld: org.statEventsHeld,
    eventsPending: org.statEventsPending,
    impactScore: org.statImpactScore,
    impactRankLabel: org.statImpactRankLabel ?? "",
  };
}

function buildApplicationAggregates(
  rows: { id: string; data: ApplicationDoc }[],
  activeEventIds: Set<string>,
) {
  const byEvent = new Map<string, { approved: number; signups: number; avatars: string[] }>();
  for (const { data: row } of rows) {
    if (!activeEventIds.has(row.eventId)) continue;
    if (!byEvent.has(row.eventId)) {
      byEvent.set(row.eventId, { approved: 0, signups: 0, avatars: [] });
    }
    const bucket = byEvent.get(row.eventId)!;
    if (row.status === "approved") bucket.approved += 1;
    if (row.status === "pending" || row.status === "approved") bucket.signups += 1;
  }
  return byEvent;
}

async function fillAvatarsFromProfiles(
  rows: { id: string; data: ApplicationDoc }[],
  agg: Map<string, { approved: number; signups: number; avatars: string[] }>,
  activeEventIds: Set<string>,
) {
  const volunteerIds = rows
    .filter(
      ({ data: row }) =>
        activeEventIds.has(row.eventId) &&
        (row.status === "pending" || row.status === "approved"),
    )
    .map(({ data: row }) => row.volunteerId);
  const profiles = await fetchProfilesMap(volunteerIds);
  for (const { data: row } of rows) {
    if (!activeEventIds.has(row.eventId)) continue;
    if (row.status !== "pending" && row.status !== "approved") continue;
    const bucket = agg.get(row.eventId);
    if (!bucket || bucket.avatars.length >= 6) continue;
    const url = profiles.get(row.volunteerId)?.avatarUrl?.trim();
    if (url) bucket.avatars.push(url);
  }
}

function mapActiveEvent(
  ev: EventRow,
  agg: Map<string, { approved: number; signups: number; avatars: string[] }>,
): ActiveOrganizerEvent {
  const bucket = agg.get(ev.id) ?? { approved: 0, signups: 0, avatars: [] };
  if (ev.status === "in_progress") {
    return {
      id: ev.id,
      kind: "in_progress",
      title: ev.title,
      joined: bucket.approved,
      capacity: Math.max(1, ev.capacity),
      coverImageUrl: ev.coverImageUrl ?? null,
    };
  }
  const avatars = bucket.avatars.slice(0, 3);
  while (avatars.length < 3) avatars.push(PLACEHOLDER_AVATAR);
  return {
    id: ev.id,
    kind: "upcoming",
    title: ev.title,
    startsInLabel: formatStartsInLabel(tsToIso(ev.startsAt)),
    signedUpExtra: Math.max(0, bucket.signups - 3),
    participantAvatarUrls: avatars.slice(0, 3),
  };
}

function sortActiveEvents(rows: EventRow[]): EventRow[] {
  const rank = (s: EventRow["status"]) => (s === "in_progress" ? 0 : 1);
  return [...rows].sort((a, b) => {
    const dr = rank(a.status) - rank(b.status);
    if (dr !== 0) return dr;
    return new Date(tsToIso(a.startsAt)).getTime() - new Date(tsToIso(b.startsAt)).getTime();
  });
}

async function fetchApplicationsForEvents(
  db: ReturnType<typeof getFirebaseFirestore>,
  eventIds: string[],
): Promise<{ id: string; data: ApplicationDoc }[]> {
  const out: { id: string; data: ApplicationDoc }[] = [];
  for (const part of chunk(eventIds, 10)) {
    if (part.length === 0) continue;
    const qs = query(collection(db, "applications"), where("eventId", "in", part));
    const snap = await getDocs(qs);
    snap.forEach((d) => out.push({ id: d.id, data: d.data() as ApplicationDoc }));
  }
  return out;
}

export const organizationDashboardService = {
  async getDashboard(organizationId?: string): Promise<OrganizerDashboardData> {
    const db = getFirebaseFirestore();
    const orgId = await resolveOrganizationId(organizationId);

    const orgSnap = await getDoc(doc(db, "organizations", orgId));
    if (!orgSnap.exists()) throw new Error("Organization not found.");
    const org = orgSnap.data() as OrganizationDoc;

    const eventsQuery = query(
      collection(db, "events"),
      where("organizationId", "==", orgId),
      orderBy("startsAt"),
    );
    const eventsSnap = await getDocs(eventsQuery);
    const orgEventsList: EventRow[] = eventsSnap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as EventDoc),
    }));

    const orgEventIds = orgEventsList.map((r) => r.id);
    const allApps = await fetchApplicationsForEvents(db, orgEventIds);

    const pendingRows = allApps.filter((a) => a.data.status === "pending");
    pendingRows.sort(
      (a, b) => tsToIso(b.data.createdAt).localeCompare(tsToIso(a.data.createdAt)),
    );

    const eventTitleById = new Map(orgEventsList.map((e) => [e.id, e.title]));
    const volunteerIds = pendingRows.map((r) => r.data.volunteerId);
    const profiles = await fetchProfilesMap(volunteerIds);

    const applications: OrganizerApplication[] = pendingRows.map((row) => {
      const p = profiles.get(row.data.volunteerId);
      const name = p?.fullName?.trim() || "Volunteer";
      const avatarUrl = p?.avatarUrl?.trim() || PLACEHOLDER_AVATAR;
      return {
        id: row.id,
        name,
        avatarUrl,
        eventName: eventTitleById.get(row.data.eventId)?.trim() || "Event",
        appliedAtLabel: formatRelativeTime(tsToIso(row.data.createdAt)),
      };
    });

    const activeRaw = orgEventsList.filter(
      (e) => e.status === "in_progress" || e.status === "upcoming",
    );
    const events = sortActiveEvents(activeRaw);
    const activeEventIds = new Set(events.map((e) => e.id));

    const agg = buildApplicationAggregates(allApps, activeEventIds);
    await fillAvatarsFromProfiles(allApps, agg, activeEventIds);

    const activeEvents = events.map((ev) => mapActiveEvent(ev, agg));
    const subtitle =
      org.dashboardSubtitle?.trim() || `Manage your community impact in ${org.city}.`;

    return {
      organizationName: org.name,
      locationSubtitle: subtitle,
      stats: mapStats(org),
      applications,
      activeEvents,
    };
  },

  async updateApplicationStatus(
    applicationId: string,
    status: "approved" | "rejected",
  ): Promise<void> {
    const db = getFirebaseFirestore();
    await updateDoc(doc(db, "applications", applicationId), { status });
  },
};
